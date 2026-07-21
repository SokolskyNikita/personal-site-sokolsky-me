import { describe, expect, it } from "vitest";
import {
  AIRPORT_COORDS,
  airportDistanceKm,
  greatCircleDistanceKm,
} from "../airport-coords";

describe("airport coords", () => {
  it("covers the main registry airports used in searches", () => {
    for (const code of ["EZE", "AEP", "JFK", "LHR", "BCN", "KIV", "TVT", "VOD"]) {
      expect(AIRPORT_COORDS[code]).toBeDefined();
    }
  });

  it("computes a plausible EZE–JFK great-circle distance", () => {
    const km = airportDistanceKm("EZE", "JFK");
    expect(km).toBeGreaterThan(8000);
    expect(km).toBeLessThan(9000);
  });

  it("returns 0 for identical airports and null for unknown codes", () => {
    expect(airportDistanceKm("EZE", "EZE")).toBe(0);
    expect(airportDistanceKm("EZE", "ZZZ")).toBeNull();
  });

  it("is symmetric", () => {
    const a = greatCircleDistanceKm(AIRPORT_COORDS.EZE!, AIRPORT_COORDS.MAD!);
    const b = greatCircleDistanceKm(AIRPORT_COORDS.MAD!, AIRPORT_COORDS.EZE!);
    expect(a).toBeCloseTo(b, 6);
  });
});
