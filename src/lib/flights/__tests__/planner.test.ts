import { describe, expect, it } from "vitest";
import {
  DEFAULT_DAILY_BUDGET,
  DEFAULT_RATE_LIMIT_PER_DAY,
  MAX_AIRPORTS_PER_BATCH,
} from "../constants";
import { planSearch } from "../planner";
import { DEFAULT_FORM } from "../url";

describe("planSearch", () => {
  it("covers the selected date plus seven days after it", () => {
    const plan = planSearch({
      origin: "EZE",
      dest: "JFK",
      dateRange: { start: "2026-07-16", days: 7 },
    });

    expect(plan.dates).toEqual([
      "2026-07-16",
      "2026-07-17",
      "2026-07-18",
      "2026-07-19",
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
    ]);
  });

  it("adds a return date and bounded call estimate for round trips", () => {
    const plan = planSearch({
      origin: "EZE",
      dest: "JFK",
      tripType: "round_trip",
      tripLengthDays: 7,
      dateRange: { start: "2026-07-16", days: 1 },
    });

    expect(plan.steps.map((step) => step.returnDate)).toEqual([
      "2026-07-23",
      "2026-07-24",
    ]);
    expect(plan.callCount).toBe(2);
    expect(plan.estimatedMaxCalls).toBe(10);
  });

  it("computes exact cross-product call count with multi-batch sets on both sides", () => {
    // Schengen/EU = 40 airports → 4 batches at size 10
    // Canada = 6 airports → 1 batch
    // Selected date + 3 days → 4 × 1 × 4 = 16
    const plan = planSearch({
      origin: "schengen-eu-gateways",
      dest: "canada-gateways",
      dateRange: { start: "2026-07-20", days: 3 },
    });
    expect(plan.callCount).toBe(16);
    expect(plan.steps).toHaveLength(16);
    expect(plan.dates).toEqual([
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
    ]);
  });

  it("batches both endpoints when sets exceed batch size", () => {
    // default dest registry = 35 airports → 4 batches
    // EZE = 1 → 1 batch
    // Selected date + 7 days → 4 × 1 × 8 = 32
    const plan = planSearch(
      {
        origin: "EZE",
        dest: DEFAULT_FORM.dest,
        dateRange: { start: "2026-07-20", days: 7 },
      },
      MAX_AIRPORTS_PER_BATCH,
    );
    expect(plan.destAirports).toHaveLength(35);
    expect(plan.callCount).toBe(32);
    expect(plan.steps[0]!.destBatch).toHaveLength(10);
    expect(plan.steps[1]!.destBatch).toHaveLength(10);
    expect(plan.steps[2]!.destBatch).toHaveLength(10);
    expect(plan.steps[3]!.destBatch).toHaveLength(5);
  });

  it("uses a smaller batch size for call-count math proof", () => {
    // 40 origin airports / batch 2 = 20 batches; 6 dest / batch 2 = 3 batches
    // Selected date + 2 days → 20 × 3 × 3 = 180
    const plan = planSearch(
      {
        origin: "schengen-eu-gateways",
        dest: "canada-gateways",
        dateRange: { start: "2026-08-01", days: 2 },
      },
      2,
    );
    expect(plan.originAirports).toHaveLength(40);
    expect(plan.destAirports).toHaveLength(6);
    expect(plan.callCount).toBe(180);
  });

  it("keeps the largest registry search within configured limits", () => {
    const plan = planSearch({
      origin: "usa-gateways",
      dest: "schengen-eu-gateways",
      dateRange: { start: "2026-08-01", days: 14 },
    });

    expect(plan.callCount).toBe(240);
    // Largest plans exceed the per-IP daily cap; the global budget still
    // covers a few of them site-wide when mostly uncached.
    expect(DEFAULT_RATE_LIMIT_PER_DAY).toBe(200);
    expect(DEFAULT_DAILY_BUDGET).toBe(2_000);
    expect(DEFAULT_DAILY_BUDGET).toBeGreaterThanOrEqual(plan.callCount * 4);
  });
});
