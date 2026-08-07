import { HEATMAP_DAYS } from "./constants";

export type HeatmapFormState = {
  q: string;
  token: string;
  name: string;
  start: string;
  /** UI-only for now; day span stays HEATMAP_DAYS until variable windows land. */
  months: number;
  nights: number;
  adults: number;
};

export const DEFAULT_HEATMAP_FORM: HeatmapFormState = {
  q: "",
  token: "",
  name: "",
  start: "",
  months: 1,
  nights: 1,
  adults: 2,
};

export function heatmapFormFromSearchParams(
  params: URLSearchParams,
): HeatmapFormState {
  return {
    q: params.get("q") ?? "",
    token: params.get("token") ?? "",
    name: params.get("name") ?? "",
    start: params.get("start") ?? "",
    months: clampNum(params.get("months"), 1, 6, 1),
    nights: clampNum(params.get("nights"), 1, 14, 1),
    adults: clampNum(params.get("adults"), 1, 8, 2),
  };
}

export function heatmapFormToSearchParams(
  state: HeatmapFormState,
): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.token) params.set("token", state.token);
  if (state.name) params.set("name", state.name);
  if (state.start) params.set("start", state.start);
  if (state.months !== DEFAULT_HEATMAP_FORM.months) {
    params.set("months", String(state.months));
  }
  if (state.nights !== DEFAULT_HEATMAP_FORM.nights) {
    params.set("nights", String(state.nights));
  }
  if (state.adults !== DEFAULT_HEATMAP_FORM.adults) {
    params.set("adults", String(state.adults));
  }
  return params;
}

/** Day count used for a scan. Months is reserved for a future variable span. */
export function heatmapDayCount(_months: number): number {
  return HEATMAP_DAYS;
}

export function addUtcDays(isoDate: string, days: number): string {
  const d = parseUtcDate(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDateFromUtc(d);
}

export function parseUtcDate(isoDate: string): Date {
  const [y, m, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, day ?? 1));
}

export function isoDateFromUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function defaultHeatmapStart(now = new Date()): string {
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() + 14);
  return isoDateFromUtc(d);
}

function clampNum(
  raw: string | null,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
