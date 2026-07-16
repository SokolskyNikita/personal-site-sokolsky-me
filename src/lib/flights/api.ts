import {
  DEFAULT_CACHE_TTL_SECONDS,
  DEFAULT_DAILY_BUDGET,
  DEFAULT_RATE_LIMIT_PER_MINUTE,
} from "./constants";
import {
  cacheGet,
  cachePut,
  checkAndIncrementRateLimit,
  countCachedSteps,
  getBudgetStatus,
  incrementBudget,
  type FlightKv,
} from "./kv";
import { planSearch } from "./planner";
import { filterByLieFlatPolicy } from "./policy";
import {
  parseSerpApiResponse,
  SerpApiProvider,
  serpApiCacheKey,
} from "./serpapi";
import { LegSearchSchema, type LegSearch, type PlanStep } from "./types";

export type FlightEnv = {
  FLIGHT_CACHE?: FlightKv;
  SERPAPI_API_KEY?: string;
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
  const budget = kv
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
  const uncachedCalls = plan.callCount - cachedSteps;

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

  // Spec order: cache → budget → rate-limit → SerpApi (cache hits skip the rest).
  const cacheKey = stepCacheKey(spec, step);
  const cached = await cacheGet(kv, cacheKey);
  let raw: unknown;
  let cacheHit = false;
  let cacheOnly = false;

  if (cached.hit && cached.value) {
    raw = JSON.parse(cached.value);
    cacheHit = true;
  } else {
    const budgetLimit = Number(env.FLIGHT_DAILY_BUDGET) || DEFAULT_DAILY_BUDGET;
    const budget = await getBudgetStatus(kv, budgetLimit);
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
    const rate = await checkAndIncrementRateLimit(
      kv,
      ip,
      DEFAULT_RATE_LIMIT_PER_MINUTE,
    );
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

    if (!env.SERPAPI_API_KEY) {
      return json({ ok: false, error: "serpapi_key_missing" }, 503);
    }

    const provider = new SerpApiProvider({ apiKey: env.SERPAPI_API_KEY });
    try {
      const result = await provider.searchStep({
        originBatch: step.originBatch,
        destBatch: step.destBatch,
        date: step.date,
        cabin: spec.cabin,
        maxStops: spec.maxStops,
        currency: spec.currency,
        gl: spec.gl,
        hl: spec.hl,
        deepSearch: spec.deepSearch,
      });
      raw = result.raw;
      await incrementBudget(kv, budgetLimit);
      const ttl =
        Number(env.FLIGHT_CACHE_TTL_SECONDS) || DEFAULT_CACHE_TTL_SECONDS;
      await cachePut(kv, cacheKey, JSON.stringify(raw), ttl);
    } catch (err) {
      return json({
        ok: true,
        stepIndex: step.stepIndex,
        cacheHit: false,
        warning: "step_failed",
        message: err instanceof Error ? err.message : String(err),
        options: [],
      });
    }
  }

  const parsedOptions = parseSerpApiResponse(raw, {
    currency: spec.currency,
    departureDate: step.date,
  });
  const options = filterByLieFlatPolicy(
    parsedOptions,
    spec.lieFlatPolicy,
    spec.includeUnverified,
  );

  const budgetLimit = Number(env.FLIGHT_DAILY_BUDGET) || DEFAULT_DAILY_BUDGET;
  const budget = await getBudgetStatus(kv, budgetLimit);

  return json({
    ok: true,
    stepIndex: step.stepIndex,
    cacheHit,
    cacheOnly,
    optionsParsed: parsedOptions.length,
    options,
    budget,
  });
}

function stepCacheKey(spec: LegSearch, step: PlanStep): string {
  return serpApiCacheKey({
    departureId: step.originBatch.join(","),
    arrivalId: step.destBatch.join(","),
    outboundDate: step.date,
    cabin: spec.cabin,
    maxStops: spec.maxStops,
    currency: spec.currency,
    gl: spec.gl,
    hl: spec.hl,
    deepSearch: spec.deepSearch,
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
  if (!origin) return true;
  if (origin === url.origin) return true;
  const host = request.headers.get("Host");
  if (!host) return false;
  return origin === `http://${host}` || origin === `https://${host}`;
}
