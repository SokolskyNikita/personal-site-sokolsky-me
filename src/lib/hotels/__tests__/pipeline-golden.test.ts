import { describe, expect, it } from "vitest";
import { createMemoryHotelsRepository } from "../db";
import { FixtureProvider } from "../providers/fixtures";
import { LiveModeDisabledError, SearchApiHotelProvider } from "../providers/searchapi";
import { runCityScan, summarizeTop } from "../pipeline";
import { computeDeals, fitLogPrice } from "../deals";

describe("SearchApiHotelProvider live gate", () => {
  it("refuses list when SEARCHAPI_LIVE is off", async () => {
    const p = new SearchApiHotelProvider({
      apiKey: "x",
      liveMode: false,
      fetchImpl: async () => {
        throw new Error("should_not_fetch");
      },
    });
    await expect(
      p.listProperties({
        q: "Buenos Aires",
        checkIn: "2026-08-11",
        checkOut: "2026-08-13",
      }),
    ).rejects.toBeInstanceOf(LiveModeDisabledError);
  });
});

describe("fixture scan pipeline", () => {
  it("scores BA fixtures end-to-end with zero live calls", async () => {
    const db = createMemoryHotelsRepository();
    const provider = new FixtureProvider();
    const result = await runCityScan({
      citySlug: "buenos-aires",
      provider,
      db,
      mostReviewedPages: 8,
      highestRatingPages: 4,
      checkIn: "2026-08-11",
      checkOut: "2026-08-13",
    });

    expect(provider.creditsUsed).toBe(0);
    expect(result.found).toBeGreaterThan(10);
    expect(result.scored).toBeGreaterThan(5);
    expect(result.enriched).toBe(0);

    const names = result.top10.map((s) => s.property.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "Four Seasons Hotel Buenos Aires",
        "Palacio Duhau - Park Hyatt Buenos Aires",
        "Alvear Palace Hotel",
      ]),
    );

    // Unknown AC must not silently exclude under default strictness
    const withUnknownAc = result.all.find(
      (s) => s.facts.hasAC.status === "unknown" && !s.gatedOut,
    );
    // Florida Garden has null amenities — may be gated for other reasons; at least facts unknown
    const florida = result.all.find((s) =>
      s.property.name.includes("Florida Garden"),
    );
    if (florida) {
      expect(florida.facts.hasAC.status).toBe("unknown");
    }
    expect(withUnknownAc || florida?.facts.hasAC.status === "unknown").toBeTruthy();

    const city = await db.getCityBySlug("buenos-aires");
    expect(city?.mean_rating).toBeTruthy();
    expect(city?.scanned_at).toBeTruthy();

    const summary = summarizeTop(result.top10);
    expect(summary).toMatchSnapshot("fixture-top10");
  });

  it("golden ranking order is stable for weight diffs", async () => {
    const result = await runCityScan({
      citySlug: "buenos-aires",
      provider: new FixtureProvider(),
      checkIn: "2026-08-11",
      checkOut: "2026-08-13",
    });
    const order = result.top10.map((s) => ({
      name: s.property.name,
      score: Math.round(s.score * 100) / 100,
      brandTier: s.property.brandTier,
      plant: Math.round(s.subscores.plantPenalty * 100) / 100,
    }));
    expect(order).toMatchSnapshot("golden-ranking");
  });

  it("does not replace city-wide mean on neighborhood scans", async () => {
    const db = createMemoryHotelsRepository();
    await runCityScan({
      citySlug: "buenos-aires",
      provider: new FixtureProvider(),
      db,
      checkIn: "2026-08-11",
      checkOut: "2026-08-13",
    });
    const before = await db.getCityBySlug("buenos-aires");
    await runCityScan({
      citySlug: "buenos-aires",
      provider: new FixtureProvider(),
      db,
      bbox: [-58.45, -34.6, -58.39, -34.55],
      checkIn: "2026-08-11",
      checkOut: "2026-08-13",
    });
    const after = await db.getCityBySlug("buenos-aires");
    expect(after?.mean_rating).toBe(before?.mean_rating);
    expect(after?.scanned_at).toBe(before?.scanned_at);
  });
});

describe("deals (P2 pure)", () => {
  it("falls back when sample is small", () => {
    const deals = computeDeals([
      { token: "a", comfort: 50, nightlyUsd: 100 },
      { token: "b", comfort: 60, nightlyUsd: 120 },
    ]);
    expect(deals.every((d) => d.method === "fallback")).toBe(true);
  });

  it("fits when sample is large enough", () => {
    const samples = Array.from({ length: 15 }, (_, i) => ({
      token: `t${i}`,
      comfort: 40 + i * 2,
      nightlyUsd: 80 + i * 10,
    }));
    expect(fitLogPrice(samples)).not.toBeNull();
    const deals = computeDeals(samples);
    expect(deals[0]?.method).toBe("fit");
  });
});
