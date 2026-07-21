import { SCORING_VERSION } from "./config/weights";
import type {
  Property,
  PropertyFacts,
  ScanContext,
  ScoredProperty,
} from "./domain";
import { extractFacts } from "./facts";
import { evaluateGates } from "./gates";
import { computeSubscores } from "./signals";

export { SCORING_VERSION };

export function comfortScore(subscores: {
  quality: number;
  consistencyPenalty: number;
  plantPenalty: number;
  brandBonus: number;
  taBonus: number;
  whitelistBonus: number;
  classNudge: number;
}): number {
  return (
    subscores.quality -
    subscores.consistencyPenalty -
    subscores.plantPenalty +
    subscores.brandBonus +
    subscores.taBonus +
    subscores.whitelistBonus +
    subscores.classNudge
  );
}

export function scoreProperty(
  property: Property,
  ctx: ScanContext,
  facts?: PropertyFacts,
): ScoredProperty {
  const resolvedFacts = facts ?? extractFacts(property);
  const gates = evaluateGates(property, resolvedFacts, ctx);
  const subscores = computeSubscores(property, ctx.cityMeanRating);
  const score = comfortScore(subscores);
  return {
    property,
    facts: resolvedFacts,
    gates,
    gatedOut: gates.length > 0,
    score,
    subscores,
    scoringVersion: SCORING_VERSION,
  };
}

export function rescoreProperties(
  properties: Property[],
  ctx: ScanContext,
): ScoredProperty[] {
  return properties
    .map((p) => scoreProperty(p, ctx))
    .sort((a, b) => b.score - a.score);
}
