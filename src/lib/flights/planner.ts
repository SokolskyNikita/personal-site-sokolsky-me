import { MAX_AIRPORTS_PER_BATCH } from "./constants";
import { resolveLocation } from "./resolver";
import type { LegSearch, PlanStep, QueryPlan } from "./types";

function chunk<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

function enumerateDates(start: string, days: number): string[] {
  const dates: string[] = [];
  const [y, m, d] = start.split("-").map(Number);
  const cursor = new Date(Date.UTC(y!, m! - 1, d!));
  for (let i = 0; i < days; i++) {
    const year = cursor.getUTCFullYear();
    const month = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const day = String(cursor.getUTCDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/**
 * Pure cross-product planner: origin batches × destination batches × dates.
 * Batching applies to BOTH endpoints. Call count is exact for arbitrary set sizes.
 */
export function planSearch(
  spec: Pick<LegSearch, "origin" | "dest" | "dateRange">,
  batchSize = MAX_AIRPORTS_PER_BATCH,
): QueryPlan {
  const originAirports = resolveLocation(spec.origin);
  const destAirports = resolveLocation(spec.dest);
  const dates = enumerateDates(spec.dateRange.start, spec.dateRange.days);

  const originBatches = chunk(originAirports, batchSize);
  const destBatches = chunk(destAirports, batchSize);

  const steps: PlanStep[] = [];
  let stepIndex = 0;
  for (const date of dates) {
    for (const originBatch of originBatches) {
      for (const destBatch of destBatches) {
        steps.push({
          stepIndex,
          date,
          originBatch,
          destBatch,
        });
        stepIndex += 1;
      }
    }
  }

  return {
    steps,
    callCount: steps.length,
    originAirports,
    destAirports,
    dates,
  };
}
