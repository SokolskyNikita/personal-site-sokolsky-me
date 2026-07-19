import { afterEach, describe, expect, it, vi } from "vitest";
import { handleSpainArgentinaOdds } from "../spain-argentina";

const json = (body: unknown) => Response.json(body);

describe("Spain vs. Argentina prediction market feed", () => {
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

      if (url.includes("external-api.kalshi.com")) {
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
      history: [
        {
          at: "2026-07-19T19:00:00.000Z",
          spain: 0.58,
          argentina: 0.42,
        },
      ],
    });
    expect(body.consensus.spain).toBeCloseTo(0.58409);
    expect(body.consensus.argentina).toBeCloseTo(0.41591);
    expect(body.providers).toMatchObject([
      { id: "kalshi", spain: 0.575, argentina: 0.425, volume: 200 },
      { id: "polymarket", spain: 0.6, argentina: 0.4, volume: 180 },
      { id: "manifold", spain: 0.55, argentina: 0.45, volume: 250 },
    ]);
  });
});
