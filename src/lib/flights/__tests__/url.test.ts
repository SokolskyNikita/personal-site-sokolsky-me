import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_FORM,
  defaultFormState,
  formStateFromSearchParams,
  formStateToLegSearch,
  formStateToSearchParams,
} from "../url";

afterEach(() => {
  vi.useRealTimers();
});

describe("spec ↔ URL round-trip", () => {
  it("uses today and four results by default", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T12:00:00Z"));

    expect(defaultFormState()).toMatchObject({
      origin: "buenos-aires",
      dest: "usa-gateways",
      start: "2026-07-16",
      topN: 4,
      deepSearch: false,
    });
  });

  it("round-trips cabin and lieFlatPolicy explicitly", () => {
    const form = defaultFormState("2026-07-20");
    form.origin = DEFAULT_FORM.origin;
    form.dest = DEFAULT_FORM.dest;
    form.mode = "business-lie-flat";
    form.cabin = "business";
    form.lieFlatPolicy = "all_segments";
    form.days = 7;
    form.maxStops = 1;
    form.maxTotalHours = 36;
    form.topN = 2;
    form.deepSearch = true;
    form.currency = "EUR";

    const params = formStateToSearchParams(form);
    expect(params.get("cabin")).toBe("business");
    expect(params.get("lieFlatPolicy")).toBe("all_segments");
    expect(params.get("maxTotalHours")).toBe("36");
    expect(params.get("currency")).toBe("EUR");
    expect(params.has("deepSearch")).toBe(false);

    const restored = formStateFromSearchParams(params);
    expect(restored.cabin).toBe("business");
    expect(restored.lieFlatPolicy).toBe("all_segments");
    expect(restored.maxTotalHours).toBe(36);
    expect(restored.mode).toBe("business-lie-flat");
    expect(restored.deepSearch).toBe(false);
    expect(restored.origin).toBe(DEFAULT_FORM.origin);
    expect(restored.dest).toBe(DEFAULT_FORM.dest);
    expect(restored.currency).toBe("EUR");

    const spec = formStateToLegSearch(restored);
    expect(spec.cabin).toBe("business");
    expect(spec.lieFlatPolicy).toBe("all_segments");
    expect(spec.maxTotalHours).toBe(36);
    // Display currency is EUR, but API searches stay in USD for cache reuse.
    expect(spec.currency).toBe("USD");
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

  it("never enables unverified seat results from URL parameters", () => {
    const form = formStateFromSearchParams(
      new URLSearchParams({ includeUnverified: "1" }),
    );

    expect(formStateToSearchParams(form).has("includeUnverified")).toBe(false);
    expect(formStateToLegSearch(form).includeUnverified).toBe(false);
  });

  it("defaults invalid max-total-hours values to 24", () => {
    const form = formStateFromSearchParams(
      new URLSearchParams({ maxTotalHours: "25" }),
    );

    expect(form.maxTotalHours).toBe(24);
  });

  it("round-trips a 0-stops (nonstop) filter", () => {
    const form = defaultFormState("2026-07-20");
    form.maxStops = 0;

    const params = formStateToSearchParams(form);
    expect(params.get("maxStops")).toBe("0");

    const restored = formStateFromSearchParams(params);
    expect(restored.maxStops).toBe(0);
    expect(formStateToLegSearch(restored).maxStops).toBe(0);
  });

  it("accepts an 18-hour itinerary limit", () => {
    const form = formStateFromSearchParams(
      new URLSearchParams({ maxTotalHours: "18" }),
    );

    expect(form.maxTotalHours).toBe(18);
    expect(formStateToLegSearch(form).maxTotalHours).toBe(18);
  });

  it("accepts legacy deep-search URLs but no longer persists the flag", () => {
    const restored = formStateFromSearchParams(
      new URLSearchParams({ deepSearch: "1" }),
    );
    expect(restored.deepSearch).toBe(true);
    expect(formStateToSearchParams(restored).has("deepSearch")).toBe(false);
  });

  it("defaults to one-way without persisting trip params", () => {
    const form = defaultFormState("2026-07-20");
    const params = formStateToSearchParams(form);

    expect(form.tripType).toBe("one_way");
    expect(form.flexibleTripLength).toBe(false);
    expect(params.has("tripType")).toBe(false);
    expect(params.has("tripLengthDays")).toBe(false);
    expect(params.has("flexibleTripLength")).toBe(false);
    expect(formStateToLegSearch(form).tripType).toBe("one_way");
  });

  it("round-trips round-trip searches with a flexible trip length", () => {
    const form = defaultFormState("2026-07-20");
    form.tripType = "round_trip";
    form.tripLengthDays = 10;
    form.flexibleTripLength = true;

    const params = formStateToSearchParams(form);
    expect(params.get("tripType")).toBe("round_trip");
    expect(params.get("tripLengthDays")).toBe("10");
    expect(params.get("flexibleTripLength")).toBe("1");

    const restored = formStateFromSearchParams(params);
    expect(restored.tripType).toBe("round_trip");
    expect(restored.tripLengthDays).toBe(10);
    expect(restored.flexibleTripLength).toBe(true);
    expect(formStateToLegSearch(restored)).toMatchObject({
      tripType: "round_trip",
      tripLengthDays: 10,
      flexibleTripLength: true,
    });
  });
});
