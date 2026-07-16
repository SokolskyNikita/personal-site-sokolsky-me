import { describe, expect, it } from "vitest";
import { MAX_AIRPORTS_PER_BATCH } from "../constants";
import { planSearch } from "../planner";

describe("planSearch", () => {
  it("computes exact cross-product call count with multi-batch sets on both sides", () => {
    // western-europe-sample = 5 airports → 1 batch at size 10
    // south-america-sample = 3 airports → 1 batch
    // 3 days → 1 × 1 × 3 = 3
    const plan = planSearch({
      origin: "western-europe-sample",
      dest: "south-america-sample",
      dateRange: { start: "2026-07-20", days: 3 },
    });
    expect(plan.callCount).toBe(3);
    expect(plan.steps).toHaveLength(3);
    expect(plan.dates).toEqual(["2026-07-20", "2026-07-21", "2026-07-22"]);
  });

  it("batches both endpoints when sets exceed batch size", () => {
    // usa-gateways = 16 airports → 2 batches of 10
    // EZE = 1 → 1 batch
    // 7 days → 2 × 1 × 7 = 14
    const plan = planSearch(
      {
        origin: "EZE",
        dest: "usa-gateways",
        dateRange: { start: "2026-07-20", days: 7 },
      },
      MAX_AIRPORTS_PER_BATCH,
    );
    expect(plan.destAirports).toHaveLength(16);
    expect(plan.callCount).toBe(14);
    expect(plan.steps[0]!.destBatch).toHaveLength(10);
    expect(plan.steps[1]!.destBatch).toHaveLength(6);
  });

  it("uses a smaller batch size for call-count math proof", () => {
    // 5 origin airports / batch 2 = 3 batches; 3 dest / batch 2 = 2 batches; 2 days
    // 3 × 2 × 2 = 12
    const plan = planSearch(
      {
        origin: "western-europe-sample",
        dest: "south-america-sample",
        dateRange: { start: "2026-08-01", days: 2 },
      },
      2,
    );
    expect(plan.originAirports).toHaveLength(5);
    expect(plan.destAirports).toHaveLength(3);
    expect(plan.callCount).toBe(12);
  });
});
