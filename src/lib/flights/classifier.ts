import type { SeatClassification } from "./types";

/**
 * Case-insensitive substring rules for seat classification.
 * Checked in order: NOT_LIE_FLAT first (so "angled flat" is not LIE_FLAT),
 * then LIE_FLAT, else UNKNOWN.
 */
export const SEAT_CLASSIFICATION_RULES = {
  NOT_LIE_FLAT: [
    "angled flat",
    "reclining seat",
    "extra reclining",
    "average legroom",
    "below average legroom",
    "above average legroom",
  ],
  LIE_FLAT: ["lie flat", "flat bed", "individual suite", "suite"],
} as const;

export function classifySeat(amenities: string[]): SeatClassification {
  const haystack = amenities.join(" ").toLowerCase();
  if (!haystack.trim()) return "unknown";

  for (const phrase of SEAT_CLASSIFICATION_RULES.NOT_LIE_FLAT) {
    if (haystack.includes(phrase)) return "not_lie_flat";
  }
  for (const phrase of SEAT_CLASSIFICATION_RULES.LIE_FLAT) {
    if (haystack.includes(phrase)) return "lie_flat";
  }
  return "unknown";
}

/** Extract a legroom descriptor from amenity strings when present. */
export function extractLegroom(amenities: string[]): string | undefined {
  for (const amenity of amenities) {
    const match = amenity.match(
      /(\d+\s*in(?:ch(?:es)?)?\s+)?((?:below |above )?average legroom|legroom)/i,
    );
    if (match) return amenity.trim();
  }
  return undefined;
}
