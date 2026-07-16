import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { groupResults } from "../group";
import { planSearch } from "../planner";
import { filterByLieFlatPolicy } from "../policy";
import { resolveLocation } from "../resolver";
import { parseSerpApiResponse } from "../serpapi";
import type { ItineraryOption } from "../types";

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../__fixtures__",
);

/**
 * Generality proof: a non-default region pair requires only registry data —
 * resolver → planner → classifier → policy → grouping.
 */
describe("generality proof: Schengen/EU → Mexico", () => {
  it("resolves entries without hardcoded market logic", () => {
    const origins = resolveLocation("schengen-eu-gateways");
    const dests = resolveLocation("mexico-gateways");
    expect(origins).toHaveLength(25);
    expect(origins).toContain("AMS");
    expect(dests).toEqual(["MEX", "CUN", "GDL", "MTY", "TIJ", "SJD"]);
  });

  it("plans a cross-product for the region pair", () => {
    const plan = planSearch({
      origin: "schengen-eu-gateways",
      dest: "mexico-gateways",
      dateRange: { start: "2026-07-20", days: 2 },
    });
    expect(plan.callCount).toBe(6);
    expect(plan.originAirports).toContain("CDG");
    expect(plan.destAirports).toContain("MEX");
  });

  it("runs fake provider fixture data through classifier → policy → grouping", () => {
    const business = JSON.parse(
      readFileSync(join(fixturesDir, "business-eze-jfk.json"), "utf8"),
    );
    const economy = JSON.parse(
      readFileSync(join(fixturesDir, "economy-eze-jfk.json"), "utf8"),
    );

    // Remap fixture destinations to prove the pipeline is location-agnostic.
    const businessOpts = remapDest(
      parseSerpApiResponse(business, {
        currency: "USD",
        departureDate: "2026-07-20",
      }),
      "MEX",
    );
    const economyOpts = remapDest(
      parseSerpApiResponse(economy, {
        currency: "USD",
        departureDate: "2026-07-21",
      }),
      "CUN",
    );

    const lieFlatPass = filterByLieFlatPolicy(
      businessOpts,
      "all_segments",
      false,
    );
    const economyPass = filterByLieFlatPolicy(economyOpts, "none", false);

    expect(lieFlatPass.length).toBeLessThan(businessOpts.length);
    expect(economyPass).toHaveLength(economyOpts.length);

    const groupedLieFlat = groupResults(lieFlatPass, {
      groupBy: "date",
      topN: 2,
    });
    const groupedEconomy = groupResults(economyPass, {
      groupBy: "date",
      topN: 2,
    });

    expect(Object.keys(groupedLieFlat).length).toBeGreaterThan(0);
    expect(Object.keys(groupedEconomy).length).toBeGreaterThan(0);
    for (const list of Object.values(groupedEconomy)) {
      expect(list.length).toBeLessThanOrEqual(2);
    }
  });
});

function remapDest(
  options: ItineraryOption[],
  dest: string,
): ItineraryOption[] {
  return options.map((o) => ({
    ...o,
    destinationAirport: dest,
    segments: o.segments.map((s, i, arr) =>
      i === arr.length - 1 ? { ...s, arrivalAirport: dest } : s,
    ),
  }));
}
