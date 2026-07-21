export type FactStatus = "confirmed" | "inferred" | "unknown" | "conflicting";

export type Fact<T> = {
  value: T | null;
  status: FactStatus;
  sources: string[];
  observedAt: string;
  modelVersion?: string;
};

export type PropertyFacts = {
  hasAC: Fact<boolean>;
  hasElevator: Fact<boolean>;
  frontDesk24h: Fact<boolean>;
  hasWifi: Fact<boolean>;
  freeCancellationSeen: Fact<boolean>;
};

export type EvidenceStrictness = "confirmed_only" | "confirmed_or_unknown";

export type CategoryKey =
  | "bathroom"
  | "rooms"
  | "cleanliness"
  | "sleep"
  | "wifi";

export type CategoryBreakdown = {
  key: CategoryKey;
  name: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  negRate: number | null;
};

export type ReviewsHistogram = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

/** Provider-agnostic property used by facts/gates/signals. */
export type Property = {
  token: string;
  name: string;
  citySlug: string;
  type: string | null;
  lat: number | null;
  lng: number | null;
  hotelClass: number | null;
  brandTier: number;
  rating: number | null;
  reviews: number | null;
  amenities: string[];
  histogram: ReviewsHistogram | null;
  breakdown: CategoryBreakdown[];
  lowStarShare: number | null;
  worstCategory: string | null;
  worstCategoryNeg: number | null;
  taRating: number | null;
  taReviews: number | null;
  taRank: number | null;
  taTotal: number | null;
  whitelist: string[];
  nightlyUsd: number | null;
  totalUsd: number | null;
  googleHotelsUrl: string | null;
  provider: string;
  raw: unknown;
  observedAt: string;
};

export type ScanContext = {
  citySlug: string;
  cityMeanRating: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  evidenceStrictness: EvidenceStrictness;
  requireAC?: boolean;
  requireElevator?: boolean;
  requireFrontDesk24h?: boolean;
  brandedOnly?: boolean;
  minReviews?: number;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
};

export type GateFailure = {
  reason: string;
  detail?: string;
};

export type Subscores = {
  quality: number;
  consistencyPenalty: number;
  plantPenalty: number;
  brandBonus: number;
  taBonus: number;
  whitelistBonus: number;
  classNudge: number;
  bayesRating: number;
  maxNegRate: number | null;
  worstPlantCategory: string | null;
};

export type ScoredProperty = {
  property: Property;
  facts: PropertyFacts;
  gates: GateFailure[];
  gatedOut: boolean;
  score: number;
  subscores: Subscores;
  scoringVersion: number;
};

export type StayOption = {
  checkIn: string;
  checkOut: string;
  nightlyUsd: number;
  totalUsd: number;
};

export type ScanResult = {
  citySlug: string;
  found: number;
  scored: number;
  gatedOut: number;
  topExclusionReason: string | null;
  creditsUsed: number;
  enriched: number;
  top10: ScoredProperty[];
  all: ScoredProperty[];
  cityMeanRating: number;
  scoringVersion: number;
};

export type OpsStats = {
  cacheHits: number;
  liveCalls: number;
  creditsUsed: number;
  propertiesDiscovered: number;
  propertiesEnriched: number;
  propertiesExcluded: number;
  topExclusionReason: string | null;
  partialFailures: string[];
};
