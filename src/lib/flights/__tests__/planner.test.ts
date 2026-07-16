import { describe, expect, it } from "vitest";
import { MAX_AIRPORTS_PER_BATCH } from "../constants";
import { planSearch } from "../planner";
import { DEFAULT_FORM } from "../url";

describe("planSearch", () => {
  it("computes exact cross-product call count with multi-batch sets on both sides", () => {
    // Schengen/EU = 40 airports → 4 batches at size 10
    // Canada = 6 airports → 1 batch
    // 3 days → 4 × 1 × 3 = 12
    const plan = planSearch({
      origin: "schengen-eu-gateways",
      dest: "canada-gateways",
      dateRange: { start: "2026-07-20", days: 3 },
    });
    expect(plan.callCount).toBe(12);
    expect(plan.steps).toHaveLength(12);
    expect(plan.dates).toEqual(["2026-07-20", "2026-07-21", "2026-07-22"]);
  });

  it("batches both endpoints when sets exceed batch size", () => {
    // default dest registry = 35 airports → 4 batches
    // EZE = 1 → 1 batch
    // 7 days → 4 × 1 × 7 = 28
    const plan = planSearch(
      {
        origin: "EZE",
        dest: DEFAULT_FORM.dest,
        dateRange: { start: "2026-07-20", days: 7 },
      },
      MAX_AIRPORTS_PER_BATCH,
    );
    expect(plan.destAirports).toHaveLength(35);
    expect(plan.callCount).toBe(28);
    expect(plan.steps[0]!.destBatch).toHaveLength(10);
    expect(plan.steps[1]!.destBatch).toHaveLength(10);
    expect(plan.steps[2]!.destBatch).toHaveLength(10);
    expect(plan.steps[3]!.destBatch).toHaveLength(5);
  });

  it("uses a smaller batch size for call-count math proof", () => {
    // 40 origin airports / batch 2 = 20 batches; 6 dest / batch 2 = 3 batches
    // 2 days → 20 × 3 × 2 = 120
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
    expect(plan.callCount).toBe(120);
  });
});
