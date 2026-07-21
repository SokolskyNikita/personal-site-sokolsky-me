export const INDEX_TTL_DAYS = 30;
export const SCAN_PAGES_MOST_REVIEWED = 4;
export const SCAN_PAGES_HIGHEST_RATING = 2;
export const MAX_CREDITS_PER_SCAN = 80;
export const ENRICH_TOP_N = 30;
export const CITY_MEAN_FALLBACK = 4.2;
export const BAYES_K = 150;
export const DEAL_MIN_SCORE = 40;
export const DEAL_MIN_SAMPLE = 12;
export const WINDOW_CAP = 21;
export const PRICE_CACHE_TTL_HOURS = 6;
/** Skip a window list call when this many index tokens already have fresh prices. */
export const PRICE_CACHE_HIT_THRESHOLD = 12;

/** Quality-scan stay: nearest Tue→Thu ≥ 21 days out (computed at call time). */
export function qualityScanDates(now = new Date()): {
  checkIn: string;
  checkOut: string;
} {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() + 21);
  // 0=Sun … 2=Tue
  const day = start.getUTCDay();
  const add = (2 - day + 7) % 7;
  start.setUTCDate(start.getUTCDate() + add);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 2);
  return { checkIn: isoDate(start), checkOut: isoDate(end) };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
