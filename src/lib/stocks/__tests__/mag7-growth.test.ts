import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const data = JSON.parse(
  readFileSync(new URL("../../../data/mag7-growth.json", import.meta.url), "utf8"),
) as {
  defaultScope: string;
  scopes: Record<
    string,
    {
      id: string;
      label: string;
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
        others: Array<{
          id: string;
          name: string;
          rank: number;
          region: string;
          marketCap: number;
          revenueGrowth: number | null;
          pe: number | null;
        }>;
      }>;
    }
  >;
};

const NON_US = new Set(["TSM", "TCEHY", "BABA", "SMSN", "ASML"]);

describe("mag7 growth dataset", () => {
  it("defaults to the U.S. set and also has a global set", () => {
    expect(data.defaultScope).toBe("us");
    expect(Object.keys(data.scopes)).toEqual(["us", "global"]);
  });

  it.each(["us", "global"] as const)(
    "covers 2016 through 2026 with ten %s companies each year",
    (scope) => {
      const years = data.scopes[scope].years;
      expect(years.map((row) => row.year)).toEqual([
        2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
      ]);
      expect(years.at(-1)?.label).toBe("2026 YTD");
      for (const row of years) {
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
          if (scope === "us") expect(NON_US.has(company.id)).toBe(false);
        }
      }
    },
  );

  it("puts the 2026 U.S. leaders in the current mega-cap order", () => {
    const names = data.scopes.us.years
      .find((row) => row.year === 2026)
      ?.companies.map((company) => company.name);
    expect(names?.slice(0, 5)).toEqual([
      "Nvidia",
      "Apple",
      "Alphabet",
      "Microsoft",
      "Amazon",
    ]);
    expect(names?.slice(-2)).toEqual(["Intel", "Cisco"]);
  });

  it("puts TSMC in the 2026 global ten and not the U.S. ten", () => {
    const us = data.scopes.us.years
      .find((row) => row.year === 2026)
      ?.companies.map((company) => company.id);
    const world = data.scopes.global.years
      .find((row) => row.year === 2026)
      ?.companies.map((company) => company.id);
    expect(us).not.toContain("TSM");
    expect(world).toContain("TSM");
  });

  it("keeps non-U.S. names available as extras on the U.S. view", () => {
    const row = data.scopes.us.years.find((item) => item.year === 2026);
    const extraIds = row?.others.map((company) => company.id) ?? [];
    expect(extraIds).toEqual(
      expect.arrayContaining(["TSM", "SMSN", "ASML", "TCEHY", "BABA"]),
    );
    expect(row?.companies.map((company) => company.id)).not.toContain("TSM");
  });

  it("does not duplicate a company between the ten and the others", () => {
    for (const scope of ["us", "global"] as const) {
      for (const row of data.scopes[scope].years) {
        const ids = [
          ...row.companies.map((company) => company.id),
          ...row.others.map((company) => company.id),
        ];
        expect(new Set(ids).size).toBe(ids.length);
        expect(row.others.length).toBeGreaterThan(0);
        for (const company of row.others) {
          expect(company.revenueGrowth).toEqual(expect.any(Number));
        }
      }
    }
  });
});
