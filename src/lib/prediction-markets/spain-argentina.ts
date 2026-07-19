import {
  getPredictionGame,
  predictionGameApiPath,
  spainArgentina2026,
  type PredictionGameConfig,
} from "./games";

export const SPAIN_ARGENTINA_ODDS_PATH = predictionGameApiPath(
  spainArgentina2026,
);

const CACHE_MS = 4_000;
const REQUEST_TIMEOUT_MS = 2_500;
const HISTORY_REQUEST_TIMEOUT_MS = 8_000;
const OPTIONAL_REQUEST_TIMEOUT_MS = 1_200;
const MAX_FETCH_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 100;
const STALE_PROVIDER_MS = 2 * 60 * 1_000;
const STALE_HISTORY_MS = 10 * 60 * 1_000;
const HALF_LENGTH_MS = 45 * 60 * 1_000;
const HALFTIME_LENGTH_MS = 15 * 60 * 1_000;
const HISTORY_KV_TTL_SECONDS = 6 * 60 * 60;
const KALSHI_API_HOSTS = [
  "https://api.elections.kalshi.com",
  "https://external-api.kalshi.com",
] as const;

const matchStartsAt = (game: PredictionGameConfig) =>
  Date.parse(game.kickoffISO);
const matchEndsAt = (game: PredictionGameConfig) =>
  matchStartsAt(game) + game.pollingWindowHours * 60 * 60 * 1_000;
const historyKvKey = (game: PredictionGameConfig) =>
  `pm:${game.slug}:kalshi-history`;

type OddsKv = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
};

export type PredictionMarketOddsEnv = {
  FLIGHT_CACHE?: OddsKv;
};

export type ProviderOdds = {
  id: "kalshi" | "polymarket" | "manifold";
  name: string;
  href: string;
  spain: number | null;
  argentina: number | null;
  volume: number | null;
  volumeUnit: "USD" | "MANA";
  status: "live" | "stale" | "unavailable";
  updatedAt?: string;
  message?: string;
};

export type MatchClock = {
  phase: "pre" | "live" | "halftime" | "final";
  label: string;
  source: "espn" | "schedule" | "archive";
  score?: { spain: number; argentina: number };
};

export type PredictionMarketOddsResponse = {
  ok: boolean;
  generatedAt: string;
  matchStartsAt: string;
  refreshAfterMs: number;
  matchClock: MatchClock;
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

/** @deprecated Use PredictionMarketOddsResponse for new game integrations. */
export type SpainArgentinaOddsResponse = PredictionMarketOddsResponse;

const responseCaches = new Map<
  string,
  { expiresAt: number; promise: Promise<SpainArgentinaOddsResponse> }
>();
const historyCaches = new Map<
  string,
  {
    expiresAt: number;
    promise: Promise<SpainArgentinaOddsResponse["history"]>;
  }
>();
const lastGoodProviders = new Map<
  string,
  { odds: ProviderOdds; receivedAt: number }
>();
const lastGoodHistories = new Map<
  string,
  { points: SpainArgentinaOddsResponse["history"]; receivedAt: number }
>();
const lastGoodMatchClocks = new Map<
  string,
  { clock: MatchClock; receivedAt: number }
>();

export function isPredictionMarketOddsPath(pathname: string): boolean {
  const slug = pathname.slice("/api/prediction-markets/".length);
  return (
    pathname.startsWith("/api/prediction-markets/") &&
    slug.length > 0 &&
    !slug.includes("/")
  );
}

export async function handlePredictionMarketOdds(
  request: Request,
  env: PredictionMarketOddsEnv = {},
): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json(
      { ok: false, error: "method_not_allowed" },
      { status: 405, headers: { Allow: "GET" } },
    );
  }

  const slug = new URL(request.url).pathname.split("/").filter(Boolean).at(-1);
  const game = slug ? getPredictionGame(slug) : undefined;
  if (!game) {
    return Response.json(
      { ok: false, error: "game_not_found" },
      { status: 404 },
    );
  }

  if (game.archive) {
    return Response.json(archivedOddsResponse(game), {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, immutable",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  const now = Date.now();
  let cached = responseCaches.get(game.slug);
  if (!cached || cached.expiresAt <= now) {
    cached = {
      expiresAt: now + CACHE_MS,
      promise: loadPredictionMarketOdds(game, env),
    };
    responseCaches.set(game.slug, cached);
  }

  const body = await cached.promise;
  return Response.json(body, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=4, stale-while-revalidate=8",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export const handleSpainArgentinaOdds = handlePredictionMarketOdds;

function archivedOddsResponse(
  game: PredictionGameConfig,
): PredictionMarketOddsResponse {
  const archive = game.archive;
  if (!archive) {
    throw new Error(`Game ${game.slug} is not archived`);
  }
  const tip = game.staticHistory.at(-1);
  return {
    ok: Boolean(tip),
    generatedAt: archive.endedAtISO,
    matchStartsAt: game.kickoffISO,
    refreshAfterMs: 0,
    matchClock: {
      phase: "final",
      label: archive.finalLabel,
      source: "archive",
      score: {
        spain: archive.finalScore.a,
        argentina: archive.finalScore.b,
      },
    },
    consensus: {
      spain: tip?.spain ?? null,
      argentina: tip?.argentina ?? null,
      providerCount: 0,
      liveProviderCount: 0,
      staleProviderCount: 0,
      totalWeight: 0,
    },
    history: game.staticHistory,
    providers: [],
  };
}

export async function loadPredictionMarketOdds(
  game: PredictionGameConfig,
  env: PredictionMarketOddsEnv,
): Promise<SpainArgentinaOddsResponse> {
  const [results, historyResult, storedHistory, matchClock] = await Promise.all([
    Promise.allSettled([
      loadKalshi(game),
      loadPolymarket(game),
      loadManifold(game),
    ]),
    getKalshiHistory(game)
      .then((points) => ({ ok: true as const, points }))
      .catch((error) => ({
        ok: false as const,
        points: [] as SpainArgentinaOddsResponse["history"],
        error: error instanceof Error ? error.message : "history_unavailable",
      })),
    readStoredHistory(game, env.FLIGHT_CACHE, historyKvKey(game)),
    loadMatchClock(game),
  ]);
  const lastGoodHistory = lastGoodHistories.get(game.slug);
  const fallbackHistory =
    lastGoodHistory && Date.now() - lastGoodHistory.receivedAt <= STALE_HISTORY_MS
      ? lastGoodHistory.points
      : [];
  const seed =
    Date.now() >= matchStartsAt(game)
      ? (game.staticHistory as SpainArgentinaOddsResponse["history"])
      : [];

  const providers: ProviderOdds[] = [
    settledProvider(game, results[0], {
      id: "kalshi",
      name: "Kalshi",
      href: game.providers.kalshi.href,
      volumeUnit: "USD",
    }),
    settledProvider(game, results[1], {
      id: "polymarket",
      name: "Polymarket",
      href: game.providers.polymarket.href,
      volumeUnit: "USD",
    }),
    settledProvider(game, results[2], {
      id: "manifold",
      name: "Manifold",
      href: game.providers.manifold.href,
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
            ? game.weights.playMoney
            : game.weights.realMoney,
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
    game,
    seed,
    storedHistory,
    fallbackHistory,
    historyResult.points,
    liveKalshiPoint,
  );
  if (history.length) {
    lastGoodHistories.set(game.slug, {
      points: history,
      receivedAt: Date.now(),
    });
    void persistHistory(env.FLIGHT_CACHE, historyKvKey(game), history);
  }

  return {
    ok: providerCount > 0,
    generatedAt,
    matchStartsAt: game.kickoffISO,
    refreshAfterMs: game.refreshIntervalMs,
    matchClock,
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

async function loadMatchClock(
  game: PredictionGameConfig,
): Promise<MatchClock> {
  const summaryUrl =
    `https://site.api.espn.com/apis/site/v2/sports/soccer/` +
    `${game.espn.league}/summary?event=${game.espn.eventId}`;
  try {
    const data = await fetchJson<Record<string, unknown>>(summaryUrl, {
      attempts: 1,
      timeoutMs: 2_000,
    });
    const competition = asRecords(asRecord(data.header).competitions)[0] ?? {};
    const status = asRecord(competition.status);
    const type = asRecord(status.type);
    const name = stringValue(type.name).toUpperCase();
    const state = stringValue(type.state).toLowerCase();
    const displayClock =
      stringValue(status.displayClock) ||
      stringValue(type.shortDetail) ||
      stringValue(type.detail) ||
      stringValue(type.statusPrimary);
    const clock = matchClockFromEspn(name, state, displayClock);
    if (clock) {
      const score = scoreFromEspn(game, asRecords(competition.competitors));
      if (score) clock.score = score;
      lastGoodMatchClocks.set(game.slug, {
        clock,
        receivedAt: Date.now(),
      });
      return clock;
    }
  } catch {
    // Fall through to cached / schedule clock.
  }

  const lastGoodMatchClock = lastGoodMatchClocks.get(game.slug);
  if (
    lastGoodMatchClock &&
    Date.now() - lastGoodMatchClock.receivedAt <= STALE_PROVIDER_MS
  ) {
    return lastGoodMatchClock.clock;
  }
  return scheduleMatchClock(game, Date.now());
}

function scoreFromEspn(
  game: PredictionGameConfig,
  competitors: Record<string, unknown>[],
): { spain: number; argentina: number } | null {
  let spain: number | undefined;
  let argentina: number | undefined;
  for (const competitor of competitors) {
    const abbreviation = stringValue(
      asRecord(competitor.team).abbreviation,
    ).toUpperCase();
    const score = Number.parseInt(stringValue(competitor.score), 10);
    if (!Number.isFinite(score)) continue;
    if (abbreviation === game.teams.a.abbreviation.toUpperCase()) spain = score;
    if (abbreviation === game.teams.b.abbreviation.toUpperCase()) argentina = score;
  }
  if (spain === undefined || argentina === undefined) return null;
  return { spain, argentina };
}

function matchClockFromEspn(
  statusName: string,
  state: string,
  displayClock: string,
): MatchClock | null {
  if (
    statusName.includes("HALFTIME") ||
    displayClock.toUpperCase() === "HT" ||
    displayClock.toUpperCase() === "HALF"
  ) {
    return { phase: "halftime", label: "HT", source: "espn" };
  }
  if (
    statusName.includes("FINAL") ||
    statusName.includes("FULL_TIME") ||
    state === "post"
  ) {
    return { phase: "final", label: "Full time", source: "espn" };
  }
  if (
    state === "in" &&
    (statusName.includes("SHOOTOUT") || statusName.includes("PENALT"))
  ) {
    return { phase: "live", label: "PENS", source: "espn" };
  }
  if (statusName.includes("SCHEDULED") || state === "pre") {
    return { phase: "pre", label: "4:00 PM", source: "espn" };
  }
  if (state === "in" || statusName.includes("HALF") || statusName.includes("EXTRA")) {
    const label = normalizeMatchMinuteLabel(displayClock);
    return { phase: "live", label, source: "espn" };
  }
  return null;
}

function normalizeMatchMinuteLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "Live";
  // ESPN renders stoppage as "90'+6'"; collapse to the usual "90+6'".
  const stoppage = trimmed.match(/^(\d+)'\+(\d+)'?$/);
  if (stoppage) return `${stoppage[1]}+${stoppage[2]}'`;
  if (/^\d+\+$/.test(trimmed)) return `${trimmed}'`;
  if (/^\d+\+\d+$/.test(trimmed)) return `${trimmed}'`;
  if (/^\d+$/.test(trimmed)) return `${trimmed}'`;
  if (/^\d+'$/.test(trimmed) || /^\d+\+\d+'$/.test(trimmed)) return trimmed;
  return trimmed;
}

function scheduleMatchClock(
  game: PredictionGameConfig,
  now: number,
): MatchClock {
  const startsAt = matchStartsAt(game);
  const endsAt = matchEndsAt(game);
  if (now < startsAt) {
    return { phase: "pre", label: "Kickoff", source: "schedule" };
  }
  if (now >= endsAt) {
    return { phase: "final", label: "Full time", source: "schedule" };
  }

  const elapsed = now - startsAt;
  if (elapsed < HALF_LENGTH_MS) {
    return {
      phase: "live",
      label: `${Math.floor(elapsed / 60_000)}'`,
      source: "schedule",
    };
  }
  if (elapsed < HALF_LENGTH_MS + HALFTIME_LENGTH_MS) {
    return { phase: "halftime", label: "HT", source: "schedule" };
  }

  // Regulation second half (incl. up to ~10' stoppage).
  const secondHalfElapsed = elapsed - HALF_LENGTH_MS - HALFTIME_LENGTH_MS;
  if (secondHalfElapsed < HALF_LENGTH_MS + 10 * 60_000) {
    const minute = 45 + Math.floor(secondHalfElapsed / 60_000);
    return {
      phase: "live",
      label: minute > 90 ? `90+${minute - 90}'` : `${minute}'`,
      source: "schedule",
    };
  }

  // Without a live feed we can't know if the game went to extra time, so the
  // fallback keeps a conservative "extra time / penalties" ladder instead of
  // declaring full time early.
  const extraElapsed = secondHalfElapsed - HALF_LENGTH_MS - 10 * 60_000;
  const EXTRA_HALF_MS = 15 * 60_000;
  const EXTRA_BREAK_MS = 5 * 60_000;
  if (extraElapsed < EXTRA_HALF_MS + EXTRA_BREAK_MS) {
    const minute = Math.min(105, 91 + Math.floor(extraElapsed / 60_000));
    return { phase: "live", label: `${minute}'`, source: "schedule" };
  }
  const extraSecondElapsed = extraElapsed - EXTRA_HALF_MS - EXTRA_BREAK_MS;
  if (extraSecondElapsed < EXTRA_HALF_MS + EXTRA_BREAK_MS) {
    const minute = Math.min(120, 106 + Math.floor(extraSecondElapsed / 60_000));
    return { phase: "live", label: `${minute}'`, source: "schedule" };
  }
  if (now < endsAt - 30 * 60_000) {
    return { phase: "live", label: "PENS", source: "schedule" };
  }

  return { phase: "final", label: "Full time", source: "schedule" };
}

function getKalshiHistory(
  game: PredictionGameConfig,
): Promise<SpainArgentinaOddsResponse["history"]> {
  const now = Date.now();
  let historyCache = historyCaches.get(game.slug);
  if (!historyCache || historyCache.expiresAt <= now) {
    const promise = loadKalshiHistory(game);
    historyCache = {
      expiresAt: now + 30_000,
      promise,
    };
    historyCaches.set(game.slug, historyCache);
    void promise.then(
      (points) => {
        if (points.length) {
          lastGoodHistories.set(game.slug, {
            points,
            receivedAt: Date.now(),
          });
        } else if (historyCache?.promise === promise) {
          historyCaches.delete(game.slug);
        }
      },
      () => {
        if (historyCache?.promise === promise) historyCaches.delete(game.slug);
      },
    );
  }
  return historyCache.promise;
}

async function loadKalshiHistory(
  game: PredictionGameConfig,
): Promise<SpainArgentinaOddsResponse["history"]> {
  const boundedNow = Math.min(
    Math.max(Date.now(), matchStartsAt(game)),
    matchEndsAt(game),
  );
  const end = Math.floor(boundedNow / 1_000);
  const start = Math.floor(matchStartsAt(game) / 1_000);
  // Prefer coarse candles first (small payload), then 1-minute detail.
  // Skip period_interval=5 — Kalshi currently returns 400 for that value.
  const intervals = [60, 1] as const;
  let lastError: unknown;

  for (const host of KALSHI_API_HOSTS) {
    for (const periodInterval of intervals) {
      try {
        const points = await loadKalshiHistoryFromHost(
          game,
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

  const lastGoodHistory = lastGoodHistories.get(game.slug);
  if (lastGoodHistory && Date.now() - lastGoodHistory.receivedAt <= STALE_HISTORY_MS) {
    return lastGoodHistory.points;
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Kalshi history feeds unavailable");
}

async function loadKalshiHistoryFromHost(
  game: PredictionGameConfig,
  host: string,
  start: number,
  end: number,
  periodInterval: number,
): Promise<SpainArgentinaOddsResponse["history"]> {
  const query = `start_ts=${start}&end_ts=${end}&period_interval=${periodInterval}`;
  const base =
    `${host}/trade-api/v2/series/` +
    `${game.providers.kalshi.seriesTicker}/markets`;
  const fetchOptions = {
    attempts: 1,
    timeoutMs: HISTORY_REQUEST_TIMEOUT_MS,
  };
  const [spainResult, argentinaResult] = await Promise.allSettled([
    fetchJson<Record<string, unknown>>(
      `${base}/${game.teams.a.kalshiTicker}/candlesticks?${query}`,
      fetchOptions,
    ),
    fetchJson<Record<string, unknown>>(
      `${base}/${game.teams.b.kalshiTicker}/candlesticks?${query}`,
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
  game: PredictionGameConfig,
  result: PromiseSettledResult<ProviderOdds>,
  fallback: Pick<ProviderOdds, "id" | "name" | "href" | "volumeUnit">,
): ProviderOdds {
  const cacheKey = `${game.slug}:${fallback.id}`;
  if (result.status === "fulfilled") {
    const receivedAt = Date.now();
    lastGoodProviders.set(cacheKey, {
      odds: result.value,
      receivedAt,
    });
    return { ...result.value, updatedAt: new Date(receivedAt).toISOString() };
  }
  const previous = lastGoodProviders.get(cacheKey);
  if (previous && Date.now() - previous.receivedAt <= STALE_PROVIDER_MS) {
    return {
      ...previous.odds,
      status: "stale",
      updatedAt: new Date(previous.receivedAt).toISOString(),
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

async function loadKalshi(
  game: PredictionGameConfig,
): Promise<ProviderOdds> {
  let markets: Record<string, unknown>[] = [];
  let lastError: unknown;
  for (const host of KALSHI_API_HOSTS) {
    try {
      const eventData = await fetchJson<Record<string, unknown>>(
        `${host}/trade-api/v2/events/${game.providers.kalshi.eventTicker}` +
          `?with_nested_markets=true`,
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
          `${host}/trade-api/v2/markets?event_ticker=` +
            `${game.providers.kalshi.eventTicker}&limit=1000`,
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
  const spain = findKalshiMarket(markets, game.teams.a);
  const argentina = findKalshiMarket(markets, game.teams.b);

  return {
    id: "kalshi",
    name: "Kalshi",
    href: game.providers.kalshi.href,
    spain: kalshiPrice(spain),
    argentina: kalshiPrice(argentina),
    volume: sumNumbers([spain.volume_fp, argentina.volume_fp]),
    volumeUnit: "USD",
    status: "live",
  };
}

function findKalshiMarket(
  markets: Record<string, unknown>[],
  team: PredictionGameConfig["teams"]["a"],
): Record<string, unknown> {
  const market = markets.find((item) => {
    const ticker = stringValue(item.ticker).toUpperCase();
    const label = `${stringValue(item.yes_sub_title)} ${stringValue(item.title)}`;
    return (
      ticker === team.kalshiTicker.toUpperCase() ||
      label.toLowerCase().includes(team.kalshiLabel.toLowerCase())
    );
  });
  if (!market) throw new Error(`Kalshi ${team.name} market not found`);
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

async function loadPolymarket(
  game: PredictionGameConfig,
): Promise<ProviderOdds> {
  const event = await loadPolymarketEvent(game);
  const markets = asRecords(event.markets);
  const spain = findPolymarketMarket(markets, game.teams.a);
  const argentina = findPolymarketMarket(markets, game.teams.b);
  const [spainPrice, argentinaPrice] = await Promise.all([
    loadPolymarketLivePrice(spain),
    loadPolymarketLivePrice(argentina),
  ]);

  return {
    id: "polymarket",
    name: "Polymarket",
    href: game.providers.polymarket.href,
    spain: spainPrice,
    argentina: argentinaPrice,
    volume: sumNumbers([
      spain.volumeNum ?? spain.volume,
      argentina.volumeNum ?? argentina.volume,
    ]),
    volumeUnit: "USD",
    status: "live",
  };
}

async function loadPolymarketEvent(
  game: PredictionGameConfig,
): Promise<Record<string, unknown>> {
  const eventSlug = encodeURIComponent(game.providers.polymarket.eventSlug);
  const urls = [
    `https://gamma-api.polymarket.com/events/slug/${eventSlug}`,
    `https://gamma-api.polymarket.com/events?slug=${eventSlug}`,
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
  team: PredictionGameConfig["teams"]["a"],
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
    return label.includes(team.polymarketLabel.toLowerCase());
  });
  if (!market) throw new Error(`Polymarket ${team.name} market not found`);
  return market;
}

async function loadPolymarketLivePrice(
  market: Record<string, unknown>,
): Promise<number> {
  const outcomes = parseStringArray(market.outcomes);
  const yesIndex = outcomes.findIndex((outcome) => outcome.toLowerCase() === "yes");
  const tokenIds = parseStringArray(market.clobTokenIds);
  const tokenId = tokenIds[yesIndex >= 0 ? yesIndex : 0];
  if (!tokenId) throw new Error("Polymarket YES token missing");

  // Gamma's outcomePrices can lag several minutes during high-volume play.
  // The CLOB midpoint is derived from the current executable order book.
  const quote = await fetchJson<Record<string, unknown>>(
    `https://clob.polymarket.com/midpoint?token_id=${encodeURIComponent(tokenId)}`,
    { attempts: 1, timeoutMs: OPTIONAL_REQUEST_TIMEOUT_MS },
  );
  const midpoint = probabilityValue(quote.mid);
  if (midpoint === null) throw new Error("Polymarket live midpoint missing");
  return clampProbability(midpoint);
}

async function loadManifold(
  game: PredictionGameConfig,
): Promise<ProviderOdds> {
  const marketId = game.providers.manifold.marketId;
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
    href: game.providers.manifold.href,
    spain: manifoldPrice(answers, answerProbs, game.teams.a),
    argentina: manifoldPrice(answers, answerProbs, game.teams.b),
    volume: numberValue(market.volume),
    volumeUnit: "MANA",
    status: "live",
  };
}

function manifoldPrice(
  answers: Record<string, unknown>[],
  probabilities: Record<string, unknown>,
  team: PredictionGameConfig["teams"]["a"],
): number {
  const answer = answers.find((item) =>
    `${stringValue(item.text)} ${stringValue(item.shortText)}`
      .toLowerCase()
      .includes(team.manifoldLabel.toLowerCase()),
  );
  if (!answer) throw new Error(`Manifold ${team.name} answer not found`);
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
  game: PredictionGameConfig,
  ...series: SpainArgentinaOddsResponse["history"][]
): SpainArgentinaOddsResponse["history"] {
  const startsAt = matchStartsAt(game);
  const endsAt = matchEndsAt(game);
  const merged = new Map<string, SpainArgentinaOddsResponse["history"][number]>();
  for (const points of series) {
    for (const point of points) {
      const timestamp = Date.parse(point.at);
      if (
        !Number.isFinite(timestamp) ||
        timestamp < startsAt ||
        timestamp > endsAt ||
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
  game: PredictionGameConfig,
  kv: OddsKv | undefined,
  key: string,
): Promise<SpainArgentinaOddsResponse["history"]> {
  if (!kv) return [];
  try {
    const raw = await kv.get(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return mergeHistoryPoints(
      game,
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
  key: string,
  points: SpainArgentinaOddsResponse["history"],
): Promise<void> {
  if (!kv || !points.length) return;
  try {
    await kv.put(key, JSON.stringify(points), {
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
