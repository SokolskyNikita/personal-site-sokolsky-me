import {
  handleFlightApi,
  isFlightApiPath,
  type FlightEnv,
} from "./lib/flights/api";
import {
  handleHotelsApi,
  isHotelsApiPath,
  type HotelsEnv,
} from "./lib/hotels";
import {
  handlePredictionMarketOdds,
  isPredictionMarketOddsPath,
} from "./lib/prediction-markets";
import {
  handleAgentDiscovery,
  withAgentDiscoveryHeaders,
} from "./lib/agent-discovery";
export { FlightQuotaCoordinator } from "./lib/flights/quota-do";

export interface Env extends FlightEnv, HotelsEnv {
  ASSETS: AssetFetcher;
  AI_COMPASS_DB?: D1Database;
}

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T = Record<string, unknown>>(columnName?: string): Promise<T | null>;
}

interface AiCompassPayload {
  version: number;
  quiz: string;
  locale: string;
  path: string;
  answers: string;
  answeredCount: number;
  archetypeIndex: number;
  archetypeName: string;
  archetypeFit: number;
  runnerIndexes: number[];
  runnerNames: string[];
  runnerFits: number[];
  scores: Record<string, number>;
  durationMs: number | null;
}

interface ArchetypeQuizPayload {
  version: number;
  quiz: "cishet-male-archetypes" | "cishet-female-archetypes";
  path: string;
  answers: string;
  matchedQuestions: number;
  topIds: string[];
  topNames: string[];
  topFits: number[];
  durationMs: number | null;
}

interface CfProperties {
  country?: string;
  continent?: string;
  colo?: string;
  timezone?: string;
}

const AI_COMPASS_RESULT_PATH = "/api/ai-compass/result";
const AI_COMPASS_STATS_PATH = "/api/ai-compass/stats";
const ARCHETYPE_QUIZ_RESULT_PATH = "/api/cishet-archetypes/result";
const PRIVATE_PATH_PREFIX = "/private/";
const LLMS_TXT_PATH = "/llms.txt";
const AXIS_KEYS = ["T", "V", "S", "I", "P"] as const;
const MAX_AI_COMPASS_ARCHETYPE_INDEX = 22;
const STATS_CACHE_SECONDS = 60;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Apex canonicalization. HTTPS is enforced at the Cloudflare zone
    // ("Always Use HTTPS"); doing it here breaks `wrangler dev` because routes
    // rewrite the request hostname to sokolsky.me even for localhost clients.
    if (url.hostname === "www.sokolsky.me") {
      url.hostname = "sokolsky.me";
      if (url.protocol === "http:") url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/misc/rabbi-article-jul-2026") {
      url.pathname = "/misc/rabbi-article-jul-2026/";
      return Response.redirect(url.toString(), 301);
    }

    if (
      url.pathname === "/misc/kavanagh" ||
      url.pathname === "/misc/kavanagh/"
    ) {
      url.pathname = "/argentina/kavanagh/";
      return Response.redirect(url.toString(), 301);
    }

    const discoveryResponse = await handleAgentDiscovery(request);
    if (discoveryResponse) {
      return discoveryResponse;
    }

    if (url.pathname === AI_COMPASS_RESULT_PATH) {
      return handleAiCompassResult(request, env, url);
    }

    if (url.pathname === AI_COMPASS_STATS_PATH) {
      return handleAiCompassStats(request, env);
    }

    if (url.pathname === ARCHETYPE_QUIZ_RESULT_PATH) {
      return handleArchetypeQuizResult(request, env, url);
    }

    if (isFlightApiPath(url.pathname)) {
      return handleFlightApi(request, env, url);
    }

    if (isHotelsApiPath(url.pathname)) {
      return handleHotelsApi(request, env, url);
    }

    if (isPredictionMarketOddsPath(url.pathname)) {
      return handlePredictionMarketOdds(request, env);
    }

    if (isPrivatePath(url.pathname)) {
      return withNoIndexHeaders(await env.ASSETS.fetch(request));
    }

    if (url.pathname === LLMS_TXT_PATH) {
      return withUtf8TextHeaders(await env.ASSETS.fetch(request));
    }

    return withAgentDiscoveryHeaders(
      await env.ASSETS.fetch(request),
      url.pathname,
    );
  },
};

async function handleAiCompassStats(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "GET") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  if (!env.AI_COMPASS_DB) {
    return json({ ok: false, error: "db_unavailable" }, 503);
  }

  try {
    const [summary, archetypes] = await Promise.all([
      env.AI_COMPASS_DB.prepare(
        `SELECT
          SUM(CASE WHEN answered_count > 0 THEN 1 ELSE 0 END) AS completions,
          SUM(CASE WHEN answered_count = 0 THEN 1 ELSE 0 END) AS zen_opt_outs,
          ROUND(AVG(CASE WHEN answered_count > 0 THEN score_t END), 3) AS avg_t,
          ROUND(AVG(CASE WHEN answered_count > 0 THEN score_v END), 3) AS avg_v,
          ROUND(AVG(CASE WHEN answered_count > 0 THEN score_s END), 3) AS avg_s,
          ROUND(AVG(CASE WHEN answered_count > 0 THEN score_i END), 3) AS avg_i,
          ROUND(AVG(CASE WHEN answered_count > 0 THEN score_p END), 3) AS avg_p,
          MIN(CASE WHEN answered_count > 0 THEN created_at END) AS first_at,
          MAX(CASE WHEN answered_count > 0 THEN created_at END) AS last_at
        FROM ai_compass_results`,
      ).first<{
        completions: number | null;
        zen_opt_outs: number | null;
        avg_t: number | null;
        avg_v: number | null;
        avg_s: number | null;
        avg_i: number | null;
        avg_p: number | null;
        first_at: string | null;
        last_at: string | null;
      }>(),
      env.AI_COMPASS_DB.prepare(
        `SELECT archetype_index AS archetypeIndex, COUNT(*) AS count
         FROM ai_compass_results
         WHERE answered_count > 0
         GROUP BY archetype_index
         ORDER BY count DESC, archetype_index ASC`,
      ).all<{ archetypeIndex: number; count: number }>(),
    ]);

    if (!summary) {
      return json({ ok: false, error: "stats_unavailable" }, 500);
    }

    return json(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        summary: {
          completions: Number(summary.completions) || 0,
          zenOptOuts: Number(summary.zen_opt_outs) || 0,
          avgScores: {
            T: summary.avg_t,
            V: summary.avg_v,
            S: summary.avg_s,
            I: summary.avg_i,
            P: summary.avg_p,
          },
          firstAt: summary.first_at,
          lastAt: summary.last_at,
        },
        archetypes: archetypes.results.map((row) => ({
          index: Number(row.archetypeIndex),
          count: Number(row.count),
        })),
      },
      200,
      {
        "Cache-Control": `public, max-age=${STATS_CACHE_SECONDS}`,
      },
    );
  } catch {
    return json({ ok: false, error: "stats_failed" }, 500);
  }
}

async function handleAiCompassResult(
  request: Request,
  env: Env,
  url: URL,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 4096) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const payload = parseAiCompassPayload(raw);
  if (!payload) {
    return json({ ok: false, error: "invalid_payload" }, 400);
  }

  if (!env.AI_COMPASS_DB) {
    return json({ ok: true, stored: false });
  }

  const cf = (request as Request & { cf?: CfProperties }).cf;

  try {
    await env.AI_COMPASS_DB.prepare(
      `INSERT INTO ai_compass_results (
        quiz_version,
        locale,
        path,
        answers,
        answered_count,
        archetype_index,
        archetype_name,
        archetype_fit,
        runner_indexes,
        runner_names,
        runner_fits,
        score_t,
        score_v,
        score_s,
        score_i,
        score_p,
        duration_ms,
        country,
        continent,
        colo,
        timezone,
        device_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        payload.version,
        payload.locale,
        payload.path,
        payload.answers,
        payload.answeredCount,
        payload.archetypeIndex,
        payload.archetypeName,
        payload.archetypeFit,
        JSON.stringify(payload.runnerIndexes),
        JSON.stringify(payload.runnerNames),
        JSON.stringify(payload.runnerFits),
        payload.scores.T,
        payload.scores.V,
        payload.scores.S,
        payload.scores.I,
        payload.scores.P,
        payload.durationMs,
        String(cf?.country ?? ""),
        String(cf?.continent ?? ""),
        String(cf?.colo ?? ""),
        String(cf?.timezone ?? ""),
        deviceCategory(request.headers.get("User-Agent") || ""),
      )
      .run();
  } catch {
    return json({ ok: false, error: "store_failed" }, 500);
  }

  return json({
    ok: true,
    stored: true,
  });
}

async function handleArchetypeQuizResult(
  request: Request,
  env: Env,
  url: URL,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 4096) {
    return json({ ok: false, error: "payload_too_large" }, 413);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const payload = parseArchetypeQuizPayload(raw);
  if (!payload) {
    return json({ ok: false, error: "invalid_payload" }, 400);
  }

  if (!env.AI_COMPASS_DB) {
    return json({ ok: true, stored: false });
  }

  const cf = (request as Request & { cf?: CfProperties }).cf;

  try {
    await env.AI_COMPASS_DB.prepare(
      `INSERT INTO cishet_archetype_results (
        quiz_version,
        quiz,
        path,
        answers,
        matched_questions,
        top_ids,
        top_names,
        top_fits,
        duration_ms,
        country,
        continent,
        colo,
        timezone,
        device_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        payload.version,
        payload.quiz,
        payload.path,
        payload.answers,
        payload.matchedQuestions,
        JSON.stringify(payload.topIds),
        JSON.stringify(payload.topNames),
        JSON.stringify(payload.topFits),
        payload.durationMs,
        String(cf?.country ?? ""),
        String(cf?.continent ?? ""),
        String(cf?.colo ?? ""),
        String(cf?.timezone ?? ""),
        deviceCategory(request.headers.get("User-Agent") || ""),
      )
      .run();
  } catch {
    return json({ ok: false, error: "store_failed" }, 500);
  }

  return json({ ok: true, stored: true });
}

function parseAiCompassPayload(raw: unknown): AiCompassPayload | null {
  if (!raw || typeof raw !== "object") return null;

  const payload = raw as Record<string, unknown>;
  const scores = payload.scores;
  if (!scores || typeof scores !== "object") return null;

  const parsedScores: Record<string, number> = {};
  for (const key of AXIS_KEYS) {
    const value = (scores as Record<string, unknown>)[key];
    if (!isFiniteNumber(value) || value < -1 || value > 1) return null;
    parsedScores[key] = value;
  }

  const runnerIndexes = readNumberArray(payload.runnerIndexes, 2, 0, MAX_AI_COMPASS_ARCHETYPE_INDEX);
  const runnerNames = readStringArray(payload.runnerNames, 2, 80);
  const runnerFits = readNumberArray(payload.runnerFits, 2, 0, 100);
  if (!runnerIndexes || !runnerNames || !runnerFits) return null;

  const answers = payload.answers;
  if (typeof answers !== "string" || !/^[0-5]{30}$/.test(answers)) return null;
  const answeredCount = answers.split("").filter((digit) => digit !== "0").length;

  const durationMs = payload.durationMs;
  const parsedDurationMs =
    durationMs === null
      ? null
      : isFiniteNumber(durationMs) && durationMs >= 0 && durationMs <= 86_400_000
        ? Math.round(durationMs)
        : null;

  if (
    payload.version !== 1 ||
    payload.quiz !== "ai-compass" ||
    (payload.locale !== "en" && payload.locale !== "ru") ||
    typeof payload.path !== "string" ||
    !payload.path.startsWith("/tests/ai-compass") ||
    payload.path.length > 128 ||
    payload.answeredCount !== answeredCount ||
    !isIntegerInRange(payload.archetypeIndex, 0, MAX_AI_COMPASS_ARCHETYPE_INDEX) ||
    typeof payload.archetypeName !== "string" ||
    payload.archetypeName.length < 1 ||
    payload.archetypeName.length > 80 ||
    !isFiniteNumber(payload.archetypeFit) ||
    payload.archetypeFit < 0 ||
    payload.archetypeFit > 100
  ) {
    return null;
  }

  return {
    version: 1,
    quiz: "ai-compass",
    locale: payload.locale,
    path: payload.path,
    answers,
    answeredCount,
    archetypeIndex: payload.archetypeIndex,
    archetypeName: payload.archetypeName,
    archetypeFit: payload.archetypeFit,
    runnerIndexes,
    runnerNames,
    runnerFits,
    scores: parsedScores,
    durationMs: parsedDurationMs,
  };
}

function parseArchetypeQuizPayload(raw: unknown): ArchetypeQuizPayload | null {
  if (!raw || typeof raw !== "object") return null;

  const payload = raw as Record<string, unknown>;
  const quiz = payload.quiz;
  if (quiz !== "cishet-male-archetypes" && quiz !== "cishet-female-archetypes") {
    return null;
  }

  const expectedPath = `/tests/${quiz}`;
  const path = payload.path;
  const answers = payload.answers;
  if (typeof answers !== "string" || answers.length > 512) return null;
  const answerSegments = answers.split(".");
  if (
    answerSegments.length !== 25 ||
    answerSegments.some((segment) => !/^[1-9a-z]+$/.test(segment))
  ) {
    return null;
  }

  const topIds = readStringArray(payload.topIds, 5, 120);
  const topNames = readStringArray(payload.topNames, 5, 240);
  const topFits = readNumberArray(payload.topFits, 5, 0, 100);
  if (
    !topIds ||
    !topNames ||
    !topFits ||
    topIds.length !== topNames.length ||
    topIds.length !== topFits.length
  ) {
    return null;
  }

  const durationMs = payload.durationMs;
  const parsedDurationMs =
    durationMs === null
      ? null
      : isFiniteNumber(durationMs) && durationMs >= 0 && durationMs <= 86_400_000
        ? Math.round(durationMs)
        : null;

  if (
    payload.version !== 1 ||
    (path !== expectedPath && path !== `${expectedPath}/`) ||
    !isIntegerInRange(payload.matchedQuestions, 0, 25)
  ) {
    return null;
  }

  return {
    version: 1,
    quiz,
    path,
    answers,
    matchedQuestions: payload.matchedQuestions,
    topIds,
    topNames,
    topFits,
    durationMs: parsedDurationMs,
  };
}

function readNumberArray(
  value: unknown,
  maxLength: number,
  min: number,
  max: number,
): number[] | null {
  if (!Array.isArray(value) || value.length > maxLength) return null;
  const out: number[] = [];
  for (const item of value) {
    if (!isFiniteNumber(item) || item < min || item > max) return null;
    out.push(item);
  }
  return out;
}

function readStringArray(
  value: unknown,
  maxLength: number,
  maxStringLength: number,
): string[] | null {
  if (!Array.isArray(value) || value.length > maxLength) return null;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.length > maxStringLength) return null;
    out.push(item);
  }
  return out;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

function isPrivatePath(pathname: string): boolean {
  return pathname === "/private" || pathname.startsWith(PRIVATE_PATH_PREFIX);
}

function withNoIndexHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withUtf8TextHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/plain; charset=utf-8");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function deviceCategory(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/bot|crawler|spider|preview|facebookexternalhit|slurp/.test(ua)) return "bot";
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

function json(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}
