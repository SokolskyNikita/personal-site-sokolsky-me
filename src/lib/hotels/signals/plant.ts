import { WEIGHTS } from "../config/weights";
import type { Property } from "../domain";
import { clamp } from "./quality";

export function plantPenalty(property: Property): {
  penalty: number;
  maxNegRate: number | null;
  worstPlantCategory: string | null;
} {
  let maxNegRate: number | null = null;
  let worstPlantCategory: string | null = null;
  for (const category of property.breakdown) {
    if (category.positive + category.negative < WEIGHTS.plantMinMentions) {
      continue;
    }
    if (
      category.negRate != null &&
      (maxNegRate == null || category.negRate > maxNegRate)
    ) {
      maxNegRate = category.negRate;
      worstPlantCategory = category.key;
    }
  }
  if (maxNegRate == null) {
    return { penalty: 0, maxNegRate: null, worstPlantCategory: null };
  }
  return {
    penalty:
      clamp(
        (maxNegRate - WEIGHTS.plantNegFloor) / WEIGHTS.plantNegSpan,
        0,
        1,
      ) * WEIGHTS.plantMax,
    maxNegRate,
    worstPlantCategory,
  };
}
