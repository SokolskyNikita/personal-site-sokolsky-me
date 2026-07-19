import historySeed from "../../data/spain-argentina-kalshi-history-seed.json";

export const SPAIN_ARGENTINA_ODDS_PATH =
  "/api/prediction-markets/spain-argentina-2026";

const CACHE_MS = 4_000;
const REQUEST_TIMEOUT_MS = 2_500;
const HISTORY_REQUEST_TIMEOUT_MS = 8_000;
const OPTIONAL_REQUEST_TIMEOUT_MS = 1_200;
const MAX_FETCH_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 100;
const STALE_PROVIDER_MS = 2 * 60 * 1_000;
const STALE_HISTORY_MS = 10 * 60 * 1_000;
const REAL_MONEY_WEIGHT = 5;
const PLAY_MONEY_WEIGHT = 1;
const MATCH_STARTS_AT_MS = Date.parse("2026-07-19T19:00:00Z");
const MATCH_ENDS_AT_MS = MATCH_STARTS_AT_MS + 4 * 60 * 60 * 1_000;
const HISTORY_KV_KEY = "pm:spain-argentina-2026:kalshi-history";
const HISTORY_KV_TTL_SECONDS = 6 * 60 * 60;
const KALSHI_API_HOSTS = [
  "https://api.elections.kalshi.com",
  "https://external-api.kalshi.com",
] as const;

type OddsKv = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
};

export type SpainArgentinaOddsEnv = {
  FLIGHT_CACHE?: OddsKv;
};

type Team = "spain" | "argentina";

export type ProviderOdds = {
  id: "kalshi" | "polymarket" | "manifold";
  name: string;
  href: string;
  spain: number | null;
  argentina: number | null;
  volume: number | null;
  volumeUnit: "USD" | "MANA";
  status: "live" | "stale" | "unavailable";
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
    liveProviderCount: number;
    staleProviderCount: number;
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
const lastGoodProviders = new Map<
  ProviderOdds["id"],
  { odds: ProviderOdds; receivedAt: number }
>();
let lastGoodHistory:
  | {
      points: SpainArgentinaOddsResponse["history"];
      receivedAt: number;
    }
  | undefined;

export async function handleSpainArgentinaOdds(
  request: Request,
  env: SpainArgentinaOddsEnv = {},
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
      promise: loadOdds(env),
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

async function loadOdds(
  env: SpainArgentinaOddsEnv,
): Promise<SpainArgentinaOddsResponse> {
  const [results, historyResult, storedHistory] = await Promise.all([
    Promise.allSettled([loadKalshi(), loadPolymarket(), loadManifold()]),
    getKalshiHistory()
      .then((points) => ({ ok: true as const, points }))
      .catch((error) => ({
        ok: false as const,
        points: [] as SpainArgentinaOddsResponse["history"],
        error: error instanceof Error ? error.message : "history_unavailable",
      })),
    readStoredHistory(env.FLIGHT_CACHE),
  ]);
  const fallbackHistory =
    lastGoodHistory && Date.now() - lastGoodHistory.receivedAt <= STALE_HISTORY_MS
      ? lastGoodHistory.points
      : [];
  const seed =
    Date.now() >= MATCH_STARTS_AT_MS
      ? (historySeed as SpainArgentinaOddsResponse["history"])
      : [];

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
      provider.status === "unavailable" ||
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
  const liveProviderCount = providers.filter(
    (provider) => provider.status === "live",
  ).length;
  const staleProviderCount = providers.filter(
    (provider) => provider.status === "stale",
  ).length;
  const totalWeight = normalized.reduce((sum, item) => sum + item.weight, 0);
  const spain =
    totalWeight === 0
      ? null
      : normalized.reduce(
          (sum, item) => sum + item.spain * item.weight,
          0,
        ) / totalWeight;
  const argentina = spain === null ? null : 1 - spain;
  const generatedAt = new Date().toISOString();
  const kalshi = providers.find((provider) => provider.id === "kalshi");
  const liveKalshiPoint =
    kalshi &&
    kalshi.status !== "unavailable" &&
    typeof kalshi.spain === "number" &&
    typeof kalshi.argentina === "number"
      ? [
          {
            at: generatedAt,
            spain: clampProbability(
              kalshi.spain / (kalshi.spain + kalshi.argentina),
            ),
            argentina: clampProbability(
              kalshi.argentina / (kalshi.spain + kalshi.argentina),
            ),
          },
        ]
      : [];

  const history = mergeHistoryPoints(
    seed,
    storedHistory,
    fallbackHistory,
    historyResult.points,
    liveKalshiPoint,
  );
  if (history.length) {
    lastGoodHistory = { points: history, receivedAt: Date.now() };
    void persistHistory(env.FLIGHT_CACHE, history);
  }

  return {
    ok: providerCount > 0,
    generatedAt,
    matchStartsAt: "2026-07-19T19:00:00Z",
    refreshAfterMs: 5_000,
    consensus: {
      spain,
      argentina,
      providerCount,
      liveProviderCount,
      staleProviderCount,
      totalWeight,
    },
    history,
    providers,
  };
}

function getKalshiHistory(): Promise<SpainArgentinaOddsResponse["history"]> {
  const now = Date.now();
  if (!historyCache || historyCache.expiresAt <= now) {
    const promise = loadKalshiHistory();
    historyCache = {
      expiresAt: now + 30_000,
      promise,
    };
    void promise.then(
      (points) => {
        if (points.length) {
          lastGoodHistory = { points, receivedAt: Date.now() };
        } else if (historyCache?.promise === promise) {
          historyCache = undefined;
        }
      },
      () => {
        if (historyCache?.promise === promise) historyCache = undefined;
      },
    );
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
  // Prefer coarse candles first (small payload), then 1-minute detail.
  // Skip period_interval=5 — Kalshi currently returns 400 for that value.
  const intervals = [60, 1] as const;
  let lastError: unknown;

  for (const host of KALSHI_API_HOSTS) {
    for (const periodInterval of intervals) {
      try {
        const points = await loadKalshiHistoryFromHost(
          host,
          start,
          end,
          periodInterval,
        );
        if (points.length) return points;
      } catch (error) {
        lastError = error;
      }
    }
  }

  if (lastGoodHistory && Date.now() - lastGoodHistory.receivedAt <= STALE_HISTORY_MS) {
    return lastGoodHistory.points;
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Kalshi history feeds unavailable");
}

async function loadKalshiHistoryFromHost(
  host: string,
  start: number,
  end: number,
  periodInterval: number,
): Promise<SpainArgentinaOddsResponse["history"]> {
  const query = `start_ts=${start}&end_ts=${end}&period_interval=${periodInterval}`;
  const base = `${host}/trade-api/v2/series/KXMENWORLDCUP/markets`;
  const fetchOptions = {
    attempts: 1,
    timeoutMs: HISTORY_REQUEST_TIMEOUT_MS,
  };
  const [spainResult, argentinaResult] = await Promise.allSettled([
    fetchJson<Record<string, unknown>>(
      `${base}/KXMENWORLDCUP-26-ES/candlesticks?${query}`,
      fetchOptions,
    ),
    fetchJson<Record<string, unknown>>(
      `${base}/KXMENWORLDCUP-26-AR/candlesticks?${query}`,
      fetchOptions,
    ),
  ]);
  if (spainResult.status === "rejected" && argentinaResult.status === "rejected") {
    throw new AggregateError(
      [spainResult.reason, argentinaResult.reason],
      "Kalshi history feeds unavailable",
    );
  }

  const spainByTime =
    spainResult.status === "fulfilled"
      ? candlesByTimestamp(spainResult.value)
      : new Map<number, number>();
  const argentinaByTime =
    argentinaResult.status === "fulfilled"
      ? candlesByTimestamp(argentinaResult.value)
      : new Map<number, number>();
  const timestamps = [
    ...new Set([...spainByTime.keys(), ...argentinaByTime.keys()]),
  ].sort((a, b) => a - b);

  return timestamps.flatMap((timestamp) => {
    const rawSpain = spainByTime.get(timestamp);
    const rawArgentina = argentinaByTime.get(timestamp);
    if (rawSpain === undefined && rawArgentina === undefined) return [];
    const spain =
      rawSpain ?? (rawArgentina === undefined ? undefined : 1 - rawArgentina);
    const argentina =
      rawArgentina ?? (rawSpain === undefined ? undefined : 1 - rawSpain);
    if (spain === undefined || argentina === undefined) return [];
    const total = spain + argentina;
    if (!Number.isFinite(total) || total <= 0) return [];
    return [
      {
        at: new Date(timestamp * 1_000).toISOString(),
        spain: clampProbability(spain / total),
        argentina: clampProbability(argentina / total),
      },
    ];
  });
}

function candlesByTimestamp(data: Record<string, unknown>): Map<number, number> {
  return new Map(
    asRecords(data.candlesticks).flatMap((candle) => {
      const timestamp = numberValue(candle.end_period_ts);
      const close = candleClose(candle);
      return timestamp === null || close === null ? [] : [[timestamp, close] as const];
    }),
  );
}

function candleClose(candle: Record<string, unknown>): number | null {
  return (
    probabilityValue(asRecord(candle.price).close_dollars) ??
    probabilityValue(asRecord(candle.yes_bid).close_dollars) ??
    probabilityValue(asRecord(candle.yes_ask).close_dollars)
  );
}

function settledProvider(
  result: PromiseSettledResult<ProviderOdds>,
  fallback: Pick<ProviderOdds, "id" | "name" | "href" | "volumeUnit">,
): ProviderOdds {
  if (result.status === "fulfilled") {
    lastGoodProviders.set(result.value.id, {
      odds: result.value,
      receivedAt: Date.now(),
    });
    return result.value;
  }
  const previous = lastGoodProviders.get(fallback.id);
  if (previous && Date.now() - previous.receivedAt <= STALE_PROVIDER_MS) {
    return {
      ...previous.odds,
      status: "stale",
      message: "Using the most recent successful quote",
    };
  }
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
  let markets: Record<string, unknown>[] = [];
  let lastError: unknown;
  for (const host of KALSHI_API_HOSTS) {
    try {
      const eventData = await fetchJson<Record<string, unknown>>(
        `${host}/trade-api/v2/events/KXMENWORLDCUP-26?with_nested_markets=true`,
      );
      markets = asRecords(asRecord(eventData.event).markets);
      if (markets.length) break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!markets.length) {
    for (const host of KALSHI_API_HOSTS) {
      try {
        const marketsData = await fetchJson<Record<string, unknown>>(
          `${host}/trade-api/v2/markets?event_ticker=KXMENWORLDCUP-26&limit=1000`,
        );
        markets = asRecords(marketsData.markets);
        if (markets.length) break;
      } catch (error) {
        lastError = error;
      }
    }
  }
  if (!markets.length) {
    throw lastError instanceof Error
      ? lastError
      : new Error("Kalshi markets unavailable");
  }
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
  const bid = probabilityValue(market.yes_bid_dollars);
  const ask = probabilityValue(market.yes_ask_dollars);
  if (bid !== null && ask !== null) return clampProbability((bid + ask) / 2);
  const last = probabilityValue(market.last_price_dollars);
  if (last === null) throw new Error("Kalshi market price missing");
  return clampProbability(last);
}

async function loadPolymarket(): Promise<ProviderOdds> {
  const event = await loadPolymarketEvent();
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

async function loadPolymarketEvent(): Promise<Record<string, unknown>> {
  const urls = [
    "https://gamma-api.polymarket.com/events/slug/world-cup-winner",
    "https://gamma-api.polymarket.com/events?slug=world-cup-winner",
  ];
  let lastError: unknown;
  for (const url of urls) {
    try {
      const data = await fetchJson<unknown>(url);
      const event = asRecords(data)[0] ?? asRecord(data);
      if (asRecords(event.markets).length) return event;
      lastError = new Error("Polymarket event has no markets");
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Polymarket event unavailable");
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
  const outcomePrice = prices[yesIndex >= 0 ? yesIndex : 0];
  const bid = probabilityValue(market.bestBid);
  const ask = probabilityValue(market.bestAsk);
  const midpoint =
    bid !== null && ask !== null ? clampProbability((bid + ask) / 2) : null;
  const price =
    probabilityValue(outcomePrice) ??
    midpoint ??
    probabilityValue(market.lastTradePrice);
  if (price === null) {
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
      {
        attempts: 1,
        timeoutMs: OPTIONAL_REQUEST_TIMEOUT_MS,
      },
    ).catch((): Record<string, unknown> => ({})),
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
  const price =
    probabilityValue(probabilities[id]) ?? probabilityValue(answer.probability);
  if (price === null) throw new Error("Manifold answer probability missing");
  return clampProbability(price);
}

type FetchJsonOptions = {
  attempts?: number;
  timeoutMs?: number;
};

class UpstreamHttpError extends Error {
  constructor(readonly status: number) {
    super(`Upstream returned ${status}`);
  }
}

async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const attempts = Math.max(1, options.attempts ?? MAX_FETCH_ATTEMPTS);
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new UpstreamHttpError(response.status);
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt + 1 >= attempts || !isRetryableFetchError(error)) throw error;
    } finally {
      clearTimeout(timeout);
    }
    await delay(RETRY_BASE_DELAY_MS * 2 ** attempt);
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Upstream request failed");
}

function isRetryableFetchError(error: unknown): boolean {
  if (!(error instanceof UpstreamHttpError)) return true;
  return (
    error.status === 408 ||
    error.status === 425 ||
    error.status === 429 ||
    error.status >= 500
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mergeHistoryPoints(
  ...series: SpainArgentinaOddsResponse["history"][]
): SpainArgentinaOddsResponse["history"] {
  const merged = new Map<string, SpainArgentinaOddsResponse["history"][number]>();
  for (const points of series) {
    for (const point of points) {
      const timestamp = Date.parse(point.at);
      if (
        !Number.isFinite(timestamp) ||
        timestamp < MATCH_STARTS_AT_MS ||
        timestamp > MATCH_ENDS_AT_MS ||
        !Number.isFinite(point.spain) ||
        !Number.isFinite(point.argentina)
      ) {
        continue;
      }
      merged.set(point.at, {
        at: point.at,
        spain: clampProbability(point.spain),
        argentina: clampProbability(point.argentina),
      });
    }
  }
  return [...merged.values()].sort(
    (left, right) => Date.parse(left.at) - Date.parse(right.at),
  );
}

async function readStoredHistory(
  kv: OddsKv | undefined,
): Promise<SpainArgentinaOddsResponse["history"]> {
  if (!kv) return [];
  try {
    const raw = await kv.get(HISTORY_KV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return mergeHistoryPoints(
      parsed.flatMap((item) => {
        const point = asRecord(item);
        const spain = numberValue(point.spain);
        const argentina = numberValue(point.argentina);
        const at = stringValue(point.at);
        if (!at || spain === null || argentina === null) return [];
        return [{ at, spain, argentina }];
      }),
    );
  } catch {
    return [];
  }
}

async function persistHistory(
  kv: OddsKv | undefined,
  points: SpainArgentinaOddsResponse["history"],
): Promise<void> {
  if (!kv || !points.length) return;
  try {
    await kv.put(HISTORY_KV_KEY, JSON.stringify(points), {
      expirationTtl: HISTORY_KV_TTL_SECONDS,
    });
  } catch {
    // Best-effort persistence for chart continuity.
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

function probabilityValue(value: unknown): number | null {
  const parsed = numberValue(value);
  return parsed !== null && parsed >= 0 && parsed <= 1 ? parsed : null;
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
