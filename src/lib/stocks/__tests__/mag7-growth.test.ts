import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const data = JSON.parse(
  readFileSync(new URL("../../../data/mag7-growth.json", import.meta.url), "utf8"),
) as {
  years: Array<{
    year: number;
    label: string;
    companies: Array<{
      id: string;
      name: string;
      rank: number;
      marketCap: number;
      revenueGrowth: number | null;
      pe: number | null;
    }>;
  }>;
};

describe("mag7 growth dataset", () => {
  it("covers 2016 through 2026 with ten companies each year", () => {
    expect(data.years.map((row) => row.year)).toEqual([
      2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ]);
    expect(data.years.at(-1)?.label).toBe("2026 YTD");
    for (const row of data.years) {
      expect(row.companies).toHaveLength(10);
      expect(row.companies.map((company) => company.rank)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ]);
      const caps = row.companies.map((company) => company.marketCap);
      expect(caps).toEqual([...caps].sort((a, b) => b - a));
      for (const company of row.companies) {
        expect(company.revenueGrowth).toEqual(expect.any(Number));
        expect(company.pe).toEqual(expect.any(Number));
        expect(company.pe).toBeGreaterThan(0);
      }
    }
  });

  it("puts the 2026 leaders in the current mega-cap order", () => {
    const names = data.years
      .find((row) => row.year === 2026)
      ?.companies.map((company) => company.name);
    expect(names?.slice(0, 5)).toEqual([
      "Nvidia",
      "Apple",
      "Alphabet",
      "Microsoft",
      "Amazon",
    ]);
  });
});
