import { airportCity } from "./locations";
import type {
  CityGroupSide,
  CityGroupSort,
  DateGroupSort,
  GroupResultsOptions,
  ItineraryOption,
  SearchResult,
} from "./types";

export type CityDateGroup = {
  city: string;
  dates: Array<{ date: string; option: ItineraryOption }>;
};

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

function optionGroupCity(
  option: ItineraryOption,
  side: CityGroupSide,
): string {
  if (side === "departure") {
    const code = option.segments[0]?.departureAirport ?? "unknown";
    return option.originCity ?? airportCity(code);
  }
  return option.destinationCity ?? airportCity(option.destinationAirport);
}

function isCheaper(a: ItineraryOption, b: ItineraryOption): boolean {
  return (
    a.price < b.price ||
    (a.price === b.price && a.totalDurationMinutes < b.totalDurationMinutes)
  );
}

function cityFloorPrice(dates: Array<{ option: ItineraryOption }>): number {
  let floor = Number.POSITIVE_INFINITY;
  for (const { option } of dates) {
    if (option.price < floor) floor = option.price;
  }
  return floor;
}

/**
 * Group already-fetched options by departure or arrival city, keeping the
 * cheapest itinerary per city×day. City order follows `citySort` (default
 * cheapest); days within each city follow `sort`.
 * Does not re-run search — it only reshapes the result set for display.
 */
export function groupCheapestByCityAndDate(
  options: ItineraryOption[],
  sort: DateGroupSort = "date",
  citySort: CityGroupSort = "cheapest_city",
  side: CityGroupSide = "departure",
): CityDateGroup[] {
  const byCity = new Map<string, Map<string, ItineraryOption>>();

  for (const option of options) {
    const city = optionGroupCity(option, side);
    const date = option.departureDate;
    let byDate = byCity.get(city);
    if (!byDate) {
      byDate = new Map();
      byCity.set(city, byDate);
    }
    const existing = byDate.get(date);
    if (!existing || isCheaper(option, existing)) {
      byDate.set(date, option);
    }
  }

  const groups = [...byCity.keys()].map((city) => {
    const byDate = byCity.get(city)!;
    const dates = [...byDate.entries()].map(([date, option]) => ({
      date,
      option,
    }));
    if (sort === "cheapest_day") {
      dates.sort(
        (a, b) =>
          a.option.price - b.option.price ||
          a.option.totalDurationMinutes - b.option.totalDurationMinutes ||
          a.date.localeCompare(b.date),
      );
    } else {
      dates.sort((a, b) => a.date.localeCompare(b.date));
    }
    return { city, dates };
  });

  if (citySort === "alpha") {
    groups.sort((a, b) => a.city.localeCompare(b.city));
  } else {
    groups.sort(
      (a, b) =>
        cityFloorPrice(a.dates) - cityFloorPrice(b.dates) ||
        a.city.localeCompare(b.city),
    );
  }
  return groups;
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
