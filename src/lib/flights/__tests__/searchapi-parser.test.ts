import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { classifySeat } from "../classifier";
import {
  buildSearchApiUrl,
  dedupeItineraries,
  parseSearchApiResponse,
  SearchApiProvider,
  searchApiCacheKey,
} from "../searchapi";

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../__fixtures__",
);

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, name), "utf8"));
}

describe("parseSearchApiResponse", () => {
  it("parses SearchAPI date and time fields with seat classifications", () => {
    const raw = loadFixture("business-eze-jfk.json");
    const options = parseSearchApiResponse(raw, {
      currency: "USD",
      departureDate: "2026-08-15",
    });

    expect(options.length).toBeGreaterThan(0);
    expect(options[0]).toMatchObject({
      departureDate: "2026-08-15",
      googleFlightsUrl:
        "https://www.google.com/travel/flights/search?fixture=business",
      provider: "searchapi",
    });
    expect(options[0]!.segments[0]!.departureTime).toBe(
      "2026-08-15 21:05",
    );
    expect(
      options.some((option) =>
        option.segments.some(
          (segment) => segment.seatClassification === "lie_flat",
        ),
      ),
    ).toBe(true);
    expect(
      options.some((option) =>
        option.segments.some(
          (segment) => segment.seatClassification === "not_lie_flat",
        ),
      ),
    ).toBe(true);
  });

  it("parses economy legroom and drops options missing a price", () => {
    const options = parseSearchApiResponse(
      loadFixture("economy-eze-jfk.json"),
      {
        currency: "USD",
        departureDate: "2026-08-15",
      },
    );
    expect(options).toHaveLength(1);
    expect(options[0]!.segments[0]).toMatchObject({
      cabin: "economy",
      legroom: "Seat type Average Legroom",
      seatClassification: "not_lie_flat",
    });

    const dropped: string[] = [];
    expect(
      parseSearchApiResponse(
        {
          best_flights: [
            {
              flights: [
                {
                  departure_airport: {
                    id: "EZE",
                    date: "2026-08-15",
                    time: "10:00",
                  },
                  arrival_airport: {
                    id: "JFK",
                    date: "2026-08-15",
                    time: "20:00",
                  },
                  duration: 600,
                  airline: "Test",
                  flight_number: "T 1",
                  extensions: [],
                },
              ],
            },
          ],
        },
        {
          currency: "USD",
          departureDate: "2026-08-15",
          onDebug: (message) => dropped.push(message),
        },
      ),
    ).toHaveLength(0);
    expect(dropped).toContain("drop itinerary: missing price");
  });

  it("dedupes identical itineraries across batches", () => {
    const raw = loadFixture("economy-eze-jfk.json");
    const options = parseSearchApiResponse(raw, {
      currency: "USD",
      departureDate: "2026-08-15",
    });
    expect(dedupeItineraries([...options, ...options])).toHaveLength(
      options.length,
    );
  });
});

describe("SearchAPI request mapping", () => {
  it("uses string parameters and comma-separated airport batches", () => {
    const url = new URL(
      buildSearchApiUrl({
        departureId: "EZE,AEP",
        arrivalId: "JFK,EWR",
        outboundDate: "2026-08-15",
        cabin: "business",
        maxStops: 1,
        currency: "USD",
        gl: "us",
        hl: "en",
        apiKey: "test",
      }),
    );

    expect(url.origin).toBe("https://www.searchapi.io");
    expect(url.pathname).toBe("/api/v1/search");
    expect(url.searchParams.get("flight_type")).toBe("one_way");
    expect(url.searchParams.get("departure_id")).toBe("EZE,AEP");
    expect(url.searchParams.get("arrival_id")).toBe("JFK,EWR");
    expect(url.searchParams.get("travel_class")).toBe("business");
    expect(url.searchParams.get("stops")).toBe("one_stop_or_fewer");
    expect(url.searchParams.has("deep_search")).toBe(false);
    expect(url.searchParams.has("no_cache")).toBe(false);
  });

  it("versions cache keys independently from legacy provider data", () => {
    const key = searchApiCacheKey({
      departureId: "EZE",
      arrivalId: "JFK",
      outboundDate: "2026-08-15",
      cabin: "business",
      maxStops: 1,
      currency: "USD",
      gl: "us",
      hl: "en",
    });
    expect(key.startsWith("searchapi-v1|")).toBe(true);
  });
});

describe("SearchApiProvider", () => {
  const step = {
    originBatch: ["EZE"],
    destBatch: ["JFK"],
    date: "2026-08-15",
    cabin: "business" as const,
    maxStops: 1 as const,
    currency: "USD",
    gl: "us",
    hl: "en",
  };

  it("retries transient errors without unsupported cache parameters", async () => {
    const urls: string[] = [];
    let calls = 0;
    const provider = new SearchApiProvider({
      apiKey: "test",
      retryAttempts: 4,
      retryBaseDelayMs: 0,
      fetchImpl: async (url) => {
        urls.push(url);
        calls += 1;
        const body =
          calls < 3
            ? { error: "Google Flights hasn't returned any results." }
            : { best_flights: [] };
        return Response.json(body);
      },
    });

    await expect(provider.searchStep(step)).resolves.toMatchObject({
      options: [],
      searchesUsed: 3,
    });
    expect(urls).toHaveLength(3);
    expect(urls.every((url) => !new URL(url).searchParams.has("no_cache"))).toBe(
      true,
    );
  });

  it("does not retry permanent SearchAPI errors", async () => {
    let calls = 0;
    const provider = new SearchApiProvider({
      apiKey: "test",
      retryAttempts: 4,
      retryBaseDelayMs: 0,
      fetchImpl: async () => {
        calls += 1;
        return Response.json({ error: "Invalid API key" });
      },
    });

    await expect(provider.searchStep(step)).rejects.toThrow("Invalid API key");
    expect(calls).toBe(1);
  });

  it("hydrates round-trip candidates with return-flight details", async () => {
    const urls: string[] = [];
    const itinerary = (
      from: string,
      to: string,
      date: string,
      number: string,
    ) => ({
      flights: [
        {
          departure_airport: { id: from, date, time: "10:00" },
          arrival_airport: { id: to, date, time: "20:00" },
          duration: 600,
          airline: "Test Air",
          flight_number: number,
          travel_class: "Business",
          extensions: ["Seat type Lie Flat"],
        },
      ],
      total_duration: 600,
      price: 1200,
    });
    const provider = new SearchApiProvider({
      apiKey: "test",
      retryAttempts: 1,
      fetchImpl: async (url) => {
        urls.push(url);
        const parsed = new URL(url);
        return Response.json(
          parsed.searchParams.has("departure_token")
            ? {
                other_flights: [
                  {
                    ...itinerary("JFK", "EZE", "2026-08-22", "TA 2"),
                    booking_token: "book",
                  },
                ],
              }
            : {
                other_flights: [
                  {
                    ...itinerary("EZE", "JFK", "2026-08-15", "TA 1"),
                    departure_token: "depart",
                  },
                ],
              },
        );
      },
    });

    const result = await provider.searchRoundTripStep({
      ...step,
      returnDate: "2026-08-22",
      topN: 4,
    });

    expect(result.searchesUsed).toBe(2);
    expect(result.options).toHaveLength(1);
    expect(result.options[0]).toMatchObject({
      bookingToken: "book",
      returnDate: "2026-08-22",
      returnDurationMinutes: 600,
    });
    expect(result.options[0]!.returnSegments?.[0]?.flightNumber).toBe("TA 2");
    expect(new URL(urls[0]!).searchParams.get("flight_type")).toBe(
      "round_trip",
    );
    expect(new URL(urls[0]!).searchParams.get("return_date")).toBe(
      "2026-08-22",
    );
    expect(new URL(urls[1]!).searchParams.get("departure_token")).toBe(
      "depart",
    );
  });
});

describe("real SearchAPI amenity strings", () => {
  it("classifies strings returned by the MCP checks", () => {
    expect(classifySeat(["Seat type Lie Flat"])).toBe("lie_flat");
    expect(classifySeat(["Seat type Extra Reclining"])).toBe(
      "not_lie_flat",
    );
    expect(classifySeat(["Seat type Average Legroom"])).toBe(
      "not_lie_flat",
    );
  });
});
