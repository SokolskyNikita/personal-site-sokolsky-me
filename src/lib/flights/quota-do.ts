import type { BudgetStatus, RateLimitStatus } from "./kv";

type DurableObjectStorageLike = {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
};

type DurableObjectStateLike = {
  storage: DurableObjectStorageLike;
};

function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function utcMinute(date = new Date()): string {
  return date.toISOString().slice(0, 16);
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
      const limit = positiveInt(url.searchParams.get("limit"), 10_000);
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
          positiveInt(body.limit, 2_400),
        ),
      );
    }
    if (url.pathname === "/budget") {
      return Response.json(
        await this.consumeBudget(
          positiveInt(body.limit, 10_000),
          nonnegativeInt(body.searchesUsed, 0),
        ),
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
    const key = `rate:${utcMinute()}:${ip}`;
    const count = (await this.state.storage.get<number>(key)) ?? 0;
    if (count >= limit) return { allowed: false, count, limit };
    const next = count + 1;
    await this.state.storage.put(key, next);
    return { allowed: true, count: next, limit };
  }
}

function positiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonnegativeInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}
