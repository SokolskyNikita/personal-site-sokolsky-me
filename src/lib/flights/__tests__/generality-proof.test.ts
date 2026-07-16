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
 * Generality proof (invariant 9): a composed sample region pair requires ONLY
 * registry data — resolver → planner → classifier → policy → grouping.
 */
describe("generality proof: western-europe-sample → south-america-sample", () => {
  it("resolves composed entries without hardcoded market logic", () => {
    const origins = resolveLocation("western-europe-sample");
    const dests = resolveLocation("south-america-sample");
    expect(origins).toEqual(["LHR", "CDG", "ORY", "FRA", "MUC"]);
    expect(dests).toEqual(["EZE", "GRU", "SCL"]);
  });

  it("plans a cross-product for the composed pair", () => {
    const plan = planSearch({
      origin: "western-europe-sample",
      dest: "south-america-sample",
      dateRange: { start: "2026-07-20", days: 2 },
    });
    expect(plan.callCount).toBe(2);
    expect(plan.originAirports).toContain("LHR");
    expect(plan.destAirports).toContain("GRU");
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
      "GRU",
    );
    const economyOpts = remapDest(
      parseSerpApiResponse(economy, {
        currency: "USD",
        departureDate: "2026-07-21",
      }),
      "SCL",
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
