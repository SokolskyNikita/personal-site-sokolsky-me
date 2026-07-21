import {
  DEFAULT_CACHE_TTL_SECONDS,
  DEFAULT_DAILY_BUDGET,
  DEFAULT_RATE_LIMIT_PER_DAY,
} from "./constants";
import {
  cacheGet,
  cachePut,
  checkAndIncrementRateLimit,
  countCachedSteps,
  getBudgetStatus,
  incrementBudget,
  type BudgetStatus,
  type FlightKv,
} from "./kv";
import { planSearch } from "./planner";
import {
  filterByDirectionalLieFlatPolicy,
  filterByMaxTotalHours,
} from "./policy";
import { assertValidLocationPair } from "./resolver";
import {
  parseSearchApiResponse,
  SearchApiProvider,
  SearchApiRequestError,
  searchApiCacheKey,
} from "./searchapi";
import {
  LegSearchSchema,
  type ItineraryOption,
  type LegSearch,
  type PlanStep,
} from "./types";

export type FlightEnv = {
  FLIGHT_CACHE?: FlightKv;
  FLIGHT_QUOTA?: {
    idFromName(name: string): unknown;
    get(id: unknown): { fetch(request: Request): Promise<Response> };
  };
  SEARCH_API_IO_KEY?: string;
  FLIGHT_DAILY_BUDGET?: string;
  FLIGHT_CACHE_TTL_SECONDS?: string;
};

const PLAN_PATH = "/api/flights/plan";
const QUERY_PATH = "/api/flights/query";

export function isFlightApiPath(pathname: string): boolean {
  return pathname === PLAN_PATH || pathname === QUERY_PATH;
}

export async function handleFlightApi(
  request: Request,
  env: FlightEnv,
  url: URL,
): Promise<Response> {
  if (url.pathname === PLAN_PATH) {
    return handlePlan(request, env, url);
  }
  if (url.pathname === QUERY_PATH) {
    return handleQuery(request, env, url);
  }
  return json({ ok: false, error: "not_found" }, 404);
}

async function handlePlan(
  request: Request,
  env: FlightEnv,
  url: URL,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  if (!isAllowedOrigin(request, url)) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }

  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;

  const specResult = LegSearchSchema.safeParse(parsed.data);
  if (!specResult.success) {
    return json(
      { ok: false, error: "invalid_spec", details: specResult.error.issues },
      400,
    );
  }

  const spec = specResult.data;
  try {
    assertValidLocationPair(spec.origin, spec.dest);
  } catch (err) {
    return json(
      {
        ok: false,
        error: "invalid_route",
        message: err instanceof Error ? err.message : String(err),
      },
      400,
    );
  }
  let plan;
  try {
    plan = planSearch(spec);
  } catch (err) {
    return json(
      {
        ok: false,
        error: "plan_failed",
        message: err instanceof Error ? err.message : String(err),
      },
      400,
    );
  }

  const kv = env.FLIGHT_CACHE;
  const budgetLimit = Number(env.FLIGHT_DAILY_BUDGET) || DEFAULT_DAILY_BUDGET;
  const budget = env.FLIGHT_QUOTA
    ? await getDurableBudgetStatus(env, budgetLimit)
    : kv
      ? await getBudgetStatus(kv, budgetLimit)
      : {
          used: 0,
          remaining: budgetLimit,
          limit: budgetLimit,
          day: new Date().toISOString().slice(0, 10),
          overBudget: false,
        };

  const cacheKeys = plan.steps.map((step) =>
    stepCacheKey(spec, step),
  );
  const cachedSteps = kv ? await countCachedSteps(kv, cacheKeys) : 0;
  const uncachedSteps = plan.callCount - cachedSteps;
  const callsPerStep =
    plan.callCount === 0 ? 0 : plan.estimatedMaxCalls / plan.callCount;
  const uncachedCalls = Math.ceil(uncachedSteps * callsPerStep);

  return json({
    ok: true,
    plan,
    cachedSteps,
    uncachedCalls,
    budget,
    canRun: uncachedCalls <= budget.remaining,
  });
}

async function handleQuery(
  request: Request,
  env: FlightEnv,
  url: URL,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  if (!isAllowedOrigin(request, url)) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }

  const kv = env.FLIGHT_CACHE;
  if (!kv) {
    return json({ ok: false, error: "kv_unavailable" }, 503);
  }

  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;

  const body = parsed.data as Record<string, unknown>;
  const specResult = LegSearchSchema.safeParse(body.spec);
  if (!specResult.success) {
    return json(
      { ok: false, error: "invalid_spec", details: specResult.error.issues },
      400,
    );
  }
  const spec = specResult.data;
  try {
    assertValidLocationPair(spec.origin, spec.dest);
  } catch (err) {
    return json(
      {
        ok: false,
        error: "invalid_route",
        message: err instanceof Error ? err.message : String(err),
      },
      400,
    );
  }

  const step = body.step as PlanStep | undefined;
  if (
    !step ||
    typeof step.stepIndex !== "number" ||
    typeof step.date !== "string" ||
    !Array.isArray(step.originBatch) ||
    !Array.isArray(step.destBatch)
  ) {
    return json({ ok: false, error: "invalid_step" }, 400);
  }
  if (spec.tripType === "round_trip" && typeof step.returnDate !== "string") {
    return json({ ok: false, error: "invalid_return_date" }, 400);
  }

  // Spec order: cache → budget → rate-limit → SearchAPI (cache hits skip the rest).
  const cacheKey = stepCacheKey(spec, step);
  const cached = await cacheGet(kv, cacheKey);
  let raw: unknown;
  let cacheHit = false;
  let cacheOnly = false;
  let searchesUsed = 0;
  let roundTripOptions: ItineraryOption[] | undefined;
  let partialFailures = 0;
  let responseBudget: BudgetStatus | undefined;

  if (cached.hit && cached.value) {
    raw = JSON.parse(cached.value);
    if (isRoundTripCache(raw)) roundTripOptions = raw.options;
    cacheHit = true;
  } else {
    const budgetLimit = Number(env.FLIGHT_DAILY_BUDGET) || DEFAULT_DAILY_BUDGET;
    const budget = env.FLIGHT_QUOTA
      ? await getDurableBudgetStatus(env, budgetLimit)
      : await getBudgetStatus(kv, budgetLimit);
    responseBudget = budget;
    if (budget.overBudget) {
      cacheOnly = true;
      return json({
        ok: true,
        stepIndex: step.stepIndex,
        cacheHit: false,
        cacheOnly: true,
        options: [],
        warning: "daily_quota_reached",
        budget,
      });
    }

    const ip =
      request.headers.get("CF-Connecting-IP") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const rate = env.FLIGHT_QUOTA
      ? await consumeDurableRateLimit(env, ip, DEFAULT_RATE_LIMIT_PER_DAY)
      : await checkAndIncrementRateLimit(kv, ip, DEFAULT_RATE_LIMIT_PER_DAY);
    if (!rate.allowed) {
      return json({
        ok: true,
        stepIndex: step.stepIndex,
        cacheHit: false,
        warning: "step_failed",
        message: "rate_limited",
        options: [],
        rate,
      });
    }

    if (!env.SEARCH_API_IO_KEY) {
      return json({ ok: false, error: "searchapi_key_missing" }, 503);
    }

    const provider = new SearchApiProvider({ apiKey: env.SEARCH_API_IO_KEY });
    try {
      const result =
        spec.tripType === "round_trip"
          ? await provider.searchRoundTripStep({
              originBatch: step.originBatch,
              destBatch: step.destBatch,
              date: step.date,
              returnDate: step.returnDate!,
              cabin: spec.cabin,
              maxStops: spec.maxStops,
              currency: spec.currency,
              gl: spec.gl,
              hl: spec.hl,
              topN: spec.topN,
            })
          : await provider.searchStep({
              originBatch: step.originBatch,
              destBatch: step.destBatch,
              date: step.date,
              cabin: spec.cabin,
              maxStops: spec.maxStops,
              currency: spec.currency,
              gl: spec.gl,
              hl: spec.hl,
            });
      raw = result.raw;
      if (
        "partialFailures" in result &&
        typeof result.partialFailures === "number"
      ) {
        partialFailures = result.partialFailures;
        roundTripOptions = result.options;
      }
      searchesUsed = result.searchesUsed;
      responseBudget = await recordSearchesUsed(
        env,
        kv,
        budgetLimit,
        result.searchesUsed,
      );
      const ttl =
        Number(env.FLIGHT_CACHE_TTL_SECONDS) || DEFAULT_CACHE_TTL_SECONDS;
      await cachePut(kv, cacheKey, JSON.stringify(raw), ttl);
    } catch (err) {
      searchesUsed =
        err instanceof SearchApiRequestError ? err.searchesUsed : 0;
      await recordSearchesUsed(env, kv, budgetLimit, searchesUsed);
      return json({
        ok: true,
        stepIndex: step.stepIndex,
        cacheHit: false,
        searchesUsed,
        warning: "step_failed",
        message: err instanceof Error ? err.message : String(err),
        options: [],
      });
    }
  }

  const parsedOptions =
    roundTripOptions ??
    parseSearchApiResponse(raw, {
      currency: spec.currency,
      departureDate: step.date,
    });
  const durationFilteredOptions = filterByMaxTotalHours(
    parsedOptions,
    spec.maxTotalHours,
  );
  const options = filterByDirectionalLieFlatPolicy(
    durationFilteredOptions,
    spec.lieFlatPolicy,
  );

  const publicOptions = options.map(toPublicOption);

  console.log(
    JSON.stringify({
      event: "flight_search_step_completed",
      stepIndex: step.stepIndex,
      tripType: spec.tripType,
      cacheHit,
      searchesUsed,
      optionsParsed: parsedOptions.length,
      optionsReturned: publicOptions.length,
      partialFailures,
    }),
  );

  return json({
    ok: true,
    stepIndex: step.stepIndex,
    cacheHit,
    cacheOnly,
    searchesUsed,
    optionsParsed: parsedOptions.length,
    options: publicOptions,
    warning: partialFailures > 0 ? "partial_return_results" : undefined,
    message:
      partialFailures > 0
        ? `${partialFailures} return-flight lookup${
            partialFailures === 1 ? "" : "s"
          } failed`
        : undefined,
    budget: responseBudget,
  });
}

function toPublicOption(option: ItineraryOption): ItineraryOption {
  const {
    raw: _raw,
    departureToken: _departureToken,
    bookingToken: _bookingToken,
    ...publicOption
  } = option;
  return publicOption;
}

function isRoundTripCache(
  value: unknown,
): value is { kind: "round_trip"; options: ItineraryOption[] } {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.kind === "round_trip" && Array.isArray(record.options);
}

async function recordSearchesUsed(
  env: FlightEnv,
  kv: FlightKv,
  budgetLimit: number,
  searchesUsed: number,
): Promise<BudgetStatus> {
  if (env.FLIGHT_QUOTA) {
    const stub = durableQuotaStub(env);
    const response = await stub.fetch(
      new Request("https://flight-quota/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: budgetLimit, searchesUsed }),
      }),
    );
    if (!response.ok) throw new Error("flight quota update unavailable");
    return response.json();
  }
  let status = await getBudgetStatus(kv, budgetLimit);
  for (let i = 0; i < searchesUsed; i++) {
    status = await incrementBudget(kv, budgetLimit);
  }
  return status;
}

function durableQuotaStub(env: FlightEnv): {
  fetch(request: Request): Promise<Response>;
} {
  const namespace = env.FLIGHT_QUOTA!;
  return namespace.get(namespace.idFromName("global"));
}

async function getDurableBudgetStatus(
  env: FlightEnv,
  limit: number,
): Promise<Awaited<ReturnType<typeof getBudgetStatus>>> {
  const response = await durableQuotaStub(env).fetch(
    new Request(`https://flight-quota/status?limit=${limit}`),
  );
  if (!response.ok) throw new Error("flight quota status unavailable");
  return response.json();
}

async function consumeDurableRateLimit(
  env: FlightEnv,
  ip: string,
  limit: number,
): Promise<Awaited<ReturnType<typeof checkAndIncrementRateLimit>>> {
  const response = await durableQuotaStub(env).fetch(
    new Request("https://flight-quota/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, limit }),
    }),
  );
  if (!response.ok) throw new Error("flight rate limiter unavailable");
  return response.json();
}

function stepCacheKey(spec: LegSearch, step: PlanStep): string {
  return searchApiCacheKey({
    departureId: step.originBatch.join(","),
    arrivalId: step.destBatch.join(","),
    outboundDate: step.date,
    cabin: spec.cabin,
    maxStops: spec.maxStops,
    currency: spec.currency,
    gl: spec.gl,
    hl: spec.hl,
    tripType: spec.tripType,
    returnDate: step.returnDate,
    topN: spec.topN,
  });
}

async function readJson(
  request: Request,
): Promise<
  { ok: true; data: unknown } | { ok: false; response: Response }
> {
  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 64_000) {
    return {
      ok: false,
      response: json({ ok: false, error: "payload_too_large" }, 413),
    };
  }
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return {
      ok: false,
      response: json({ ok: false, error: "invalid_json" }, 400),
    };
  }
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Allow same-origin and local wrangler (Host may differ from rewritten url.origin). */
function isAllowedOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get("Origin");
  // Browser fetch always sends Origin on POST; reject bare curl/script abuse.
  if (!origin) return false;
  if (origin === url.origin) return true;
  const host = request.headers.get("Host");
  if (!host) return false;
  return origin === `http://${host}` || origin === `https://${host}`;
}
