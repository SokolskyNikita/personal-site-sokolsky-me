import type {
  DateGroupSort,
  GroupResultsOptions,
  ItineraryOption,
  SearchResult,
} from "./types";

function groupKey(option: ItineraryOption, groupBy: GroupResultsOptions["groupBy"]): string {
  switch (groupBy) {
    case "date":
      return option.departureDate;
    case "destination":
      return option.destinationAirport;
    case "origin":
      return option.segments[0]?.departureAirport ?? "unknown";
    default: {
      const _exhaustive: never = groupBy;
      return _exhaustive;
    }
  }
}

/**
 * Rank/group itineraries. Pure function parameterized by groupBy + topN.
 * Future groupBy values ('destination' | 'origin') are new parameter values.
 */
export function groupResults(
  options: ItineraryOption[],
  { groupBy, topN }: GroupResultsOptions,
): Record<string, ItineraryOption[]> {
  const buckets = new Map<string, ItineraryOption[]>();

  for (const option of options) {
    const key = groupKey(option, groupBy);
    const list = buckets.get(key);
    if (list) list.push(option);
    else buckets.set(key, [option]);
  }

  const grouped: Record<string, ItineraryOption[]> = {};
  for (const [key, list] of buckets) {
    grouped[key] = [...list]
      .sort((a, b) => a.price - b.price || a.totalDurationMinutes - b.totalDurationMinutes)
      .slice(0, topN);
  }

  return grouped;
}

/**
 * Order date-group keys. `cheapest_day` uses each group's already-sorted
 * cheapest option (index 0) so days with the lowest fares appear first.
 */
export function orderedGroupKeys(
  grouped: Record<string, ItineraryOption[]>,
  sort: DateGroupSort = "date",
): string[] {
  const keys = Object.keys(grouped);
  if (sort === "date") return keys.sort();
  return keys.sort((a, b) => {
    const priceA = grouped[a]![0]?.price ?? Number.POSITIVE_INFINITY;
    const priceB = grouped[b]![0]?.price ?? Number.POSITIVE_INFINITY;
    return priceA - priceB || a.localeCompare(b);
  });
}

export function buildSearchResult(
  spec: SearchResult["spec"],
  options: ItineraryOption[],
  stats: SearchResult["stats"],
  stepErrors: SearchResult["stepErrors"] = [],
): SearchResult {
  return {
    spec,
    options,
    grouped: groupResults(options, { groupBy: "date", topN: spec.topN }),
    stats,
    stepErrors,
  };
}
