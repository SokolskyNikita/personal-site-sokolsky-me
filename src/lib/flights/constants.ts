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

/** Global daily SerpApi call budget. */
export const DEFAULT_DAILY_BUDGET = 100;

/** Per-IP rate limit on /query. */
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 15;
