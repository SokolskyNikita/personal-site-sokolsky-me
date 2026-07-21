import {
  CITY_MEAN_FALLBACK,
  INDEX_TTL_DAYS,
  MAX_CREDITS_PER_SCAN,
  PRICE_CACHE_HIT_THRESHOLD,
  PRICE_CACHE_TTL_HOURS,
  PRICE_TOPUP_MAX_CALLS,
  SCAN_PAGES_HIGHEST_RATING,
  SCAN_PAGES_MOST_REVIEWED,
  WINDOW_CAP,
} from "./constants";
import { createD1HotelsRepository, type HotelsD1 } from "./db";
import { getCityConfig, runCityScan, scanOpsStats, summarizeTop } from "./pipeline";
import { FixtureProvider } from "./providers/fixtures";
import {
  LiveModeDisabledError,
  SearchApiHotelProvider,
} from "./providers/searchapi";
import { googleHotelsSearchUrl, mapListProperty } from "./mapper";
import { scoreProperty, SCORING_VERSION } from "./scoring";
import type { ScanContext } from "./domain";
import type { PropertyFacts } from "./domain";
import type { SearchApiListProperty } from "./providers/types";
import {
  planPriceSweepCredits,
  priceWindowMarker,
  runPriceSweep,
} from "./prices";
import { generateStayWindows } from "./windows";
import { matchTripadvisor, ratingConcordance } from "./ta";
import {
  analyzeHotelReviews,
  getCachedReviewAnalysis,
} from "./reviews";
import { REVIEW_MODEL_VERSION } from "./review-signals";
import {
  createHotelQuotaGuard,
  HotelQuotaExceededError,
  type HotelQuotaEnv,
} from "./quota";

export type HotelsEnv = HotelQuotaEnv & {
  hotels_index?: HotelsD1;
  SEARCH_API_IO_KEY?: string;
  SEARCHAPI_LIVE?: string;
};

const PLAN_PATH = "/api/hotels/plan";
const SCAN_PATH = "/api/hotels/scan";
const INDEX_PATH = "/api/hotels/index";
const RESCORE_PATH = "/api/hotels/rescore";
const PRICES_PATH = "/api/hotels/prices";

export function isHotelsApiPath(pathname: string): boolean {
  return (
    pathname === PLAN_PATH ||
    pathname === SCAN_PATH ||
    pathname === INDEX_PATH ||
    pathname === RESCORE_PATH ||
    pathname === PRICES_PATH ||
    pathname.startsWith("/api/hotels/property/") ||
    pathname.startsWith("/api/hotels/reviews/")
  );
}

export async function handleHotelsApi(
  request: Request,
  env: HotelsEnv,
  url: URL,
): Promise<Response> {
  try {
    if (url.pathname === PLAN_PATH) return await handlePlan(request, env, url);
    if (url.pathname === SCAN_PATH) return await handleScan(request, env, url);
    if (url.pathname === INDEX_PATH) return await handleIndex(request, env, url);
    if (url.pathname === RESCORE_PATH) {
      return await handleRescore(request, env, url);
    }
    if (url.pathname === PRICES_PATH) {
      return await handlePrices(request, env, url);
    }
    if (url.pathname.startsWith("/api/hotels/property/")) {
      return await handleProperty(request, env, url);
    }
    if (url.pathname.startsWith("/api/hotels/reviews/")) {
      return await handleReviews(request, env, url);
    }
    return json({ ok: false, error: "not_found" }, 404);
  } catch (e) {
    if (e instanceof HotelQuotaExceededError) {
      return json(
        {
          ok: false,
          error: e.code,
          quota: e.quota,
        },
        429,
        {
          "Retry-After": String(secondsUntil(e.quota.resetAt)),
        },
      );
    }
    return json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "hotels_api_failed",
      },
      500,
    );
  }
}

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function liveEnabled(env: HotelsEnv): boolean {
  return env.SEARCHAPI_LIVE === "1";
}

function useFixtures(env: HotelsEnv): boolean {
  return !liveEnabled(env);
}

function hotelProvider(env: HotelsEnv, request: Request) {
  return useFixtures(env)
    ? new FixtureProvider()
    : new SearchApiHotelProvider({
        apiKey: env.SEARCH_API_IO_KEY ?? "",
        liveMode: true,
        beforeCall: createHotelQuotaGuard(env, request),
      });
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
  const propertyRows = row && db ? await db.listRawByCity(row.id) : [];
  const propertiesOnHand = propertyRows.length;

  // Scan cost: most_reviewed pages + highest_rating pages (enrichment skipped).
  const requestedScanPages = Math.min(
    SCAN_PAGES_MOST_REVIEWED,
    Math.max(1, Number(url.searchParams.get("scanPages") ?? SCAN_PAGES_MOST_REVIEWED)),
  );
  const scanCreditsEstimate = requestedScanPages + SCAN_PAGES_HIGHEST_RATING;

  const checkInStart = url.searchParams.get("checkInStart");
  const checkInEnd = url.searchParams.get("checkInEnd") ?? checkInStart;
  const nightsMin = Number(url.searchParams.get("nightsMin") ?? 2);
  const nightsMax = Number(url.searchParams.get("nightsMax") ?? nightsMin);
  const priceAdults = Number(url.searchParams.get("adults") ?? 2);
  let priceSweepEstimate = 0;
  let windowCount = 0;
  let priceCacheHitsExpected = 0;
  let cachedWindows = 0;
  let singleWindowTop20Hits = 0;
  if (checkInStart && checkInEnd) {
    const windows = generateStayWindows({
      checkInStart,
      checkInEnd,
      nightsMin: Number.isFinite(nightsMin) ? nightsMin : 2,
      nightsMax: Number.isFinite(nightsMax) ? nightsMax : 2,
    });
    windowCount = windows.length;
    if (db && propertyRows.length) {
      const tokens = propertyRows.map((property) => property.token);
      const topTokens = new Set(
        (await db.listByCityScore(row!.id, 20)).map(
          (property) => property.token,
        ),
      );
      const fresherThan = now - PRICE_CACHE_TTL_HOURS * 3600;
      for (const window of windows) {
        const cached = await db.listPricesForTokens(
          [...tokens, priceWindowMarker(citySlug)],
          window.checkIn,
          window.checkOut,
          fresherThan,
          Number.isFinite(priceAdults) ? priceAdults : 2,
        );
        const pricedForWindow = cached.filter(
          (price) =>
            price.token !== priceWindowMarker(citySlug) &&
            price.nightly_usd != null,
        );
        priceCacheHitsExpected += pricedForWindow.length;
        if (windows.length === 1) {
          singleWindowTop20Hits = cached.filter(
            (price) =>
              topTokens.has(price.token) && price.nightly_usd != null,
          ).length;
        }
        const hasMarker = cached.some(
          (price) => price.token === priceWindowMarker(citySlug),
        );
        if (
          hasMarker ||
          pricedForWindow.length >=
            Math.min(PRICE_CACHE_HIT_THRESHOLD, tokens.length)
        ) {
          cachedWindows += 1;
        }
      }
    }
    priceSweepEstimate = planPriceSweepCredits(windows, cachedWindows);
    if (windows.length === 1) {
      priceSweepEstimate += Math.min(
        PRICE_TOPUP_MAX_CALLS,
        Math.max(0, 20 - singleWindowTop20Hits),
      );
    }
  }

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
      priceCacheHitsExpected,
      cachedWindows,
      windowCount,
      windowCap: WINDOW_CAP,
      priceCacheHitThreshold: PRICE_CACHE_HIT_THRESHOLD,
      singleWindowTopupMax: PRICE_TOPUP_MAX_CALLS,
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
    const provider = hotelProvider(env, request);

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
      properties: summarizeTop(kept),
      demoted: summarizeTop(demoted),
      durationMs: Date.now() - t0,
      ops: scanOpsStats(result),
    });
  } catch (e) {
    if (e instanceof HotelQuotaExceededError) throw e;
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
  // Every search path returns the complete eligible city index. The UI must not
  // silently hide lower-ranked hotels that may have availability or better prices.
  const rows = await db.listByCityScore(city.id);
  const reviewRows = await db.listLatestReviewFeatures(
    rows.map((row) => row.token),
    REVIEW_MODEL_VERSION,
  );
  const reviewsByToken = new Map(
    reviewRows.map((row) => [
      row.token,
      safeJsonParse(row.features_json, null),
    ]),
  );
  return json({
    ok: true,
    city: citySlug,
    meanRating: city.mean_rating,
    scannedAt: city.scanned_at,
    durationMs: Date.now() - t0,
    properties: rows.map((r) => {
      const facts = safeJsonParse<PropertyFacts | null>(r.facts_json, null);
      const subscores = safeJsonParse<Record<string, number> | null>(
        r.subscores_json,
        null,
      );
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
        factValues: {
          hasAC: facts?.hasAC?.value ?? null,
          hasElevator: facts?.hasElevator?.value ?? null,
          hasWifi: facts?.hasWifi?.value ?? null,
          frontDesk24h: facts?.frontDesk24h?.value ?? null,
        },
        breakdown: safeJsonParse(r.breakdown_json, []),
        whitelist: safeJsonParse(r.whitelist, []),
        reviewFeatures: reviewsByToken.get(r.token) ?? null,
        subscores,
        googleHotelsUrl: googleHotelsSearchUrl(
          r.name,
          city.display,
        ),
        lat: r.lat,
        lng: r.lng,
        taRating: r.ta_rating,
        taReviews: r.ta_reviews,
        scoringVersion: r.scoring_version,
        gatedOut: false,
        gates: [],
      };
    }),
  });
}

async function handlePrices(
  request: Request,
  env: HotelsEnv,
  url: URL,
): Promise<Response> {
  if (request.method !== "POST" && request.method !== "GET") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  if (!env.hotels_index) {
    return json({ ok: false, error: "db_unavailable" }, 503);
  }

  let body: {
    citySlug?: string;
    checkInStart?: string;
    checkInEnd?: string;
    nightsMin?: number;
    nightsMax?: number;
    adults?: number;
    joinTa?: boolean;
    topUp?: boolean;
  } = {};
  if (request.method === "POST") {
    try {
      body = (await request.json()) as typeof body;
    } catch {
      body = {};
    }
  }

  const citySlug =
    body.citySlug ?? url.searchParams.get("city") ?? "buenos-aires";
  const checkInStart =
    body.checkInStart ?? url.searchParams.get("checkInStart") ?? "";
  const checkInEnd =
    body.checkInEnd ??
    url.searchParams.get("checkInEnd") ??
    checkInStart;
  const nightsMin = Number(
    body.nightsMin ?? url.searchParams.get("nightsMin") ?? 2,
  );
  const nightsMax = Number(
    body.nightsMax ?? url.searchParams.get("nightsMax") ?? nightsMin,
  );
  const adults = Number(body.adults ?? url.searchParams.get("adults") ?? 2);
  const joinTa =
    body.joinTa === true || url.searchParams.get("joinTa") === "1";

  if (!checkInStart || !checkInEnd) {
    return json({ ok: false, error: "dates_required" }, 400);
  }

  const db = createD1HotelsRepository(env.hotels_index);
  const city = await db.getCityBySlug(citySlug);
  if (!city) {
    return json({ ok: false, error: "city_not_found" }, 404);
  }

  try {
    const provider = hotelProvider(env, request);
    if (!useFixtures(env) && !env.SEARCH_API_IO_KEY) {
      return json({ ok: false, error: "searchapi_key_missing" }, 503);
    }

    const t0 = Date.now();
    const generatedWindows = generateStayWindows({
      checkInStart,
      checkInEnd,
      nightsMin: Number.isFinite(nightsMin) ? nightsMin : 2,
      nightsMax: Number.isFinite(nightsMax) ? nightsMax : 2,
    });
    const topUp =
      body.topUp ??
      (url.searchParams.has("topUp")
        ? url.searchParams.get("topUp") === "1"
        : generatedWindows.length === 1);
    const sweep = await runPriceSweep({
      citySlug,
      provider,
      db,
      adults: Number.isFinite(adults) ? adults : 2,
      topUp,
      windows: {
        checkInStart,
        checkInEnd,
        nightsMin: Number.isFinite(nightsMin) ? nightsMin : 2,
        nightsMax: Number.isFinite(nightsMax) ? nightsMax : 2,
      },
    });

    let taJoined = 0;
    let taCredits = 0;
    const cityCfg = getCityConfig(citySlug);
    const display = cityCfg?.display ?? city.display;

    if (joinTa && provider.searchTripadvisor) {
      const top = (await db.listByCityScore(city.id, 15)).filter(
        (r) => r.ta_rating == null,
      );
      for (const row of top.slice(0, 5)) {
        const result = await provider.searchTripadvisor(
          `${row.name} ${display}`,
        );
        taCredits += 1;
        const match = matchTripadvisor(row.name, display, result.places);
        if (!match) continue;
        await db.updateTaFields({
          token: row.token,
          taRating: match.rating,
          taReviews: match.reviews,
        });
        if (row.raw_json) {
          const mapped = mapListProperty(
            JSON.parse(row.raw_json) as SearchApiListProperty,
            {
              citySlug,
              cityDisplay: display,
              provider: row.provider,
              ta: {
                rating: match.rating,
                reviews: match.reviews,
                rank: row.ta_rank,
                total: row.ta_total,
              },
              whitelist: row.whitelist ? JSON.parse(row.whitelist) : [],
            },
          );
          if (mapped) {
            const facts = row.facts_json
              ? (JSON.parse(row.facts_json) as PropertyFacts)
              : undefined;
            await db.upsertScored(
              city.id,
              scoreProperty(
                mapped,
                {
                  citySlug,
                  cityMeanRating: city.mean_rating ?? CITY_MEAN_FALLBACK,
                  checkIn: "",
                  checkOut: "",
                  adults,
                  evidenceStrictness: "confirmed_or_unknown",
                },
                facts,
              ),
            );
          }
        }
        taJoined += 1;
      }
    }

    // Merge index identity + price fields for UI.
    const indexRows = await db.listByCityScore(city.id);
    const reviewRows = await db.listLatestReviewFeatures(
      indexRows.map((row) => row.token),
      REVIEW_MODEL_VERSION,
    );
    const reviewsByToken = new Map(
      reviewRows.map((row) => [
        row.token,
        safeJsonParse(row.features_json, null),
      ]),
    );
    const pricedByToken = new Map(sweep.properties.map((p) => [p.token, p]));
    const properties = indexRows.map((r) => {
      const priced = pricedByToken.get(r.token);
      const facts = safeJsonParse<PropertyFacts | null>(r.facts_json, null);
      const subscores = safeJsonParse<Record<string, number> | null>(
        r.subscores_json,
        null,
      );
      const best = priced?.bestStay ?? null;
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
        factValues: {
          hasAC: facts?.hasAC?.value ?? null,
          hasElevator: facts?.hasElevator?.value ?? null,
          hasWifi: facts?.hasWifi?.value ?? null,
          frontDesk24h: facts?.frontDesk24h?.value ?? null,
        },
        reviewFeatures: reviewsByToken.get(r.token) ?? null,
        breakdown: safeJsonParse(r.breakdown_json, []),
        whitelist: safeJsonParse(r.whitelist, []),
        subscores,
        lat: r.lat,
        lng: r.lng,
        taRating: r.ta_rating,
        taReviews: r.ta_reviews,
        concordance: ratingConcordance(r.rating, r.ta_rating),
        nightly_usd: best?.nightlyUsd ?? null,
        total_usd: best?.totalUsd ?? null,
        expected_usd: priced?.expectedUsd ?? null,
        deal_pct: priced?.dealPct ?? null,
        dealMethod: priced?.dealMethod ?? null,
        bestStay: best,
        matchingStays: priced?.matchingStays ?? [],
        matrix: priced?.matrix ?? [],
        minNightly: priced?.minNightly ?? null,
        medianNightly: priced?.medianNightly ?? null,
        maxNightly: priced?.maxNightly ?? null,
        googleHotelsUrl:
          priced?.googleHotelsUrl ??
          googleHotelsSearchUrl(r.name, display, checkInStart, checkInEnd),
      };
    });

    const top20 = properties.slice(0, 20);
    const top20Priced = top20.filter((p) => p.nightly_usd != null).length;

    return json({
      ok: true,
      city: citySlug,
      windows: sweep.windows,
      properties,
      pricedCount: sweep.pricedCount,
      top20PricedShare: top20.length ? top20Priced / top20.length : 0,
      credits_used: sweep.creditsUsed + taCredits,
      durationMs: Date.now() - t0,
      ops: {
        cacheHits: sweep.cacheHits,
        liveCalls: sweep.liveCalls,
        windowsSkippedCache: sweep.windowsSkippedCache,
        topupCalls: sweep.topupCalls,
        windowCount: sweep.windows.length,
        taJoined,
        taCredits,
        mode: useFixtures(env) ? "fixture" : "live",
      },
    });
  } catch (e) {
    if (e instanceof HotelQuotaExceededError) throw e;
    if (e instanceof LiveModeDisabledError) {
      return json({ ok: false, error: "live_mode_disabled" }, 403);
    }
    return json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "prices_failed",
      },
      500,
    );
  }
}

async function handleProperty(
  request: Request,
  env: HotelsEnv,
  url: URL,
): Promise<Response> {
  if (request.method !== "GET") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  const token = decodeURIComponent(
    url.pathname.replace("/api/hotels/property/", ""),
  );
  if (!token) return json({ ok: false, error: "token_required" }, 400);

  const checkIn = url.searchParams.get("checkIn") ?? undefined;
  const checkOut = url.searchParams.get("checkOut") ?? undefined;
  const adults = Number(url.searchParams.get("adults") ?? 2);
  const normalizedAdults = Number.isFinite(adults) ? adults : 2;
  const priceOnly = url.searchParams.get("priceOnly") === "1";

  try {
    if (priceOnly && env.hotels_index && checkIn && checkOut) {
      const db = createD1HotelsRepository(env.hotels_index);
      const cached = (
        await db.listPricesForTokens(
          [token],
          checkIn,
          checkOut,
          Math.floor(Date.now() / 1000) - PRICE_CACHE_TTL_HOURS * 3600,
          normalizedAdults,
        )
      )[0];
      // Positive list/property prices are reusable. A cached null is conclusive
      // only when it came from an exact property lookup, not a bulk-list miss.
      if (
        cached &&
        (cached.nightly_usd != null ||
          cached.total_usd != null ||
          cached.source === "searchapi_property")
      ) {
        return json({
          ok: true,
          token,
          nightly_usd: cached.nightly_usd,
          total_usd: cached.total_usd,
          price_resolved: true,
          cached: true,
          credits_used: 0,
        });
      }
    }

    const provider = hotelProvider(env, request);
    if (!useFixtures(env) && !env.SEARCH_API_IO_KEY) {
      return json({ ok: false, error: "searchapi_key_missing" }, 503);
    }

    const page = await provider.getProperty({
      propertyToken: token,
      checkIn,
      checkOut,
      adults: normalizedAdults,
    });
    const p = page.property;
    const nightly =
      typeof p.price_per_night?.extracted_price === "number" &&
      p.price_per_night.extracted_price > 0
        ? p.price_per_night.extracted_price
        : null;
    const total =
      typeof p.total_price?.extracted_price === "number" &&
      p.total_price.extracted_price > 0
        ? p.total_price.extracted_price
        : null;
    if (env.hotels_index && checkIn && checkOut) {
      const db = createD1HotelsRepository(env.hotels_index);
      await db.upsertPrice({
        token,
        checkIn,
        checkOut,
        adults: normalizedAdults,
        nightlyUsd: nightly,
        totalUsd: total,
        source: "searchapi_property",
        fetchedAt: Math.floor(Date.now() / 1000),
      });
    }
    const offers = [
      ...(Array.isArray(p.featured_offers) ? p.featured_offers : []),
      ...(Array.isArray(p.all_offers) ? p.all_offers : []),
    ].slice(0, 8);
    const freeCancel = offers.some(
      (o) =>
        o &&
        typeof o === "object" &&
        (o as { has_free_cancellation?: boolean }).has_free_cancellation ===
          true,
    );

    return json({
      ok: true,
      token,
      name: p.name ?? null,
      rating: p.rating ?? null,
      reviews: p.reviews ?? null,
      address: (p as { address?: string }).address ?? null,
      nightly_usd: nightly,
      total_usd: total,
      price_resolved: true,
      cached: false,
      freeCancellationSeen: freeCancel,
      offers,
      topThings:
        (p as { review_results?: { top_things_to_know?: unknown } })
          .review_results?.top_things_to_know ?? null,
      requestUrl: page.requestUrl ?? null,
      credits_used: useFixtures(env)
        ? 0
        : (provider as SearchApiHotelProvider).creditsUsed,
    });
  } catch (e) {
    if (e instanceof HotelQuotaExceededError) throw e;
    if (e instanceof LiveModeDisabledError) {
      return json({ ok: false, error: "live_mode_disabled" }, 403);
    }
    return json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "property_failed",
      },
      500,
    );
  }
}

async function handleReviews(
  request: Request,
  env: HotelsEnv,
  url: URL,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  if (!env.hotels_index) {
    return json({ ok: false, error: "db_unavailable" }, 503);
  }
  const token = decodeURIComponent(
    url.pathname.replace("/api/hotels/reviews/", ""),
  );
  if (!token) return json({ ok: false, error: "token_required" }, 400);

  const db = createD1HotelsRepository(env.hotels_index);
  const property = await db.getPropertyByToken(token);
  if (!property) return json({ ok: false, error: "property_not_found" }, 404);

  const cached = await getCachedReviewAnalysis(db, token);
  if (request.method === "GET") {
    return json({
      ok: true,
      cached: cached != null,
      modelVersion: REVIEW_MODEL_VERSION,
      analysis: cached,
      creditsEstimate: cached ? 0 : 2,
    });
  }

  const city = await db.getCityById(property.city_id);
  if (!city) return json({ ok: false, error: "city_not_found" }, 404);
  if (!liveEnabled(env)) {
    return json({ ok: false, error: "live_mode_disabled" }, 403);
  }
  if (!env.SEARCH_API_IO_KEY) {
    return json({ ok: false, error: "searchapi_key_missing" }, 503);
  }

  const provider = hotelProvider(env, request);
  try {
    const result = await analyzeHotelReviews({
      property,
      cityDisplay: city.display,
      citySlug: city.slug,
      cityId: city.id,
      cityMeanRating: city.mean_rating,
      provider,
      db,
      force: url.searchParams.get("force") === "1",
    });
    return json({
      ok: true,
      cached: result.cacheHit,
      analysis: result,
      credits_used: result.creditsUsed,
    });
  } catch (e) {
    if (e instanceof HotelQuotaExceededError) throw e;
    return json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "review_analysis_failed",
        credits_used: provider.creditsUsed,
      },
      500,
    );
  }
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
      ta: {
        rating: row.ta_rating,
        reviews: row.ta_reviews,
        rank: row.ta_rank,
        total: row.ta_total,
      },
      whitelist: row.whitelist ? JSON.parse(row.whitelist) : [],
    });
    if (!mapped) continue;
    const existingFacts = row.facts_json
      ? (JSON.parse(row.facts_json) as PropertyFacts)
      : undefined;
    const scored = scoreProperty(mapped, ctx, existingFacts);
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

function secondsUntil(isoTimestamp: string): number {
  const reset = Date.parse(isoTimestamp);
  if (!Number.isFinite(reset)) return 60;
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}

function json(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}
