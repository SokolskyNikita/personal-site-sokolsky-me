/**
 * Signal registry — each function is pure.
 * New signals: add a function + weight entry; wire in scoring.ts.
 */
import { BAYES_K } from "../constants";
import { WEIGHTS } from "../config/weights";
import type { CategoryKey, Property, Subscores } from "../domain";

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function bayesRating(
  rating: number,
  reviews: number,
  cityMean: number,
  k = BAYES_K,
): number {
  return (reviews * rating + k * cityMean) / (reviews + k);
}

export function qualitySignal(
  property: Property,
  cityMean: number,
): { quality: number; bayesRating: number } {
  const r = property.rating ?? 0;
  const n = property.reviews ?? 0;
  const bayes = bayesRating(r, n, cityMean);
  const quality =
    clamp(
      (bayes - WEIGHTS.qualityFloorRating) / WEIGHTS.qualitySpan,
      0,
      1,
    ) * WEIGHTS.qualityMax;
  return { quality, bayesRating: bayes };
}

export function consistencyPenalty(property: Property): number {
  const share = property.lowStarShare;
  if (share == null) return 0;
  return (
    clamp(share / WEIGHTS.consistencyLowStarShareRef, 0, 1) *
    WEIGHTS.consistencyMax
  );
}

export function plantPenalty(property: Property): {
  penalty: number;
  maxNegRate: number | null;
  worstPlantCategory: string | null;
} {
  let maxNegRate: number | null = null;
  let worst: string | null = null;
  for (const c of property.breakdown) {
    const mentions = c.positive + c.negative;
    if (mentions < WEIGHTS.plantMinMentions) continue;
    const rate = c.negRate;
    if (rate == null) continue;
    if (maxNegRate == null || rate > maxNegRate) {
      maxNegRate = rate;
      worst = c.key;
    }
  }
  if (maxNegRate == null) {
    return { penalty: 0, maxNegRate: null, worstPlantCategory: null };
  }
  const penalty =
    clamp(
      (maxNegRate - WEIGHTS.plantNegFloor) / WEIGHTS.plantNegSpan,
      0,
      1,
    ) * WEIGHTS.plantMax;
  return { penalty, maxNegRate, worstPlantCategory: worst };
}

export function brandBonus(tier: number): number {
  const t = clamp(Math.floor(tier), 0, 3) as 0 | 1 | 2 | 3;
  return WEIGHTS.brandBonusByTier[t];
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

export function computeSubscores(
  property: Property,
  cityMean: number,
): Subscores {
  const q = qualitySignal(property, cityMean);
  const plant = plantPenalty(property);
  return {
    quality: q.quality,
    consistencyPenalty: consistencyPenalty(property),
    plantPenalty: plant.penalty,
    brandBonus: brandBonus(property.brandTier),
    taBonus: taBonus(property),
    whitelistBonus: whitelistBonus(property),
    classNudge: classNudge(property),
    bayesRating: q.bayesRating,
    maxNegRate: plant.maxNegRate,
    worstPlantCategory: plant.worstPlantCategory,
  };
}

export type { CategoryKey };
