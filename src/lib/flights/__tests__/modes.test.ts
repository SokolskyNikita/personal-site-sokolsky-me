import { describe, expect, it } from "vitest";
import { SEARCH_MODES, getSearchMode } from "../modes";

describe("SEARCH_MODES", () => {
  it("ships exactly four rows with correct cabin/policy mappings", () => {
    expect(SEARCH_MODES).toHaveLength(4);
    expect(getSearchMode("economy")).toEqual(
      expect.objectContaining({ cabin: "economy", lieFlatPolicy: "none" }),
    );
    expect(getSearchMode("premium-economy")).toEqual(
      expect.objectContaining({
        cabin: "premium_economy",
        lieFlatPolicy: "none",
      }),
    );
    expect(getSearchMode("business")).toEqual(
      expect.objectContaining({ cabin: "business", lieFlatPolicy: "none" }),
    );
    expect(getSearchMode("business-lie-flat")).toEqual(
      expect.objectContaining({
        cabin: "business",
        lieFlatPolicy: "all_segments",
      }),
    );
  });
});
