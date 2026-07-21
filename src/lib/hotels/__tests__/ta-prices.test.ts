import { describe, expect, it } from "vitest";
import { createMemoryHotelsRepository } from "../db";
import { mapListProperty } from "../mapper";
import { FixtureProvider } from "../providers/fixtures";
import { runPriceSweep } from "../prices";
import { scoreProperty } from "../scoring";
import { matchTripadvisor, normalizeTitle, ratingConcordance } from "../ta";

describe("tripadvisor concordance", () => {
  it("matches exact Four Seasons title", () => {
    const m = matchTripadvisor(
      "Four Seasons Hotel Buenos Aires",
      "Buenos Aires",
      [
        {
          title: "Four Seasons Hotel Buenos Aires",
          rating: 4.7,
          reviews: 2278,
          place_id: "x",
          location: "Buenos Aires",
        },
        {
          title: "Four Seasons Hotel Prague",
          rating: 4.8,
          reviews: 100,
          location: "Prague",
        },
      ],
    );
    expect(m?.rating).toBe(4.7);
    expect(m?.confidence).toBe("exact");
  });

  it("refuses ambiguous near-duplicates", () => {
    const m = matchTripadvisor("Alvear", "Buenos Aires", [
      { title: "Alvear Palace Hotel", rating: 4.5, reviews: 100 },
      { title: "Alvear Icon Hotel", rating: 4.6, reviews: 100 },
    ]);
    expect(m).toBeNull();
  });

  it("normalize strips hotel filler words", () => {
    expect(normalizeTitle("The Four Seasons Hotel")).toBe("four seasons");
  });

  it("matches Llao Llao across hotel and resort suffixes", () => {
    const m = matchTripadvisor("Llao Llao Hotel", "Bariloche", [
      {
        title: "Llao Llao Resort, Golf-Spa",
        rating: 4.5,
        reviews: 4100,
        place_id: "llao-llao",
        location: "San Carlos de Bariloche",
      },
    ]);
    expect(m).toMatchObject({
      placeId: "llao-llao",
      confidence: "exact",
    });
  });

  it("ratingConcordance buckets", () => {
    expect(ratingConcordance(4.7, 4.7)).toBe("agree");
    expect(ratingConcordance(4.7, 4.4)).toBe("soft");
    expect(ratingConcordance(4.7, 3.9)).toBe("diverge");
    expect(ratingConcordance(null, 4.5)).toBe("unknown");
  });
});

describe("price sweep (fixtures)", () => {
  it("returns the full eligible index instead of capping at 100", async () => {
    const db = createMemoryHotelsRepository();
    const cityId = await db.ensureCity({
      slug: "buenos-aires",
      display: "Buenos Aires",
      query: "Buenos Aires",
    });
    const provider = new FixtureProvider();
    const page = await provider.listProperties({
      q: "Buenos Aires",
      sortBy: "most_reviewed",
    });
    const template = page.properties[0]!;
    for (let i = 0; i < 105; i += 1) {
      const property = mapListProperty(
        {
          ...template,
          property_token: `full-index-${i}`,
          name: `Full Index Hotel ${i}`,
        },
        { citySlug: "buenos-aires", cityDisplay: "Buenos Aires" },
      )!;
      await db.upsertScored(
        cityId,
        scoreProperty(property, {
          citySlug: "buenos-aires",
          cityMeanRating: 4.2,
          checkIn: "",
          checkOut: "",
          adults: 2,
          evidenceStrictness: "confirmed_or_unknown",
        }),
      );
    }

    expect(await db.listByCityScore(cityId)).toHaveLength(105);
    expect(await db.listByCityScore(cityId, 100)).toHaveLength(100);

    const sweep = await runPriceSweep({
      citySlug: "buenos-aires",
      provider,
      db,
      windows: {
        checkInStart: "2026-08-11",
        checkInEnd: "2026-08-11",
        nightsMin: 2,
        nightsMax: 2,
      },
    });
    expect(sweep.indexSize).toBe(105);
    expect(sweep.properties).toHaveLength(105);
  });

  it("joins dated list prices onto index tokens", async () => {
    const db = createMemoryHotelsRepository();
    const cityId = await db.ensureCity({
      slug: "buenos-aires",
      display: "Buenos Aires",
      query: "Buenos Aires",
    });
    // Seed a few tokens from the fixture list.
    const provider = new FixtureProvider();
    const page = await provider.listProperties({
      q: "Buenos Aires",
      checkIn: "2026-08-11",
      checkOut: "2026-08-13",
      sortBy: "most_reviewed",
    });
    for (const raw of page.properties.slice(0, 6)) {
      if (!raw.property_token || !raw.name) continue;
      await db.upsertScored(cityId, {
        property: {
          token: raw.property_token,
          name: raw.name,
          citySlug: "buenos-aires",
          type: "hotel",
          lat: null,
          lng: null,
          hotelClass: null,
          brandTier: 0,
          rating: typeof raw.rating === "number" ? raw.rating : null,
          reviews: typeof raw.reviews === "number" ? raw.reviews : null,
          amenities: [],
          histogram: null,
          breakdown: [],
          lowStarShare: null,
          worstCategory: null,
          worstCategoryNeg: null,
          taRating: null,
          taReviews: null,
          taRank: null,
          taTotal: null,
          whitelist: [],
          nightlyUsd: null,
          totalUsd: null,
          googleHotelsUrl: null,
          provider: "fixture",
          raw,
          observedAt: new Date().toISOString(),
        },
        facts: {
          hasAC: {
            value: null,
            status: "unknown",
            sources: [],
            observedAt: "",
          },
          hasElevator: {
            value: null,
            status: "unknown",
            sources: [],
            observedAt: "",
          },
          hasWifi: {
            value: null,
            status: "unknown",
            sources: [],
            observedAt: "",
          },
          frontDesk24h: {
            value: null,
            status: "unknown",
            sources: [],
            observedAt: "",
          },
          freeCancellationSeen: {
            value: null,
            status: "unknown",
            sources: [],
            observedAt: "",
          },
        },
        gates: [],
        gatedOut: false,
        score: 50,
        subscores: {
          quality: 40,
          consistencyPenalty: 0,
          plantPenalty: 0,
          brandBonus: 0,
          taBonus: 0,
          whitelistBonus: 0,
          classNudge: 0,
          bayesRating: 4.2,
          maxNegRate: 0,
          worstPlantCategory: null,
        },
        scoringVersion: 1,
      });
    }

    const sweep = await runPriceSweep({
      citySlug: "buenos-aires",
      provider,
      db,
      windows: {
        checkInStart: "2026-08-11",
        checkInEnd: "2026-08-11",
        nightsMin: 2,
        nightsMax: 2,
      },
    });

    expect(sweep.windows).toHaveLength(1);
    expect(sweep.liveCalls).toBeGreaterThanOrEqual(1); // list + optional top-ups
    expect(sweep.pricedCount).toBeGreaterThanOrEqual(1);
    expect(sweep.properties.some((p) => p.bestStay != null)).toBe(true);

    // Second pass should hit cache and skip list + top-up.
    const again = await runPriceSweep({
      citySlug: "buenos-aires",
      provider,
      db,
      windows: {
        checkInStart: "2026-08-11",
        checkInEnd: "2026-08-11",
        nightsMin: 2,
        nightsMax: 2,
      },
    });
    expect(again.windowsSkippedCache).toBe(1);
    expect(again.liveCalls).toBe(0);
    expect(again.topupCalls).toBe(0);

    const differentOccupancy = await runPriceSweep({
      citySlug: "buenos-aires",
      provider,
      db,
      adults: 3,
      windows: {
        checkInStart: "2026-08-11",
        checkInEnd: "2026-08-11",
        nightsMin: 2,
        nightsMax: 2,
      },
    });
    expect(differentOccupancy.liveCalls).toBe(1);
  });
});
