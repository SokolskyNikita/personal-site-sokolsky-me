import { WEIGHTS } from "../config/weights";
import type { Property } from "../domain";
import { clamp } from "./quality";

export function brandBonus(tier: number): number {
  const normalized = clamp(Math.floor(tier), 0, 3) as 0 | 1 | 2 | 3;
  return WEIGHTS.brandBonusByTier[normalized];
}

export function taBonus(property: Property): number {
  const rating = property.taRating;
  const reviews = property.taReviews;
  if (rating == null || reviews == null || reviews < WEIGHTS.taMinReviews) {
    return 0;
  }
  let bonus = 0;
  if (rating >= WEIGHTS.taHighRating) bonus += WEIGHTS.taHighBonus;
  if (rating <= WEIGHTS.taLowRating) bonus += WEIGHTS.taLowPenalty;
  if (
    property.taRank != null &&
    property.taTotal != null &&
    property.taTotal > 0 &&
    property.taRank / property.taTotal <= 0.1
  ) {
    bonus += WEIGHTS.taTopDecileBonus;
  }
  return bonus;
}

export function whitelistBonus(property: Property): number {
  return property.whitelist.length > 0 ? WEIGHTS.whitelistBonus : 0;
}

export function classNudge(property: Property): number {
  return property.hotelClass != null &&
    property.hotelClass >= WEIGHTS.classNudgeMin
    ? WEIGHTS.classNudge
    : 0;
}
