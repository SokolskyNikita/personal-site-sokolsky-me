/**
 * Max IATA codes per departure_id / arrival_id comma list.
 * Empirically verified via SerpApi MCP on 2026-07-16:
 * - 10 airports → results returned (EZE → JFK,EWR,BOS,IAD,PHL,CLT,ATL,MIA,ORD,DFW)
 * - 16 airports (full gateway list) → "Google Flights hasn't returned any results"
 * Using 10 as a safe batch size for both endpoints.
 */
export const MAX_AIRPORTS_PER_BATCH = 10;

/**
 * Outbound candidates hydrated with return-flight details per round-trip step.
 * Keeping this bounded makes the maximum API cost predictable.
 */
export const ROUND_TRIP_CANDIDATES_PER_STEP = 4;

/** Default KV cache TTL for raw SerpApi JSON (2 hours). */
export const DEFAULT_CACHE_TTL_SECONDS = 2 * 60 * 60;

/**
 * Approximate marginal cost using SerpApi's $25 / 1,000-search Starter plan.
 * Cached SerpApi searches are free: https://serpapi.com/pricing
 */
export const SERPAPI_ESTIMATED_COST_PER_SEARCH_USD = 25 / 1_000;

/**
 * Global daily SerpApi call budget.
 * A default Buenos Aires→gateway plan is ~32 live calls at 7 days after the
 * selected date, or ~60 at 14 days after it. 2,000 permits roughly 30–60
 * fully uncached typical searches site-wide while capping runaway spend.
 */
export const DEFAULT_DAILY_BUDGET = 2_000;

/**
 * Per-IP daily rate limit on /query (uncached SerpApi steps).
 * Caps a single client at ~6 typical Buenos Aires→gateway searches per day.
 */
export const DEFAULT_RATE_LIMIT_PER_DAY = 200;
