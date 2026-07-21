import { describe, expect, it } from "vitest";
import { extractFacts } from "../facts";
import { evaluateGates } from "../gates";
import { matchBrandTier } from "../mapper";
import { comfortScore, scoreProperty } from "../scoring";
import type { Property, ScanContext } from "../domain";

function baseProperty(over: Partial<Property> = {}): Property {
  return {
    token: "t1",
    name: "Test Hotel",
    citySlug: "buenos-aires",
    type: "hotel",
    lat: -34.6,
    lng: -58.4,
    hotelClass: 5,
    brandTier: 0,
    rating: 4.6,
    reviews: 1000,
    amenities: ["Air conditioning", "Free Wi‑Fi"],
    histogram: { 1: 10, 2: 20, 3: 50, 4: 200, 5: 720 },
    breakdown: [],
    lowStarShare: 30 / 1000,
    worstCategory: null,
    worstCategoryNeg: null,
    taRating: null,
    taReviews: null,
    taRank: null,
    taTotal: null,
    whitelist: [],
    nightlyUsd: 200,
    totalUsd: 400,
    googleHotelsUrl: null,
    provider: "fixture",
    raw: {},
    observedAt: "2026-07-20T00:00:00Z",
    ...over,
  };
}

const ctx: ScanContext = {
  citySlug: "buenos-aires",
  cityMeanRating: 4.2,
  checkIn: "2026-08-11",
  checkOut: "2026-08-13",
  adults: 2,
  evidenceStrictness: "confirmed_or_unknown",
};

describe("brand tier", () => {
  it("matches luxury and upper-upscale brands", () => {
    expect(matchBrandTier("Four Seasons Hotel Buenos Aires")).toBe(3);
    expect(matchBrandTier("Palacio Duhau - Park Hyatt Buenos Aires")).toBe(3);
    expect(matchBrandTier("Alvear Palace Hotel")).toBe(3);
    expect(matchBrandTier("Hilton Buenos Aires")).toBe(2);
    expect(matchBrandTier("Florida Garden")).toBe(0);
  });
});

describe("facts", () => {
  it("confirms AC/wifi when listed; elevator stays unknown when absent", () => {
    const facts = extractFacts(baseProperty());
    expect(facts.hasAC.status).toBe("confirmed");
    expect(facts.hasWifi.status).toBe("confirmed");
    expect(facts.hasElevator.status).toBe("unknown");
    expect(facts.hasElevator.value).toBeNull();
  });

  it("does not treat missing amenities as false under default strictness", () => {
    const p = baseProperty({ amenities: [] });
    const facts = extractFacts(p);
    const gates = evaluateGates(p, facts, { ...ctx, requireAC: true });
    expect(gates.some((g) => g.reason === "require_ac")).toBe(false);
  });

  it("gates require AC when confirmed_only and unknown", () => {
    const p = baseProperty({ amenities: [] });
    const facts = extractFacts(p);
    const gates = evaluateGates(p, facts, {
      ...ctx,
      requireAC: true,
      evidenceStrictness: "confirmed_only",
    });
    expect(gates.some((g) => g.reason === "require_ac")).toBe(true);
  });
});

describe("gates", () => {
  it("gates low rating and low reviews", () => {
    const p = baseProperty({ rating: 3.7, reviews: 50 });
    const scored = scoreProperty(p, ctx);
    expect(scored.gatedOut).toBe(true);
    expect(scored.gates.map((g) => g.reason)).toEqual(
      expect.arrayContaining(["rating_below_min", "reviews_below_min"]),
    );
  });

  it("gates hostels and backpacker accommodation", () => {
    for (const name of ["Central Hostel", "City Backpacker Lodge"]) {
      const scored = scoreProperty(baseProperty({ name }), ctx);
      expect(scored.gates).toContainEqual(
        expect.objectContaining({ reason: "no_private_bathroom" }),
      );
    }
  });

  it("gates listings whose description mentions shared bathrooms", () => {
    const scored = scoreProperty(
      baseProperty({
        raw: {
          description:
            "Traditional rooms, some with shared bathrooms, plus free Wi-Fi.",
        },
      }),
      ctx,
    );
    expect(scored.gates).toContainEqual(
      expect.objectContaining({ reason: "no_private_bathroom" }),
    );
  });

  it.each([
    "Unfussy rooms with shared or private bathrooms.",
    "Cozy quarters, some with en suite bathrooms.",
    "Casual rooms, some rooms have private bathrooms.",
  ])("gates mixed bathroom inventory: %s", (description) => {
    const scored = scoreProperty(
      baseProperty({ raw: { description } }),
      ctx,
    );
    expect(scored.gates).toContainEqual(
      expect.objectContaining({ reason: "no_private_bathroom" }),
    );
  });

  it("does not reject a pod-branded hotel without shared-bath evidence", () => {
    const scored = scoreProperty(baseProperty({ name: "Pod 39" }), ctx);
    expect(scored.gates.some((g) => g.reason === "no_private_bathroom")).toBe(
      false,
    );
  });
});

describe("scoring", () => {
  it("applies brand bonus and class nudge", () => {
    const luxury = scoreProperty(
      baseProperty({
        name: "Four Seasons Hotel Buenos Aires",
        brandTier: 3,
        hotelClass: 5,
      }),
      ctx,
    );
    const indie = scoreProperty(
      baseProperty({ name: "Indie Boutique", brandTier: 0, hotelClass: 3 }),
      ctx,
    );
    expect(luxury.subscores.brandBonus).toBe(12);
    expect(luxury.subscores.classNudge).toBe(2);
    expect(luxury.score).toBeGreaterThan(indie.score);
  });

  it("applies plant penalty when category neg rate is high with enough mentions", () => {
    const p = baseProperty({
      breakdown: [
        {
          key: "rooms",
          name: "Room",
          positive: 29,
          negative: 51,
          neutral: 5,
          total: 85,
          negRate: 51 / (29 + 51),
        },
      ],
    });
    const scored = scoreProperty(p, ctx);
    expect(scored.subscores.plantPenalty).toBeGreaterThan(10);
    expect(scored.subscores.worstPlantCategory).toBe("rooms");
  });

  it("comfortScore matches composition", () => {
    expect(
      comfortScore({
        quality: 40,
        consistencyPenalty: 5,
        plantPenalty: 10,
        brandBonus: 12,
        taBonus: 0,
        whitelistBonus: 0,
        classNudge: 2,
      }),
    ).toBe(39);
  });
});
