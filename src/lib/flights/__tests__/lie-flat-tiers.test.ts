import { describe, expect, it } from "vitest";
import {
  aircraftMatch,
  airlineCore,
  airlinesMatch,
  lookupLieFlatTiers,
  lookupLieFlatTiersForSegments,
} from "../lie-flat-tiers";
import type { Segment } from "../types";

function segment(partial: Partial<Segment> & Pick<Segment, "carrier">): Segment {
  return {
    flightNumber: "XX 1",
    departureAirport: "EZE",
    arrivalAirport: "JFK",
    departureTime: "2026-08-15 21:00",
    arrivalTime: "2026-08-16 06:00",
    durationMinutes: 600,
    amenities: ["Seat type Lie Flat"],
    seatClassification: "lie_flat",
    cabin: "business",
    ...partial,
  };
}

describe("airlinesMatch", () => {
  it("maps common Google Flights short names to ranking airlines", () => {
    expect(airlinesMatch("American", "American Airlines")).toBe(true);
    expect(airlinesMatch("COPA", "Copa Airlines")).toBe(true);
    expect(airlinesMatch("Delta", "Delta Air Lines")).toBe(true);
    expect(airlinesMatch("United", "United Airlines")).toBe(true);
    expect(airlinesMatch("JAL", "Japan Airlines")).toBe(true);
    expect(airlinesMatch("TAP", "TAP Air Portugal")).toBe(true);
    expect(airlinesMatch("LOT", "LOT Polish Airlines")).toBe(true);
  });

  it("does not confuse similarly named Chinese carriers", () => {
    expect(airlinesMatch("China Eastern", "China Airlines")).toBe(false);
    expect(airlinesMatch("China Airlines", "China Eastern")).toBe(false);
    expect(airlinesMatch("Air China", "China Airlines")).toBe(false);
    expect(airlineCore("China Eastern")).toBe("china eastern");
    expect(airlineCore("China Airlines")).toBe("china");
  });
});

describe("aircraftMatch", () => {
  it("matches Google airplane strings to ranking models", () => {
    expect(aircraftMatch("Boeing 777", "777-300ER")).toBe(true);
    expect(aircraftMatch("Boeing 777", "777")).toBe(true);
    expect(aircraftMatch("Boeing 777-300ER", "777-300ER")).toBe(true);
    expect(aircraftMatch("Boeing 777-300ER", "777-200ER")).toBe(false);
    expect(aircraftMatch("Boeing 737MAX 9", "737 MAX 9")).toBe(true);
    expect(aircraftMatch("Boeing 737MAX 9 Passenger", "737 MAX 9")).toBe(true);
    expect(aircraftMatch("Boeing 737 MAX 9", "737 MAX 8")).toBe(false);
    expect(aircraftMatch("Airbus A350", "A350-900")).toBe(true);
    expect(aircraftMatch("Airbus A321XLR", "A321XLR")).toBe(true);
    expect(aircraftMatch("Airbus A330-900neo", "A330-900")).toBe(true);
    expect(aircraftMatch("Boeing 787-10", "787")).toBe(true);
  });
});

describe("lookupLieFlatTiers", () => {
  it("returns all matching tiers for an airline/aircraft combo", () => {
    const tiers = lookupLieFlatTiers("American", "Boeing 777", "business").map(
      (match) => match.tier,
    );
    expect(tiers.length).toBeGreaterThan(1);
    expect(tiers).toContain("A");
    expect(tiers).toContain("B+");
    expect(tiers).not.toContain("S++");
  });

  it("returns Copa Dreams Business tier for 737 MAX 9", () => {
    expect(
      lookupLieFlatTiers("COPA", "Boeing 737MAX 9 Passenger", "business").map(
        (match) => match.tier,
      ),
    ).toEqual(["B+"]);
  });

  it("maps live Google Flights short airline names from real searches", () => {
    expect(
      lookupLieFlatTiers("ZIPAIR Tokyo", "Boeing 787", "business").map(
        (match) => match.tier,
      ),
    ).toEqual(["C+"]);
    expect(
      lookupLieFlatTiers("JAL", "Boeing 787", "business").map(
        (match) => match.tier,
      ),
    ).toEqual(expect.arrayContaining(["A+", "A"]));
    expect(
      lookupLieFlatTiers("JetBlue", "Airbus A321neo", "business").map(
        (match) => match.tier,
      ),
    ).toEqual(expect.arrayContaining(["S", "A+"]));
    expect(
      lookupLieFlatTiers("Virgin Atlantic", "Airbus A330-900neo", "business").map(
        (match) => match.tier,
      ),
    ).toEqual(expect.arrayContaining(["A+", "A"]));
    expect(
      lookupLieFlatTiers("BoA", "Airbus A330", "business").map(
        (match) => match.tier,
      ),
    ).toEqual(["C"]);
    expect(
      lookupLieFlatTiers("Etihad", "Airbus A350", "business").map(
        (match) => match.tier,
      ),
    ).toContain("S");
    expect(
      lookupLieFlatTiers("Tap Air Portugal", "Airbus A321neo", "business").map(
        (match) => match.tier,
      ),
    ).toEqual(["B+"]);
  });

  it("treats A321neo/LR/XLR as compatible but keeps A321T distinct", () => {
    expect(aircraftMatch("Airbus A321neo", "A321LR")).toBe(true);
    expect(aircraftMatch("Airbus A321neo", "A321XLR")).toBe(true);
    expect(aircraftMatch("Airbus A321neo", "A321T")).toBe(false);
  });

  it("maps Iberia A330 and A350 business products separately", () => {
    expect(
      lookupLieFlatTiers("Iberia", "Airbus A330", "business").map(
        (match) => match.tier,
      ),
    ).toEqual(["A"]);
    expect(
      lookupLieFlatTiers("Iberia", "Airbus A350", "business").map(
        (match) => match.tier,
      ),
    ).toEqual(["A+"]);
  });

  it("returns nothing when aircraft is missing", () => {
    expect(lookupLieFlatTiers("Emirates", undefined, "business")).toEqual([]);
  });

  it("never mixes business and first products for the same aircraft", () => {
    const emiratesBusiness = lookupLieFlatTiers(
      "Emirates",
      "Airbus A380",
      "business",
    );
    const emiratesFirst = lookupLieFlatTiers("Emirates", "Airbus A380", "first");
    expect(emiratesBusiness.map((m) => m.tier)).toEqual(["A+"]);
    expect(emiratesBusiness.flatMap((m) => m.products)).toEqual([
      "A380 Business Class",
    ]);
    expect(emiratesFirst.map((m) => m.tier)).toEqual(["S+"]);
    expect(emiratesFirst.flatMap((m) => m.products)).toEqual([
      "A380 First Class Suite",
    ]);

    const baBusiness = lookupLieFlatTiers(
      "British Airways",
      "Boeing 777",
      "business",
    );
    const baFirst = lookupLieFlatTiers("British Airways", "Boeing 777", "first");
    expect(baBusiness.map((m) => m.tier)).toEqual(["A+", "C+"]);
    expect(baBusiness.flatMap((m) => m.products).join(" ")).not.toMatch(/First/i);
    expect(baFirst.map((m) => m.tier)).toEqual(["S", "A+"]);
    expect(baFirst.flatMap((m) => m.products).join(" ")).toMatch(/First/i);
    expect(baFirst.flatMap((m) => m.products).join(" ")).not.toMatch(/Club/i);

    const aaBusiness = lookupLieFlatTiers("American", "Boeing 777", "business");
    const aaFirst = lookupLieFlatTiers("American", "Boeing 777", "first");
    expect(aaFirst.flatMap((m) => m.products)).toEqual(["Flagship First"]);
    expect(aaBusiness.flatMap((m) => m.products).join(" ")).not.toMatch(
      /Flagship First/,
    );
  });

  it("requires an explicit business or first cabin", () => {
    expect(lookupLieFlatTiers("Emirates", "Airbus A380")).toEqual([]);
    expect(lookupLieFlatTiers("Emirates", "Airbus A380", "economy")).toEqual([]);
    expect(
      lookupLieFlatTiers("Emirates", "Airbus A380", "premium_economy"),
    ).toEqual([]);
  });
});

describe("lookupLieFlatTiersForSegments", () => {
  it("unions tiers across lie-flat segments only", () => {
    const matches = lookupLieFlatTiersForSegments([
      segment({
        carrier: "American",
        aircraft: "Boeing 777",
        cabin: "business",
      }),
      segment({
        carrier: "American",
        aircraft: "Boeing 737",
        seatClassification: "not_lie_flat",
        amenities: ["Average legroom"],
      }),
      segment({
        carrier: "COPA",
        aircraft: "Boeing 737MAX 9",
        cabin: "business",
      }),
    ]);
    const tiers = matches.map((match) => match.tier);
    expect(tiers).toContain("A");
    expect(tiers).toContain("B+");
  });

  it("presumes business when lie-flat segment cabin is missing", () => {
    const presumedBusiness = lookupLieFlatTiersForSegments([
      segment({
        carrier: "Emirates",
        aircraft: "Airbus A380",
        cabin: undefined,
      }),
    ]);
    expect(presumedBusiness.map((m) => m.tier)).toEqual(["A+"]);
    expect(presumedBusiness.flatMap((m) => m.products)).toEqual([
      "A380 Business Class",
    ]);
  });

  it("uses search-mode first cabin when segment cabin is missing", () => {
    const firstFallback = lookupLieFlatTiersForSegments(
      [
        segment({
          carrier: "Emirates",
          aircraft: "Airbus A380",
          cabin: undefined,
        }),
      ],
      "first",
    );
    expect(firstFallback.map((m) => m.tier)).toEqual(["S+"]);
  });

  it("prefers segment cabin over search-mode fallback", () => {
    const matches = lookupLieFlatTiersForSegments(
      [
        segment({
          carrier: "Emirates",
          aircraft: "Airbus A380",
          cabin: "first",
        }),
      ],
      "business",
    );
    expect(matches.map((m) => m.tier)).toEqual(["S+"]);
  });
});
