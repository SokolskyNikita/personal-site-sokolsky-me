import brandsConfig from "./config/brands.json";
import categoriesConfig from "./config/categories.json";
import type {
  CategoryBreakdown,
  CategoryKey,
  Property,
  ReviewsHistogram,
} from "./domain";
import type {
  ReviewsBreakdownItem,
  SearchApiListProperty,
} from "./providers/types";

const BRAND_TIERS = (["3", "2", "1"] as const).map((tier) => ({
  tier: Number(tier),
  patterns: (brandsConfig as Record<string, string[]>)[tier].map(
    (p) => new RegExp(p, "i"),
  ),
}));

const CATEGORY_ALIASES = categoriesConfig as Record<CategoryKey, string[]>;

export function matchBrandTier(name: string): number {
  for (const { tier, patterns } of BRAND_TIERS) {
    if (patterns.some((re) => re.test(name))) return tier;
  }
  return 0;
}

export function canonicalizeCategory(
  name: string | undefined,
): CategoryKey | null {
  if (!name) return null;
  for (const [key, aliases] of Object.entries(CATEGORY_ALIASES) as [
    CategoryKey,
    string[],
  ][]) {
    if (aliases.some((a) => a.toLowerCase() === name.toLowerCase())) {
      return key;
    }
  }
  return null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function mapHistogram(
  h: SearchApiListProperty["reviews_histogram"],
): ReviewsHistogram | null {
  if (!h) return null;
  return {
    1: h["1"] ?? 0,
    2: h["2"] ?? 0,
    3: h["3"] ?? 0,
    4: h["4"] ?? 0,
    5: h["5"] ?? 0,
  };
}

function mapBreakdown(items: ReviewsBreakdownItem[] | undefined): {
  breakdown: CategoryBreakdown[];
  worstCategory: string | null;
  worstCategoryNeg: number | null;
} {
  const breakdown: CategoryBreakdown[] = [];
  let worstCategory: string | null = null;
  let worstCategoryNeg: number | null = null;

  for (const item of items ?? []) {
    const key = canonicalizeCategory(item.name);
    if (!key) continue;
    const positive = item.positive ?? 0;
    const negative = item.negative ?? 0;
    const neutral = item.neutral ?? 0;
    const total = item.total ?? item.total_mentions ?? positive + negative + neutral;
    const denom = positive + negative;
    const negRate = denom > 0 ? negative / denom : null;
    breakdown.push({
      key,
      name: item.name ?? key,
      positive,
      negative,
      neutral,
      total,
      negRate,
    });
    if (negRate != null && (worstCategoryNeg == null || negRate > worstCategoryNeg)) {
      worstCategoryNeg = negRate;
      worstCategory = item.name ?? key;
    }
  }
  return { breakdown, worstCategory, worstCategoryNeg };
}

function lowStarShare(
  hist: ReviewsHistogram | null,
  reviews: number | null,
): number | null {
  if (!hist || !reviews || reviews <= 0) return null;
  return (hist[1] + hist[2]) / reviews;
}

/** Build Google Hotels deep-link fallback (see NOTES.md ADR). */
export function googleHotelsSearchUrl(
  name: string,
  city: string,
  checkIn?: string,
  checkOut?: string,
): string {
  const q = encodeURIComponent(`${name} ${city}`);
  const url = new URL(`https://www.google.com/travel/search?q=${q}`);
  if (checkIn) url.searchParams.set("checkin", checkIn);
  if (checkOut) url.searchParams.set("checkout", checkOut);
  return url.toString();
}

export type MapPropertyOptions = {
  citySlug: string;
  cityDisplay: string;
  checkIn?: string;
  checkOut?: string;
  provider?: string;
  observedAt?: string;
  ta?: {
    rating?: number | null;
    reviews?: number | null;
    rank?: number | null;
    total?: number | null;
  };
  whitelist?: string[];
};

/**
 * Sole place that reads provider raw JSON into Property.
 * Unknown / missing fields become null — never invent amenities.
 */
export function mapListProperty(
  raw: SearchApiListProperty,
  opts: MapPropertyOptions,
): Property | null {
  const token = raw.property_token;
  const name = raw.name;
  if (!token || !name) return null;

  const reviews = num(raw.reviews);
  const histogram = mapHistogram(raw.reviews_histogram);
  const { breakdown, worstCategory, worstCategoryNeg } = mapBreakdown(
    raw.reviews_breakdown,
  );
  const amenities = Array.isArray(raw.amenities)
    ? raw.amenities.filter((a): a is string => typeof a === "string")
    : [];

  return {
    token,
    name,
    citySlug: opts.citySlug,
    type: typeof raw.type === "string" ? raw.type : null,
    lat: num(raw.gps_coordinates?.latitude),
    lng: num(raw.gps_coordinates?.longitude),
    hotelClass: num(raw.extracted_hotel_class),
    brandTier: matchBrandTier(name),
    rating: num(raw.rating),
    reviews,
    amenities,
    histogram,
    breakdown,
    lowStarShare: lowStarShare(histogram, reviews),
    worstCategory,
    worstCategoryNeg,
    taRating: opts.ta?.rating ?? null,
    taReviews: opts.ta?.reviews ?? null,
    taRank: opts.ta?.rank ?? null,
    taTotal: opts.ta?.total ?? null,
    whitelist: opts.whitelist ?? [],
    nightlyUsd: num(raw.price_per_night?.extracted_price),
    totalUsd: num(raw.total_price?.extracted_price),
    googleHotelsUrl: googleHotelsSearchUrl(
      name,
      opts.cityDisplay,
      opts.checkIn,
      opts.checkOut,
    ),
    provider: opts.provider ?? "searchapi",
    raw,
    observedAt: opts.observedAt ?? new Date().toISOString(),
  };
}
