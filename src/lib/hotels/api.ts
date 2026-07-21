import { INDEX_TTL_DAYS, MAX_CREDITS_PER_SCAN } from "./constants";
import { createD1HotelsRepository, type HotelsD1 } from "./db";
import { getCityConfig, runCityScan, scanOpsStats, summarizeTop } from "./pipeline";
import { FixtureProvider } from "./providers/fixtures";
import {
  LiveModeDisabledError,
  SearchApiHotelProvider,
} from "./providers/searchapi";
import { mapListProperty } from "./mapper";
import { scoreProperty, SCORING_VERSION } from "./scoring";
import type { ScanContext } from "./domain";
import type { SearchApiListProperty } from "./providers/types";
import { CITY_MEAN_FALLBACK } from "./constants";

export type HotelsEnv = {
  hotels_index?: HotelsD1;
  SEARCH_API_IO_KEY?: string;
  SEARCHAPI_LIVE?: string;
};

const PLAN_PATH = "/api/hotels/plan";
const SCAN_PATH = "/api/hotels/scan";
const INDEX_PATH = "/api/hotels/index";
const RESCORE_PATH = "/api/hotels/rescore";

export function isHotelsApiPath(pathname: string): boolean {
  return (
    pathname === PLAN_PATH ||
    pathname === SCAN_PATH ||
    pathname === INDEX_PATH ||
    pathname === RESCORE_PATH ||
    pathname.startsWith("/api/hotels/property/")
  );
}

export async function handleHotelsApi(
  request: Request,
  env: HotelsEnv,
  url: URL,
): Promise<Response> {
  if (url.pathname === PLAN_PATH) return handlePlan(request, env, url);
  if (url.pathname === SCAN_PATH) return handleScan(request, env, url);
  if (url.pathname === INDEX_PATH) return handleIndex(request, env, url);
  if (url.pathname === RESCORE_PATH) return handleRescore(request, env, url);
  return json({ ok: false, error: "not_found" }, 404);
}

function liveEnabled(env: HotelsEnv): boolean {
  return env.SEARCHAPI_LIVE === "1";
}

function useFixtures(env: HotelsEnv): boolean {
  return !liveEnabled(env);
}

async function handlePlan(
  request: Request,
  env: HotelsEnv,
  url: URL,
): Promise<Response> {
  if (request.method !== "GET") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  const citySlug = url.searchParams.get("city") ?? "buenos-aires";
  const city = getCityConfig(citySlug);
  const db = env.hotels_index
    ? createD1HotelsRepository(env.hotels_index)
    : null;
  const row = db ? await db.getCityBySlug(citySlug) : null;
  const now = Math.floor(Date.now() / 1000);
  const ageDays =
    row?.scanned_at != null ? (now - row.scanned_at) / 86400 : null;
  const fresh = ageDays != null && ageDays <= INDEX_TTL_DAYS;
  const propertiesOnHand = row && db ? (await db.listRawByCity(row.id)).length : 0;

  // Scan cost: most_reviewed pages + highest_rating pages (enrichment skipped).
  const scanCreditsEstimate = 4 + 2;
  const priceSweepEstimate = 0;

  return json({
    ok: true,
    city: citySlug,
    display: city?.display ?? citySlug,
    index: {
      fresh,
      ageDays,
      scannedAt: row?.scanned_at ?? null,
      meanRating: row?.mean_rating ?? null,
      propertiesOnHand,
      scoringVersion: SCORING_VERSION,
    },
    costs: {
      scanCreditsEstimate,
      priceSweepEstimate,
      maxCreditsPerScan: MAX_CREDITS_PER_SCAN,
      mode: useFixtures(env) ? "fixture" : "live",
    },
  });
}

async function handleScan(
  request: Request,
  env: HotelsEnv,
  url: URL,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  let body: {
    citySlug?: string;
    q?: string;
    bbox?: [number, number, number, number];
    force?: boolean;
    mostReviewedPages?: number;
    highestRatingPages?: number;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const q = body.q?.trim();
  const citySlug =
    body.citySlug ??
    url.searchParams.get("city") ??
    (q ? q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null) ??
    "buenos-aires";
  const db = env.hotels_index
    ? createD1HotelsRepository(env.hotels_index)
    : undefined;

  try {
    const provider = useFixtures(env)
      ? new FixtureProvider()
      : new SearchApiHotelProvider({
          apiKey: env.SEARCH_API_IO_KEY ?? "",
          liveMode: true,
        });

    if (!useFixtures(env) && !env.SEARCH_API_IO_KEY) {
      return json({ ok: false, error: "searchapi_key_missing" }, 503);
    }

    const t0 = Date.now();
    const result = await runCityScan({
      citySlug,
      provider,
      db,
      force: body.force,
      q: q || undefined,
      bbox: body.bbox,
      mostReviewedPages: body.mostReviewedPages,
      highestRatingPages: body.highestRatingPages,
    });
    const kept = result.all
      .filter((s) => !s.gatedOut)
      .sort((a, b) => b.score - a.score);
    const demoted = result.all
      .filter(
        (s) =>
          !s.gatedOut &&
          (s.property.rating ?? 0) >= 4.4 &&
          s.subscores.plantPenalty >= 5,
      )
      .sort((a, b) => b.subscores.plantPenalty - a.subscores.plantPenalty)
      .slice(0, 5);

    return json({
      ok: true,
      found: result.found,
      scored: result.scored,
      gated_out: result.gatedOut,
      topExclusionReason: result.topExclusionReason,
      credits_used: result.creditsUsed,
      cityMeanRating: result.cityMeanRating,
      scoringVersion: result.scoringVersion,
      top10: summarizeTop(result.top10),
      properties: summarizeTop(kept.slice(0, 60)),
      demoted: summarizeTop(demoted),
      durationMs: Date.now() - t0,
      ops: scanOpsStats(result),
    });
  } catch (e) {
    if (e instanceof LiveModeDisabledError) {
      return json({ ok: false, error: "live_mode_disabled" }, 403);
    }
    return json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "scan_failed",
      },
      500,
    );
  }
}

async function handleIndex(
  request: Request,
  env: HotelsEnv,
  url: URL,
): Promise<Response> {
  if (request.method !== "GET") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  if (!env.hotels_index) {
    return json({ ok: false, error: "db_unavailable" }, 503);
  }
  const citySlug = url.searchParams.get("city") ?? "buenos-aires";
  const db = createD1HotelsRepository(env.hotels_index);
  const city = await db.getCityBySlug(citySlug);
  if (!city) {
    return json({ ok: true, city: citySlug, properties: [], neverScanned: true });
  }
  const t0 = Date.now();
  const rows = await db.listByCityScore(city.id, 100);
  return json({
    ok: true,
    city: citySlug,
    meanRating: city.mean_rating,
    scannedAt: city.scanned_at,
    durationMs: Date.now() - t0,
    properties: rows.map((r) => {
      const facts = r.facts_json ? JSON.parse(r.facts_json) : null;
      const subscores = r.subscores_json ? JSON.parse(r.subscores_json) : null;
      return {
        token: r.token,
        name: r.name,
        score: r.score,
        rating: r.rating,
        reviews: r.reviews,
        hotelClass: r.hotel_class,
        brandTier: r.brand_tier,
        lowStarShare: r.low_star_share,
        worstCategory: r.worst_category,
        worstCategoryNeg: r.worst_category_neg,
        plantPenalty: subscores?.plantPenalty ?? 0,
        facts: {
          hasAC: facts?.hasAC?.status ?? "unknown",
          hasElevator: facts?.hasElevator?.status ?? "unknown",
          hasWifi: facts?.hasWifi?.status ?? "unknown",
          frontDesk24h: facts?.frontDesk24h?.status ?? "unknown",
        },
        factsFull: facts,
        subscores,
        googleHotelsUrl: null as string | null,
        lat: r.lat,
        lng: r.lng,
        scoringVersion: r.scoring_version,
        gatedOut: false,
        gates: [],
      };
    }),
  });
}

async function handleRescore(
  request: Request,
  env: HotelsEnv,
  url: URL,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  if (!env.hotels_index) {
    return json({ ok: false, error: "db_unavailable" }, 503);
  }
  const citySlug = url.searchParams.get("city") ?? "buenos-aires";
  const db = createD1HotelsRepository(env.hotels_index);
  const city = await db.getCityBySlug(citySlug);
  if (!city) {
    return json({ ok: false, error: "city_not_found" }, 404);
  }
  const rows = await db.listRawByCity(city.id);
  const cityCfg = getCityConfig(citySlug);
  const mean = city.mean_rating ?? CITY_MEAN_FALLBACK;
  const ctx: ScanContext = {
    citySlug,
    cityMeanRating: mean,
    checkIn: "",
    checkOut: "",
    adults: 2,
    evidenceStrictness: "confirmed_or_unknown",
  };

  let updated = 0;
  for (const row of rows) {
    if (!row.raw_json) continue;
    const raw = JSON.parse(row.raw_json) as SearchApiListProperty;
    const mapped = mapListProperty(raw, {
      citySlug,
      cityDisplay: cityCfg?.display ?? city.display,
      provider: row.provider,
    });
    if (!mapped) continue;
    const scored = scoreProperty(mapped, ctx);
    await db.upsertScored(city.id, scored);
    updated += 1;
  }

  return json({
    ok: true,
    city: citySlug,
    updated,
    scoringVersion: SCORING_VERSION,
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
