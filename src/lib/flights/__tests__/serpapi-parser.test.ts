import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { classifySeat } from "../classifier";
import {
  dedupeItineraries,
  parseSerpApiResponse,
  SerpApiProvider,
} from "../serpapi";

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

describe("SerpApiProvider retries", () => {
  const step = {
    originBatch: ["EZE"],
    destBatch: ["JFK"],
    date: "2026-07-23",
    cabin: "business" as const,
    maxStops: 1 as const,
    currency: "USD",
    gl: "us",
    hl: "en",
    deepSearch: true,
  };

  it("retries transient Google Flights errors without SerpApi cache", async () => {
    const urls: string[] = [];
    let calls = 0;
    const provider = new SerpApiProvider({
      apiKey: "test",
      retryAttempts: 4,
      retryBaseDelayMs: 0,
      fetchImpl: async (url) => {
        urls.push(url);
        calls += 1;
        const body =
          calls < 3
            ? { error: "Google Flights hasn't returned any results for this query." }
            : { best_flights: [] };
        return new Response(JSON.stringify(body), { status: 200 });
      },
    });

    await expect(provider.searchStep(step)).resolves.toMatchObject({
      options: [],
      searchesUsed: 3,
    });
    expect(calls).toBe(3);
    expect(new URL(urls[0]!).searchParams.has("no_cache")).toBe(false);
    expect(new URL(urls[1]!).searchParams.get("no_cache")).toBe("true");
    expect(new URL(urls[2]!).searchParams.get("no_cache")).toBe("true");
  });

  it("does not retry permanent SerpApi errors", async () => {
    let calls = 0;
    const provider = new SerpApiProvider({
      apiKey: "test",
      retryAttempts: 4,
      retryBaseDelayMs: 0,
      fetchImpl: async () => {
        calls += 1;
        return new Response(JSON.stringify({ error: "Invalid API key" }), {
          status: 200,
        });
      },
    });

    await expect(provider.searchStep(step)).rejects.toThrow("Invalid API key");
    expect(calls).toBe(1);
  });

  it("hydrates round-trip candidates with return-flight details", async () => {
    const urls: string[] = [];
    const flight = (
      from: string,
      to: string,
      date: string,
      number: string,
    ) => ({
      flights: [
        {
          departure_airport: { id: from, time: `${date} 10:00` },
          arrival_airport: { id: to, time: `${date} 20:00` },
          duration: 600,
          airline: "Test Air",
          flight_number: number,
          travel_class: "Business",
          extensions: ["Lie flat seat"],
        },
      ],
      total_duration: 600,
      price: 1200,
    });
    const provider = new SerpApiProvider({
      apiKey: "test",
      retryAttempts: 1,
      fetchImpl: async (url) => {
        urls.push(url);
        const parsed = new URL(url);
        const body = parsed.searchParams.has("departure_token")
          ? {
              best_flights: [
                {
                  ...flight("JFK", "EZE", "2026-07-30", "TA 2"),
                  booking_token: "book",
                },
              ],
            }
          : {
              best_flights: [
                {
                  ...flight("EZE", "JFK", "2026-07-23", "TA 1"),
                  departure_token: "depart",
                },
              ],
            };
        return new Response(JSON.stringify(body));
      },
    });

    const result = await provider.searchRoundTripStep({
      ...step,
      returnDate: "2026-07-30",
      topN: 4,
    });

    expect(result.searchesUsed).toBe(2);
    expect(result.options).toHaveLength(1);
    expect(result.options[0]).toMatchObject({
      bookingToken: "book",
      returnDate: "2026-07-30",
      returnDurationMinutes: 600,
    });
    expect(result.options[0]!.returnSegments?.[0]?.flightNumber).toBe("TA 2");
    expect(new URL(urls[0]!).searchParams.get("type")).toBe("1");
    expect(new URL(urls[0]!).searchParams.get("return_date")).toBe(
      "2026-07-30",
    );
    expect(new URL(urls[1]!).searchParams.get("departure_token")).toBe(
      "depart",
    );
  });
});
