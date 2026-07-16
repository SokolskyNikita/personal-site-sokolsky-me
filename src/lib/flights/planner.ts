import {
  MAX_AIRPORTS_PER_BATCH,
  ROUND_TRIP_CANDIDATES_PER_STEP,
} from "./constants";
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
  // `days` is the number of days after the selected start date.
  for (let i = 0; i <= days; i++) {
    const year = cursor.getUTCFullYear();
    const month = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const day = String(cursor.getUTCDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year!, month! - 1, day!));
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/**
 * Pure cross-product planner: origin batches × destination batches × dates.
 * Batching applies to BOTH endpoints. Call count is exact for arbitrary set sizes.
 */
export function planSearch(
  spec: Pick<LegSearch, "origin" | "dest" | "dateRange"> &
    Partial<Pick<LegSearch, "tripType" | "tripLengthDays">>,
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
          returnDate:
            spec.tripType === "round_trip"
              ? addDays(date, spec.tripLengthDays ?? 7)
              : undefined,
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
    estimatedMaxCalls:
      spec.tripType === "round_trip"
        ? steps.length * (1 + ROUND_TRIP_CANDIDATES_PER_STEP)
        : steps.length,
    originAirports,
    destAirports,
    dates,
  };
}
