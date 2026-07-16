import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { groupResults } from "../group";
import { getSearchMode } from "../modes";
import { planSearch } from "../planner";
import { filterByLieFlatPolicy } from "../policy";
import { parseSerpApiResponse } from "../serpapi";

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../__fixtures__",
);

describe("integration: fake provider through pipeline", () => {
  it("business-lie-flat mode filters to all_segments lie-flat", () => {
    const mode = getSearchMode("business-lie-flat")!;
    const plan = planSearch({
      origin: "EZE",
      dest: "JFK",
      dateRange: { start: "2026-07-23", days: 1 },
    });
    expect(plan.callCount).toBe(2);

    const raw = JSON.parse(
      readFileSync(join(fixturesDir, "business-eze-jfk.json"), "utf8"),
    );
    const parsed = parseSerpApiResponse(raw, {
      currency: "USD",
      departureDate: "2026-07-23",
    });
    const filtered = filterByLieFlatPolicy(
      parsed,
      mode.lieFlatPolicy,
      false,
    );
    expect(filtered.every((o) =>
      o.segments.every((s) => s.seatClassification === "lie_flat"),
    )).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);

    const grouped = groupResults(filtered, { groupBy: "date", topN: 2 });
    expect(grouped["2026-07-23"]).toBeDefined();
  });

  it("economy mode applies no lie-flat filter", () => {
    const mode = getSearchMode("economy")!;
    expect(mode.lieFlatPolicy).toBe("none");

    const raw = JSON.parse(
      readFileSync(join(fixturesDir, "economy-eze-jfk.json"), "utf8"),
    );
    const parsed = parseSerpApiResponse(raw, {
      currency: "USD",
      departureDate: "2026-07-23",
    });
    const filtered = filterByLieFlatPolicy(
      parsed,
      mode.lieFlatPolicy,
      false,
    );
    expect(filtered).toHaveLength(parsed.length);
  });
});
