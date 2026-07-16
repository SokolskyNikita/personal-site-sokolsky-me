import { describe, expect, it } from "vitest";
import { FlightQuotaCoordinator } from "../quota-do";

class MemoryStorage {
  private readonly values = new Map<string, unknown>();

  async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.values.get(key) as T | undefined;
  }

  async put(key: string, value: unknown): Promise<void> {
    this.values.set(key, value);
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

  it("enforces a per-IP rate limit within the current minute", async () => {
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
});
