import type { Fact, Property, PropertyFacts } from "./domain";

function unknownBool(sources: string[], observedAt: string): Fact<boolean> {
  return { value: null, status: "unknown", sources, observedAt };
}

function confirmedTrue(sources: string[], observedAt: string): Fact<boolean> {
  return { value: true, status: "confirmed", sources, observedAt };
}

function normalizeAmenity(a: string): string {
  // Google uses unicode hyphens in "Wi‑Fi" (U+2011 etc.)
  return a.toLowerCase().replace(/[\u2010-\u2015‐‑‒–—―]/g, "-");
}

function amenityMatch(amenities: string[], patterns: RegExp[]): boolean {
  return amenities.some((a) => {
    const s = normalizeAmenity(a);
    return patterns.some((re) => re.test(s));
  });
}

const AC_RE = [/air.?condition/, /\ba\/?c\b/, /climate.?control/];
const WIFI_RE = [/wi-?fi/, /wifi/, /wireless.?internet/];
// Elevator / 24h desk: Google lists are incomplete — absence stays unknown.
const ELEVATOR_RE = [/elevat/, /\blift\b/];
const DESK_RE = [/24.?hour/, /24h/, /front.?desk/, /reception/];

/**
 * P1 facts from structured amenities / offers only.
 * Absence → unknown (never false).
 */
export function extractFacts(
  property: Property,
  opts?: { freeCancellationSeen?: boolean },
): PropertyFacts {
  const at = property.observedAt;
  const src = ["google_hotels.amenities"];

  const hasAC = amenityMatch(property.amenities, AC_RE)
    ? confirmedTrue(src, at)
    : unknownBool(src, at);

  const hasWifi = amenityMatch(property.amenities, WIFI_RE)
    ? confirmedTrue(src, at)
    : unknownBool(src, at);

  const hasElevator = amenityMatch(property.amenities, ELEVATOR_RE)
    ? confirmedTrue(src, at)
    : unknownBool(src, at);

  const frontDesk24h = amenityMatch(property.amenities, DESK_RE)
    ? confirmedTrue(src, at)
    : unknownBool(src, at);

  const freeCancellationSeen =
    opts?.freeCancellationSeen === true
      ? confirmedTrue(["google_hotels_property.offers"], at)
      : unknownBool(["google_hotels_property.offers"], at);

  return { hasAC, hasElevator, frontDesk24h, hasWifi, freeCancellationSeen };
}

export function factSatisfies(
  fact: Fact<boolean>,
  strictness: "confirmed_only" | "confirmed_or_unknown",
): boolean {
  if (fact.status === "confirmed" && fact.value === true) return true;
  if (strictness === "confirmed_or_unknown" && fact.status === "unknown") {
    return true;
  }
  return false;
}
