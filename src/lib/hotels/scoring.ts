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
import { WEIGHTS } from "./config/weights";

export { SCORING_VERSION };

export function comfortScore(subscores: {
  quality: number;
  consistencyPenalty: number;
  plantPenalty: number;
  brandBonus: number;
  taBonus: number;
  whitelistBonus: number;
  classNudge: number;
  unknownPenalty?: number;
}): number {
  return (
    subscores.quality -
    subscores.consistencyPenalty -
    subscores.plantPenalty +
    subscores.brandBonus +
    subscores.taBonus +
    subscores.whitelistBonus +
    subscores.classNudge -
    (subscores.unknownPenalty ?? 0)
  );
}

export function scoreProperty(
  property: Property,
  ctx: ScanContext,
  facts?: PropertyFacts,
): ScoredProperty {
  const resolvedFacts = facts ?? extractFacts(property);
  const gates = evaluateGates(property, resolvedFacts, ctx);
  const baseSubscores = computeSubscores(property, ctx.cityMeanRating);
  const unknownCount = Object.values(resolvedFacts).filter(
    (fact) => fact.status === "unknown",
  ).length;
  const subscores = {
    ...baseSubscores,
    unknownPenalty:
      ctx.evidenceStrictness === "confirmed_or_unknown"
        ? unknownCount * WEIGHTS.unknownFactPenalty
        : 0,
  };
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
