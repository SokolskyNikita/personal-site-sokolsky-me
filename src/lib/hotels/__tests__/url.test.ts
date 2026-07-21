import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOTEL_FORM,
  formStateFromSearchParams,
  formStateToSearchParams,
} from "../url";

describe("hotel URL state", () => {
  it("uses defaults when numeric parameters are absent", () => {
    const state = formStateFromSearchParams(new URLSearchParams());
    expect(state.nightsMin).toBe(2);
    expect(state.nightsMax).toBe(2);
    expect(state.adults).toBe(2);
  });

  it("round-trips dated occupancy state", () => {
    const input = {
      ...DEFAULT_HOTEL_FORM,
      checkInStart: "2026-08-11",
      checkInEnd: "2026-08-12",
      nightsMin: 3,
      nightsMax: 4,
      adults: 3,
    };
    const output = formStateFromSearchParams(formStateToSearchParams(input));
    expect(output).toMatchObject(input);
  });
  it("round-trips filters", () => {
    const form = {
      ...DEFAULT_HOTEL_FORM,
      city: "buenos-aires",
      q: "Lisbon",
      requireAC: true,
      minReviews: 500 as const,
      sort: "rating" as const,
    };
    const params = formStateToSearchParams(form);
    const back = formStateFromSearchParams(params);
    expect(back.q).toBe("Lisbon");
    expect(back.requireAC).toBe(true);
    expect(back.minReviews).toBe(500);
    expect(back.sort).toBe("rating");
  });
});
