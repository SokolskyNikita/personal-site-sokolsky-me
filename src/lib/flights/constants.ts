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
 * 500 allows many real searches/day while still capping runaway spend.
 */
export const DEFAULT_DAILY_BUDGET = 500;

/**
 * Per-IP rate limit on /query (calls per minute).
 * Client runs steps at concurrency 3 — a 28-step plan needs headroom
 * above the old 15/min cap so a single search isn't mid-flight throttled.
 */
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 60;
