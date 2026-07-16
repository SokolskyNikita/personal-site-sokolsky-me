import { describe, expect, it } from "vitest";
import {
  DEFAULT_FORM,
  defaultFormState,
  formStateFromSearchParams,
  formStateToLegSearch,
  formStateToSearchParams,
} from "../url";

describe("spec ↔ URL round-trip", () => {
  it("round-trips cabin and lieFlatPolicy explicitly", () => {
    const form = defaultFormState("2026-07-20");
    form.origin = DEFAULT_FORM.origin;
    form.dest = DEFAULT_FORM.dest;
    form.mode = "business-lie-flat";
    form.cabin = "business";
    form.lieFlatPolicy = "all_segments";
    form.days = 7;
    form.maxStops = 1;
    form.topN = 2;
    form.deepSearch = true;

    const params = formStateToSearchParams(form);
    expect(params.get("cabin")).toBe("business");
    expect(params.get("lieFlatPolicy")).toBe("all_segments");
    expect(params.get("deepSearch")).toBe("1");

    const restored = formStateFromSearchParams(params);
    expect(restored.cabin).toBe("business");
    expect(restored.lieFlatPolicy).toBe("all_segments");
    expect(restored.mode).toBe("business-lie-flat");
    expect(restored.deepSearch).toBe(true);
    expect(restored.origin).toBe(DEFAULT_FORM.origin);
    expect(restored.dest).toBe(DEFAULT_FORM.dest);

    const spec = formStateToLegSearch(restored);
    expect(spec.cabin).toBe("business");
    expect(spec.lieFlatPolicy).toBe("all_segments");
  });

  it("restores first cabin via URL params without a UI preset", () => {
    const params = new URLSearchParams({
      origin: "CDG",
      dest: "JFK",
      cabin: "first",
      lieFlatPolicy: "none",
      start: "2026-08-01",
      days: "3",
      maxStops: "1",
      topN: "2",
      currency: "USD",
      gl: "us",
      hl: "en",
    });
    const form = formStateFromSearchParams(params);
    expect(form.cabin).toBe("first");
    expect(form.lieFlatPolicy).toBe("none");
    expect(formStateToLegSearch(form).cabin).toBe("first");
  });
});
