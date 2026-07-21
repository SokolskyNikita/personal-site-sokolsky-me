import citiesConfig from "./config/cities.json";
import {
  CITY_MEAN_FALLBACK,
  MAX_CREDITS_PER_SCAN,
  SCAN_PAGES_HIGHEST_RATING,
  SCAN_PAGES_MOST_REVIEWED,
  qualityScanDates,
} from "./constants";
import type {
  EvidenceStrictness,
  OpsStats,
  Property,
  ScanContext,
  ScanResult,
  ScoredProperty,
} from "./domain";
import type { HotelsRepository } from "./db";
import { mapListProperty } from "./mapper";
import type { HotelDataProvider, SearchApiListProperty } from "./providers/types";
import { scoreProperty } from "./scoring";

export type CityConfig = {
  slug: string;
  display: string;
  query: string;
  gl?: string;
  neighborhoods?: { name: string; bbox: number[] }[];
};

export function getCityConfig(slug: string): CityConfig | undefined {
  return (citiesConfig as CityConfig[]).find((c) => c.slug === slug);
}

export type ScanOptions = {
  citySlug: string;
  provider: HotelDataProvider;
  db?: HotelsRepository;
  force?: boolean;
  mostReviewedPages?: number;
  highestRatingPages?: number;
  maxCredits?: number;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  evidenceStrictness?: EvidenceStrictness;
  q?: string;
  bbox?: [number, number, number, number];
};

function creditEstimate(provider: HotelDataProvider): number {
  if ("creditsUsed" in provider && typeof provider.creditsUsed === "number") {
    return provider.creditsUsed;
  }
  return 0;
}

async function fetchListPages(
  provider: HotelDataProvider,
  base: {
    q?: string;
    bbox?: [number, number, number, number];
    checkIn: string;
    checkOut: string;
    adults: number;
    sortBy: "most_reviewed" | "highest_rating";
    gl: string;
  },
  maxPages: number,
  maxCredits: number,
  getCredits: () => number,
): Promise<{ raw: SearchApiListProperty[]; pages: number; aborted: boolean }> {
  const out: SearchApiListProperty[] = [];
  let token: string | undefined;
  let pages = 0;
  let aborted = false;

  for (let i = 0; i < maxPages; i++) {
    if (getCredits() >= maxCredits) {
      aborted = true;
      break;
    }
    const page = await provider.listProperties(
      {
        q: base.bbox ? undefined : base.q,
        bbox: base.bbox,
        checkIn: base.checkIn,
        checkOut: base.checkOut,
        adults: base.adults,
        sortBy: base.sortBy,
        gl: base.gl,
        hl: "en",
        currency: "USD",
        propertyType: "hotel",
      },
      token,
    );
    pages += 1;
    out.push(...page.properties);
    token = page.pagination.nextPageToken;
    if (!token) break;
  }
  return { raw: out, pages, aborted };
}

export async function runCityScan(opts: ScanOptions): Promise<ScanResult> {
  const city = getCityConfig(opts.citySlug);
  const display = city?.display ?? opts.citySlug;
  const query = opts.q ?? city?.query ?? opts.citySlug;
  const gl = city?.gl ?? "us";
  const dates = qualityScanDates();
  const checkIn = opts.checkIn ?? dates.checkIn;
  const checkOut = opts.checkOut ?? dates.checkOut;
  const adults = opts.adults ?? 2;
  const maxCredits = opts.maxCredits ?? MAX_CREDITS_PER_SCAN;
  const mostPages = opts.mostReviewedPages ?? SCAN_PAGES_MOST_REVIEWED;
  const highPages = opts.highestRatingPages ?? SCAN_PAGES_HIGHEST_RATING;

  const getCredits = () => creditEstimate(opts.provider);

  const most = await fetchListPages(
    opts.provider,
    {
      q: query,
      bbox: opts.bbox,
      checkIn,
      checkOut,
      adults,
      sortBy: "most_reviewed",
      gl,
    },
    mostPages,
    maxCredits,
    getCredits,
  );

  const highest = await fetchListPages(
    opts.provider,
    {
      q: query,
      bbox: opts.bbox,
      checkIn,
      checkOut,
      adults,
      sortBy: "highest_rating",
      gl,
    },
    highPages,
    maxCredits,
    getCredits,
  );

  const byToken = new Map<string, SearchApiListProperty>();
  for (const p of [...most.raw, ...highest.raw]) {
    if (p.property_token && !byToken.has(p.property_token)) {
      byToken.set(p.property_token, p);
    }
  }

  // List responses include histogram/breakdown — skip enrichment (NOTES.md ADR).
  const enriched = 0;

  const observedAt = new Date().toISOString();
  const properties: Property[] = [];
  for (const raw of byToken.values()) {
    const mapped = mapListProperty(raw, {
      citySlug: opts.citySlug,
      cityDisplay: display,
      checkIn,
      checkOut,
      provider: "searchapi",
      observedAt,
    });
    if (mapped) properties.push(mapped);
  }

  const ratings = properties
    .map((p) => p.rating)
    .filter((r): r is number => r != null);
  const cityMean =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : CITY_MEAN_FALLBACK;

  const ctx: ScanContext = {
    citySlug: opts.citySlug,
    cityMeanRating: cityMean,
    checkIn,
    checkOut,
    adults,
    evidenceStrictness: opts.evidenceStrictness ?? "confirmed_or_unknown",
  };

  const all = properties.map((p) => scoreProperty(p, ctx));
  const gated = all.filter((s) => s.gatedOut);
  const kept = all.filter((s) => !s.gatedOut).sort((a, b) => b.score - a.score);

  const exclusionCounts = new Map<string, number>();
  for (const s of gated) {
    const reason = s.gates[0]?.reason ?? "unknown";
    exclusionCounts.set(reason, (exclusionCounts.get(reason) ?? 0) + 1);
  }
  let topExclusionReason: string | null = null;
  let topCount = 0;
  for (const [reason, count] of exclusionCounts) {
    if (count > topCount) {
      topCount = count;
      topExclusionReason = reason;
    }
  }

  const creditsUsed = getCredits();
  // Fixture provider reports 0 credits; treat each list page as 1 estimated for ops.
  const estimatedCredits =
    creditsUsed > 0 ? creditsUsed : most.pages + highest.pages;

  if (opts.db) {
    const cityId = await opts.db.ensureCity({
      slug: opts.citySlug,
      display,
      query,
      gl,
    });
    for (const s of all) {
      await opts.db.upsertScored(cityId, s);
    }
    await opts.db.updateCityScan({
      cityId,
      meanRating: cityMean,
      scannedAt: Math.floor(Date.now() / 1000),
      credits: estimatedCredits,
    });
  }

  return {
    citySlug: opts.citySlug,
    found: byToken.size,
    scored: kept.length,
    gatedOut: gated.length,
    topExclusionReason,
    creditsUsed: estimatedCredits,
    enriched,
    top10: kept.slice(0, 10),
    all,
    cityMeanRating: cityMean,
    scoringVersion: kept[0]?.scoringVersion ?? all[0]?.scoringVersion ?? 0,
  };
}

export function scanOpsStats(result: ScanResult): OpsStats {
  return {
    cacheHits: 0,
    liveCalls: result.creditsUsed,
    creditsUsed: result.creditsUsed,
    propertiesDiscovered: result.found,
    propertiesEnriched: result.enriched,
    propertiesExcluded: result.gatedOut,
    topExclusionReason: result.topExclusionReason,
    partialFailures: [],
  };
}

export function summarizeTop(scored: ScoredProperty[]) {
  return scored.map((s) => ({
    name: s.property.name,
    token: s.property.token,
    score: round2(s.score),
    rating: s.property.rating,
    reviews: s.property.reviews,
    brandTier: s.property.brandTier,
    hotelClass: s.property.hotelClass,
    lowStarShare: s.property.lowStarShare,
    worstCategory: s.property.worstCategory,
    worstCategoryNeg: s.property.worstCategoryNeg,
    plantPenalty: round2(s.subscores.plantPenalty),
    facts: {
      hasAC: s.facts.hasAC.status,
      hasElevator: s.facts.hasElevator.status,
      hasWifi: s.facts.hasWifi.status,
    },
    gatedOut: s.gatedOut,
    gates: s.gates.map((g) => g.reason),
  }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
