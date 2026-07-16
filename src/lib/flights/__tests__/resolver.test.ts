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

  it("resolves gateway registries", () => {
    expect(resolveLocation("usa-gateways")).toHaveLength(20);
    expect(resolveLocation("canada-gateways")).toEqual([
      "YYZ",
      "YVR",
      "YUL",
      "YYC",
      "YEG",
      "YOW",
    ]);
    expect(resolveLocation("uk-ireland-gateways")).toHaveLength(10);
    expect(resolveLocation("schengen-eu-gateways")).toHaveLength(25);
    expect(resolveLocation("mexico-gateways")).toHaveLength(6);
    expect(resolveLocation("germany-gateways")).toHaveLength(5);
    expect(resolveLocation("france-gateways")).toHaveLength(5);
  });

  it("resolves composed entries with dedupe", () => {
    LOCATION_REGISTRY["test-composed"] = {
      id: "test-composed",
      type: "region",
      label: "Test composed",
      airports: ["YYZ"],
      refs: ["canada-gateways", "mexico-gateways"],
    };
    try {
      const airports = resolveLocation("test-composed");
      expect(airports).toEqual([
        "YYZ",
        "YVR",
        "YUL",
        "YYC",
        "YEG",
        "YOW",
        "MEX",
        "CUN",
        "GDL",
        "MTY",
        "TIJ",
        "SJD",
      ]);
      expect(new Set(airports).size).toBe(airports.length);
    } finally {
      delete LOCATION_REGISTRY["test-composed"];
    }
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
    expect(normalizeLocationRef("schengen-eu-gateways")).toBe(
      "schengen-eu-gateways",
    );
  });
});
