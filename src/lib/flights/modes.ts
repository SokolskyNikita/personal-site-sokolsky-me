import type { Cabin, LieFlatPolicy } from "./types";

export type SearchModeId =
  | "economy"
  | "premium-economy"
  | "business"
  | "business-lie-flat";

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
    id: "business-lie-flat",
    label: "Business (all segments lie-flat)",
    cabin: "business",
    lieFlatPolicy: "all_segments",
  },
] as const;

export const DEFAULT_SEARCH_MODE_ID: SearchModeId = "business-lie-flat";

export function getSearchMode(id: string): SearchMode | undefined {
  return SEARCH_MODES.find((mode) => mode.id === id);
}

export function modeInvolvesLieFlat(policy: LieFlatPolicy): boolean {
  return policy !== "none";
}
