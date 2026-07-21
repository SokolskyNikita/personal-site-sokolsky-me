import { describe, expect, it } from "vitest";
import { computeDeals, fitLogPrice } from "../deals";
import { DEAL_MIN_SCORE } from "../constants";
import { generateStayWindows, median } from "../windows";

describe("generateStayWindows", () => {
  it("builds check-in × nights cartesian product", () => {
    const windows = generateStayWindows({
      checkInStart: "2026-08-11",
      checkInEnd: "2026-08-12",
      nightsMin: 2,
      nightsMax: 3,
    });
    expect(windows).toEqual([
      { checkIn: "2026-08-11", checkOut: "2026-08-13", nights: 2 },
      { checkIn: "2026-08-11", checkOut: "2026-08-14", nights: 3 },
      { checkIn: "2026-08-12", checkOut: "2026-08-14", nights: 2 },
      { checkIn: "2026-08-12", checkOut: "2026-08-15", nights: 3 },
    ]);
  });

  it("caps at WINDOW_CAP", () => {
    const windows = generateStayWindows({
      checkInStart: "2026-08-01",
      checkInEnd: "2026-08-20",
      nightsMin: 1,
      nightsMax: 5,
      cap: 7,
    });
    expect(windows).toHaveLength(7);
  });

  it("returns empty for inverted dates", () => {
    expect(
      generateStayWindows({
        checkInStart: "2026-08-12",
        checkInEnd: "2026-08-11",
        nightsMin: 2,
        nightsMax: 2,
      }),
    ).toEqual([]);
  });
});

describe("deals", () => {
  it("falls back when sample is small", () => {
    const deals = computeDeals([
      { token: "a", comfort: 50, nightlyUsd: 100 },
      { token: "b", comfort: 60, nightlyUsd: 120 },
    ]);
    expect(deals.every((d) => d.method === "fallback")).toBe(true);
    expect(deals.every((d) => d.dealPct >= -1 && d.dealPct <= 1)).toBe(true);
  });

  it("fits when sample is large enough", () => {
    const samples = Array.from({ length: 15 }, (_, i) => ({
      token: `t${i}`,
      comfort: 40 + i * 2,
      nightlyUsd: 80 + i * 10,
    }));
    expect(fitLogPrice(samples)).not.toBeNull();
    expect(computeDeals(samples)[0]?.method).toBe("fit");
  });

  it("excludes properties below DEAL_MIN_SCORE floor", () => {
    const samples = Array.from({ length: 15 }, (_, i) => ({
      token: `t${i}`,
      comfort: i < 3 ? 20 : 45 + i,
      nightlyUsd: 100 + i * 5,
    }));
    const deals = computeDeals(samples);
    expect(deals.every((d) => {
      const src = samples.find((s) => s.token === d.token)!;
      return src.comfort >= DEAL_MIN_SCORE;
    })).toBe(true);
    expect(deals.some((d) => d.token === "t0")).toBe(false);
  });

  it("median helper", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBeNull();
  });
});
