import rankingsData from "../../data/lie-flat-rankings.json";
import type { Cabin, Segment } from "./types";

export type LieFlatTier =
  | "S++"
  | "S+"
  | "S"
  | "A+"
  | "A"
  | "B+"
  | "B"
  | "C+"
  | "C";

type RankingCabin = "First" | "Business";

type RankingEntry = {
  airline: string;
  product: string;
  cabin: RankingCabin;
  aircraft: string[];
  tier: LieFlatTier;
  rank: number;
};

export type LieFlatTierMatch = {
  tier: LieFlatTier;
  products: string[];
};

const TIER_ORDER: readonly LieFlatTier[] = [
  "S++",
  "S+",
  "S",
  "A+",
  "A",
  "B+",
  "B",
  "C+",
  "C",
] as const;

/** Short Google Flights names → ranking airline core. */
const AIRLINE_ALIASES: Record<string, string> = {
  jal: "japan",
  "japan air": "japan",
  scandinavian: "sas",
  "scandinavian airlines": "sas",
  "ana all nippon": "ana",
  "all nippon": "ana",
  "all nippon airways": "ana",
  tap: "tap air portugal",
  "tap portugal": "tap air portugal",
  lot: "lot polish",
  alitalia: "ita",
  zipair: "zipair",
  "zipair tokyo": "zipair",
  starlux: "starlux",
  "starlux airlines": "starlux",
  "el al": "el al",
  elal: "el al",
  boa: "boliviana de aviacion",
  boliviana: "boliviana de aviacion",
  ethiopian: "ethiopian",
  etihad: "etihad",
  // Google often drops geographic qualifiers / expands compound brands
  biman: "biman bangladesh",
  miat: "miat mongolian",
  taag: "taag angola",
  garuda: "garuda indonesia",
  edelweiss: "edelweiss air",
  juneyao: "juneyao air",
  xiamen: "xiamenair",
  "xiamen air": "xiamenair",
};

type AircraftParts = {
  family: string;
  isMax: boolean | null;
  variant: string;
};

type IndexedEntry = {
  airlineCores: string[];
  cabin: RankingCabin;
  aircraft: AircraftParts[];
  tier: LieFlatTier;
  product: string;
  rank: number;
};

const indexedEntries: IndexedEntry[] = (
  rankingsData.entries as RankingEntry[]
).map((entry) => ({
  airlineCores: airlineCores(entry.airline),
  cabin: entry.cabin,
  aircraft: entry.aircraft.map(parseAircraft),
  tier: entry.tier,
  product: entry.product,
  rank: entry.rank,
}));

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function airlineCore(value: string): string {
  const normalized = stripDiacritics(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(air lines|airlines|airline|airways)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return AIRLINE_ALIASES[normalized] ?? normalized;
}

/**
 * Ranking rows may combine carriers after mergers (e.g. "Alaska/Hawaiian").
 * Split on "/" so either Google Flights name can match.
 */
export function airlineCores(value: string): string[] {
  const parts = value
    .split("/")
    .map((part) => airlineCore(part))
    .filter(Boolean);
  return [...new Set(parts)];
}

export function airlinesMatch(searchAirline: string, rankingAirline: string): boolean {
  const left = airlineCore(searchAirline);
  if (!left) return false;
  return airlineCores(rankingAirline).includes(left);
}

export function parseAircraft(raw: string): AircraftParts {
  let value = stripDiacritics(raw).toLowerCase();
  value = value.replace(
    /\b(boeing|airbus|mcdonnell douglas|embraer|bombardier)\b/g,
    " ",
  );
  // Google often appends role suffixes: "Boeing 737MAX 9 Passenger".
  value = value.replace(/\b(passenger|freighter|combi)\b/g, " ");
  value = value.replace(/737\s*max/g, "737 max");
  // Normalize glued suffixes from Google ("A321neo", "A321XLR").
  value = value.replace(
    /\b(a\d{3})(neo|xlr|lr|ceo|t)\b/g,
    "$1 $2",
  );
  value = value.replace(/[^a-z0-9]+/g, " ");
  value = value.replace(/\s+/g, " ").trim();

  const maxMatch = value.match(/^737 max(?:\s+(\w+))?$/);
  if (maxMatch) {
    return { family: "737", isMax: true, variant: maxMatch[1] ?? "" };
  }

  const familyMatch = value.match(/^(a\d{3}|7\d{2}|md\d+|e\d+)(?:\s+(.*))?$/);
  if (!familyMatch) {
    return { family: value, isMax: null, variant: "" };
  }

  const family = familyMatch[1]!;
  let variant = (familyMatch[2] ?? "").trim();
  let isMax: boolean | null = null;
  if (family === "737") {
    if (variant.startsWith("max")) {
      isMax = true;
      variant = variant.replace(/^max\s*/, "").trim();
    } else if (variant) {
      isMax = false;
    }
  }

  return { family, isMax, variant: variant.replace(/\s+/g, "") };
}

export function aircraftMatch(
  searchAircraft: string,
  rankingAircraft: string,
): boolean {
  return aircraftPartsMatch(
    parseAircraft(searchAircraft),
    parseAircraft(rankingAircraft),
  );
}

/** A321neo / LR / XLR are often labeled interchangeably by Google Flights. */
const A321_NEO_FAMILY = new Set(["neo", "lr", "xlr"]);

function variantsCompatible(
  family: string,
  searchVariant: string,
  rankingVariant: string,
): boolean {
  if (!searchVariant || !rankingVariant) return true;
  if (searchVariant === rankingVariant) return true;
  if (
    searchVariant.includes(rankingVariant) ||
    rankingVariant.includes(searchVariant)
  ) {
    return true;
  }
  if (family === "a321") {
    // Keep A321T (AA transcon) distinct from neo-family long-haul frames.
    if (searchVariant === "t" || rankingVariant === "t") return false;
    if (
      A321_NEO_FAMILY.has(searchVariant) &&
      A321_NEO_FAMILY.has(rankingVariant)
    ) {
      return true;
    }
  }
  return false;
}

function aircraftPartsMatch(search: AircraftParts, ranking: AircraftParts): boolean {
  if (!search.family || !ranking.family) return false;
  if (search.family !== ranking.family) return false;

  if (search.family === "737") {
    if (
      search.isMax != null &&
      ranking.isMax != null &&
      search.isMax !== ranking.isMax
    ) {
      return false;
    }
  }

  return variantsCompatible(search.family, search.variant, ranking.variant);
}

function rankingCabinFor(cabin?: Cabin): RankingCabin | undefined {
  if (cabin === "first") return "First";
  if (cabin === "business") return "Business";
  return undefined;
}

/**
 * Look up lie-flat ranking tiers for an airline + aircraft + cabin.
 * Business segments only match Business products; first only matches First.
 * Returns unique tiers best→worst; empty when cabin is not business/first
 * or no ranking match exists. Callers that see lie-flat without a cabin
 * should pass "business" (see resolveLieFlatRankingCabin).
 */
export function lookupLieFlatTiers(
  carrier: string,
  aircraft: string | undefined,
  cabin?: Cabin,
): LieFlatTierMatch[] {
  if (!carrier.trim() || !aircraft?.trim()) return [];

  const wantedCabin = rankingCabinFor(cabin);
  // Never mix cabins: refuse to map without an explicit business/first cabin.
  if (!wantedCabin) return [];

  const carrierCore = airlineCore(carrier);
  if (!carrierCore) return [];
  const searchAircraft = parseAircraft(aircraft);

  const byTier = new Map<LieFlatTier, { products: Set<string>; bestRank: number }>();

  for (const entry of indexedEntries) {
    if (!entry.airlineCores.includes(carrierCore)) continue;
    if (entry.cabin !== wantedCabin) continue;
    if (!entry.aircraft.some((model) => aircraftPartsMatch(searchAircraft, model))) {
      continue;
    }

    const current = byTier.get(entry.tier);
    if (!current) {
      byTier.set(entry.tier, {
        products: new Set([entry.product]),
        bestRank: entry.rank,
      });
      continue;
    }
    current.products.add(entry.product);
    current.bestRank = Math.min(current.bestRank, entry.rank);
  }

  return TIER_ORDER.filter((tier) => byTier.has(tier)).map((tier) => {
    const match = byTier.get(tier)!;
    return {
      tier,
      products: [...match.products].sort((a, b) => a.localeCompare(b)),
    };
  });
}

/**
 * Resolve which ranking cabin to use for a lie-flat segment.
 * Prefers the segment cabin, then the search-mode cabin; if Google marks
 * lie-flat but omits travel class, presume business.
 */
export function resolveLieFlatRankingCabin(
  segmentCabin?: Cabin,
  fallbackCabin?: Cabin,
): Cabin {
  if (rankingCabinFor(segmentCabin)) return segmentCabin!;
  if (rankingCabinFor(fallbackCabin)) return fallbackCabin!;
  return "business";
}

/**
 * Unique tiers for every lie-flat segment on an itinerary (best→worst).
 * Prefers each segment's own cabin; falls back to the search-mode cabin, then
 * business when Google lists lie-flat without a travel class.
 */
export function lookupLieFlatTiersForSegments(
  segments: Segment[],
  fallbackCabin?: Cabin,
): LieFlatTierMatch[] {
  const byTier = new Map<LieFlatTier, Set<string>>();

  for (const segment of segments) {
    if (segment.seatClassification !== "lie_flat") continue;
    const cabin = resolveLieFlatRankingCabin(segment.cabin, fallbackCabin);
    for (const match of lookupLieFlatTiers(
      segment.carrier,
      segment.aircraft,
      cabin,
    )) {
      const products = byTier.get(match.tier) ?? new Set<string>();
      for (const product of match.products) products.add(product);
      byTier.set(match.tier, products);
    }
  }

  return TIER_ORDER.filter((tier) => byTier.has(tier)).map((tier) => ({
    tier,
    products: [...byTier.get(tier)!].sort((a, b) => a.localeCompare(b)),
  }));
}

export function tierBadgeClass(tier: LieFlatTier): string {
  return `fs-tier-badge fs-tier-${tier.replaceAll("+", "p")}`;
}
