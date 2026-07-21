import { WEIGHTS } from "../config/weights";
import { BAYES_K } from "../constants";
import type { Property } from "../domain";

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
  const bayes = bayesRating(
    property.rating ?? 0,
    property.reviews ?? 0,
    cityMean,
  );
  const quality =
    clamp(
      (bayes - WEIGHTS.qualityFloorRating) / WEIGHTS.qualitySpan,
      0,
      1,
    ) * WEIGHTS.qualityMax;
  return { quality, bayesRating: bayes };
}
