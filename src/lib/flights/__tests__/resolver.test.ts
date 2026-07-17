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
    expect(resolveLocation("buenos-aires")).toEqual(["EZE", "AEP"]);
  });

  it("resolves London to all six commercial airports", () => {
    expect(resolveLocation("london")).toEqual([
      "LHR",
      "LGW",
      "STN",
      "LTN",
      "LCY",
      "SEN",
    ]);
  });

  it("resolves Seattle and San Francisco as separate metro areas", () => {
    expect(resolveLocation("seattle")).toEqual(["SEA", "PAE", "BFI"]);
    expect(resolveLocation("san-francisco")).toEqual(["SFO", "OAK", "SJC"]);
  });

  it("resolves New York City to its three primary airports", () => {
    expect(resolveLocation("new-york")).toEqual(["JFK", "LGA", "EWR"]);
  });

  it("resolves Tashkent to both valid IATA airports", () => {
    expect(resolveLocation("tashkent")).toEqual(["TAS", "TVT"]);
  });

  it("resolves Prague to both valid IATA airports", () => {
    expect(resolveLocation("prague")).toEqual(["PRG", "VOD"]);
  });

  it("resolves Madrid to Barajas", () => {
    expect(resolveLocation("madrid")).toEqual(["MAD"]);
  });

  it("resolves gateway registries", () => {
    expect(resolveLocation("usa-gateways")).toHaveLength(35);
    expect(resolveLocation("canada-gateways")).toEqual([
      "YYZ",
      "YVR",
      "YUL",
      "YYC",
      "YEG",
      "YOW",
    ]);
    expect(resolveLocation("uk-ireland-gateways")).toHaveLength(10);
    expect(resolveLocation("schengen-eu-gateways")).toHaveLength(40);
    expect(resolveLocation("mexico-gateways")).toHaveLength(6);
    expect(resolveLocation("south-america-gateways")).toEqual([
      "GRU",
      "BOG",
      "LIM",
      "SCL",
      "CGH",
      "GIG",
      "AEP",
      "BSB",
      "MDE",
      "CNF",
      "VCP",
      "EZE",
      "REC",
      "CTG",
      "POA",
    ]);
    expect(resolveLocation("east-asia-gateways")).toEqual([
      "HND",
      "PVG",
      "CAN",
      "ICN",
      "PEK",
      "SZX",
      "TFU",
      "HKG",
      "PKX",
      "CKG",
      "HGH",
      "SHA",
      "KMG",
      "XIY",
      "TPE",
    ]);
    expect(resolveLocation("vietnam")).toEqual([
      "SGN",
      "HAN",
      "DAD",
      "CXR",
      "PQC",
      "HPH",
    ]);
    expect(resolveLocation("germany-gateways")).toHaveLength(5);
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
