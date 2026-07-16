/**
 * Max IATA codes per departure_id / arrival_id comma list.
 * Empirically verified via SerpApi MCP on 2026-07-16:
 * - 10 airports → results returned (EZE → JFK,EWR,BOS,IAD,PHL,CLT,ATL,MIA,ORD,DFW)
 * - 16 airports (full gateway list) → "Google Flights hasn't returned any results"
 * Using 10 as a safe batch size for both endpoints.
 */
export const MAX_AIRPORTS_PER_BATCH = 10;

/** Default KV cache TTL for raw SerpApi JSON (6 hours). */
export const DEFAULT_CACHE_TTL_SECONDS = 6 * 60 * 60;

/**
 * Global daily SerpApi call budget.
 * A default EZE→gateway 7-day plan is ~28 live calls; 14 days ~56.
 * The largest 14-day registry pair (USA 35 × Schengen/EU 40) is 224 calls.
 * 1,000 permits four fully uncached largest searches while capping runaway spend.
 */
export const DEFAULT_DAILY_BUDGET = 1_000;

/**
 * Per-IP rate limit on /query (calls per minute).
 * Client runs steps at concurrency 3. A 240-call ceiling accommodates the
 * largest 224-step search without allowing an unbounded request burst.
 */
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 240;
