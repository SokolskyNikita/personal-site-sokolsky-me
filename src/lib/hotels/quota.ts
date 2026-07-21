import {
  HOTEL_RATE_LIMIT_PER_DAY,
  SEARCHAPI_DAILY_BUDGET,
} from "./constants";

export type SearchQuotaNamespace = {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(request: Request): Promise<Response> };
};

export type HotelQuotaEnv = {
  FLIGHT_QUOTA?: SearchQuotaNamespace;
  HOTEL_RATE_LIMIT_PER_DAY?: string;
  SEARCHAPI_DAILY_BUDGET?: string;
  FLIGHT_DAILY_BUDGET?: string;
};

export type HotelQuotaStatus = {
  allowed: boolean;
  reason: "per_ip_limit_reached" | "global_budget_reached" | null;
  amount: number;
  rate: { allowed: boolean; count: number; limit: number };
  budget: {
    used: number;
    remaining: number;
    limit: number;
    day: string;
    overBudget: boolean;
  };
  resetAt: string;
};

export class HotelQuotaExceededError extends Error {
  constructor(
    readonly code: "per_ip_limit_reached" | "global_budget_reached",
    readonly quota: HotelQuotaStatus,
  ) {
    super(code);
    this.name = "HotelQuotaExceededError";
  }
}

export function createHotelQuotaGuard(
  env: HotelQuotaEnv,
  request: Request,
): (info: { engine: string }) => Promise<void> {
  if (!env.FLIGHT_QUOTA) {
    return async () => {
      throw new Error("hotel_quota_unavailable");
    };
  }
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const perIpLimit = positiveInt(
    env.HOTEL_RATE_LIMIT_PER_DAY,
    HOTEL_RATE_LIMIT_PER_DAY,
  );
  const globalLimit = positiveInt(
    env.SEARCHAPI_DAILY_BUDGET ?? env.FLIGHT_DAILY_BUDGET,
    SEARCHAPI_DAILY_BUDGET,
  );
  const namespace = env.FLIGHT_QUOTA;
  const stub = namespace.get(namespace.idFromName("global"));

  return async ({ engine }) => {
    const response = await stub.fetch(
      new Request("https://searchapi-quota/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip,
          scope: "hotels",
          engine,
          amount: 1,
          perIpLimit,
          globalLimit,
        }),
      }),
    );
    if (!response.ok) throw new Error("hotel_quota_unavailable");
    const quota = (await response.json()) as HotelQuotaStatus;
    if (!quota.allowed && quota.reason) {
      throw new HotelQuotaExceededError(quota.reason, quota);
    }
  };
}

function positiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
