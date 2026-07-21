import {
  DEFAULT_CACHE_TTL_SECONDS,
  DEFAULT_DAILY_BUDGET,
  DEFAULT_RATE_LIMIT_PER_DAY,
} from "./constants";

/** Minimal KV surface used by flights modules (Cloudflare KVNamespace-compatible). */
export interface FlightKv {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
}

export type CacheLookup = {
  hit: boolean;
  value: string | null;
};

export async function cacheGet(
  kv: FlightKv,
  key: string,
): Promise<CacheLookup> {
  const value = await kv.get(key);
  return { hit: value !== null, value };
}

export async function cachePut(
  kv: FlightKv,
  key: string,
  value: string,
  ttlSeconds = DEFAULT_CACHE_TTL_SECONDS,
): Promise<void> {
  await kv.put(key, value, { expirationTtl: ttlSeconds });
}

function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export type BudgetStatus = {
  used: number;
  remaining: number;
  limit: number;
  day: string;
  overBudget: boolean;
};

export async function getBudgetStatus(
  kv: FlightKv,
  limit = DEFAULT_DAILY_BUDGET,
  now = new Date(),
): Promise<BudgetStatus> {
  const day = utcDayKey(now);
  const raw = await kv.get(`budget:${day}`);
  const used = raw ? Number(raw) : 0;
  const safeUsed = Number.isFinite(used) ? used : 0;
  const remaining = Math.max(0, limit - safeUsed);
  return {
    used: safeUsed,
    remaining,
    limit,
    day,
    overBudget: remaining <= 0,
  };
}

export async function incrementBudget(
  kv: FlightKv,
  limit = DEFAULT_DAILY_BUDGET,
  now = new Date(),
): Promise<BudgetStatus> {
  const status = await getBudgetStatus(kv, limit, now);
  const next = status.used + 1;
  // Expire shortly after day boundary (36h) so counters don't linger forever.
  await kv.put(`budget:${status.day}`, String(next), {
    expirationTtl: 36 * 60 * 60,
  });
  return {
    used: next,
    remaining: Math.max(0, limit - next),
    limit,
    day: status.day,
    overBudget: next >= limit,
  };
}

export type RateLimitStatus = {
  allowed: boolean;
  count: number;
  limit: number;
};

export async function checkAndIncrementRateLimit(
  kv: FlightKv,
  ip: string,
  limit = DEFAULT_RATE_LIMIT_PER_DAY,
  now = new Date(),
): Promise<RateLimitStatus> {
  const day = utcDayKey(now);
  const key = `rl:${ip}:${day}`;
  const raw = await kv.get(key);
  const count = raw ? Number(raw) : 0;
  const safeCount = Number.isFinite(count) ? count : 0;
  if (safeCount >= limit) {
    return { allowed: false, count: safeCount, limit };
  }
  const next = safeCount + 1;
  // Expire shortly after day boundary (36h) so counters don't linger forever.
  await kv.put(key, String(next), { expirationTtl: 36 * 60 * 60 });
  return { allowed: true, count: next, limit };
}

/** Count how many plan-step cache keys already exist. */
export async function countCachedSteps(
  kv: FlightKv,
  keys: string[],
): Promise<number> {
  const values = await Promise.all(keys.map((key) => kv.get(key)));
  return values.reduce((hits, value) => hits + (value !== null ? 1 : 0), 0);
}
