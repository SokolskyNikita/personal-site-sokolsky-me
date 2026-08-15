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
          region: string;
          rank: number;
          marketCap: number;
          revenueGrowth: number | null;
          pe: number | null;
        }>;
      }>;
    }
  >;
};

const NON_US = new Set([
  "TSM",
  "TCEHY",
  "BABA",
  "SMSN",
  "ASML",
  "SKH",
  "SAP",
  "SHOP",
  "MTK",
  "TOEL",
  "SONY",
  "KEYN",
  "PDD",
  "BIDU",
  "FOXN",
  "NTDOY",
  "ADVT",
]);

describe("mag7 growth dataset", () => {
  it("defaults to the U.S. set and also has global and non-U.S. sets", () => {
    expect(data.defaultScope).toBe("us");
    expect(Object.keys(data.scopes)).toEqual(["us", "global", "nonus"]);
  });

  it.each(["us", "global", "nonus"] as const)(
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
          if (scope === "us") expect(NON_US.has(company.id)).toBe(false);
          if (scope === "nonus") expect(company.region).toBe("nonus");
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

  it("ranks the 2026 non-U.S. ten by headquarters outside the United States", () => {
    const names = data.scopes.nonus.years
      .find((row) => row.year === 2026)
      ?.companies.map((company) => company.name);
    expect(names?.slice(0, 5)).toEqual([
      "TSMC",
      "Samsung",
      "SK Hynix",
      "ASML",
      "Tencent",
    ]);
    expect(names).toContain("SAP");
    expect(names).toContain("Shopify");
    expect(names).not.toContain("Nvidia");
    expect(names).not.toContain("Apple");
  });
});
