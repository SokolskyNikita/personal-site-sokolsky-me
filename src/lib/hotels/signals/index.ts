/** Pure-signal registry. Add one module per signal family. */
import type { CategoryKey, Property, Subscores } from "../domain";
import {
  brandBonus,
  classNudge,
  taBonus,
  whitelistBonus,
} from "./bonuses";
import { consistencyPenalty } from "./consistency";
import { plantPenalty } from "./plant";
import { qualitySignal } from "./quality";

export { brandBonus, classNudge, consistencyPenalty, plantPenalty, taBonus, whitelistBonus };
export { bayesRating, clamp, qualitySignal } from "./quality";

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
