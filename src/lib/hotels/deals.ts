/**
 * P2 deal metric — pure, city-local fit + fallback.
 * Designed now; not wired into scan until prices land.
 */
import { DEAL_MIN_SAMPLE, DEAL_MIN_SCORE } from "./constants";

export type PricedComfort = {
  token: string;
  comfort: number;
  nightlyUsd: number;
};

export type DealResult = {
  token: string;
  nightlyUsd: number;
  expectedUsd: number;
  dealPct: number;
  method: "fit" | "fallback";
};

function ln(n: number): number {
  return Math.log(n);
}

/** Ordinary least squares: ln(nightly) ~ a + b * comfort */
export function fitLogPrice(samples: PricedComfort[]): {
  a: number;
  b: number;
} | null {
  const usable = samples.filter(
    (s) => s.comfort >= DEAL_MIN_SCORE && s.nightlyUsd > 0,
  );
  if (usable.length < DEAL_MIN_SAMPLE) return null;
  const n = usable.length;
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumXY = 0;
  for (const s of usable) {
    const x = s.comfort;
    const y = ln(s.nightlyUsd);
    sumX += x;
    sumY += y;
    sumXX += x * x;
    sumXY += x * y;
  }
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-9) return null;
  const b = (n * sumXY - sumX * sumY) / denom;
  const a = (sumY - b * sumX) / n;
  return { a, b };
}

export function computeDeals(samples: PricedComfort[]): DealResult[] {
  const fit = fitLogPrice(samples);
  if (!fit) {
    const scored = samples.filter(
      (s) => s.comfort >= DEAL_MIN_SCORE && s.nightlyUsd > 0,
    );
    const ratios = scored
      .map((s) => s.comfort / s.nightlyUsd)
      .sort((a, b) => a - b);
    const mid = Math.floor(ratios.length / 2);
    const medianRatio =
      ratios.length === 0
        ? 1
        : ratios.length % 2
          ? ratios[mid]!
          : (ratios[mid - 1]! + ratios[mid]!) / 2;
    return scored.map((s) => {
      const ratio = s.comfort / s.nightlyUsd;
      const dealPct = medianRatio > 0 ? ratio / medianRatio - 1 : 0;
      return {
        token: s.token,
        nightlyUsd: s.nightlyUsd,
        expectedUsd: s.nightlyUsd * (1 + dealPct),
        dealPct,
        method: "fallback" as const,
      };
    });
  }
  return samples
    .filter((s) => s.comfort >= DEAL_MIN_SCORE && s.nightlyUsd > 0)
    .map((s) => {
      const expectedUsd = Math.exp(fit.a + fit.b * s.comfort);
      const dealPct = expectedUsd / s.nightlyUsd - 1;
      return {
        token: s.token,
        nightlyUsd: s.nightlyUsd,
        expectedUsd,
        dealPct,
        method: "fit" as const,
      };
    });
}
