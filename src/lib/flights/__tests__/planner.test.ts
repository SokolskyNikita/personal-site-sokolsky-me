import { describe, expect, it } from "vitest";
import { MAX_AIRPORTS_PER_BATCH } from "../constants";
import { planSearch } from "../planner";
import { DEFAULT_FORM } from "../url";

describe("planSearch", () => {
  it("computes exact cross-product call count with multi-batch sets on both sides", () => {
    // Schengen/EU = 25 airports → 3 batches at size 10
    // Canada = 6 airports → 1 batch
    // 3 days → 3 × 1 × 3 = 9
    const plan = planSearch({
      origin: "schengen-eu-gateways",
      dest: "canada-gateways",
      dateRange: { start: "2026-07-20", days: 3 },
    });
    expect(plan.callCount).toBe(9);
    expect(plan.steps).toHaveLength(9);
    expect(plan.dates).toEqual(["2026-07-20", "2026-07-21", "2026-07-22"]);
  });

  it("batches both endpoints when sets exceed batch size", () => {
    // default dest registry = 20 airports → 2 batches of 10
    // EZE = 1 → 1 batch
    // 7 days → 2 × 1 × 7 = 14
    const plan = planSearch(
      {
        origin: "EZE",
        dest: DEFAULT_FORM.dest,
        dateRange: { start: "2026-07-20", days: 7 },
      },
      MAX_AIRPORTS_PER_BATCH,
    );
    expect(plan.destAirports).toHaveLength(20);
    expect(plan.callCount).toBe(14);
    expect(plan.steps[0]!.destBatch).toHaveLength(10);
    expect(plan.steps[1]!.destBatch).toHaveLength(10);
  });

  it("uses a smaller batch size for call-count math proof", () => {
    // 25 origin airports / batch 2 = 13 batches; 6 dest / batch 2 = 3 batches
    // 2 days → 13 × 3 × 2 = 78
    const plan = planSearch(
      {
        origin: "schengen-eu-gateways",
        dest: "canada-gateways",
        dateRange: { start: "2026-08-01", days: 2 },
      },
      2,
    );
    expect(plan.originAirports).toHaveLength(25);
    expect(plan.destAirports).toHaveLength(6);
    expect(plan.callCount).toBe(78);
  });
});
