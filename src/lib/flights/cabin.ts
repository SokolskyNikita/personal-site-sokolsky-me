import type { Cabin, MaxStops } from "./types";

/** SearchAPI.io Google Flights travel_class values. */
export const CABIN_TO_TRAVEL_CLASS: Record<Cabin, string> = {
  economy: "economy",
  premium_economy: "premium_economy",
  business: "business",
  first: "first_class",
};

/** SearchAPI.io Google Flights stops values. */
export function maxStopsToSearchApiStops(
  maxStops: MaxStops,
): "nonstop" | "one_stop_or_fewer" | "two_stops_or_fewer" {
  if (maxStops === 0) return "nonstop";
  if (maxStops === 1) return "one_stop_or_fewer";
  return "two_stops_or_fewer";
}

export const CABIN_LABELS: Record<Cabin, string> = {
  economy: "economy",
  premium_economy: "premium economy",
  business: "business",
  first: "first",
};
