import { WEIGHTS } from "../config/weights";
import type { Property } from "../domain";
import { clamp } from "./quality";

export function consistencyPenalty(property: Property): number {
  const share = property.lowStarShare;
  if (share == null) return 0;
  return (
    clamp(share / WEIGHTS.consistencyLowStarShareRef, 0, 1) *
    WEIGHTS.consistencyMax
  );
}
