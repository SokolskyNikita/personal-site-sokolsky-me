import type { Cabin, LieFlatPolicy } from "./types";

export type SearchModeId =
  | "economy"
  | "premium-economy"
  | "business"
  | "business-any-lie-flat"
  | "business-lie-flat"
  | "first";

export type SearchMode = {
  id: SearchModeId;
  label: string;
  cabin: Cabin;
  lieFlatPolicy: LieFlatPolicy;
};

/**
 * UI preset table. Future modes are new rows, not new code paths.
 * All four LieFlatPolicy values remain implemented; presets expose a subset.
 */
export const SEARCH_MODES: readonly SearchMode[] = [
  {
    id: "economy",
    label: "Economy",
    cabin: "economy",
    lieFlatPolicy: "none",
  },
  {
    id: "premium-economy",
    label: "Premium economy",
    cabin: "premium_economy",
    lieFlatPolicy: "none",
  },
  {
    id: "business",
    label: "Business",
    cabin: "business",
    lieFlatPolicy: "none",
  },
  {
    id: "business-any-lie-flat",
    label: "Business (at least 1 segment lie-flat)",
    cabin: "business",
    lieFlatPolicy: "any_segment",
  },
  {
    id: "business-lie-flat",
    label: "Business (all segments lie-flat)",
    cabin: "business",
    lieFlatPolicy: "all_segments",
  },
  {
    id: "first",
    label: "First class",
    cabin: "first",
    lieFlatPolicy: "none",
  },
] as const;

export const DEFAULT_SEARCH_MODE_ID: SearchModeId = "economy";

export function getSearchMode(id: string): SearchMode | undefined {
  return SEARCH_MODES.find((mode) => mode.id === id);
}

export function modeInvolvesLieFlat(policy: LieFlatPolicy): boolean {
  return policy !== "none";
}
