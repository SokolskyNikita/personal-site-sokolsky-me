import { describe, expect, it } from "vitest";
import {
  cacheGet,
  cachePut,
  checkAndIncrementRateLimit,
  countCachedSteps,
  getBudgetStatus,
  incrementBudget,
  type FlightKv,
} from "../kv";

function memoryKv(): FlightKv {
  const store = new Map<string, string>();
  return {
    async get(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    async put(key, value) {
      store.set(key, value);
    },
  };
}

describe("KV cache", () => {
  it("stores and retrieves values", async () => {
    const kv = memoryKv();
    expect(await cacheGet(kv, "k1")).toEqual({ hit: false, value: null });
    await cachePut(kv, "k1", '{"ok":true}');
    expect(await cacheGet(kv, "k1")).toEqual({
      hit: true,
      value: '{"ok":true}',
    });
  });

  it("counts cached steps", async () => {
    const kv = memoryKv();
    await cachePut(kv, "a", "1");
    await cachePut(kv, "c", "1");
    expect(await countCachedSteps(kv, ["a", "b", "c"])).toBe(2);
  });
});

describe("budget", () => {
  it("tracks daily remaining and over-budget", async () => {
    const kv = memoryKv();
    const now = new Date("2026-07-16T12:00:00Z");
    let status = await getBudgetStatus(kv, 3, now);
    expect(status.remaining).toBe(3);
    expect(status.overBudget).toBe(false);

    status = await incrementBudget(kv, 3, now);
    status = await incrementBudget(kv, 3, now);
    status = await incrementBudget(kv, 3, now);
    expect(status.used).toBe(3);
    expect(status.remaining).toBe(0);
    expect(status.overBudget).toBe(true);
  });
});

describe("rate limit", () => {
  it("allows up to the limit then blocks", async () => {
    const kv = memoryKv();
    const now = new Date("2026-07-16T12:00:00Z");
    expect(
      (await checkAndIncrementRateLimit(kv, "1.2.3.4", 2, now)).allowed,
    ).toBe(true);
    expect(
      (await checkAndIncrementRateLimit(kv, "1.2.3.4", 2, now)).allowed,
    ).toBe(true);
    expect(
      (await checkAndIncrementRateLimit(kv, "1.2.3.4", 2, now)).allowed,
    ).toBe(false);
  });
});
