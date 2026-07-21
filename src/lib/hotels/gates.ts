import { GATE_DEFAULTS } from "./config/weights";
import type {
  GateFailure,
  Property,
  PropertyFacts,
  ScanContext,
} from "./domain";
import { factSatisfies } from "./facts";

const SHARED_BATHROOM_PATTERN =
  /\b(?:shared|communal)(?:\s+(?:or|and)\s+(?:private|en[\s-]?suite))?\s+(?:bathrooms?|baths?|toilets?|restrooms?|washrooms?)\b|\b(?:private|en[\s-]?suite)\s+(?:or|and)\s+(?:shared|communal)\s+(?:bathrooms?|baths?|toilets?|restrooms?|washrooms?)\b|\b(?:bathrooms?|baths?|toilets?|restrooms?|washrooms?)\s+(?:are\s+)?(?:shared|communal)\b/i;
const PARTIAL_PRIVATE_BATHROOM_PATTERN =
  /\bsome(?:\s+(?:rooms?|quarters|units?|accommodations?))?\s+(?:with|have|feature|featuring)\s+(?:an?\s+)?(?:private|en[\s-]?suite)\s+(?:bathrooms?|baths?|toilets?|restrooms?|washrooms?)\b/i;
const SHARED_LODGING_PATTERN =
  /\b(?:hostels?|backpackers?|dorms?|dormitor(?:y|ies)|capsules?|albergues?)\b/i;

export function privateBathroomExclusionReason(
  property: Property,
): string | null {
  const raw =
    property.raw && typeof property.raw === "object"
      ? (property.raw as { description?: unknown })
      : null;
  const description =
    typeof raw?.description === "string" ? raw.description : "";
  const identity = `${property.type ?? ""} ${property.name}`;
  if (SHARED_LODGING_PATTERN.test(identity)) {
    return "shared-facility accommodation type";
  }
  if (
    SHARED_BATHROOM_PATTERN.test(description) ||
    PARTIAL_PRIVATE_BATHROOM_PATTERN.test(description) ||
    SHARED_LODGING_PATTERN.test(description)
  ) {
    return "listing describes shared bathroom facilities";
  }
  return null;
}

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

  const privateBathroomFailure = privateBathroomExclusionReason(property);
  if (privateBathroomFailure) {
    failures.push({
      reason: "no_private_bathroom",
      detail: privateBathroomFailure,
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
