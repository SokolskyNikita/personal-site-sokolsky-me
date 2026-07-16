import { describe, expect, it } from "vitest";
import { LOCATION_REGISTRY } from "../locations";
import {
  LocationResolveError,
  isRawIata,
  normalizeLocationRef,
  resolveLocation,
} from "../resolver";

describe("resolveLocation", () => {
  it("resolves a raw IATA code", () => {
    expect(resolveLocation("eze")).toEqual(["EZE"]);
    expect(resolveLocation("JFK")).toEqual(["JFK"]);
  });

  it("resolves a flat registry entry", () => {
    expect(resolveLocation("EZE")).toEqual(["EZE"]);
  });

  it("resolves composed entries with dedupe", () => {
    const airports = resolveLocation("western-europe-sample");
    // Own airports first, then composed refs (france, germany).
    expect(airports).toEqual(["LHR", "CDG", "ORY", "FRA", "MUC"]);
    // EZE appears in south-america-sample and as airport entry — no duplicate
    const sa = resolveLocation("south-america-sample");
    expect(sa).toEqual(["EZE", "GRU", "SCL"]);
    expect(new Set(sa).size).toBe(sa.length);
  });

  it("detects cycles", () => {
    const original = LOCATION_REGISTRY["cycle-a"];
    LOCATION_REGISTRY["cycle-a"] = {
      id: "cycle-a",
      type: "region",
      label: "Cycle A",
      refs: ["cycle-b"],
    };
    LOCATION_REGISTRY["cycle-b"] = {
      id: "cycle-b",
      type: "region",
      label: "Cycle B",
      refs: ["cycle-a"],
    };
    try {
      expect(() => resolveLocation("cycle-a")).toThrow(LocationResolveError);
    } finally {
      delete LOCATION_REGISTRY["cycle-a"];
      delete LOCATION_REGISTRY["cycle-b"];
      if (original) LOCATION_REGISTRY["cycle-a"] = original;
    }
  });

  it("rejects unknown refs", () => {
    expect(() => resolveLocation("not-a-place")).toThrow(LocationResolveError);
  });
});

describe("IATA helpers", () => {
  it("validates and normalizes", () => {
    expect(isRawIata("EZE")).toBe(true);
    expect(isRawIata("eze")).toBe(false);
    expect(normalizeLocationRef("eze")).toBe("EZE");
    expect(normalizeLocationRef("western-europe-sample")).toBe(
      "western-europe-sample",
    );
  });
});
