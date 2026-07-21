import {
  DEFAULT_DAILY_BUDGET,
  DEFAULT_RATE_LIMIT_PER_DAY,
} from "./constants";
import type { BudgetStatus, RateLimitStatus } from "./kv";

type DurableObjectStorageLike = {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
  transaction?<T>(
    closure: (transaction: DurableObjectStorageLike) => Promise<T>,
  ): Promise<T>;
};

type DurableObjectStateLike = {
  storage: DurableObjectStorageLike;
};

function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Globally serialized budget and per-IP rate accounting.
 *
 * KV remains the result cache; counters live here because KV read/modify/write
 * operations are eventually consistent and can lose concurrent increments.
 */
export class FlightQuotaCoordinator {
  constructor(private readonly state: DurableObjectStateLike) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/status") {
      const limit = positiveInt(
        url.searchParams.get("limit"),
        DEFAULT_DAILY_BUDGET,
      );
      return Response.json(await this.budgetStatus(limit));
    }

    if (request.method !== "POST") {
      return Response.json({ error: "method_not_allowed" }, { status: 405 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    if (url.pathname === "/rate") {
      return Response.json(
        await this.consumeRate(
          typeof body.ip === "string" ? body.ip : "unknown",
          positiveInt(body.limit, DEFAULT_RATE_LIMIT_PER_DAY),
        ),
      );
    }
    if (url.pathname === "/budget") {
      return Response.json(
        await this.consumeBudget(
          positiveInt(body.limit, DEFAULT_DAILY_BUDGET),
          nonnegativeInt(body.searchesUsed, 0),
        ),
      );
    }
    if (url.pathname === "/reserve") {
      return Response.json(
        await this.reserveCredits({
          ip: typeof body.ip === "string" ? body.ip : "unknown",
          scope: safeScope(body.scope),
          amount: positiveInt(body.amount, 1),
          perIpLimit: positiveInt(
            body.perIpLimit,
            DEFAULT_RATE_LIMIT_PER_DAY,
          ),
          globalLimit: positiveInt(body.globalLimit, DEFAULT_DAILY_BUDGET),
        }),
      );
    }

    return Response.json({ error: "not_found" }, { status: 404 });
  }

  private async budgetStatus(limit: number): Promise<BudgetStatus> {
    const day = utcDay();
    const used =
      (await this.state.storage.get<number>(`budget:${day}`)) ?? 0;
    const remaining = Math.max(0, limit - used);
    return { used, remaining, limit, day, overBudget: remaining <= 0 };
  }

  private async consumeBudget(
    limit: number,
    searchesUsed: number,
  ): Promise<BudgetStatus> {
    const status = await this.budgetStatus(limit);
    const used = status.used + searchesUsed;
    await this.state.storage.put(`budget:${status.day}`, used);
    return {
      ...status,
      used,
      remaining: Math.max(0, limit - used),
      overBudget: used >= limit,
    };
  }

  private async consumeRate(
    ip: string,
    limit: number,
  ): Promise<RateLimitStatus> {
    const key = `rate:${utcDay()}:${ip}`;
    const count = (await this.state.storage.get<number>(key)) ?? 0;
    if (count >= limit) return { allowed: false, count, limit };
    const next = count + 1;
    await this.state.storage.put(key, next);
    return { allowed: true, count: next, limit };
  }

  private async reserveCredits(input: {
    ip: string;
    scope: string;
    amount: number;
    perIpLimit: number;
    globalLimit: number;
  }): Promise<{
    allowed: boolean;
    reason: "per_ip_limit_reached" | "global_budget_reached" | null;
    amount: number;
    rate: RateLimitStatus;
    budget: BudgetStatus;
    resetAt: string;
  }> {
    const run = async (storage: DurableObjectStorageLike) => {
      const day = utcDay();
      const budgetKey = `budget:${day}`;
      const rateKey = `rate:${day}:${input.scope}:${input.ip}`;
      const [budgetUsed, rateUsed] = await Promise.all([
        storage.get<number>(budgetKey),
        storage.get<number>(rateKey),
      ]);
      const safeBudgetUsed = budgetUsed ?? 0;
      const safeRateUsed = rateUsed ?? 0;
      const resetAt = `${nextUtcDay(day)}T00:00:00.000Z`;

      if (safeBudgetUsed + input.amount > input.globalLimit) {
        return {
          allowed: false,
          reason: "global_budget_reached" as const,
          amount: input.amount,
          rate: {
            allowed: safeRateUsed + input.amount <= input.perIpLimit,
            count: safeRateUsed,
            limit: input.perIpLimit,
          },
          budget: budgetResult(
            day,
            safeBudgetUsed,
            input.globalLimit,
          ),
          resetAt,
        };
      }
      if (safeRateUsed + input.amount > input.perIpLimit) {
        return {
          allowed: false,
          reason: "per_ip_limit_reached" as const,
          amount: input.amount,
          rate: {
            allowed: false,
            count: safeRateUsed,
            limit: input.perIpLimit,
          },
          budget: budgetResult(
            day,
            safeBudgetUsed,
            input.globalLimit,
          ),
          resetAt,
        };
      }

      const nextBudget = safeBudgetUsed + input.amount;
      const nextRate = safeRateUsed + input.amount;
      await Promise.all([
        storage.put(budgetKey, nextBudget),
        storage.put(rateKey, nextRate),
      ]);
      return {
        allowed: true,
        reason: null,
        amount: input.amount,
        rate: {
          allowed: true,
          count: nextRate,
          limit: input.perIpLimit,
        },
        budget: budgetResult(day, nextBudget, input.globalLimit),
        resetAt,
      };
    };

    return this.state.storage.transaction
      ? this.state.storage.transaction(run)
      : run(this.state.storage);
  }
}

function budgetResult(day: string, used: number, limit: number): BudgetStatus {
  return {
    used,
    remaining: Math.max(0, limit - used),
    limit,
    day,
    overBudget: used >= limit,
  };
}

function nextUtcDay(day: string): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function safeScope(value: unknown): string {
  return typeof value === "string" && /^[a-z][a-z0-9_-]{0,31}$/.test(value)
    ? value
    : "default";
}

function positiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonnegativeInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}
