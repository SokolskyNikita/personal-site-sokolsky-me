import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const json = (body: unknown) => Response.json(body);

describe("Spain vs. Argentina prediction market feed", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes all three championship markets into one response", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("/candlesticks")) {
        const isSpain = url.includes("-ES/");
        return json({
          candlesticks: [
            {
              end_period_ts: 1_784_487_600,
              price: {
                close_dollars: isSpain ? "0.58" : "0.42",
              },
            },
          ],
        });
      }

      if (url.includes("kalshi.com") && url.includes("/events/")) {
        return json({
          event: {
            markets: [
              {
                ticker: "KXMENWORLDCUP-26-ES",
                yes_sub_title: "Spain",
                yes_bid_dollars: "0.57",
                yes_ask_dollars: "0.58",
                volume_fp: "120",
              },
              {
                ticker: "KXMENWORLDCUP-26-AR",
                yes_sub_title: "Argentina",
                yes_bid_dollars: "0.42",
                yes_ask_dollars: "0.43",
                volume_fp: "80",
              },
            ],
          },
        });
      }

      if (url.includes("gamma-api.polymarket.com")) {
        return json([
          {
            markets: [
              {
                groupItemTitle: "Spain",
                outcomes: '["Yes","No"]',
                outcomePrices: '["0.60","0.40"]',
                volumeNum: 100,
              },
              {
                groupItemTitle: "Argentina",
                outcomes: '["Yes","No"]',
                outcomePrices: '["0.40","0.60"]',
                volumeNum: 80,
              },
            ],
          },
        ]);
      }

      if (url.endsWith("/prob")) {
        return json({
          answerProbs: {
            spainAnswer: 0.55,
            argentinaAnswer: 0.45,
          },
        });
      }

      if (url.includes("api.manifold.markets")) {
        return json({
          volume: 250,
          answers: [
            { id: "spainAnswer", text: "Spain" },
            { id: "argentinaAnswer", text: "Argentina" },
          ],
        });
      }

      return new Response(null, { status: 404 });
    });

    const { handleSpainArgentinaOdds } = await import("../spain-argentina");
    const response = await handleSpainArgentinaOdds(
      new Request("https://sokolsky.me/api/prediction-markets/spain-argentina-2026"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      matchStartsAt: "2026-07-19T19:00:00Z",
      refreshAfterMs: 5_000,
      consensus: {
        providerCount: 3,
        totalWeight: 11,
      },
    });
    expect(body.history.length).toBeGreaterThan(0);
    expect(body.history[0]).toMatchObject({
      at: "2026-07-19T19:00:00.000Z",
      spain: 0.58,
      argentina: 0.42,
    });
    expect(body.consensus.spain).toBeCloseTo(0.58409);
    expect(body.consensus.argentina).toBeCloseTo(0.41591);
    expect(body.providers).toMatchObject([
      { id: "kalshi", spain: 0.575, argentina: 0.425, volume: 200 },
      { id: "polymarket", spain: 0.6, argentina: 0.4, volume: 180 },
      { id: "manifold", spain: 0.55, argentina: 0.45, volume: 250 },
    ]);
  });

  it("recovers from transient and partial upstream failures", async () => {
    let kalshiEventAttempts = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("/candlesticks")) {
        if (url.includes("-ES/")) return new Response(null, { status: 503 });
        return json({
          candlesticks: [
            {
              end_period_ts: 1_784_487_600,
              price: { close_dollars: "0.42" },
            },
          ],
        });
      }

      if (url.includes("/events/KXMENWORLDCUP-26")) {
        kalshiEventAttempts += 1;
        return kalshiEventAttempts === 1
          ? new Response(null, { status: 503 })
          : json({ event: {} });
      }

      if (url.includes("trade-api/v2/markets?")) {
        return json({
          markets: [
            {
              ticker: "KXMENWORLDCUP-26-ES",
              yes_sub_title: "Spain",
              last_price_dollars: "0.58",
            },
            {
              ticker: "KXMENWORLDCUP-26-AR",
              yes_sub_title: "Argentina",
              last_price_dollars: "0.42",
            },
          ],
        });
      }

      if (url.includes("/events/slug/world-cup-winner")) {
        return new Response(null, { status: 404 });
      }

      if (url.includes("gamma-api.polymarket.com/events?")) {
        return json([
          {
            markets: [
              {
                groupItemTitle: "Spain",
                outcomes: '["Yes","No"]',
                outcomePrices: '["0.59","0.41"]',
              },
              {
                groupItemTitle: "Argentina",
                outcomes: '["Yes","No"]',
                outcomePrices: '["0.41","0.59"]',
              },
            ],
          },
        ]);
      }

      if (url.endsWith("/prob")) {
        return new Response(null, { status: 503 });
      }

      if (url.includes("api.manifold.markets")) {
        return json({
          answers: [
            { id: "spainAnswer", text: "Spain", probability: 0.56 },
            { id: "argentinaAnswer", text: "Argentina", probability: 0.44 },
          ],
        });
      }

      return new Response(null, { status: 404 });
    });

    const { handleSpainArgentinaOdds } = await import("../spain-argentina");
    const response = await handleSpainArgentinaOdds(
      new Request("https://sokolsky.me/api/prediction-markets/spain-argentina-2026"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(kalshiEventAttempts).toBeGreaterThanOrEqual(2);
    expect(body.consensus).toMatchObject({
      providerCount: 3,
      liveProviderCount: 3,
      staleProviderCount: 0,
    });
    expect(body.history.length).toBeGreaterThan(0);
    expect(body.history[0]).toMatchObject({
      at: "2026-07-19T19:00:00.000Z",
      spain: 0.5800000000000001,
      argentina: 0.42,
    });
    expect(body.providers).toMatchObject([
      { id: "kalshi", status: "live", spain: 0.58, argentina: 0.42 },
      { id: "polymarket", status: "live", spain: 0.59, argentina: 0.41 },
      { id: "manifold", status: "live", spain: 0.56, argentina: 0.44 },
    ]);
  });

  it("uses recent successful quotes when every live lookup briefly fails", async () => {
    let failing = false;
    let now = Date.parse("2026-07-19T19:30:00Z");
    vi.spyOn(Date, "now").mockImplementation(() => now);
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (failing) return new Response(null, { status: 503 });

      if (url.includes("/candlesticks")) {
        const isSpain = url.includes("-ES/");
        return json({
          candlesticks: [
            {
              end_period_ts: 1_784_487_600,
              price: { close_dollars: isSpain ? "0.58" : "0.42" },
            },
          ],
        });
      }
      if (url.includes("kalshi.com") && url.includes("/events/")) {
        return json({
          event: {
            markets: [
              {
                ticker: "KXMENWORLDCUP-26-ES",
                yes_sub_title: "Spain",
                last_price_dollars: "0.58",
              },
              {
                ticker: "KXMENWORLDCUP-26-AR",
                yes_sub_title: "Argentina",
                last_price_dollars: "0.42",
              },
            ],
          },
        });
      }
      if (url.includes("gamma-api.polymarket.com")) {
        return json({
          markets: [
            {
              groupItemTitle: "Spain",
              outcomes: ["Yes", "No"],
              outcomePrices: [0.59, 0.41],
            },
            {
              groupItemTitle: "Argentina",
              outcomes: ["Yes", "No"],
              outcomePrices: [0.41, 0.59],
            },
          ],
        });
      }
      if (url.endsWith("/prob")) {
        return json({
          answerProbs: { spainAnswer: 0.56, argentinaAnswer: 0.44 },
        });
      }
      if (url.includes("api.manifold.markets")) {
        return json({
          answers: [
            { id: "spainAnswer", text: "Spain" },
            { id: "argentinaAnswer", text: "Argentina" },
          ],
        });
      }
      return new Response(null, { status: 404 });
    });

    const { handleSpainArgentinaOdds } = await import("../spain-argentina");
    await handleSpainArgentinaOdds(
      new Request("https://sokolsky.me/api/prediction-markets/spain-argentina-2026"),
    );

    failing = true;
    now += 5_000;
    const response = await handleSpainArgentinaOdds(
      new Request("https://sokolsky.me/api/prediction-markets/spain-argentina-2026"),
    );
    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(body.consensus).toMatchObject({
      providerCount: 3,
      liveProviderCount: 0,
      staleProviderCount: 3,
    });
    expect(body.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "kalshi", status: "stale" }),
        expect.objectContaining({ id: "polymarket", status: "stale" }),
        expect.objectContaining({ id: "manifold", status: "stale" }),
      ]),
    );
  });

  it("returns a safe empty response when every provider fails on a cold start", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 503 }),
    );

    const { handleSpainArgentinaOdds } = await import("../spain-argentina");
    const response = await handleSpainArgentinaOdds(
      new Request("https://sokolsky.me/api/prediction-markets/spain-argentina-2026"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: false,
      consensus: {
        spain: null,
        argentina: null,
        providerCount: 0,
        liveProviderCount: 0,
        staleProviderCount: 0,
        totalWeight: 0,
      },
    });
    // During the match window, a baked Kalshi seed keeps the chart populated
    // even when every live upstream is down.
    expect(body.history.length).toBeGreaterThan(0);
    expect(body.history[0]).toMatchObject({
      at: "2026-07-19T19:00:00.000Z",
    });
    expect(body.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "kalshi", status: "unavailable" }),
        expect.objectContaining({ id: "polymarket", status: "unavailable" }),
        expect.objectContaining({ id: "manifold", status: "unavailable" }),
      ]),
    );
  });
});
