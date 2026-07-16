import { DEFAULT_SEARCH_MODE_ID, getSearchMode } from "./modes";
import {
  LegSearchSchema,
  MAX_TOTAL_HOURS_OPTIONS,
  type Cabin,
  type LegSearch,
  type LieFlatPolicy,
  type MaxTotalHours,
} from "./types";

/** Form defaults — "usa" string allowed only here and in locations registry. */
export const DEFAULT_FORM = {
  origin: "EZE",
  dest: "usa-gateways",
  mode: DEFAULT_SEARCH_MODE_ID,
  days: 7,
  maxStops: 1 as 1 | 2,
  maxTotalHours: 24 as MaxTotalHours,
  deepSearch: false,
  topN: 2,
  currency: "USD",
  gl: "us",
  hl: "en",
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export type FormState = {
  origin: string;
  dest: string;
  mode: string;
  cabin: Cabin;
  lieFlatPolicy: LieFlatPolicy;
  start: string;
  days: number;
  maxStops: 1 | 2;
  maxTotalHours: MaxTotalHours;
  deepSearch: boolean;
  topN: number;
  currency: string;
  gl: string;
  hl: string;
};

export function defaultFormState(start = todayUtc()): FormState {
  const mode = getSearchMode(DEFAULT_FORM.mode)!;
  return {
    origin: DEFAULT_FORM.origin,
    dest: DEFAULT_FORM.dest,
    mode: mode.id,
    cabin: mode.cabin,
    lieFlatPolicy: mode.lieFlatPolicy,
    start,
    days: DEFAULT_FORM.days,
    maxStops: DEFAULT_FORM.maxStops,
    maxTotalHours: DEFAULT_FORM.maxTotalHours,
    deepSearch: DEFAULT_FORM.deepSearch,
    topN: DEFAULT_FORM.topN,
    currency: DEFAULT_FORM.currency,
    gl: DEFAULT_FORM.gl,
    hl: DEFAULT_FORM.hl,
  };
}

export function formStateToLegSearch(form: FormState): LegSearch {
  return LegSearchSchema.parse({
    origin: form.origin,
    dest: form.dest,
    dateRange: { start: form.start, days: form.days },
    maxStops: form.maxStops,
    maxTotalHours: form.maxTotalHours,
    cabin: form.cabin,
    lieFlatPolicy: form.lieFlatPolicy,
    includeUnverified: false,
    currency: form.currency,
    gl: form.gl,
    hl: form.hl,
    deepSearch: form.deepSearch,
    topN: form.topN,
  });
}

/** Serialize the full search spec to URL query params (invariant 7). */
export function formStateToSearchParams(form: FormState): URLSearchParams {
  const params = new URLSearchParams();
  params.set("origin", form.origin);
  params.set("dest", form.dest);
  params.set("mode", form.mode);
  params.set("cabin", form.cabin);
  params.set("lieFlatPolicy", form.lieFlatPolicy);
  params.set("start", form.start);
  params.set("days", String(form.days));
  params.set("maxStops", String(form.maxStops));
  params.set("maxTotalHours", String(form.maxTotalHours));
  params.set("topN", String(form.topN));
  params.set("currency", form.currency);
  params.set("gl", form.gl);
  params.set("hl", form.hl);
  if (form.deepSearch) params.set("deepSearch", "1");
  return params;
}

export function formStateFromSearchParams(
  params: URLSearchParams,
  fallbackStart = todayUtc(),
): FormState {
  const base = defaultFormState(fallbackStart);
  const modeId = params.get("mode") ?? base.mode;
  const mode = getSearchMode(modeId);

  const cabinParam = params.get("cabin");
  const policyParam = params.get("lieFlatPolicy");

  const cabin = (cabinParam as Cabin | null) ?? mode?.cabin ?? base.cabin;
  const lieFlatPolicy =
    (policyParam as LieFlatPolicy | null) ??
    mode?.lieFlatPolicy ??
    base.lieFlatPolicy;

  const maxStopsRaw = Number(params.get("maxStops") ?? base.maxStops);
  const maxStops: 1 | 2 = maxStopsRaw === 2 ? 2 : 1;

  return {
    origin: params.get("origin") ?? base.origin,
    dest: params.get("dest") ?? base.dest,
    mode: mode?.id ?? base.mode,
    cabin,
    lieFlatPolicy,
    start: params.get("start") ?? base.start,
    days: clampInt(params.get("days"), 1, 14, base.days),
    maxStops,
    maxTotalHours: parseMaxTotalHours(
      params.get("maxTotalHours"),
      base.maxTotalHours,
    ),
    deepSearch: params.get("deepSearch") === "1",
    topN: clampInt(params.get("topN"), 1, 20, base.topN),
    currency: params.get("currency") ?? base.currency,
    gl: params.get("gl") ?? base.gl,
    hl: params.get("hl") ?? base.hl,
  };
}

function parseMaxTotalHours(
  raw: string | null,
  fallback: MaxTotalHours,
): MaxTotalHours {
  const value = Number(raw);
  return MAX_TOTAL_HOURS_OPTIONS.includes(value as MaxTotalHours)
    ? (value as MaxTotalHours)
    : fallback;
}

function clampInt(
  raw: string | null,
  min: number,
  max: number,
  fallback: number,
): number {
  if (raw === null) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
