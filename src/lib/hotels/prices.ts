import {
  PRICE_CACHE_HIT_THRESHOLD,
  PRICE_CACHE_TTL_HOURS,
  PRICE_TOPUP_MAX_CALLS,
  PRICE_TOPUP_TOP_N,
} from "./constants";
import { computeDeals, type DealResult } from "./deals";
import type { HotelsRepository, PropertyRow } from "./db";
import { getCityConfig } from "./pipeline";
import type { HotelDataProvider } from "./providers/types";
import { googleHotelsSearchUrl } from "./mapper";
import {
  generateStayWindows,
  median,
  type StayWindow,
  type WindowGenInput,
} from "./windows";

export type StayPrice = {
  checkIn: string;
  checkOut: string;
  nights: number;
  nightlyUsd: number;
  totalUsd: number | null;
};

export type PricedHotel = {
  token: string;
  name: string;
  score: number | null;
  matchingStays: StayPrice[];
  bestStay: StayPrice | null;
  minNightly: number | null;
  medianNightly: number | null;
  maxNightly: number | null;
  expectedUsd: number | null;
  dealPct: number | null;
  dealMethod: DealResult["method"] | null;
  googleHotelsUrl: string | null;
  matrix: { checkIn: string; checkOut: string; nightlyUsd: number | null }[];
};

export type PriceSweepResult = {
  windows: StayWindow[];
  properties: PricedHotel[];
  creditsUsed: number;
  cacheHits: number;
  liveCalls: number;
  windowsSkippedCache: number;
  topupCalls: number;
  pricedCount: number;
  indexSize: number;
};

export type PriceSweepInput = {
  citySlug: string;
  provider: HotelDataProvider;
  db: HotelsRepository;
  windows: WindowGenInput;
  adults?: number;
  /** Single-window coverage fill; disabled for flexible sweeps to preserve 1 credit/window. */
  topUp?: boolean;
  /** Cap index rows considered for join / deal set. */
  indexLimit?: number;
};

function windowCacheToken(citySlug: string): string {
  return `__window__:${citySlug}`;
}

export function planPriceSweepCredits(
  windows: StayWindow[],
  cacheHitWindows: number,
): number {
  return Math.max(0, windows.length - cacheHitWindows);
}

/**
 * One dated list call per window (unless cache covers enough index tokens).
 * Joins prices onto the comfort index by token; computes deals on bestStay.
 */
export async function runPriceSweep(
  input: PriceSweepInput,
): Promise<PriceSweepResult> {
  const city = getCityConfig(input.citySlug);
  const cityRow = await input.db.getCityBySlug(input.citySlug);
  if (!cityRow) {
    return {
      windows: [],
      properties: [],
      creditsUsed: 0,
      cacheHits: 0,
      liveCalls: 0,
      windowsSkippedCache: 0,
      topupCalls: 0,
      pricedCount: 0,
      indexSize: 0,
    };
  }

  const windows = generateStayWindows(input.windows);
  const index = await input.db.listByCityScore(
    cityRow.id,
    input.indexLimit ?? 100,
  );
  const tokens = index.map((r) => r.token);
  const tokenSet = new Set(tokens);
  const now = Math.floor(Date.now() / 1000);
  const fresherThan = now - PRICE_CACHE_TTL_HOURS * 3600;

  let creditsUsed = 0;
  let cacheHits = 0;
  let liveCalls = 0;
  let windowsSkippedCache = 0;
  let topupCalls = 0;

  /** token → list of stay prices across windows */
  const byToken = new Map<string, StayPrice[]>();
  const primaryWindow = windows[0];

  for (const w of windows) {
    const windowMarker = windowCacheToken(input.citySlug);
    const cached = await input.db.listPricesForTokens(
      [...tokens, windowMarker],
      w.checkIn,
      w.checkOut,
      fresherThan,
    );
    const cachedWithPrice = cached.filter(
      (c) => c.token !== windowMarker && c.nightly_usd != null,
    );
    cacheHits += cachedWithPrice.length;

    const coverTarget = Math.min(PRICE_CACHE_HIT_THRESHOLD, tokens.length);
    const windowFetched = cached.some((c) => c.token === windowMarker);
    const needLive = !windowFetched && cachedWithPrice.length < coverTarget;
    if (!needLive) {
      windowsSkippedCache += 1;
      mergeCached(byToken, cachedWithPrice, w);
      continue;
    }

    const page = await input.provider.listProperties({
      q: city?.query ?? cityRow.query ?? input.citySlug,
      checkIn: w.checkIn,
      checkOut: w.checkOut,
      adults: input.adults ?? 2,
      gl: cityRow.gl ?? "us",
      sortBy: "most_reviewed",
      propertyType: "hotel",
    });
    liveCalls += 1;
    creditsUsed += 1;

    const seen = new Set<string>();
    for (const raw of page.properties) {
      const token = raw.property_token;
      if (!token || !tokenSet.has(token)) continue;
      const nightly = raw.price_per_night?.extracted_price;
      const total = raw.total_price?.extracted_price ?? null;
      if (typeof nightly !== "number" || !(nightly > 0)) {
        await input.db.upsertPrice({
          token,
          checkIn: w.checkIn,
          checkOut: w.checkOut,
          nightlyUsd: null,
          totalUsd: null,
          fetchedAt: now,
        });
        seen.add(token);
        continue;
      }
      seen.add(token);
      await input.db.upsertPrice({
        token,
        checkIn: w.checkIn,
        checkOut: w.checkOut,
        nightlyUsd: nightly,
        totalUsd: typeof total === "number" ? total : null,
        fetchedAt: now,
      });
      pushStay(byToken, token, {
        checkIn: w.checkIn,
        checkOut: w.checkOut,
        nights: w.nights,
        nightlyUsd: nightly,
        totalUsd: typeof total === "number" ? total : null,
      });
    }

    // Marker so this window is not re-fetched (do NOT null-fill missing index
    // tokens — absence from one list page ≠ unpriced; top-up handles gaps).
    await input.db.upsertPrice({
      token: windowMarker,
      checkIn: w.checkIn,
      checkOut: w.checkOut,
      nightlyUsd: null,
      totalUsd: null,
      source: "window_marker",
      fetchedAt: now,
    });

    for (const c of cachedWithPrice) {
      if (!seen.has(c.token)) {
        pushStay(byToken, c.token, {
          checkIn: w.checkIn,
          checkOut: w.checkOut,
          nights: w.nights,
          nightlyUsd: c.nightly_usd!,
          totalUsd: c.total_usd,
        });
      }
    }
  }

  // List pages miss many comfort-ranked hotels — top up top-N via property details
  // on the primary window only (keeps flexible sweeps cheap).
  if (primaryWindow && input.topUp === true) {
    const top = index.slice(0, PRICE_TOPUP_TOP_N);
    for (const row of top) {
      if (topupCalls >= PRICE_TOPUP_MAX_CALLS) break;
      if ((byToken.get(row.token) ?? []).length > 0) continue;
      const cached = await input.db.listPricesForTokens(
        [row.token],
        primaryWindow.checkIn,
        primaryWindow.checkOut,
        fresherThan,
      );
      if (cached.length && cached[0]!.nightly_usd != null) {
        pushStay(byToken, row.token, {
          checkIn: primaryWindow.checkIn,
          checkOut: primaryWindow.checkOut,
          nights: primaryWindow.nights,
          nightlyUsd: cached[0]!.nightly_usd,
          totalUsd: cached[0]!.total_usd,
        });
        cacheHits += 1;
        continue;
      }
      // Only trust a null from a prior property top-up; list misses are not final.
      if (
        cached.length &&
        cached[0]!.nightly_usd == null &&
        cached[0]!.source === "searchapi_property"
      ) {
        continue;
      }

      try {
        const page = await input.provider.getProperty({
          propertyToken: row.token,
          checkIn: primaryWindow.checkIn,
          checkOut: primaryWindow.checkOut,
          adults: input.adults ?? 2,
        });
        topupCalls += 1;
        creditsUsed += 1;
        liveCalls += 1;
        const nightly = page.property.price_per_night?.extracted_price;
        const total = page.property.total_price?.extracted_price ?? null;
        const nightlyUsd =
          typeof nightly === "number" && nightly > 0 ? nightly : null;
        await input.db.upsertPrice({
          token: row.token,
          checkIn: primaryWindow.checkIn,
          checkOut: primaryWindow.checkOut,
          nightlyUsd,
          totalUsd: typeof total === "number" ? total : null,
          source: "searchapi_property",
          fetchedAt: now,
        });
        if (nightlyUsd != null) {
          pushStay(byToken, row.token, {
            checkIn: primaryWindow.checkIn,
            checkOut: primaryWindow.checkOut,
            nights: primaryWindow.nights,
            nightlyUsd,
            totalUsd: typeof total === "number" ? total : null,
          });
        }
      } catch {
        await input.db.upsertPrice({
          token: row.token,
          checkIn: primaryWindow.checkIn,
          checkOut: primaryWindow.checkOut,
          nightlyUsd: null,
          totalUsd: null,
          source: "searchapi_property",
          fetchedAt: now,
        });
        topupCalls += 1;
        creditsUsed += 1;
      }
    }
  }

  const display = city?.display ?? cityRow.display;
  const dealSamples = index
    .map((row) => {
      const stays = byToken.get(row.token) ?? [];
      const best = cheapestStay(stays);
      if (!best || row.score == null) return null;
      return {
        token: row.token,
        comfort: row.score,
        nightlyUsd: best.nightlyUsd,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  const deals = computeDeals(dealSamples);
  const dealByToken = new Map(deals.map((d) => [d.token, d]));

  const properties: PricedHotel[] = index.map((row) =>
    toPricedHotel(row, byToken.get(row.token) ?? [], windows, dealByToken, display),
  );

  return {
    windows,
    properties,
    creditsUsed,
    cacheHits,
    liveCalls,
    windowsSkippedCache,
    topupCalls,
    pricedCount: properties.filter((p) => p.bestStay != null).length,
    indexSize: index.length,
  };
}

function mergeCached(
  byToken: Map<string, StayPrice[]>,
  cached: { token: string; nightly_usd: number | null; total_usd: number | null }[],
  w: StayWindow,
): void {
  for (const c of cached) {
    if (c.nightly_usd == null) continue;
    pushStay(byToken, c.token, {
      checkIn: w.checkIn,
      checkOut: w.checkOut,
      nights: w.nights,
      nightlyUsd: c.nightly_usd,
      totalUsd: c.total_usd,
    });
  }
}

function pushStay(
  byToken: Map<string, StayPrice[]>,
  token: string,
  stay: StayPrice,
): void {
  const list = byToken.get(token) ?? [];
  list.push(stay);
  byToken.set(token, list);
}

function cheapestStay(stays: StayPrice[]): StayPrice | null {
  if (!stays.length) return null;
  return [...stays].sort((a, b) => a.nightlyUsd - b.nightlyUsd)[0] ?? null;
}

function toPricedHotel(
  row: PropertyRow,
  stays: StayPrice[],
  windows: StayWindow[],
  dealByToken: Map<string, DealResult>,
  cityDisplay: string,
): PricedHotel {
  const best = cheapestStay(stays);
  const nightlies = stays.map((s) => s.nightlyUsd);
  const deal = dealByToken.get(row.token) ?? null;
  const matrix = windows.map((w) => {
    const hit = stays.find(
      (s) => s.checkIn === w.checkIn && s.checkOut === w.checkOut,
    );
    return {
      checkIn: w.checkIn,
      checkOut: w.checkOut,
      nightlyUsd: hit?.nightlyUsd ?? null,
    };
  });
  return {
    token: row.token,
    name: row.name,
    score: row.score,
    matchingStays: stays,
    bestStay: best,
    minNightly: nightlies.length ? Math.min(...nightlies) : null,
    medianNightly: median(nightlies),
    maxNightly: nightlies.length ? Math.max(...nightlies) : null,
    expectedUsd: deal?.expectedUsd ?? null,
    dealPct: deal?.dealPct ?? null,
    dealMethod: deal?.method ?? null,
    googleHotelsUrl: best
      ? googleHotelsSearchUrl(row.name, cityDisplay, best.checkIn, best.checkOut)
      : googleHotelsSearchUrl(row.name, cityDisplay),
    matrix,
  };
}
