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

/** Default KV cache TTL for raw SerpApi JSON (1 hour). */
export const DEFAULT_CACHE_TTL_SECONDS = 60 * 60;

/**
 * Approximate marginal cost using SerpApi's $25 / 1,000-search Starter plan.
 * Cached SerpApi searches are free: https://serpapi.com/pricing
 */
export const SERPAPI_ESTIMATED_COST_PER_SEARCH_USD = 25 / 1_000;

/**
 * Global daily SerpApi call budget.
 * A default Buenos Aires→gateway plan is ~32 live calls at 7 days after the
 * selected date, or ~60 at 14 days after it. The largest 14-day registry pair
 * (USA 35 × Schengen/EU 40) is 240 calls. 10,000 permits 41 fully uncached
 * largest searches while capping runaway spend.
 */
export const DEFAULT_DAILY_BUDGET = 10_000;

/**
 * Per-IP rate limit on /query (calls per minute).
 * Client runs steps at concurrency 3. A 2,400-call ceiling accommodates
 * repeated largest searches without allowing an unbounded request burst.
 */
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 2_400;
