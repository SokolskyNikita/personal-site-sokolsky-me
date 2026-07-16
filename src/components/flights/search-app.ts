import { formatDateHeader, formatPrice, formatResultRow } from "../../lib/flights/format";
import { listRegistryOptions } from "../../lib/flights/resolver";
import {
  SEARCH_MODES,
  getSearchMode,
  modeInvolvesLieFlat,
} from "../../lib/flights/modes";
import type { ItineraryOption, LegSearch, PlanStep, QueryPlan } from "../../lib/flights/types";
import {
  DEFAULT_FORM,
  defaultFormState,
  formStateFromSearchParams,
  formStateToLegSearch,
  formStateToSearchParams,
  type FormState,
} from "../../lib/flights/url";

type PlanResponse = {
  ok: boolean;
  plan?: QueryPlan;
  cachedSteps?: number;
  uncachedCalls?: number;
  budget?: { remaining: number; used: number; limit: number };
  canRun?: boolean;
  error?: string;
  message?: string;
};

type QueryResponse = {
  ok: boolean;
  stepIndex?: number;
  cacheHit?: boolean;
  cacheOnly?: boolean;
  options?: ItineraryOption[];
  optionsParsed?: number;
  warning?: string;
  message?: string;
  budget?: { remaining: number; used: number; limit: number };
  error?: string;
};

const CONCURRENCY = 3;

export function mountFlightSearch(root: HTMLElement): void {
  const formEl = root.querySelector<HTMLFormElement>("#fs-form")!;
  const planSummary = root.querySelector<HTMLElement>("#fs-plan-summary")!;
  const banners = root.querySelector<HTMLElement>("#fs-banners")!;
  const progress = root.querySelector<HTMLElement>("#fs-progress")!;
  const results = root.querySelector<HTMLElement>("#fs-results")!;
  const footer = root.querySelector<HTMLElement>("#fs-footer")!;
  const planBtn = root.querySelector<HTMLButtonElement>("#fs-plan")!;
  const runBtn = root.querySelector<HTMLButtonElement>("#fs-run")!;
  const unverifiedWrap = root.querySelector<HTMLElement>("#fs-unverified-wrap")!;

  populateSelects(root);
  let form = formStateFromSearchParams(new URLSearchParams(location.search));
  applyFormToDom(root, form);
  syncUnverifiedVisibility(form, unverifiedWrap);
  runBtn.disabled = true;

  root.querySelector("#fs-swap")?.addEventListener("click", () => {
    form = readForm(root);
    const tmp = form.origin;
    form.origin = form.dest;
    form.dest = tmp;
    applyFormToDom(root, form);
    syncUrl(form);
  });

  formEl.addEventListener("change", () => {
    form = readForm(root);
    syncUnverifiedVisibility(form, unverifiedWrap);
    syncUrl(form);
    runBtn.disabled = true;
    planSummary.textContent = "Plan the search to see call count and budget.";
  });

  planBtn.addEventListener("click", async () => {
    form = readForm(root);
    syncUrl(form);
    banners.innerHTML = "";
    planSummary.textContent = "Planning…";
    runBtn.disabled = true;

    const spec = formStateToLegSearch(form);
    const res = await fetch("/api/flights/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spec),
    });
    const data = (await res.json()) as PlanResponse;
    if (!data.ok || !data.plan) {
      planSummary.textContent = `Plan failed: ${data.message ?? data.error ?? res.status}`;
      return;
    }

    const cached = data.cachedSteps ?? 0;
    const uncached = data.uncachedCalls ?? data.plan.callCount;
    const remaining = data.budget?.remaining ?? 0;
    planSummary.textContent = `This search = ${data.plan.callCount} API calls (${cached} cached, ${remaining} budget remaining). Run?`;

    if (!data.canRun) {
      runBtn.disabled = true;
      banners.innerHTML = `<div class="fs-banner fs-banner-danger">Uncached calls (${uncached}) exceed remaining daily budget (${remaining}). Reduce days or wait for cache/budget reset.</div>`;
      return;
    }

    runBtn.disabled = false;
    (runBtn as HTMLButtonElement & { _plan?: PlanResponse })._plan = data;
  });

  runBtn.addEventListener("click", async () => {
    form = readForm(root);
    const planData = (runBtn as HTMLButtonElement & { _plan?: PlanResponse })._plan;
    if (!planData?.plan) return;

    runBtn.disabled = true;
    planBtn.disabled = true;
    banners.innerHTML = "";
    results.innerHTML = "";
    footer.innerHTML = "";
    progress.textContent = "Running…";

    const spec = formStateToLegSearch(form);
    const stats = {
      callsMade: 0,
      cacheHits: 0,
      optionsParsed: 0,
      optionsPassingFilters: 0,
    };
    const allOptions: ItineraryOption[] = [];
    const stepErrors: Array<{ stepIndex: number; message: string }> = [];
    let quotaBannerShown = false;

    await mapPool(planData.plan.steps, CONCURRENCY, async (step) => {
      const outcome = await runStep(spec, step, form.accessToken);
      if (outcome.cacheHit) stats.cacheHits += 1;
      else if (!outcome.cacheOnly) stats.callsMade += 1;

      if (outcome.cacheOnly && !quotaBannerShown) {
        quotaBannerShown = true;
        banners.innerHTML += `<div class="fs-banner fs-banner-warn">Daily quota reached — cached results only.</div>`;
      }

      if (outcome.warning === "step_failed") {
        stepErrors.push({
          stepIndex: step.stepIndex,
          message: outcome.message ?? "step failed",
        });
        const err = document.createElement("p");
        err.className = "fs-step-error";
        err.textContent = `Step ${step.stepIndex} (${step.date}): ${outcome.message ?? "failed"}`;
        results.appendChild(err);
      }

      stats.optionsParsed += outcome.optionsParsed ?? 0;
      if (outcome.options?.length) {
        allOptions.push(...outcome.options);
        stats.optionsPassingFilters = allOptions.length;
        renderResults(results, allOptions, spec);
      }

      const done =
        stats.callsMade + stats.cacheHits + stepErrors.length;
      progress.textContent = `Progress: ${Math.min(done, planData.plan!.callCount)}/${planData.plan!.callCount} · cache hits ${stats.cacheHits} · live calls ${stats.callsMade}`;
    });

    const searchResult = {
      spec,
      options: allOptions,
      grouped: groupByDate(allOptions, spec.topN),
      stats,
      stepErrors,
    };

    footer.innerHTML = `
      <span>Calls made: ${stats.callsMade}</span>
      <span>Cache hits: ${stats.cacheHits}</span>
      <span>Options parsed: ${stats.optionsParsed}</span>
      <span>Passing filters: ${stats.optionsPassingFilters}</span>
      <a id="fs-download" href="#">Download JSON</a>
    `;
    footer.querySelector("#fs-download")?.addEventListener("click", (e) => {
      e.preventDefault();
      const blob = new Blob([JSON.stringify(searchResult, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `flight-search-${spec.dateRange.start}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    progress.textContent = `Done. ${stats.callsMade} live calls, ${stats.cacheHits} cache hits.`;
    planBtn.disabled = false;
    runBtn.disabled = false;
  });
}

async function runStep(
  spec: LegSearch,
  step: PlanStep,
  accessToken?: string,
): Promise<QueryResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["X-Search-Access-Token"] = accessToken;

  try {
    const res = await fetch("/api/flights/query", {
      method: "POST",
      headers,
      body: JSON.stringify({ spec, step }),
    });
    return (await res.json()) as QueryResponse;
  } catch (err) {
    return {
      ok: true,
      stepIndex: step.stepIndex,
      warning: "step_failed",
      message: err instanceof Error ? err.message : String(err),
      options: [],
    };
  }
}

function renderResults(
  container: HTMLElement,
  options: ItineraryOption[],
  spec: LegSearch,
): void {
  const grouped = groupByDate(options, spec.topN);
  const dates = Object.keys(grouped).sort();
  const html: string[] = [];
  for (const date of dates) {
    html.push(`<section class="fs-date-group"><h2>${formatDateHeader(date)}</h2>`);
    for (const option of grouped[date]!) {
      const line = formatResultRow(option, spec.lieFlatPolicy);
      const dest = option.destinationLabel ?? option.destinationAirport;
      const price = formatPrice(option.price, option.currency);
      const href = option.googleFlightsUrl
        ? ` href="${escapeAttr(option.googleFlightsUrl)}" target="_blank" rel="noopener noreferrer"`
        : "";
      html.push(`
        <div class="fs-row">
          <a class="fs-row-desktop"${href}>${escapeHtml(line)}</a>
          <a class="fs-row-mobile"${href}>
            <div class="line1">${escapeHtml(price)} — ${escapeHtml(dest)}</div>
            <div class="line2">${escapeHtml(line.split(" — ").slice(2).join(" — "))}</div>
          </a>
        </div>
      `);
    }
    html.push("</section>");
  }
  container.innerHTML = html.join("");
}

function groupByDate(
  options: ItineraryOption[],
  topN: number,
): Record<string, ItineraryOption[]> {
  const buckets = new Map<string, ItineraryOption[]>();
  for (const option of options) {
    const list = buckets.get(option.departureDate) ?? [];
    list.push(option);
    buckets.set(option.departureDate, list);
  }
  const out: Record<string, ItineraryOption[]> = {};
  for (const [date, list] of buckets) {
    out[date] = [...list]
      .sort((a, b) => a.price - b.price)
      .slice(0, topN);
  }
  return out;
}

function populateSelects(root: HTMLElement): void {
  const registry = listRegistryOptions();
  for (const sel of root.querySelectorAll<HTMLSelectElement>("[data-registry]")) {
    sel.innerHTML = registry
      .map((o) => `<option value="${escapeAttr(o.id)}">${escapeHtml(o.label)}</option>`)
      .join("");
  }
  const modeSel = root.querySelector<HTMLSelectElement>("#fs-mode")!;
  modeSel.innerHTML = SEARCH_MODES.map(
    (m) => `<option value="${m.id}">${escapeHtml(m.label)}</option>`,
  ).join("");
}

function applyFormToDom(root: HTMLElement, form: FormState): void {
  setVal(root, "#fs-origin-reg", form.origin);
  setVal(root, "#fs-dest-reg", form.dest);
  setVal(root, "#fs-origin-iata", looksLikeIata(form.origin) ? form.origin : "");
  setVal(root, "#fs-dest-iata", looksLikeIata(form.dest) ? form.dest : "");
  setVal(root, "#fs-mode", form.mode);
  setVal(root, "#fs-days", String(form.days));
  setVal(root, "#fs-max-stops", String(form.maxStops));
  setVal(root, "#fs-topn", String(form.topN));
  setVal(root, "#fs-start", form.start);
  const unverified = root.querySelector<HTMLInputElement>("#fs-unverified");
  if (unverified) unverified.checked = form.includeUnverified;
  const deep = root.querySelector<HTMLInputElement>("#fs-deep");
  if (deep) deep.checked = form.deepSearch;
  const token = root.querySelector<HTMLInputElement>("#fs-token");
  if (token && form.accessToken) token.value = form.accessToken;
}

function readForm(root: HTMLElement): FormState {
  const originIata = (
    root.querySelector<HTMLInputElement>("#fs-origin-iata")?.value ?? ""
  )
    .trim()
    .toUpperCase();
  const destIata = (
    root.querySelector<HTMLInputElement>("#fs-dest-iata")?.value ?? ""
  )
    .trim()
    .toUpperCase();
  const originReg =
    root.querySelector<HTMLSelectElement>("#fs-origin-reg")?.value ?? "EZE";
  const destReg =
    root.querySelector<HTMLSelectElement>("#fs-dest-reg")?.value ??
    DEFAULT_FORM.dest;
  const modeId =
    root.querySelector<HTMLSelectElement>("#fs-mode")?.value ??
    "business-lie-flat";
  const mode = getSearchMode(modeId) ?? getSearchMode("business-lie-flat")!;

  const base = defaultFormState(
    root.querySelector<HTMLInputElement>("#fs-start")?.value || undefined,
  );
  return {
    ...base,
    origin: looksLikeIata(originIata) ? originIata : originReg,
    dest: looksLikeIata(destIata) ? destIata : destReg,
    mode: mode.id,
    cabin: mode.cabin,
    lieFlatPolicy: mode.lieFlatPolicy,
    start:
      root.querySelector<HTMLInputElement>("#fs-start")?.value || base.start,
    days: Number(root.querySelector<HTMLInputElement>("#fs-days")?.value) || 7,
    maxStops:
      Number(root.querySelector<HTMLSelectElement>("#fs-max-stops")?.value) ===
      2
        ? 2
        : 1,
    topN: Number(root.querySelector<HTMLInputElement>("#fs-topn")?.value) || 2,
    includeUnverified:
      root.querySelector<HTMLInputElement>("#fs-unverified")?.checked ?? false,
    deepSearch:
      root.querySelector<HTMLInputElement>("#fs-deep")?.checked ?? false,
    accessToken:
      root.querySelector<HTMLInputElement>("#fs-token")?.value || undefined,
  };
}

function syncUrl(form: FormState): void {
  const params = formStateToSearchParams(form);
  const next = `${location.pathname}?${params.toString()}`;
  history.replaceState(null, "", next);
}

function syncUnverifiedVisibility(
  form: FormState,
  wrap: HTMLElement,
): void {
  wrap.hidden = !modeInvolvesLieFlat(form.lieFlatPolicy);
}

function looksLikeIata(value: string): boolean {
  return /^[A-Z]{3}$/.test(value);
}

function setVal(root: HTMLElement, sel: string, value: string): void {
  const el = root.querySelector<HTMLInputElement | HTMLSelectElement>(sel);
  if (el) el.value = value;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

async function mapPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const current = index;
      index += 1;
      await fn(items[current]!);
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
}
