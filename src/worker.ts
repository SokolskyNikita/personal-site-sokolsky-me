export interface Env {
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

interface CfProperties {
  country?: string;
  continent?: string;
  colo?: string;
  timezone?: string;
}

const AI_COMPASS_RESULT_PATH = "/api/ai-compass/result";
const PRIVATE_PATH_PREFIX = "/private/";
const LLMS_TXT_PATH = "/llms.txt";
const AXIS_KEYS = ["T", "V", "S", "I", "P"] as const;
const MAX_AI_COMPASS_ARCHETYPE_INDEX = 22;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Enforce HTTPS and canonical apex host at the edge.
    if (url.protocol === "http:") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    if (url.hostname === "www.sokolsky.me") {
      url.hostname = "sokolsky.me";
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

    if (url.pathname === AI_COMPASS_RESULT_PATH) {
      return handleAiCompassResult(request, env, url);
    }

    if (isPrivatePath(url.pathname)) {
      return withNoIndexHeaders(await env.ASSETS.fetch(request));
    }

    if (url.pathname === LLMS_TXT_PATH) {
      return withUtf8TextHeaders(await env.ASSETS.fetch(request));
    }

    return env.ASSETS.fetch(request);
  },
};

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

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
