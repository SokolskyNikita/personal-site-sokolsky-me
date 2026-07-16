import { describe, expect, it } from "vitest";
import { groupResults } from "../group";
import type { ItineraryOption, Segment } from "../types";

function makeOption(
  id: string,
  price: number,
  date: string,
  dest: string,
  origin = "EZE",
): ItineraryOption {
  const segment: Segment = {
    carrier: "Test",
    flightNumber: "T1",
    departureAirport: origin,
    arrivalAirport: dest,
    departureTime: `${date}T10:00:00`,
    arrivalTime: `${date}T18:00:00`,
    durationMinutes: 480,
    amenities: [],
    seatClassification: "unknown",
  };
  return {
    id,
    segments: [segment],
    layovers: [],
    totalDurationMinutes: 480,
    price,
    currency: "USD",
    provider: "test",
    departureDate: date,
    destinationAirport: dest,
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
});
