export const SPAIN_ARGENTINA_ODDS_PATH =
  "/api/prediction-markets/spain-argentina-2026";

const CACHE_MS = 4_000;
const REQUEST_TIMEOUT_MS = 4_000;
const REAL_MONEY_WEIGHT = 5;
const PLAY_MONEY_WEIGHT = 1;
const MATCH_STARTS_AT_MS = Date.parse("2026-07-19T19:00:00Z");
const MATCH_ENDS_AT_MS = MATCH_STARTS_AT_MS + 4 * 60 * 60 * 1_000;

type Team = "spain" | "argentina";

export type ProviderOdds = {
  id: "kalshi" | "polymarket" | "manifold";
  name: string;
  href: string;
  spain: number | null;
  argentina: number | null;
  volume: number | null;
  volumeUnit: "USD" | "MANA";
  status: "live" | "unavailable";
  message?: string;
};

export type SpainArgentinaOddsResponse = {
  ok: boolean;
  generatedAt: string;
  matchStartsAt: string;
  refreshAfterMs: number;
  consensus: {
    spain: number | null;
    argentina: number | null;
    providerCount: number;
    totalWeight: number;
  };
  history: {
    at: string;
    spain: number;
    argentina: number;
  }[];
  providers: ProviderOdds[];
};

let cached:
  | {
      expiresAt: number;
      promise: Promise<SpainArgentinaOddsResponse>;
    }
  | undefined;
let historyCache:
  | {
      expiresAt: number;
      promise: Promise<SpainArgentinaOddsResponse["history"]>;
    }
  | undefined;

export async function handleSpainArgentinaOdds(
  request: Request,
): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json(
      { ok: false, error: "method_not_allowed" },
      { status: 405, headers: { Allow: "GET" } },
    );
  }

  const now = Date.now();
  if (!cached || cached.expiresAt <= now) {
    cached = {
      expiresAt: now + CACHE_MS,
      promise: loadOdds(),
    };
  }

  const body = await cached.promise;
  return Response.json(body, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=4, stale-while-revalidate=8",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function loadOdds(): Promise<SpainArgentinaOddsResponse> {
  const [results, history] = await Promise.all([
    Promise.allSettled([loadKalshi(), loadPolymarket(), loadManifold()]),
    getKalshiHistory().catch(() => []),
  ]);

  const providers: ProviderOdds[] = [
    settledProvider(results[0], {
      id: "kalshi",
      name: "Kalshi",
      href: "https://kalshi.com/markets/kxmenworldcup/mens-world-cup-winner/kxmenworldcup-26",
      volumeUnit: "USD",
    }),
    settledProvider(results[1], {
      id: "polymarket",
      name: "Polymarket",
      href: "https://polymarket.com/event/world-cup-winner",
      volumeUnit: "USD",
    }),
    settledProvider(results[2], {
      id: "manifold",
      name: "Manifold",
      href: "https://manifold.markets/ManifoldSports/esp-vs-arg-world-cup-26",
      volumeUnit: "MANA",
    }),
  ];

  const normalized = providers.flatMap((provider) => {
    if (
      provider.status !== "live" ||
      provider.spain === null ||
      provider.argentina === null
    ) {
      return [];
    }
    const total = provider.spain + provider.argentina;
    if (total <= 0) return [];
    return [
      {
        spain: provider.spain / total,
        argentina: provider.argentina / total,
        weight:
          provider.id === "manifold"
            ? PLAY_MONEY_WEIGHT
            : REAL_MONEY_WEIGHT,
      },
    ];
  });

  const providerCount = normalized.length;
  const totalWeight = normalized.reduce((sum, item) => sum + item.weight, 0);
  const spain =
    totalWeight === 0
      ? null
      : normalized.reduce(
          (sum, item) => sum + item.spain * item.weight,
          0,
        ) / totalWeight;
  const argentina = spain === null ? null : 1 - spain;

  return {
    ok: providerCount > 0,
    generatedAt: new Date().toISOString(),
    matchStartsAt: "2026-07-19T19:00:00Z",
    refreshAfterMs: 5_000,
    consensus: { spain, argentina, providerCount, totalWeight },
    history,
    providers,
  };
}

function getKalshiHistory(): Promise<SpainArgentinaOddsResponse["history"]> {
  const now = Date.now();
  if (!historyCache || historyCache.expiresAt <= now) {
    historyCache = {
      expiresAt: now + 60_000,
      promise: loadKalshiHistory(),
    };
  }
  return historyCache.promise;
}

async function loadKalshiHistory(): Promise<SpainArgentinaOddsResponse["history"]> {
  const boundedNow = Math.min(
    Math.max(Date.now(), MATCH_STARTS_AT_MS),
    MATCH_ENDS_AT_MS,
  );
  const end = Math.floor(boundedNow / 1_000);
  const start = Math.floor(MATCH_STARTS_AT_MS / 1_000);
  const query = `start_ts=${start}&end_ts=${end}&period_interval=1`;
  const base =
    "https://external-api.kalshi.com/trade-api/v2/series/KXMENWORLDCUP/markets";
  const [spainData, argentinaData] = await Promise.all([
    fetchJson<Record<string, unknown>>(
      `${base}/KXMENWORLDCUP-26-ES/candlesticks?${query}`,
    ),
    fetchJson<Record<string, unknown>>(
      `${base}/KXMENWORLDCUP-26-AR/candlesticks?${query}`,
    ),
  ]);
  const argentinaByTime = new Map(
    asRecords(argentinaData.candlesticks).map((candle) => [
      numberValue(candle.end_period_ts),
      candleClose(candle),
    ]),
  );

  return asRecords(spainData.candlesticks).flatMap((candle) => {
    const timestamp = numberValue(candle.end_period_ts);
    const spain = candleClose(candle);
    const argentina = timestamp === null ? null : argentinaByTime.get(timestamp);
    if (
      timestamp === null ||
      spain === null ||
      argentina === null ||
      argentina === undefined
    ) {
      return [];
    }
    return [
      {
        at: new Date(timestamp * 1_000).toISOString(),
        spain: clampProbability(spain),
        argentina: clampProbability(argentina),
      },
    ];
  });
}

function candleClose(candle: Record<string, unknown>): number | null {
  return numberValue(asRecord(candle.price).close_dollars);
}

function settledProvider(
  result: PromiseSettledResult<ProviderOdds>,
  fallback: Pick<ProviderOdds, "id" | "name" | "href" | "volumeUnit">,
): ProviderOdds {
  if (result.status === "fulfilled") return result.value;
  return {
    ...fallback,
    spain: null,
    argentina: null,
    volume: null,
    status: "unavailable",
    message: "Feed temporarily unavailable",
  };
}

async function loadKalshi(): Promise<ProviderOdds> {
  const data = await fetchJson<Record<string, unknown>>(
    "https://external-api.kalshi.com/trade-api/v2/events/KXMENWORLDCUP-26?with_nested_markets=true",
  );
  const event = asRecord(data.event);
  const markets = asRecords(event.markets);
  const spain = findKalshiMarket(markets, "spain");
  const argentina = findKalshiMarket(markets, "argentina");

  return {
    id: "kalshi",
    name: "Kalshi",
    href: "https://kalshi.com/markets/kxmenworldcup/mens-world-cup-winner/kxmenworldcup-26",
    spain: kalshiPrice(spain),
    argentina: kalshiPrice(argentina),
    volume: sumNumbers([spain.volume_fp, argentina.volume_fp]),
    volumeUnit: "USD",
    status: "live",
  };
}

function findKalshiMarket(
  markets: Record<string, unknown>[],
  team: Team,
): Record<string, unknown> {
  const code = team === "spain" ? "-ES" : "-AR";
  const market = markets.find((item) => {
    const ticker = stringValue(item.ticker).toUpperCase();
    const label = `${stringValue(item.yes_sub_title)} ${stringValue(item.title)}`;
    return ticker.endsWith(code) || label.toLowerCase().includes(team);
  });
  if (!market) throw new Error(`Kalshi ${team} market not found`);
  return market;
}

function kalshiPrice(market: Record<string, unknown>): number {
  const bid = numberValue(market.yes_bid_dollars);
  const ask = numberValue(market.yes_ask_dollars);
  if (bid !== null && ask !== null) return clampProbability((bid + ask) / 2);
  const last = numberValue(market.last_price_dollars);
  if (last === null) throw new Error("Kalshi market price missing");
  return clampProbability(last);
}

async function loadPolymarket(): Promise<ProviderOdds> {
  const data = await fetchJson<unknown>(
    "https://gamma-api.polymarket.com/events?slug=world-cup-winner",
  );
  const event = asRecords(data)[0] ?? asRecord(data);
  const markets = asRecords(event.markets);
  const spain = findPolymarketMarket(markets, "spain");
  const argentina = findPolymarketMarket(markets, "argentina");

  return {
    id: "polymarket",
    name: "Polymarket",
    href: "https://polymarket.com/event/world-cup-winner",
    spain: polymarketPrice(spain),
    argentina: polymarketPrice(argentina),
    volume: sumNumbers([
      spain.volumeNum ?? spain.volume,
      argentina.volumeNum ?? argentina.volume,
    ]),
    volumeUnit: "USD",
    status: "live",
  };
}

function findPolymarketMarket(
  markets: Record<string, unknown>[],
  team: Team,
): Record<string, unknown> {
  const market = markets.find((item) => {
    const label = [
      item.groupItemTitle,
      item.question,
      item.title,
      item.slug,
    ]
      .map(stringValue)
      .join(" ")
      .toLowerCase();
    return label.includes(team);
  });
  if (!market) throw new Error(`Polymarket ${team} market not found`);
  return market;
}

function polymarketPrice(market: Record<string, unknown>): number {
  const outcomes = parseStringArray(market.outcomes);
  const prices = parseNumberArray(market.outcomePrices);
  const yesIndex = outcomes.findIndex((outcome) => outcome.toLowerCase() === "yes");
  const price = prices[yesIndex >= 0 ? yesIndex : 0] ?? numberValue(market.lastTradePrice);
  if (price === null || price === undefined) {
    throw new Error("Polymarket market price missing");
  }
  return clampProbability(price);
}

async function loadManifold(): Promise<ProviderOdds> {
  const marketId = "20ACq555CE";
  const [market, probabilities] = await Promise.all([
    fetchJson<Record<string, unknown>>(
      `https://api.manifold.markets/v0/market/${marketId}`,
    ),
    fetchJson<Record<string, unknown>>(
      `https://api.manifold.markets/v0/market/${marketId}/prob`,
    ),
  ]);
  const answers = asRecords(market.answers);
  const answerProbs = asRecord(probabilities.answerProbs);

  return {
    id: "manifold",
    name: "Manifold",
    href: "https://manifold.markets/ManifoldSports/esp-vs-arg-world-cup-26",
    spain: manifoldPrice(answers, answerProbs, "spain"),
    argentina: manifoldPrice(answers, answerProbs, "argentina"),
    volume: numberValue(market.volume),
    volumeUnit: "MANA",
    status: "live",
  };
}

function manifoldPrice(
  answers: Record<string, unknown>[],
  probabilities: Record<string, unknown>,
  team: Team,
): number {
  const answer = answers.find((item) =>
    `${stringValue(item.text)} ${stringValue(item.shortText)}`
      .toLowerCase()
      .includes(team),
  );
  if (!answer) throw new Error(`Manifold ${team} answer not found`);
  const id = stringValue(answer.id);
  const price = numberValue(probabilities[id]) ?? numberValue(answer.probability);
  if (price === null) throw new Error("Manifold answer probability missing");
  return clampProbability(price);
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try {
    return parseStringArray(JSON.parse(value));
  } catch {
    return [];
  }
}

function parseNumberArray(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const parsed = numberValue(item);
      return parsed === null ? [] : [parsed];
    });
  }
  if (typeof value !== "string") return [];
  try {
    return parseNumberArray(JSON.parse(value));
  } catch {
    return [];
  }
}

function sumNumbers(values: unknown[]): number | null {
  const numbers = values.flatMap((value) => {
    const parsed = numberValue(value);
    return parsed === null ? [] : [parsed];
  });
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) : null;
}

function clampProbability(value: number): number {
  return Math.min(1, Math.max(0, value));
}
