import { describe, expect, it } from "vitest";
import {
  applyLieFlatPolicy,
  filterByLieFlatPolicy,
  filterByMaxTotalHours,
} from "../policy";
import type { ItineraryOption, Segment } from "../types";

function seg(
  overrides: Partial<Segment> & Pick<Segment, "seatClassification">,
): Segment {
  return {
    carrier: "Test Air",
    flightNumber: "TA1",
    departureAirport: "AAA",
    arrivalAirport: "BBB",
    departureTime: "2026-07-20T10:00:00",
    arrivalTime: "2026-07-20T14:00:00",
    durationMinutes: 240,
    amenities: [],
    ...overrides,
  };
}

function option(segments: Segment[]): ItineraryOption {
  return {
    id: "opt-1",
    segments,
    layovers: [],
    totalDurationMinutes: segments.reduce((s, x) => s + x.durationMinutes, 0),
    price: 1000,
    currency: "USD",
    provider: "test",
    departureDate: "2026-07-20",
    destinationAirport: segments[segments.length - 1]!.arrivalAirport,
    unverified: false,
  };
}

describe("applyLieFlatPolicy", () => {
  it("none passes everything through without marking unverified", () => {
    const opt = option([seg({ seatClassification: "not_lie_flat" })]);
    expect(applyLieFlatPolicy(opt, "none")).toEqual({
      passes: true,
      unverified: false,
    });
  });

  it("any_segment passes when at least one segment is lie-flat", () => {
    const opt = option([
      seg({ seatClassification: "not_lie_flat", durationMinutes: 60 }),
      seg({ seatClassification: "lie_flat", durationMinutes: 480 }),
    ]);
    expect(applyLieFlatPolicy(opt, "any_segment").passes).toBe(true);
  });

  it("any_segment excludes UNKNOWN unless includeUnverified", () => {
    const opt = option([seg({ seatClassification: "unknown" })]);
    expect(applyLieFlatPolicy(opt, "any_segment", false).passes).toBe(false);
    expect(applyLieFlatPolicy(opt, "any_segment", true)).toEqual({
      passes: true,
      unverified: true,
    });
  });

  it("longest_segment requires the longest segment to be lie-flat", () => {
    const opt = option([
      seg({ seatClassification: "lie_flat", durationMinutes: 60 }),
      seg({ seatClassification: "not_lie_flat", durationMinutes: 480 }),
    ]);
    expect(applyLieFlatPolicy(opt, "longest_segment").passes).toBe(false);

    const opt2 = option([
      seg({ seatClassification: "not_lie_flat", durationMinutes: 60 }),
      seg({ seatClassification: "lie_flat", durationMinutes: 480 }),
    ]);
    expect(applyLieFlatPolicy(opt2, "longest_segment").passes).toBe(true);
  });

  it("all_segments requires every segment to be lie-flat", () => {
    const mixed = option([
      seg({ seatClassification: "lie_flat" }),
      seg({ seatClassification: "not_lie_flat" }),
    ]);
    expect(applyLieFlatPolicy(mixed, "all_segments").passes).toBe(false);

    const all = option([
      seg({ seatClassification: "lie_flat" }),
      seg({ seatClassification: "lie_flat" }),
    ]);
    expect(applyLieFlatPolicy(all, "all_segments").passes).toBe(true);
  });

  it("all_segments with includeUnverified marks unverified when unknowns present", () => {
    const opt = option([
      seg({ seatClassification: "lie_flat" }),
      seg({ seatClassification: "unknown" }),
    ]);
    expect(applyLieFlatPolicy(opt, "all_segments", true)).toEqual({
      passes: true,
      unverified: true,
    });
  });
});

describe("filterByLieFlatPolicy", () => {
  it("none returns all options", () => {
    const options = [
      option([seg({ seatClassification: "not_lie_flat" })]),
      option([seg({ seatClassification: "lie_flat" })]),
    ];
    expect(filterByLieFlatPolicy(options, "none")).toHaveLength(2);
  });
});

describe("filterByMaxTotalHours", () => {
  it("keeps options at the limit and removes longer itineraries", () => {
    const atLimit = option([
      seg({ seatClassification: "lie_flat", durationMinutes: 24 * 60 }),
    ]);
    const overLimit = option([
      seg({ seatClassification: "lie_flat", durationMinutes: 24 * 60 + 1 }),
    ]);

    expect(filterByMaxTotalHours([atLimit, overLimit], 24)).toEqual([
      atLimit,
    ]);
  });
});
