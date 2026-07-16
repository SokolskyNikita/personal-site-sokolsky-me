import type { Cabin } from "./types";

/** SerpApi google_flights travel_class mapping (verified via serpapi://engines/google_flights). */
export const CABIN_TO_TRAVEL_CLASS: Record<Cabin, number> = {
  economy: 1,
  premium_economy: 2,
  business: 3,
  first: 4,
};

/**
 * SerpApi stops enum (verified via serpapi://engines/google_flights):
 * 0 = any, 1 = nonstop, 2 = 1 stop or fewer, 3 = 2 stops or fewer.
 * UI maxStops 1|2 maps to the matching SerpApi filter.
 */
export function maxStopsToSerpApiStops(maxStops: 1 | 2): 2 | 3 {
  return maxStops === 1 ? 2 : 3;
}

export const CABIN_LABELS: Record<Cabin, string> = {
  economy: "economy",
  premium_economy: "premium economy",
  business: "business",
  first: "first",
};
