import {
  formatDateHeader,
  formatDuration,
  formatPrice,
} from "../../lib/flights/format";
import { SEARCHAPI_ESTIMATED_COST_PER_SEARCH_USD } from "../../lib/flights/constants";
import {
  groupCheapestByCityAndDate,
  groupResults,
  orderedGroupKeys,
} from "../../lib/flights/group";
import { airportCity, airportLabel } from "../../lib/flights/locations";
import {
  defaultCityGroupSide,
  isAnywhereToAnywhere,
  listRegistryOptionSections,
} from "../../lib/flights/resolver";
import {
  SEARCH_MODES,
  getSearchMode,
  modeInvolvesLieFlat,
} from "../../lib/flights/modes";
import {
  MAX_TOTAL_HOURS_OPTIONS,
  type CityGroupSide,
  type CityGroupSort,
  type DateGroupSort,
  type ItineraryOption,
  type LegSearch,
  type MaxTotalHours,
  type PlanStep,
  type QueryPlan,
} from "../../lib/flights/types";
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
  searchesUsed?: number;
  options?: ItineraryOption[];
  optionsParsed?: number;
  warning?: string;
  message?: string;
  budget?: { remaining: number; used: number; limit: number };
  error?: string;
};

const ONE_WAY_CONCURRENCY = 6;
const ROUND_TRIP_CONCURRENCY = 3;

export function mountFlightSearch(root: HTMLElement): void {
  const formEl = root.querySelector<HTMLFormElement>("#fs-form")!;
  const searchSummary = root.querySelector<HTMLElement>("#fs-search-summary")!;
  const banners = root.querySelector<HTMLElement>("#fs-banners")!;
  const progress = root.querySelector<HTMLElement>("#fs-progress")!;
  const results = root.querySelector<HTMLElement>("#fs-results")!;
  const footer = root.querySelector<HTMLElement>("#fs-footer")!;
  const runBtn = root.querySelector<HTMLButtonElement>("#fs-run")!;
  const cancelBtn = root.querySelector<HTMLButtonElement>("#fs-cancel")!;
  const daysInput = root.querySelector<HTMLInputElement>("#fs-days")!;
  const daysValue = root.querySelector<HTMLElement>("#fs-days-value")!;
  const resultsToolbar = root.querySelector<HTMLElement>("#fs-results-toolbar")!;
  const sortSelect = root.querySelector<HTMLSelectElement>("#fs-sort")!;
  const groupCityToggle = root.querySelector<HTMLInputElement>("#fs-group-city")!;
  const citySideWrap = root.querySelector<HTMLElement>("#fs-city-side-wrap")!;
  const citySideSelect = root.querySelector<HTMLSelectElement>("#fs-city-side")!;
  const citySortWrap = root.querySelector<HTMLElement>("#fs-city-sort-wrap")!;
  const citySortSelect = root.querySelector<HTMLSelectElement>("#fs-city-sort")!;
  const progressDock = root.querySelector<HTMLElement>("#fs-search-progress")!;
  const progressTrack = root.querySelector<HTMLElement>(
    "#fs-search-progress-track",
  )!;
  const progressFill = root.querySelector<HTMLElement>(
    "#fs-search-progress-fill",
  )!;
  const progressLabel = root.querySelector<HTMLElement>(
    "#fs-search-progress-label",
  )!;
  const progressCount = root.querySelector<HTMLElement>(
    "#fs-search-progress-count",
  )!;

  populateSelects(root);
  let form = formStateFromSearchParams(
    new URLSearchParams(location.search),
    todayLocalDate(),
  );
  applyFormToDom(root, form);
  syncDaysLabel(daysInput, daysValue);
  syncTripFields(root, form.tripType);
  let isRunning = false;
  let activeController: AbortController | undefined;
  let progressHideTimer: ReturnType<typeof setTimeout> | undefined;
  let latestOptions: ItineraryOption[] = [];
  let latestSpec: LegSearch | null = null;
  let citySideRouteKey = `${form.origin}|${form.dest}`;
  let citySideManual = false;

  function currentSort(): DateGroupSort {
    return sortSelect.value === "cheapest_day" ? "cheapest_day" : "date";
  }

  function currentGroupByCity(): boolean {
    return groupCityToggle.checked;
  }

  function currentCitySort(): CityGroupSort {
    const value = citySortSelect.value;
    if (value === "alpha" || value === "price_per_distance") return value;
    return "cheapest_city";
  }

  function currentCitySide(): CityGroupSide {
    return citySideSelect.value === "arrival" ? "arrival" : "departure";
  }

  function syncCityGroupControls(): void {
    const grouped = currentGroupByCity();
    citySideWrap.hidden = !grouped;
    citySortWrap.hidden = !grouped;
  }

  function syncCitySideDefault(): void {
    const routeKey = `${form.origin}|${form.dest}`;
    if (routeKey !== citySideRouteKey) {
      citySideRouteKey = routeKey;
      citySideManual = false;
    }
    if (!citySideManual) {
      citySideSelect.value = defaultCityGroupSide(form.origin, form.dest);
    }
  }

  syncCitySideDefault();

  function showResults(options: ItineraryOption[], spec: LegSearch): void {
    latestOptions = options;
    latestSpec = spec;
    resultsToolbar.hidden = options.length === 0;
    syncCitySideDefault();
    syncCityGroupControls();
    renderResults(results, options, spec, {
      sort: currentSort(),
      groupByCity: currentGroupByCity(),
      citySort: currentCitySort(),
      citySide: currentCitySide(),
    });
  }

  function rerenderLatestResults(): void {
    if (!latestSpec || latestOptions.length === 0) return;
    syncCityGroupControls();
    renderResults(results, latestOptions, latestSpec, {
      sort: currentSort(),
      groupByCity: currentGroupByCity(),
      citySort: currentCitySort(),
      citySide: currentCitySide(),
    });
  }

  sortSelect.addEventListener("change", rerenderLatestResults);
  citySortSelect.addEventListener("change", rerenderLatestResults);
  citySideSelect.addEventListener("change", () => {
    citySideManual = true;
    rerenderLatestResults();
  });
  groupCityToggle.addEventListener("change", () => {
    if (groupCityToggle.checked) {
      citySideManual = false;
      syncCitySideDefault();
    }
    rerenderLatestResults();
  });

  // Registry select wins over leftover IATA text.
  for (const id of ["#fs-origin-reg", "#fs-dest-reg"] as const) {
    root.querySelector(id)?.addEventListener("change", (event) => {
      const select = event.target as HTMLSelectElement;
      const iataId = select.id === "fs-origin-reg" ? "#fs-origin-iata" : "#fs-dest-iata";
      const iata = root.querySelector<HTMLInputElement>(iataId);
      if (iata) iata.value = "";
      onFormChanged();
    });
  }

  // Typing a full IATA overrides the registry dropdown for that side.
  for (const id of ["#fs-origin-iata", "#fs-dest-iata"] as const) {
    root.querySelector(id)?.addEventListener("input", (event) => {
      const input = event.target as HTMLInputElement;
      input.value = input.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
      onFormChanged();
    });
  }

  root.querySelector("#fs-custom-airports")?.addEventListener("change", (event) => {
    const checked = (event.target as HTMLInputElement).checked;
    syncCustomAirportFields(root, checked);
    if (checked) {
      root.querySelector<HTMLInputElement>("#fs-origin-iata")?.focus();
      return;
    }
    setVal(root, "#fs-origin-iata", "");
    setVal(root, "#fs-dest-iata", "");
    onFormChanged();
  });

  root.querySelector("#fs-mode")?.addEventListener("change", () => {
    const modeId =
      root.querySelector<HTMLSelectElement>("#fs-mode")?.value ??
      DEFAULT_FORM.mode;
    const mode = getSearchMode(modeId);
    if (mode) {
      form = { ...form, mode: mode.id, cabin: mode.cabin, lieFlatPolicy: mode.lieFlatPolicy };
    }
    onFormChanged();
  });

  root.querySelector("#fs-round-trip")?.addEventListener("change", () => {
    const tripType = root.querySelector<HTMLInputElement>("#fs-round-trip")
      ?.checked
      ? "round_trip"
      : "one_way";
    syncTripFields(root, tripType);
    onFormChanged();
  });

  daysInput.addEventListener("input", () => {
    syncDaysLabel(daysInput, daysValue);
    onFormChanged();
  });

  root.querySelector("#fs-swap")?.addEventListener("click", () => {
    form = readForm(root, form);
    const tmp = form.origin;
    form.origin = form.dest;
    form.dest = tmp;
    applyFormToDom(root, form);
    syncUrl(form);
    syncCitySideDefault();
    invalidateSearch();
  });

  formEl.addEventListener("change", (event) => {
    const target = event.target as HTMLElement | null;
    // Registry/mode/days handled above with dedicated listeners.
    if (
      target?.id === "fs-origin-reg" ||
      target?.id === "fs-dest-reg" ||
      target?.id === "fs-mode" ||
      target?.id === "fs-round-trip" ||
      target?.id === "fs-custom-airports" ||
      target?.id === "fs-days"
    ) {
      return;
    }
    onFormChanged();
  });

  function onFormChanged(): void {
    form = readForm(root, form);
    syncUrl(form);
    syncCitySideDefault();
    invalidateSearch();
  }

  function routeBlockedMessage(state: FormState): string | null {
    if (isAnywhereToAnywhere(state.origin, state.dest)) {
      return "Anywhere to Anywhere is not supported. Choose a specific origin or destination.";
    }
    return null;
  }

  function invalidateSearch(): void {
    const blocked = routeBlockedMessage(form);
    runBtn.disabled = isRunning || Boolean(blocked);
    hideSearchProgress();
    searchSummary.textContent = blocked
      ? blocked
      : "Ready to search. Cached results are reused automatically.";
    banners.innerHTML = blocked
      ? `<div class="fs-banner fs-banner-warn">${escapeHtml(blocked)}</div>`
      : "";
    progress.textContent = "";
    results.innerHTML = "";
    footer.innerHTML = "";
    resultsToolbar.hidden = true;
    latestOptions = [];
    latestSpec = null;
  }

  // Honor route rules for URL-prefilled Anywhere→Anywhere (and clear stale UI).
  invalidateSearch();

  function setSearchBusy(busy: boolean, label = "Search flights"): void {
    isRunning = busy;
    for (const control of Array.from(formEl.elements)) {
      if (
        control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement ||
        control instanceof HTMLButtonElement
      ) {
        control.disabled = control === cancelBtn ? !busy : busy;
      }
    }
    cancelBtn.hidden = !busy;
    runBtn.textContent = label;
    if (busy) runBtn.setAttribute("aria-busy", "true");
    else {
      runBtn.removeAttribute("aria-busy");
      // Keep Search disabled if the current route is Anywhere→Anywhere.
      runBtn.disabled = Boolean(routeBlockedMessage(form));
    }
  }

  cancelBtn.addEventListener("click", () => {
    activeController?.abort();
    cancelBtn.disabled = true;
    progress.textContent = "Cancelling…";
  });

  function showSearchProgress(
    label: string,
    completed?: number,
    total?: number,
  ): void {
    if (progressHideTimer) clearTimeout(progressHideTimer);
    progressDock.hidden = false;
    progressLabel.textContent = label;

    if (typeof completed === "number" && typeof total === "number" && total > 0) {
      const percent = Math.min(100, Math.max(0, (completed / total) * 100));
      progressDock.classList.remove("is-indeterminate");
      progressFill.style.transform = `scaleX(${percent / 100})`;
      progressCount.textContent = `${completed} of ${total}`;
      progressTrack.setAttribute("aria-valuenow", String(Math.round(percent)));
      return;
    }

    progressDock.classList.add("is-indeterminate");
    progressFill.style.removeProperty("transform");
    progressCount.textContent = "";
    progressTrack.removeAttribute("aria-valuenow");
  }

  function hideSearchProgress(): void {
    if (progressHideTimer) clearTimeout(progressHideTimer);
    progressDock.hidden = true;
    progressDock.classList.remove("is-indeterminate");
    progressFill.style.removeProperty("transform");
    progressTrack.removeAttribute("aria-valuenow");
  }

  function completeSearchProgress(total: number): void {
    showSearchProgress("Search complete", total, total);
    progressHideTimer = setTimeout(hideSearchProgress, 900);
  }

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isRunning) return;

    form = readForm(root, form);
    const blocked = routeBlockedMessage(form);
    if (blocked) {
      invalidateSearch();
      return;
    }

    const controller = new AbortController();
    activeController = controller;
    const spec = formStateToLegSearch(form);
    syncUrl(form);
    setSearchBusy(true, "Checking…");
    showSearchProgress("Preparing search");
    banners.innerHTML = "";
    results.innerHTML = "";
    footer.innerHTML = "";
    resultsToolbar.hidden = true;
    latestOptions = [];
    latestSpec = null;
    progress.textContent = "";
    searchSummary.textContent = `Checking cache for ${spec.dateRange.days + 1} dates (start date + ${spec.dateRange.days} ${
      spec.dateRange.days === 1 ? "day" : "days"
    }) and daily budget…`;

    let planData: PlanResponse;
    try {
      const res = await fetch("/api/flights/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
        signal: controller.signal,
      });
      planData = (await res.json()) as PlanResponse;
    } catch (err) {
      if (controller.signal.aborted) {
        searchSummary.textContent = "Search cancelled.";
        hideSearchProgress();
        setSearchBusy(false);
        return;
      }
      searchSummary.textContent = `Search failed: ${err instanceof Error ? err.message : String(err)}`;
      hideSearchProgress();
      setSearchBusy(false);
      return;
    }

    if (!planData.ok || !planData.plan) {
      searchSummary.textContent = `Search failed: ${planData.message ?? planData.error ?? "unknown error"}`;
      hideSearchProgress();
      setSearchBusy(false);
      return;
    }

    const cached = planData.cachedSteps ?? 0;
    const uncached = planData.uncachedCalls ?? planData.plan.callCount;
    const remaining = planData.budget?.remaining ?? 0;
    if (!planData.canRun) {
      searchSummary.textContent = "Search not started.";
      banners.innerHTML = `<div class="fs-banner fs-banner-danger">Uncached calls (${uncached}) exceed remaining daily budget (${remaining}). Reduce the date range or try again later.</div>`;
      hideSearchProgress();
      setSearchBusy(false);
      return;
    }

    const totalSteps = planData.plan.callCount;
    if (spec.tripType === "round_trip") {
      const callLabel = uncached === 1 ? "call" : "calls";
      const batchLabel = totalSteps === 1 ? "date batch" : "date batches";
      searchSummary.textContent = `Up to ${uncached} new ${callLabel} · ${cached} cached · ${totalSteps} ${batchLabel} total · ${remaining} daily budget remaining.`;
    } else {
      const newLabel = uncached === 1 ? "search" : "searches";
      const totalLabel = totalSteps === 1 ? "search" : "searches";
      searchSummary.textContent = `${uncached} new ${newLabel} · ${cached} cached · ${totalSteps} total ${totalLabel} · ${remaining} daily budget remaining.`;
    }
    setSearchBusy(true, "Searching…");
    showSearchProgress("Searching flights", 0, planData.plan.callCount);
    results.setAttribute("aria-busy", "true");
    progress.textContent = "Starting search…";

    const stats = {
      callsMade: 0,
      cacheHits: 0,
      optionsParsed: 0,
      optionsPassingFilters: 0,
    };
    const allOptions: ItineraryOption[] = [];
    const seenIds = new Set<string>();
    const stepErrors: Array<{ stepIndex: number; message: string }> = [];
    let quotaBannerShown = false;
    let rateLimitBannerShown = false;
    let partialReturnFailures = 0;
    let completedSteps = 0;

    const concurrency =
      spec.tripType === "round_trip"
        ? ROUND_TRIP_CONCURRENCY
        : ONE_WAY_CONCURRENCY;
    await mapPool(planData.plan.steps, concurrency, async (step) => {
      if (controller.signal.aborted) return;
      const outcome = await runStep(spec, step, controller.signal);
      completedSteps += 1;

      if (outcome.cacheHit) stats.cacheHits += 1;
      stats.callsMade +=
        outcome.searchesUsed ??
        (!outcome.cacheHit &&
        !outcome.cacheOnly &&
        outcome.warning !== "step_failed"
          ? 1
          : 0);

      if (outcome.cacheOnly && !quotaBannerShown) {
        quotaBannerShown = true;
        banners.insertAdjacentHTML(
          "beforeend",
          outOfCreditBanner(
            "The site-wide daily search quota was reached — showing cached results only.",
          ),
        );
      }

      if (
        outcome.warning === "step_failed" ||
        (outcome.error && outcome.warning !== "cancelled")
      ) {
        const message =
          outcome.message ?? outcome.error ?? "step failed";
        stepErrors.push({ stepIndex: step.stepIndex, message });
        if (message === "rate_limited" && !rateLimitBannerShown) {
          rateLimitBannerShown = true;
          banners.insertAdjacentHTML(
            "beforeend",
            outOfCreditBanner(
              "Your daily search limit was reached — dates without cached results are skipped.",
            ),
          );
        }
      }
      if (outcome.warning === "partial_return_results") {
        partialReturnFailures += 1;
      }

      stats.optionsParsed += outcome.optionsParsed ?? 0;
      if (outcome.options?.length) {
        for (const option of outcome.options) {
          if (seenIds.has(option.id)) continue;
          seenIds.add(option.id);
          allOptions.push(option);
        }
        stats.optionsPassingFilters = allOptions.length;
        showResults(allOptions, spec);
      }

      progress.textContent = formatSearchProgress(
        `Progress: ${completedSteps}/${planData.plan!.callCount} · cache hits ${stats.cacheHits} · live calls ${stats.callsMade}`,
        allOptions,
      );
      showSearchProgress(
        "Searching flights",
        completedSteps,
        planData.plan!.callCount,
      );
    });

    const wasCancelled = controller.signal.aborted;
    activeController = undefined;

    if (allOptions.length === 0) {
      const advice = noResultsAdvice(spec);
      results.insertAdjacentHTML(
        "afterbegin",
        `<div class="fs-empty"><strong>No matching flights found.</strong><span>${escapeHtml(advice)}</span></div>`,
      );
    }
    if (partialReturnFailures > 0) {
      banners.insertAdjacentHTML(
        "beforeend",
        `<div class="fs-banner fs-banner-warn">Partial results: ${partialReturnFailures} search ${
          partialReturnFailures === 1 ? "batch" : "batches"
        } could not load every return-flight option.</div>`,
      );
    }
    if (stepErrors.length > 0) {
      const details = stepErrors
        .slice(0, 12)
        .map(
          (error) =>
            `<li>Batch ${error.stepIndex + 1}: ${escapeHtml(error.message)}</li>`,
        )
        .join("");
      banners.insertAdjacentHTML(
        "beforeend",
        `<details class="fs-error-details"><summary>${stepErrors.length} failed ${
          stepErrors.length === 1 ? "batch" : "batches"
        }</summary><ul>${details}</ul></details>`,
      );
    }

    const searchResult = {
      spec,
      options: allOptions,
      grouped: groupResults(allOptions, { groupBy: "date", topN: spec.topN }),
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

    progress.textContent = formatSearchProgress(
      wasCancelled
        ? `Cancelled after ${completedSteps} of ${planData.plan.callCount} batches. Partial results are shown.`
        : `Done. ${stats.callsMade} live calls, ${stats.cacheHits} cache hits.`,
      allOptions,
    );
    renderCostSummary(searchSummary, stats.callsMade, stats.cacheHits);
    results.removeAttribute("aria-busy");
    if (wasCancelled) hideSearchProgress();
    else completeSearchProgress(planData.plan.callCount);
    setSearchBusy(false);
  });
}

function outOfCreditBanner(reason: string): string {
  return `<div class="fs-banner fs-banner-warn">${escapeHtml(reason)} Limits reset daily.<span class="fs-banner-contact">Need larger limits? Email <a href="mailto:sokolx@gmail.com">sokolx@gmail.com</a> or DM <a href="https://x.com/nsokolsky" target="_blank" rel="noopener noreferrer">@nsokolsky</a> on X.</span></div>`;
}

function optionCity(option: ItineraryOption, side: CityGroupSide): string {
  if (side === "departure") {
    const code = option.segments[0]?.departureAirport ?? "unknown";
    return option.originCity ?? airportCity(code);
  }
  return option.destinationCity ?? airportCity(option.destinationAirport);
}

function countDistinctCities(
  options: ItineraryOption[],
  side: CityGroupSide,
): number {
  const cities = new Set<string>();
  for (const option of options) cities.add(optionCity(option, side));
  return cities.size;
}

/**
 * Distinct cities on the busier side of the route (arrival or departure).
 * Avoids undercounting when the city-group control is set to the single-city side.
 */
function countCitiesFound(options: ItineraryOption[]): number {
  return Math.max(
    countDistinctCities(options, "departure"),
    countDistinctCities(options, "arrival"),
  );
}

/** Append "Cities found" when more than two distinct cities appear in results. */
function formatSearchProgress(
  base: string,
  options: ItineraryOption[],
): string {
  const cities = countCitiesFound(options);
  if (cities <= 2) return base;
  return `${base} · Cities found: ${cities}`;
}

function renderCostSummary(
  container: HTMLElement,
  searchesUsed: number,
  cacheHits: number,
): void {
  const estimatedCost =
    searchesUsed * SEARCHAPI_ESTIMATED_COST_PER_SEARCH_USD;
  const formattedCost = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(estimatedCost);
  const searchLabel = searchesUsed === 1 ? "search" : "searches";

  container.replaceChildren();
  const cost = document.createElement("strong");
  cost.textContent = `Approx. SearchAPI cost: ${formattedCost}`;
  const detail = document.createTextNode(
    ` · ${searchesUsed} billable ${searchLabel} at $4 / 1,000 · ${cacheHits} cached (free)`,
  );
  container.append(cost, detail);
}

async function runStep(
  spec: LegSearch,
  step: PlanStep,
  signal?: AbortSignal,
): Promise<QueryResponse> {
  try {
    const res = await fetch("/api/flights/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec, step }),
      signal,
    });
    const data = (await res.json()) as QueryResponse;
    if (!data.ok && !data.warning) {
      return {
        ok: true,
        stepIndex: step.stepIndex,
        warning: "step_failed",
        message: data.error ?? `HTTP ${res.status}`,
        options: [],
      };
    }
    return data;
  } catch (err) {
    if (signal?.aborted || (err instanceof Error && err.name === "AbortError")) {
      return {
        ok: true,
        stepIndex: step.stepIndex,
        warning: "cancelled",
        message: "cancelled",
        options: [],
      };
    }
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
  view: {
    sort?: DateGroupSort;
    groupByCity?: boolean;
    citySort?: CityGroupSort;
    citySide?: CityGroupSide;
  } = {},
): void {
  const sort = view.sort ?? "date";
  const errors = [...container.querySelectorAll(".fs-step-error")];
  const html = view.groupByCity
    ? renderCityGroupedResults(
        options,
        spec,
        sort,
        view.citySort ?? "cheapest_city",
        view.citySide ?? "departure",
      )
    : renderDateGroupedResults(options, spec, sort);
  container.innerHTML = html;
  for (const err of errors) container.appendChild(err);
}

function renderDateGroupedResults(
  options: ItineraryOption[],
  spec: LegSearch,
  sort: DateGroupSort,
): string {
  const grouped = groupResults(options, { groupBy: "date", topN: spec.topN });
  const dates = orderedGroupKeys(grouped, sort);
  const html: string[] = [];
  for (const date of dates) {
    const dateOptions = grouped[date]!;
    const optionLabel = dateOptions.length === 1 ? "option" : "options";
    const cheapest = dateOptions[0];
    const dayMeta =
      sort === "cheapest_day" && cheapest
        ? `${formatPrice(cheapest.price, cheapest.currency)} · ${dateOptions.length} ${optionLabel}`
        : `${dateOptions.length} ${optionLabel}`;
    html.push(`
      <section class="fs-date-group">
        <header class="fs-date-heading">
          <h2>${formatDateHeader(date)}</h2>
          <span>${escapeHtml(dayMeta)}</span>
        </header>
        <div class="fs-result-list">
          ${dateOptions.map((option) => renderResultCard(option, spec)).join("")}
        </div>
      </section>
    `);
  }
  return html.join("");
}

function renderCityGroupedResults(
  options: ItineraryOption[],
  spec: LegSearch,
  sort: DateGroupSort,
  citySort: CityGroupSort,
  citySide: CityGroupSide,
): string {
  const cities = groupCheapestByCityAndDate(
    options,
    sort,
    citySort,
    citySide,
  );
  const html: string[] = [];
  for (const cityGroup of cities) {
    const dayLabel = cityGroup.dates.length === 1 ? "day" : "days";
    const cheapest = cityGroup.dates.reduce(
      (best, entry) =>
        !best || entry.option.price < best.price ? entry.option : best,
      undefined as ItineraryOption | undefined,
    );
    const cityMeta = cheapest
      ? `${cityGroup.dates.length} ${dayLabel} · from ${formatPrice(cheapest.price, cheapest.currency)}`
      : `${cityGroup.dates.length} ${dayLabel}`;
    const [first, ...rest] = cityGroup.dates;
    html.push(`
      <section class="fs-city-group">
        <header class="fs-city-heading">
          <h2>${escapeHtml(cityGroup.city)}</h2>
          <span>${escapeHtml(cityMeta)}</span>
        </header>
        ${first ? renderCityDateBlock(first.date, first.option, spec) : ""}
    `);
    if (rest.length > 0) {
      const moreLabel =
        rest.length === 1 ? "1 more day" : `${rest.length} more days`;
      html.push(`
        <details class="fs-city-expand">
          <summary>
            <span class="fs-city-expand-label-closed">Expand · ${escapeHtml(moreLabel)}</span>
            <span class="fs-city-expand-label-open">Collapse</span>
          </summary>
          <div class="fs-city-expand-body">
            ${rest
              .map(({ date, option }) =>
                renderCityDateBlock(date, option, spec),
              )
              .join("")}
          </div>
        </details>
      `);
    }
    html.push("</section>");
  }
  return html.join("");
}

function renderCityDateBlock(
  date: string,
  option: ItineraryOption,
  spec: LegSearch,
): string {
  return `
    <section class="fs-date-group fs-date-group-nested">
      <header class="fs-date-heading">
        <h3>${formatDateHeader(date)}</h3>
        <span>${escapeHtml(formatPrice(option.price, option.currency))}</span>
      </header>
      <div class="fs-result-list">
        ${renderResultCard(option, spec)}
      </div>
    </section>
  `;
}

function renderResultCard(option: ItineraryOption, spec: LegSearch): string {
  const firstSegment = option.segments[0]!;
  const lastSegment = option.segments.at(-1)!;
  const origin = airportLabel(firstSegment.departureAirport);
  const dest = option.destinationLabel ?? option.destinationAirport;
  const price = formatPrice(option.price, option.currency);
  const tripDurationDays = option.returnDate
    ? differenceInCalendarDays(option.departureDate, option.returnDate)
    : undefined;
  const outboundLeg = renderResultLeg(option, spec, {
    label: option.returnSegments?.length ? "Outbound" : undefined,
  });
  let returnMarkup = "";
  if (option.returnSegments?.length) {
    const returnOption: ItineraryOption = {
      ...option,
      segments: option.returnSegments,
      layovers: option.returnLayovers ?? [],
      totalDurationMinutes:
        option.returnDurationMinutes ??
        option.returnSegments.reduce(
          (total, segment) => total + segment.durationMinutes,
          0,
        ),
    };
    returnMarkup = renderResultLeg(returnOption, spec, {
      label: `Return · ${formatDateHeader(option.returnDate ?? "")}`,
      extraClass: "fs-result-leg-return",
      showDuration: true,
    });
  }
  const tag = option.googleFlightsUrl ? "a" : "div";
  const href = option.googleFlightsUrl
    ? ` href="${escapeAttr(option.googleFlightsUrl)}" target="_blank" rel="noopener noreferrer"`
    : "";
  const unavailableClass = option.googleFlightsUrl ? "" : " fs-result-unavailable";
  return `
    <${tag} class="fs-result${unavailableClass}"${href}>
      <div class="fs-result-price">
        <strong>${escapeHtml(price)}</strong>
        <span class="fs-result-od">
          <span>${escapeHtml(origin)}</span>
          <span class="fs-result-od-arrow" aria-hidden="true">→</span>
          <span>${escapeHtml(dest)}</span>
        </span>
        ${
          tripDurationDays
            ? `<span class="fs-result-trip-length">${tripDurationDays}-day round trip</span>`
            : ""
        }
      </div>
      <div class="fs-result-journey">
        ${outboundLeg}
        ${returnMarkup}
      </div>
      <div class="fs-result-duration">
        <strong>${formatDuration(option.totalDurationMinutes)}</strong>
        <span>${escapeHtml(firstSegment.departureAirport)}–${escapeHtml(lastSegment.arrivalAirport)}</span>
      </div>
      ${option.googleFlightsUrl ? '<span class="fs-result-arrow" aria-hidden="true">↗</span>' : ""}
    </${tag}>
  `;
}

function differenceInCalendarDays(start: string, end: string): number | undefined {
  const startTime = Date.parse(`${start}T00:00:00Z`);
  const endTime = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return undefined;
  const days = Math.round((endTime - startTime) / 86_400_000);
  return days > 0 ? days : undefined;
}

function noResultsAdvice(spec: LegSearch): string {
  const suggestions: string[] = [];
  const nextMaxHours = MAX_TOTAL_HOURS_OPTIONS.find(
    (hours) => hours > spec.maxTotalHours,
  );

  if (nextMaxHours) {
    suggestions.push(
      `increase max total hours to ${nextMaxHours}h${
        spec.maxTotalHours <= 24 ? " or higher" : ""
      }`,
    );
  }
  if (spec.maxStops < 2) suggestions.push("allow up to 2 stops");
  if (modeInvolvesLieFlat(spec.lieFlatPolicy)) {
    suggestions.push("relax the lie-flat requirement");
  }
  if (spec.dateRange.days < 14) suggestions.push("widen the date range");

  if (suggestions.length === 0) {
    return "Try another cabin, route, or start date.";
  }
  if (suggestions.length === 1) return `Try to ${suggestions[0]}.`;

  return `Try to ${suggestions.slice(0, -1).join(", ")}, or ${
    suggestions.at(-1)!
  }.`;
}

function renderResultLeg(
  option: ItineraryOption,
  spec: LegSearch,
  opts: {
    label?: string;
    extraClass?: string;
    showDuration?: boolean;
  } = {},
): string {
  const first = option.segments[0]!;
  const last = option.segments.at(-1)!;
  const carriers = [...new Set(option.segments.map((segment) => segment.carrier))];
  const seatDetail = modeInvolvesLieFlat(spec.lieFlatPolicy)
    ? formatLieFlatSegments(option)
    : formatCabinDetail(option);
  const stopDetail = formatStops(option);
  const className = ["fs-result-leg", opts.extraClass].filter(Boolean).join(" ");
  const airportCodes = [
    first.departureAirport,
    ...option.segments.map((segment) => segment.arrivalAirport),
  ];
  const airportsMarkup = airportCodes
    .map((code, index) => {
      const codeHtml = `<span>${escapeHtml(code)}</span>`;
      if (index === 0) return codeHtml;
      return `<span class="fs-result-route-sep" aria-hidden="true"></span>${codeHtml}`;
    })
    .join("");
  const metaParts = [
    `<span class="fs-result-stops">${escapeHtml(stopDetail)}</span>`,
    `<span class="fs-result-carrier">${escapeHtml(carriers.join(" + "))}</span>`,
  ];
  if (seatDetail) {
    metaParts.push(
      `<span class="fs-seat-detail">${escapeHtml(seatDetail)}</span>`,
    );
  }
  if (opts.showDuration) {
    metaParts.push(
      `<span class="fs-result-leg-duration">${formatDuration(
        option.totalDurationMinutes,
      )}</span>`,
    );
  }
  return `
    <div class="${className}">
      ${
        opts.label
          ? `<span class="fs-result-leg-label">${escapeHtml(opts.label)}</span>`
          : ""
      }
      <div class="fs-result-schedule">
        <div class="fs-result-times">
          <time>${escapeHtml(formatClock(first.departureTime))}</time>
          <span class="fs-result-time-sep" aria-hidden="true"></span>
          <time>${escapeHtml(formatClock(last.arrivalTime))}</time>
        </div>
        <div class="fs-result-airports" aria-label="${escapeAttr(
          airportCodes.join(" to "),
        )}">${airportsMarkup}</div>
      </div>
      <div class="fs-result-meta">${metaParts.join("")}</div>
    </div>
  `;
}

function formatStops(option: ItineraryOption): string {
  if (option.layovers.length === 0) return "Nonstop";
  const count = option.layovers.length;
  const label = count === 1 ? "stop" : "stops";
  const details = option.layovers
    .map((layover) => `${layover.airport} ${formatDuration(layover.durationMinutes)}`)
    .join(" · ");
  return `${count} ${label} · ${details}`;
}

function formatClock(value: string): string {
  const match = value.match(/(?:^|\s)(\d{1,2}:\d{2})$/);
  return match?.[1] ?? (value || "—");
}

function formatLieFlatSegments(option: ItineraryOption): string {
  const segments = option.segments.filter(
    (segment) => segment.seatClassification === "lie_flat",
  );
  if (segments.length === 0) {
    return "No lie-flat segment";
  }
  return `Google lists lie-flat · ${segments
    .map((segment) => {
      const aircraft = segment.aircraft ? ` · ${segment.aircraft}` : "";
      return `${segment.departureAirport}–${segment.arrivalAirport}${aircraft}`;
    })
    .join(" / ")}`;
}

function formatCabinDetail(option: ItineraryOption): string {
  const longest = option.segments.reduce((current, segment) =>
    segment.durationMinutes > current.durationMinutes ? segment : current,
  );
  const cabin = longest.cabin?.replaceAll("_", " ") ?? "Cabin unknown";
  const rawLegroom =
    longest.legroom ??
    longest.amenities.find((amenity) => /legroom/i.test(amenity));
  if (!rawLegroom) return cabin;
  const legroom = rawLegroom
    .replace(/^Seat type\s+/i, "")
    .replace(/\bLegroom\b/g, "legroom");
  return `${cabin} · ${legroom}`;
}

function populateSelects(root: HTMLElement): void {
  const sections = listRegistryOptionSections();
  const registryHtml = sections
    .map((section) => {
      const options = section.options
        .map(
          (o) =>
            `<option value="${escapeAttr(o.id)}">${escapeHtml(o.label)}</option>`,
        )
        .join("");
      if (section.continent === null) return options;
      return `<optgroup label="${escapeAttr(section.continent)}">${options}</optgroup>`;
    })
    .join("");
  for (const sel of root.querySelectorAll<HTMLSelectElement>("[data-registry]")) {
    sel.innerHTML = registryHtml;
  }
  const modeSel = root.querySelector<HTMLSelectElement>("#fs-mode")!;
  modeSel.innerHTML = SEARCH_MODES.map(
    (m) => `<option value="${m.id}">${escapeHtml(m.label)}</option>`,
  ).join("");
}

function applyFormToDom(root: HTMLElement, form: FormState): void {
  const registryIds = new Set(
    [...root.querySelectorAll<HTMLSelectElement>("[data-registry]")[0]?.options ?? []].map(
      (o) => o.value,
    ),
  );

  // Registry ids (including airport entries like EZE) live in the dropdown.
  // The IATA box is only for raw override codes that aren't a registry selection.
  if (registryIds.has(form.origin)) {
    setVal(root, "#fs-origin-reg", form.origin);
    setVal(root, "#fs-origin-iata", "");
  } else {
    setVal(root, "#fs-origin-reg", DEFAULT_FORM.origin);
    setVal(root, "#fs-origin-iata", looksLikeIata(form.origin) ? form.origin : "");
  }

  if (registryIds.has(form.dest)) {
    setVal(root, "#fs-dest-reg", form.dest);
    setVal(root, "#fs-dest-iata", "");
  } else {
    setVal(root, "#fs-dest-reg", DEFAULT_FORM.dest);
    setVal(root, "#fs-dest-iata", looksLikeIata(form.dest) ? form.dest : "");
  }
  const hasCustomAirport =
    !registryIds.has(form.origin) || !registryIds.has(form.dest);
  const customAirports = root.querySelector<HTMLInputElement>(
    "#fs-custom-airports",
  );
  if (customAirports) customAirports.checked = hasCustomAirport;
  syncCustomAirportFields(root, hasCustomAirport);

  const matchingMode = SEARCH_MODES.find(
    (m) => m.cabin === form.cabin && m.lieFlatPolicy === form.lieFlatPolicy,
  );
  setVal(root, "#fs-mode", matchingMode?.id ?? form.mode);
  setVal(root, "#fs-trip-length", String(form.tripLengthDays));
  setVal(root, "#fs-days", String(form.days));
  setVal(root, "#fs-max-stops", String(form.maxStops));
  setVal(root, "#fs-max-hours", String(form.maxTotalHours));
  setVal(root, "#fs-topn", String(form.topN));
  setVal(root, "#fs-start", form.start);

  const startInput = root.querySelector<HTMLInputElement>("#fs-start");
  if (startInput) {
    const min = todayLocalDate();
    startInput.min = min;
    if (form.start < min) {
      startInput.value = min;
    }
  }

  const roundTrip = root.querySelector<HTMLInputElement>("#fs-round-trip");
  if (roundTrip) roundTrip.checked = form.tripType === "round_trip";
  const flexibleTripLength = root.querySelector<HTMLInputElement>(
    "#fs-flexible-trip-length",
  );
  if (flexibleTripLength) {
    flexibleTripLength.checked = form.flexibleTripLength;
  }
  syncTripFields(root, form.tripType);

  const daysInput = root.querySelector<HTMLInputElement>("#fs-days");
  const daysValue = root.querySelector<HTMLElement>("#fs-days-value");
  if (daysInput && daysValue) syncDaysLabel(daysInput, daysValue);
}

/**
 * Read the form. Cabin/policy follow the mode select when the mode changes;
 * otherwise preserve explicit cabin/policy (e.g. first via URL).
 */
function readForm(root: HTMLElement, prev: FormState): FormState {
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
    root.querySelector<HTMLSelectElement>("#fs-origin-reg")?.value ??
    DEFAULT_FORM.origin;
  const destReg =
    root.querySelector<HTMLSelectElement>("#fs-dest-reg")?.value ??
    DEFAULT_FORM.dest;
  const modeId =
    root.querySelector<HTMLSelectElement>("#fs-mode")?.value ??
    DEFAULT_FORM.mode;
  const mode = getSearchMode(modeId) ?? getSearchMode(DEFAULT_FORM.mode)!;

  const modeChanged = prev.mode !== mode.id;
  const cabin = modeChanged ? mode.cabin : prev.cabin;
  const lieFlatPolicy = modeChanged ? mode.lieFlatPolicy : prev.lieFlatPolicy;
  const maxTotalHoursValue = Number(
    root.querySelector<HTMLSelectElement>("#fs-max-hours")?.value,
  ) as MaxTotalHours;

  const base = defaultFormState(
    root.querySelector<HTMLInputElement>("#fs-start")?.value || undefined,
  );
  return {
    ...base,
    origin: looksLikeIata(originIata) ? originIata : originReg,
    dest: looksLikeIata(destIata) ? destIata : destReg,
    mode: mode.id,
    cabin,
    lieFlatPolicy,
    tripType: root.querySelector<HTMLInputElement>("#fs-round-trip")?.checked
      ? "round_trip"
      : "one_way",
    tripLengthDays: Math.min(
      85,
      Math.max(
        1,
        Number(
          root.querySelector<HTMLSelectElement>("#fs-trip-length")?.value,
        ) || base.tripLengthDays,
      ),
    ),
    flexibleTripLength:
      root.querySelector<HTMLInputElement>("#fs-flexible-trip-length")
        ?.checked ?? false,
    start:
      root.querySelector<HTMLInputElement>("#fs-start")?.value || base.start,
    days: Number(root.querySelector<HTMLInputElement>("#fs-days")?.value) || 7,
    maxStops: (() => {
      const raw = Number(
        root.querySelector<HTMLSelectElement>("#fs-max-stops")?.value,
      );
      if (raw === 0 || raw === 2) return raw;
      return 1;
    })(),
    maxTotalHours: MAX_TOTAL_HOURS_OPTIONS.includes(maxTotalHoursValue)
      ? maxTotalHoursValue
      : base.maxTotalHours,
    topN: Number(root.querySelector<HTMLInputElement>("#fs-topn")?.value) || 2,
    deepSearch: prev.deepSearch,
  };
}

function syncTripFields(
  root: HTMLElement,
  tripType: FormState["tripType"],
): void {
  const controls = root.querySelector<HTMLElement>("#fs-trip-controls");
  if (controls) controls.hidden = tripType !== "round_trip";
}

function syncCustomAirportFields(
  root: HTMLElement,
  visible: boolean,
): void {
  root
    .querySelector<HTMLInputElement>("#fs-custom-airports")
    ?.setAttribute("aria-expanded", String(visible));
  for (const selector of ["#fs-origin-iata", "#fs-dest-iata"] as const) {
    const input = root.querySelector<HTMLInputElement>(selector);
    if (input) input.hidden = !visible;
  }
  for (const location of root.querySelectorAll<HTMLElement>(".fs-loc")) {
    location.classList.toggle("has-custom-airport", visible);
  }
}

function syncUrl(form: FormState): void {
  const params = formStateToSearchParams(form);
  const next = `${location.pathname}?${params.toString()}`;
  history.replaceState(null, "", next);
}

function syncDaysLabel(
  daysInput: HTMLInputElement,
  daysValue: HTMLElement,
): void {
  daysValue.textContent = daysInput.value;
  const min = Number(daysInput.min) || 1;
  const max = Number(daysInput.max) || 14;
  const value = Number(daysInput.value);
  const percent = ((value - min) / (max - min)) * 100;
  daysInput.style.setProperty("--fs-days-percent", `${percent}%`);
  const unit = daysInput.ownerDocument.getElementById("fs-days-unit");
  if (unit) unit.textContent = daysInput.value === "1" ? "day" : "days";
  daysInput.setAttribute("aria-valuenow", daysInput.value);
}

function todayLocalDate(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
