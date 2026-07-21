import { describe, expect, it } from "vitest";
import { ANYWHERE_LOCATION_ID, LOCATION_REGISTRY } from "../locations";
import {
  LocationResolveError,
  assertValidLocationPair,
  defaultCityGroupSide,
  isAnywhereOrGateway,
  isAnywhereToAnywhere,
  isRawIata,
  isSingleCityLocation,
  listRegistryOptions,
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

  it("resolves Anywhere to the top 125 airports by passenger traffic", () => {
    const airports = resolveLocation(ANYWHERE_LOCATION_ID);
    expect(airports).toHaveLength(125);
    expect(new Set(airports).size).toBe(125);
    expect(airports[0]).toBe("ATL");
    expect(airports).toContain("DXB");
    expect(airports).toContain("GDL");
  });

  it("rejects Anywhere to Anywhere but allows Anywhere on one side", () => {
    expect(isAnywhereToAnywhere("anywhere", "anywhere")).toBe(true);
    expect(isAnywhereToAnywhere("anywhere", "usa-gateways")).toBe(false);
    expect(() => assertValidLocationPair("anywhere", "anywhere")).toThrow(
      LocationResolveError,
    );
    expect(() =>
      assertValidLocationPair("anywhere", "buenos-aires"),
    ).not.toThrow();
    expect(() =>
      assertValidLocationPair("buenos-aires", "anywhere"),
    ).not.toThrow();
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
    expect(resolveLocation("schengen-eu-gateways")).toEqual(
      expect.arrayContaining(["LPA", "TFS", "ACE", "TFN", "FUE", "FNC"]),
    );
    expect(resolveLocation("schengen-eu-gateways")).toHaveLength(46);
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
    expect(resolveLocation("africa-gateways")).toEqual([
      "CAI",
      "CMN",
      "HRG",
      "RAK",
      "ALG",
      "TUN",
      "SSH",
      "AGA",
      "RMF",
      "TNG",
      "ORN",
      "DJE",
      "RBA",
      "MIR",
      "LXR",
    ]);
    expect(resolveLocation("africa-gateways")).toEqual(
      expect.not.arrayContaining(["LPA", "TFS", "ACE", "TFN", "FUE", "FNC"]),
    );
    expect(resolveLocation("sub-saharan-africa-gateways")).toEqual([
      "JNB",
      "ADD",
      "CPT",
      "NBO",
      "LOS",
      "ABV",
      "DUR",
      "MRU",
      "ACC",
      "DSS",
      "DAR",
      "LAD",
      "RUN",
      "ABJ",
      "EBB",
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
    expect(resolveLocation("oceania-gateways")).toEqual([
      "SYD",
      "MEL",
      "BNE",
      "AKL",
      "PER",
      "ADL",
      "CHC",
      "OOL",
      "WLG",
      "CNS",
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

describe("registry options", () => {
  it("lists alphabetized gateways before alphabetized cities", () => {
    expect(listRegistryOptions().map(({ id, label }) => [id, label])).toEqual([
      ["africa-gateways", "Africa (except sub-Saharan)"],
      ["sub-saharan-africa-gateways", "Africa (Sub-Saharan)"],
      ["anywhere", "Anywhere (top 125 airports)"],
      ["canada-gateways", "Canada gateways"],
      ["east-asia-gateways", "East Asia gateways"],
      ["germany-gateways", "Germany gateways"],
      ["mexico-gateways", "Mexico gateways"],
      [
        "oceania-gateways",
        "Oceania (Australia and New Zealand) gateways",
      ],
      ["schengen-eu-gateways", "Schengen and EU gateways"],
      ["south-america-gateways", "South America gateways"],
      ["uk-ireland-gateways", "United Kingdom and Ireland gateways"],
      ["usa-gateways", "USA gateways"],
      ["vietnam", "Vietnam gateways"],
      ["buenos-aires", "Buenos Aires (all airports)"],
      ["london", "London (all airports)"],
      ["madrid", "Madrid (all airports)"],
      ["new-york", "New York City (all airports)"],
      ["prague", "Prague (all airports)"],
      ["san-francisco", "San Francisco (all airports)"],
      ["seattle", "Seattle (all airports)"],
      ["tashkent", "Tashkent (all airports)"],
    ]);
  });
});

describe("city group side defaults", () => {
  it("detects gateways, Anywhere, and single-city locations", () => {
    expect(isAnywhereOrGateway("anywhere")).toBe(true);
    expect(isAnywhereOrGateway("usa-gateways")).toBe(true);
    expect(isAnywhereOrGateway("vietnam")).toBe(true);
    expect(isAnywhereOrGateway("buenos-aires")).toBe(false);
    expect(isAnywhereOrGateway("EZE")).toBe(false);

    expect(isSingleCityLocation("buenos-aires")).toBe(true);
    expect(isSingleCityLocation("EZE")).toBe(true);
    expect(isSingleCityLocation("usa-gateways")).toBe(false);
    expect(isSingleCityLocation("anywhere")).toBe(false);
  });

  it("defaults to arrival when flying from a city to gateways or Anywhere", () => {
    expect(defaultCityGroupSide("buenos-aires", "usa-gateways")).toBe(
      "arrival",
    );
    expect(defaultCityGroupSide("EZE", "anywhere")).toBe("arrival");
  });

  it("defaults to departure otherwise", () => {
    expect(defaultCityGroupSide("usa-gateways", "buenos-aires")).toBe(
      "departure",
    );
    expect(defaultCityGroupSide("anywhere", "london")).toBe("departure");
    expect(defaultCityGroupSide("usa-gateways", "schengen-eu-gateways")).toBe(
      "departure",
    );
    expect(defaultCityGroupSide("buenos-aires", "london")).toBe("departure");
  });
});
