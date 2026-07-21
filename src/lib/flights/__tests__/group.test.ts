import { describe, expect, it } from "vitest";
import {
  groupCheapestByCityAndDate,
  groupResults,
  orderedGroupKeys,
} from "../group";
import { airportCity } from "../locations";
import type { ItineraryOption, Segment } from "../types";

function makeOption(
  id: string,
  price: number,
  date: string,
  dest: string,
  origin = "EZE",
  durationMinutes = 480,
): ItineraryOption {
  const segment: Segment = {
    carrier: "Test",
    flightNumber: "T1",
    departureAirport: origin,
    arrivalAirport: dest,
    departureTime: `${date}T10:00:00`,
    arrivalTime: `${date}T18:00:00`,
    durationMinutes,
    amenities: [],
    seatClassification: "unknown",
  };
  return {
    id,
    segments: [segment],
    layovers: [],
    totalDurationMinutes: durationMinutes,
    price,
    currency: "USD",
    provider: "test",
    departureDate: date,
    destinationAirport: dest,
    destinationCity: airportCity(dest),
    originCity: airportCity(origin),
    unverified: false,
  };
}

describe("groupResults", () => {
  const options = [
    makeOption("a", 500, "2026-07-20", "JFK"),
    makeOption("b", 400, "2026-07-20", "DFW"),
    makeOption("c", 600, "2026-07-20", "ORD"),
    makeOption("d", 300, "2026-07-21", "JFK"),
    makeOption("e", 350, "2026-07-21", "LAX"),
  ];

  it("groups by date and keeps topN cheapest", () => {
    const grouped = groupResults(options, { groupBy: "date", topN: 2 });
    expect(Object.keys(grouped).sort()).toEqual(["2026-07-20", "2026-07-21"]);
    expect(grouped["2026-07-20"]!.map((o) => o.id)).toEqual(["b", "a"]);
    expect(grouped["2026-07-21"]!.map((o) => o.id)).toEqual(["d", "e"]);
  });

  it("supports groupBy destination as a parameter value", () => {
    const grouped = groupResults(options, { groupBy: "destination", topN: 1 });
    expect(grouped["JFK"]![0]!.id).toBe("d");
    expect(grouped["DFW"]![0]!.id).toBe("b");
  });

  it("supports groupBy origin as a parameter value", () => {
    const mixed = [
      makeOption("x", 100, "2026-07-20", "JFK", "EZE"),
      makeOption("y", 200, "2026-07-20", "JFK", "GRU"),
    ];
    const grouped = groupResults(mixed, { groupBy: "origin", topN: 5 });
    expect(grouped["EZE"]).toHaveLength(1);
    expect(grouped["GRU"]).toHaveLength(1);
  });

  it("orders date groups by cheapest day", () => {
    const grouped = groupResults(options, { groupBy: "date", topN: 2 });
    expect(orderedGroupKeys(grouped, "date")).toEqual([
      "2026-07-20",
      "2026-07-21",
    ]);
    expect(orderedGroupKeys(grouped, "cheapest_day")).toEqual([
      "2026-07-21",
      "2026-07-20",
    ]);
  });
});

describe("groupCheapestByCityAndDate", () => {
  it("keeps the cheapest flight per arrival city and day", () => {
    const options = [
      makeOption("jfk-expensive", 500, "2026-07-20", "JFK"),
      makeOption("lga-cheap", 400, "2026-07-20", "LGA"),
      makeOption("jfk-next", 350, "2026-07-21", "JFK"),
      makeOption("lax", 450, "2026-07-20", "LAX"),
      makeOption("lax-cheaper", 300, "2026-07-21", "LAX"),
    ];

    const grouped = groupCheapestByCityAndDate(
      options,
      "date",
      "alpha",
      "arrival",
    );
    expect(grouped.map((g) => g.city)).toEqual(["Los Angeles", "New York"]);
    expect(grouped[0]!.dates.map((d) => d.option.id)).toEqual([
      "lax",
      "lax-cheaper",
    ]);
    expect(grouped[1]!.dates.map((d) => d.option.id)).toEqual([
      "lga-cheap",
      "jfk-next",
    ]);
  });

  it("defaults to cheapest-city order by departure city", () => {
    const options = [
      makeOption("bos-20", 500, "2026-07-20", "JFK", "BOS"),
      makeOption("mia-20", 200, "2026-07-20", "JFK", "MIA"),
      makeOption("bos-21", 300, "2026-07-21", "JFK", "BOS"),
    ];

    const grouped = groupCheapestByCityAndDate(options, "date");
    expect(grouped.map((g) => g.city)).toEqual(["Miami", "Boston"]);
  });

  it("groups by departure city when requested", () => {
    const options = [
      makeOption("from-eze", 400, "2026-07-20", "JFK", "EZE"),
      makeOption("from-aep", 350, "2026-07-20", "JFK", "AEP"),
      makeOption("from-gru", 500, "2026-07-20", "JFK", "GRU"),
    ];

    const grouped = groupCheapestByCityAndDate(
      options,
      "date",
      "alpha",
      "departure",
    );
    expect(grouped.map((g) => g.city)).toEqual(["Buenos Aires", "São Paulo"]);
    expect(grouped[0]!.dates[0]!.option.id).toBe("from-aep");
  });

  it("sorts days within each city by cheapest fare", () => {
    const options = [
      makeOption("bos-20", 500, "2026-07-20", "BOS"),
      makeOption("bos-21", 300, "2026-07-21", "BOS"),
      makeOption("mia-20", 200, "2026-07-20", "MIA"),
      makeOption("mia-21", 250, "2026-07-21", "MIA"),
    ];

    const grouped = groupCheapestByCityAndDate(
      options,
      "cheapest_day",
      "alpha",
      "arrival",
    );
    expect(grouped.map((g) => g.city)).toEqual(["Boston", "Miami"]);
    expect(grouped[0]!.dates.map((d) => d.date)).toEqual([
      "2026-07-21",
      "2026-07-20",
    ]);
    expect(grouped[1]!.dates.map((d) => d.date)).toEqual([
      "2026-07-20",
      "2026-07-21",
    ]);
  });

  it("falls back to airport code when city label is unknown", () => {
    const options = [makeOption("xyz", 100, "2026-07-20", "XYZ")];
    const grouped = groupCheapestByCityAndDate(
      options,
      "date",
      "cheapest_city",
      "arrival",
    );
    expect(grouped[0]!.city).toBe("XYZ");
  });

  it("sorts cities by price per great-circle km", () => {
    // Santiago is cheapest absolutely but a short hop; Madrid costs more
    // yet far less per km, so $/distance should prefer Madrid.
    const options = [
      makeOption("scl", 100, "2026-07-20", "SCL", "EZE"),
      makeOption("mad", 400, "2026-07-20", "MAD", "EZE"),
    ];

    const byPrice = groupCheapestByCityAndDate(
      options,
      "date",
      "cheapest_city",
      "arrival",
    );
    expect(byPrice.map((g) => g.city)).toEqual(["Santiago", "Madrid"]);

    const byRate = groupCheapestByCityAndDate(
      options,
      "date",
      "price_per_distance",
      "arrival",
    );
    expect(byRate.map((g) => g.city)).toEqual(["Madrid", "Santiago"]);
  });

  it("sorts cities by great-circle distance ascending", () => {
    const options = [
      makeOption("mad", 400, "2026-07-20", "MAD", "EZE"),
      makeOption("scl", 500, "2026-07-20", "SCL", "EZE"),
      makeOption("jfk", 300, "2026-07-20", "JFK", "EZE"),
    ];

    const grouped = groupCheapestByCityAndDate(
      options,
      "date",
      "distance",
      "arrival",
    );
    expect(grouped.map((g) => g.city)).toEqual([
      "Santiago",
      "New York",
      "Madrid",
    ]);
  });
});
