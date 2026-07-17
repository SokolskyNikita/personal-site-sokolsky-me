/**
 * Max IATA codes per departure_id / arrival_id comma list.
 * Empirically verified with comma-separated SearchAPI.io airport ids:
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

/** Default KV cache TTL for raw SearchAPI.io JSON (2 hours). */
export const DEFAULT_CACHE_TTL_SECONDS = 2 * 60 * 60;

/**
 * Approximate usage cost on SearchAPI.io's entry-level paid plan:
 * $40/month for 10,000 searches, or $4 per 1,000.
 * https://www.searchapi.io/pricing
 * Cached provider responses are served from our KV without another paid search.
 */
export const SEARCHAPI_ESTIMATED_COST_PER_SEARCH_USD = 4 / 1_000;

/**
 * Global daily SearchAPI.io call budget.
 * A default Buenos Aires→gateway plan is ~32 live calls at 7 days after the
 * selected date, or ~60 at 14 days after it. 2,000 permits roughly 30–60
 * fully uncached typical searches site-wide while capping runaway spend.
 */
export const DEFAULT_DAILY_BUDGET = 2_000;

/**
 * Per-IP daily rate limit on /query (uncached SearchAPI.io steps).
 * Caps a single client at ~12 typical Buenos Aires→gateway searches per day.
 */
export const DEFAULT_RATE_LIMIT_PER_DAY = 400;
