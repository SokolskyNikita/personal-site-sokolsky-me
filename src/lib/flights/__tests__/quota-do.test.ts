import { describe, expect, it } from "vitest";
import { FlightQuotaCoordinator } from "../quota-do";

class MemoryStorage {
  private readonly values = new Map<string, unknown>();
  private transactionTail: Promise<void> = Promise.resolve();

  async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.values.get(key) as T | undefined;
  }

  async put(key: string, value: unknown): Promise<void> {
    this.values.set(key, value);
  }

  async transaction<T>(
    closure: (transaction: MemoryStorage) => Promise<T>,
  ): Promise<T> {
    const previous = this.transactionTail;
    let release = (): void => {};
    this.transactionTail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await closure(this);
    } finally {
      release();
    }
  }
}

function coordinator() {
  return new FlightQuotaCoordinator({ storage: new MemoryStorage() });
}

describe("FlightQuotaCoordinator", () => {
  it("tracks daily budget atomically across consume calls", async () => {
    const quota = coordinator();

    const first = await quota.fetch(
      new Request("https://flight-quota/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10, searchesUsed: 3 }),
      }),
    );
    await expect(first.json()).resolves.toMatchObject({
      used: 3,
      remaining: 7,
      overBudget: false,
    });

    const second = await quota.fetch(
      new Request("https://flight-quota/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10, searchesUsed: 7 }),
      }),
    );
    await expect(second.json()).resolves.toMatchObject({
      used: 10,
      remaining: 0,
      overBudget: true,
    });
  });

  it("enforces a per-IP rate limit within the current day", async () => {
    const quota = coordinator();

    const allowed = await quota.fetch(
      new Request("https://flight-quota/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: "203.0.113.10", limit: 2 }),
      }),
    );
    await expect(allowed.json()).resolves.toMatchObject({
      allowed: true,
      count: 1,
    });

    await quota.fetch(
      new Request("https://flight-quota/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: "203.0.113.10", limit: 2 }),
      }),
    );

    const blocked = await quota.fetch(
      new Request("https://flight-quota/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: "203.0.113.10", limit: 2 }),
      }),
    );
    await expect(blocked.json()).resolves.toMatchObject({
      allowed: false,
      count: 2,
      limit: 2,
    });
  });

  it("atomically reserves shared budget and scoped per-IP credits", async () => {
    const quota = coordinator();
    const reserve = (ip: string, scope: string) =>
      quota.fetch(
        new Request("https://flight-quota/reserve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ip,
            scope,
            amount: 1,
            perIpLimit: 2,
            globalLimit: 3,
          }),
        }),
      );

    const responses = await Promise.all([
      reserve("203.0.113.10", "hotels"),
      reserve("203.0.113.10", "hotels"),
      reserve("203.0.113.10", "hotels"),
    ]);
    const results = await Promise.all(responses.map((response) => response.json()));
    expect(results.filter((result) => result.allowed)).toHaveLength(2);
    expect(results.find((result) => !result.allowed)).toMatchObject({
      reason: "per_ip_limit_reached",
      rate: { count: 2, limit: 2 },
    });

    const otherScope = await reserve("203.0.113.10", "flights");
    await expect(otherScope.json()).resolves.toMatchObject({
      allowed: true,
      budget: { used: 3, remaining: 0 },
    });

    const globalBlocked = await reserve("203.0.113.11", "hotels");
    await expect(globalBlocked.json()).resolves.toMatchObject({
      allowed: false,
      reason: "global_budget_reached",
      budget: { used: 3, remaining: 0 },
    });
  });
});
