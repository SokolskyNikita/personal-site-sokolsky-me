import { describe, expect, it } from "vitest";
import {
  formStateFromSearchParams,
  formStateToSearchParams,
  DEFAULT_HOTEL_FORM,
} from "../url";

describe("hotel url state", () => {
  it("round-trips form state", () => {
    const form = {
      ...DEFAULT_HOTEL_FORM,
      city: "buenos-aires",
      q: "Lisbon",
      minComfort: 40,
      requireAC: true,
      minReviews: 500 as const,
      sort: "rating" as const,
    };
    const params = formStateToSearchParams(form);
    const back = formStateFromSearchParams(params);
    expect(back.q).toBe("Lisbon");
    expect(back.minComfort).toBe(40);
    expect(back.requireAC).toBe(true);
    expect(back.minReviews).toBe(500);
    expect(back.sort).toBe("rating");
  });
});
