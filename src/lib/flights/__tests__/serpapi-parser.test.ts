import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { classifySeat } from "../classifier";
import { dedupeItineraries, parseSerpApiResponse } from "../serpapi";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../__fixtures__");

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, name), "utf8"));
}

describe("parseSerpApiResponse", () => {
  it("parses business-cabin fixture with lie-flat and angled-flat segments", () => {
    const raw = loadFixture("business-eze-jfk.json");
    const options = parseSerpApiResponse(raw, {
      currency: "USD",
      departureDate: "2026-07-23",
    });

    expect(options.length).toBeGreaterThan(0);
    expect(options.every((o) => typeof o.price === "number")).toBe(true);

    const lieFlat = options.find((o) =>
      o.segments.some((s) => s.seatClassification === "lie_flat"),
    );
    expect(lieFlat).toBeDefined();
    expect(
      lieFlat!.segments.some((s) =>
        s.amenities.some((a) => /lie flat/i.test(a)),
      ),
    ).toBe(true);

    const angled = options.find((o) =>
      o.segments.some((s) =>
        s.amenities.some((a) => /angled flat/i.test(a)),
      ),
    );
    expect(angled).toBeDefined();
    expect(
      angled!.segments.find((s) =>
        s.amenities.some((a) => /angled flat/i.test(a)),
      )!.seatClassification,
    ).toBe("not_lie_flat");
  });

  it("parses economy-cabin fixture with legroom seat classifications", () => {
    const raw = loadFixture("economy-eze-jfk.json");
    const options = parseSerpApiResponse(raw, {
      currency: "USD",
      departureDate: "2026-07-23",
    });

    expect(options.length).toBeGreaterThan(0);
    const withLegroom = options.find((o) =>
      o.segments.some((s) => s.seatClassification === "not_lie_flat"),
    );
    expect(withLegroom).toBeDefined();
    expect(
      withLegroom!.segments.every(
        (s) => s.seatClassification === "not_lie_flat" || s.seatClassification === "unknown",
      ),
    ).toBe(true);
  });

  it("drops options missing a price", () => {
    const dropped: string[] = [];
    const options = parseSerpApiResponse(
      {
        best_flights: [
          {
            flights: [
              {
                departure_airport: { id: "EZE", time: "2026-07-23 10:00" },
                arrival_airport: { id: "JFK", time: "2026-07-23 20:00" },
                duration: 600,
                airline: "Test",
                flight_number: "T 1",
                extensions: [],
              },
            ],
            total_duration: 600,
          },
        ],
      },
      {
        currency: "USD",
        departureDate: "2026-07-23",
        onDebug: (m) => dropped.push(m),
      },
    );
    expect(options).toHaveLength(0);
    expect(dropped.some((m) => m.includes("missing price"))).toBe(true);
  });

  it("dedupes identical itineraries across batches", () => {
    const raw = loadFixture("economy-eze-jfk.json");
    const a = parseSerpApiResponse(raw, {
      currency: "USD",
      departureDate: "2026-07-23",
    });
    const b = parseSerpApiResponse(raw, {
      currency: "USD",
      departureDate: "2026-07-23",
    });
    const merged = dedupeItineraries([...a, ...b]);
    expect(merged).toHaveLength(a.length);
  });
});

describe("real amenity strings from fixtures", () => {
  it("classifies strings present in recorded fixtures", () => {
    expect(classifySeat(["Lie flat seat"])).toBe("lie_flat");
    expect(classifySeat(["Angled flat seat"])).toBe("not_lie_flat");
    expect(classifySeat(["Below average legroom (28 in)"])).toBe("not_lie_flat");
    expect(classifySeat(["Average legroom (31 in)"])).toBe("not_lie_flat");
    expect(classifySeat(["Above average legroom (32 in)"])).toBe("not_lie_flat");
  });
});
