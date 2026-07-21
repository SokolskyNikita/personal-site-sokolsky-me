import { GATE_DEFAULTS } from "./config/weights";
import type {
  GateFailure,
  Property,
  PropertyFacts,
  ScanContext,
} from "./domain";
import { factSatisfies } from "./facts";

export function evaluateGates(
  property: Property,
  facts: PropertyFacts,
  ctx: ScanContext,
): GateFailure[] {
  const failures: GateFailure[] = [];
  const minReviews = ctx.minReviews ?? GATE_DEFAULTS.minReviews;
  const minRating = ctx.minRating ?? GATE_DEFAULTS.minRating;

  if (property.reviews == null || property.reviews < minReviews) {
    failures.push({
      reason: "reviews_below_min",
      detail: `${property.reviews ?? 0} < ${minReviews}`,
    });
  }

  if (property.rating == null || property.rating < minRating) {
    failures.push({
      reason: "rating_below_min",
      detail: `${property.rating ?? "null"} < ${minRating}`,
    });
  }

  const type = (property.type ?? "").toLowerCase();
  for (const excluded of GATE_DEFAULTS.excludedTypes) {
    if (type.includes(excluded) || property.name.toLowerCase().includes(excluded)) {
      failures.push({ reason: "excluded_type", detail: excluded });
    }
  }

  if (ctx.requireAC && !factSatisfies(facts.hasAC, ctx.evidenceStrictness)) {
    failures.push({ reason: "require_ac" });
  }
  if (
    ctx.requireElevator &&
    !factSatisfies(facts.hasElevator, ctx.evidenceStrictness)
  ) {
    failures.push({ reason: "require_elevator" });
  }
  if (
    ctx.requireFrontDesk24h &&
    !factSatisfies(facts.frontDesk24h, ctx.evidenceStrictness)
  ) {
    failures.push({ reason: "require_front_desk_24h" });
  }
  if (ctx.brandedOnly && property.brandTier < 1) {
    failures.push({ reason: "branded_only" });
  }

  if (
    ctx.priceMin != null &&
    property.nightlyUsd != null &&
    property.nightlyUsd < ctx.priceMin
  ) {
    failures.push({ reason: "price_below_min" });
  }
  if (
    ctx.priceMax != null &&
    property.nightlyUsd != null &&
    property.nightlyUsd > ctx.priceMax
  ) {
    failures.push({ reason: "price_above_max" });
  }

  return failures;
}
