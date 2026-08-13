import {
  airportDistanceKm,
  estimateFlightMinutes,
} from "../../lib/flights/airport-coords";
import {
  convertCurrency,
  parseSearchCurrency,
  type SearchCurrency,
} from "../../lib/flights/currency";
import {
  formatDateHeader,
  formatDuration,
  formatPrice,
} from "../../lib/flights/format";
import {
  groupCheapestByCityAndDate,
  groupResults,
  orderedGroupKeys,
} from "../../lib/flights/group";
import { airportCity, airportLabel } from "../../lib/flights/locations";
import {
  defaultCityGroupSide,
  involvesBelarusRegistry,
  isAnywhereToAnywhere,
  isRegistryLocation,
  listRegistryOptionSections,
} from "../../lib/flights/resolver";
import {
  SEARCH_MODES,
  getSearchMode,
  modeInvolvesLieFlat,
} from "../../lib/flights/modes";
import {
  lookupLieFlatTiersForSegments,
  tierBadgeClass,
} from "../../lib/flights/lie-flat-tiers";
import type { AirportLocationSuggestion } from "../../lib/flights/searchapi";
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
  DEFAULT_GROUPING_DEST,
  DEFAULT_GROUPING_ORIGIN,
  DEFAULT_START_OFFSET_DAYS,
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

/** Marks per-leg times in the route line as flight durations. */
const PLANE_ICON = `<svg class="fs-result-route-plane" viewBox="0 0 24 24" width="10" height="10" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"/></svg>`;
/** Marks layover waits in the same 10px glyph style as the plane. */
const CLOCK_ICON = `<svg class="fs-result-route-clock" viewBox="0 0 24 24" width="10" height="10" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M12 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;

export function mountFlightSearch(root: HTMLElement): void {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const formEl = root.querySelector<HTMLFormElement>("#fs-form")!;
  const searchSummary = root.querySelector<HTMLElement>("#fs-search-summary")!;
  const banners = root.querySelector<HTMLElement>("#fs-banners")!;
  const progress = root.querySelector<HTMLElement>("#fs-progress")!;
  const results = root.querySelector<HTMLElement>("#fs-results")!;
  const footer = root.querySelector<HTMLElement>("#fs-footer")!;
  const runBtn = root.querySelector<HTMLButtonElement>("#fs-run")!;
  const clearBtn = root.querySelector<HTMLButtonElement>("#fs-clear")!;
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
    defaultLocalStartDate(),
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
    if (
      value === "alpha" ||
      value === "price_per_distance" ||
      value === "distance"
    ) {
      return value;
    }
    return "cheapest_city";
  }

  function currentCitySide(): CityGroupSide {
    return citySideSelect.value === "arrival" ? "arrival" : "departure";
  }

  function currentCurrency(): SearchCurrency {
    const selected = root.querySelector<HTMLInputElement>(
      'input[name="fs-currency"]:checked',
    )?.value;
    return parseSearchCurrency(selected, form.currency);
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
      currency: currentCurrency(),
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
      currency: currentCurrency(),
    });
  }

  function closeAirportCities(): void {
    for (const el of results.querySelectorAll(".fs-route-code.is-open")) {
      el.classList.remove("is-open");
    }
  }

  results.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const code = target.closest(".fs-route-code.is-interactive");
    if (!(code instanceof HTMLElement) || !results.contains(code)) {
      closeAirportCities();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const willOpen = !code.classList.contains("is-open");
    closeAirportCities();
    if (willOpen) code.classList.add("is-open");
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Node && results.contains(target)) return;
    closeAirportCities();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAirportCities();
  });

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
  for (const input of root.querySelectorAll<HTMLInputElement>(
    'input[name="fs-currency"]',
  )) {
    input.addEventListener("change", () => {
      form = { ...form, currency: currentCurrency() };
      rerenderLatestResults();
    });
  }

  for (const id of ["#fs-origin-reg", "#fs-dest-reg"] as const) {
    root.querySelector(id)?.addEventListener("change", () => onFormChanged());
  }

  for (const side of ["origin", "destination"] as const) {
    const checkbox = root.querySelector<HTMLInputElement>(
      side === "origin" ? "#fs-origin-groupings" : "#fs-dest-groupings",
    );
    checkbox?.addEventListener("change", () => {
      const checked = Boolean(checkbox.checked);
      if (checked) {
        const select = root.querySelector<HTMLSelectElement>(
          side === "origin" ? "#fs-origin-reg" : "#fs-dest-reg",
        );
        const fallback =
          side === "origin" ? DEFAULT_GROUPING_ORIGIN : DEFAULT_GROUPING_DEST;
        if (select && !isRegistryLocation(select.value)) {
          select.value = fallback;
        }
        clearAirportSearchSide(root, side);
      }
      syncLocationMode(root, side, checked);
      onFormChanged();
      if (checked) {
        root
          .querySelector<HTMLSelectElement>(
            side === "origin" ? "#fs-origin-reg" : "#fs-dest-reg",
          )
          ?.focus({ preventScroll: true });
      } else {
        root
          .querySelector<HTMLInputElement>(
            side === "origin" ? "#fs-origin-query" : "#fs-dest-query",
          )
          ?.focus({ preventScroll: true });
      }
    });
  }

  mountAirportSearch(root, "origin", () => onFormChanged());
  mountAirportSearch(root, "destination", () => onFormChanged());

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
    const next: FormState = {
      ...form,
      origin: form.dest,
      dest: form.origin,
      originLabel: form.destLabel,
      destLabel: form.originLabel,
    };
    form = next;
    applyFormToDom(root, form);
    syncCitySideDefault();
    invalidateSearch();
  });

  clearBtn.addEventListener("click", () => {
    if (isRunning) return;
    form = defaultFormState(defaultLocalStartDate());
    applyFormToDom(root, form);
    clearUrl();
    syncCitySideDefault();
    invalidateSearch();
  });

  formEl.addEventListener("change", (event) => {
    const target = event.target as HTMLElement | null;
    // Registry/mode/days/groupings/autocomplete handled above.
    if (
      target?.id === "fs-origin-reg" ||
      target?.id === "fs-dest-reg" ||
      target?.id === "fs-mode" ||
      target?.id === "fs-round-trip" ||
      target?.id === "fs-origin-groupings" ||
      target?.id === "fs-dest-groupings" ||
      target?.id === "fs-origin-query" ||
      target?.id === "fs-dest-query" ||
      target?.id === "fs-days"
    ) {
      return;
    }
    onFormChanged();
  });

  function onFormChanged(): void {
    form = readForm(root, form);
    syncCitySideDefault();
    invalidateSearch();
  }

  function routeBlockedMessage(state: FormState): string | null {
    if (!state.origin || !state.dest) {
      return "Choose an origin and destination to search.";
    }
    if (isAnywhereToAnywhere(state.origin, state.dest)) {
      return "Anywhere to Anywhere is not supported. Choose a specific origin or destination.";
    }
    return null;
  }

  function invalidateSearch(): void {
    const blocked = routeBlockedMessage(form);
    runBtn.disabled = isRunning || Boolean(blocked);
    hideSearchProgress();
    searchSummary.textContent = blocked ? blocked : "Ready to search.";
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
    const focused = document.activeElement;
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
    if (busy) {
      runBtn.setAttribute("aria-busy", "true");
      // Disabling the focused control would drop focus to the body.
      if (focused instanceof HTMLElement && formEl.contains(focused)) {
        cancelBtn.focus({ preventScroll: true });
      }
    } else {
      runBtn.removeAttribute("aria-busy");
      // Keep Search disabled if the current route is Anywhere→Anywhere.
      runBtn.disabled = Boolean(routeBlockedMessage(form));
      // Hiding Cancel while it holds focus would drop focus to the body.
      if (focused === cancelBtn && !runBtn.disabled) {
        runBtn.focus({ preventScroll: true });
      }
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

    syncUrl(form);

    // Belarus dropdown routes are futile via Google Flights — block search.
    if (involvesBelarusRegistry(form.origin, form.dest)) {
      hideSearchProgress();
      results.innerHTML = "";
      footer.innerHTML = "";
      resultsToolbar.hidden = true;
      latestOptions = [];
      latestSpec = null;
      progress.textContent = "";
      searchSummary.textContent = "";
      banners.innerHTML = belarusRouteWarningHtml();
      return;
    }

    const controller = new AbortController();
    activeController = controller;
    const spec = formStateToLegSearch(form);
    setSearchBusy(true, "Checking…");
    showSearchProgress("Preparing search");
    banners.innerHTML = "";
    results.innerHTML = "";
    footer.innerHTML = "";
    resultsToolbar.hidden = true;
    latestOptions = [];
    latestSpec = null;
    progress.textContent = "";
    const dateCount = spec.dateRange.days + 1;
    searchSummary.textContent = `Preparing search across ${dateCount} ${
      dateCount === 1 ? "date" : "dates"
    }…`;

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

    if (!planData.canRun) {
      searchSummary.textContent = "Search not started.";
      banners.innerHTML = `<div class="fs-banner fs-banner-danger">This search is too large for today's remaining search limit. Reduce the date range or try again later.</div>`;
      hideSearchProgress();
      setSearchBusy(false);
      return;
    }

    const totalSteps = planData.plan.callCount;
    const batchLabel = totalSteps === 1 ? "batch" : "batches";
    searchSummary.textContent = `Searching ${totalSteps} ${batchLabel}…`;
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
            "The site-wide daily search limit was reached — some dates may be missing.",
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
              "Your daily search limit was reached — some dates may be missing.",
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
        `Progress: ${completedSteps}/${planData.plan!.callCount}`,
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
            `<li>Batch ${error.stepIndex + 1}: ${escapeHtml(friendlyStepError(error.message))}</li>`,
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

    const resultLabel =
      allOptions.length === 1 ? "matching flight" : "matching flights";
    footer.innerHTML = `
      <span>${allOptions.length} ${resultLabel}</span>
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
        : "Done.",
      allOptions,
    );
    searchSummary.textContent = wasCancelled
      ? "Search cancelled. Partial results are shown."
      : formatSearchProgress(
          `Found ${allOptions.length} ${resultLabel}.`,
          allOptions,
        );
    results.removeAttribute("aria-busy");
    if (wasCancelled) hideSearchProgress();
    else completeSearchProgress(planData.plan.callCount);
    setSearchBusy(false);
  });
}

function outOfCreditBanner(reason: string): string {
  return `<div class="fs-banner fs-banner-warn">${escapeHtml(reason)} Limits reset daily.<span class="fs-banner-contact">Need larger limits? Email <a href="mailto:sokolx@gmail.com">sokolx@gmail.com</a> or DM <a href="https://x.com/nsokolsky" target="_blank" rel="noopener noreferrer">@nsokolsky</a> on X.</span></div>`;
}

/** Shown after Search for any Belarus dropdown route (DOT Order 2021-7-1). */
function belarusRouteWarningHtml(): string {
  const airlines = [
    { name: "Belavia", href: "https://en.belavia.by/" },
    { name: "flydubai", href: "https://www.flydubai.com/" },
    { name: "Azerbaijan Airlines", href: "https://www.azal.az/en/" },
    { name: "Air China", href: "https://www.airchina.com/" },
    { name: "Uzbekistan Airways", href: "https://www.uzairways.com/" },
    { name: "Aeroflot", href: "https://www.aeroflot.com/us-en" },
    { name: "SCAT Airlines", href: "https://www.scat.kz/" },
  ];
  const airlineLinks = airlines
    .map(
      ({ name, href }) =>
        `<li><a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a></li>`,
    )
    .join("");

  return `<aside class="fs-banner fs-banner-warn fs-banner-route" role="status" aria-labelledby="fs-belarus-route-title">
  <p class="fs-banner-title" id="fs-belarus-route-title">Belarus searches are not available here</p>
  <p class="fs-banner-body">A 2021 U.S. DOT order restricts selling U.S.–Belarus tickets. Google Flights seems to interpret that restriction very broadly, so Belarus-involved searches are futile here — even when neither side is in the U.S.</p>
  <p class="fs-banner-action-label">Book direct with an airline that still flies internationally to Minsk:</p>
  <ul class="fs-banner-airlines">${airlineLinks}</ul>
  <p class="fs-banner-contact"><a href="https://downloads.regulations.gov/DOT-OST-2021-0074-0190/attachment_1.pdf" target="_blank" rel="noopener noreferrer">DOT Order 2021-7-1 (PDF)</a></p>
</aside>`;
}

function friendlyStepError(message: string): string {
  if (message === "rate_limited") {
    return "Daily search limit reached";
  }
  if (message === "daily_quota_reached") {
    return "Site-wide search limit reached";
  }
  return message;
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

function formatDisplayPrice(
  price: number,
  fromCurrency: string,
  displayCurrency: SearchCurrency,
): string {
  return formatPrice(
    convertCurrency(price, fromCurrency, displayCurrency),
    displayCurrency,
  );
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
    currency?: SearchCurrency;
  } = {},
): void {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const sort = view.sort ?? "date";
  const currency = view.currency ?? "USD";
  const errors = [...container.querySelectorAll(".fs-step-error")];
  const html = view.groupByCity
    ? renderCityGroupedResults(
        options,
        spec,
        sort,
        view.citySort ?? "cheapest_city",
        view.citySide ?? "departure",
        currency,
      )
    : renderDateGroupedResults(options, spec, sort, currency);
  container.innerHTML = html;
  for (const err of errors) container.appendChild(err);
  restoreScrollIfJumped(scrollX, scrollY);
}

function renderDateGroupedResults(
  options: ItineraryOption[],
  spec: LegSearch,
  sort: DateGroupSort,
  currency: SearchCurrency,
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
        ? `${formatDisplayPrice(cheapest.price, cheapest.currency, currency)} · ${dateOptions.length} ${optionLabel}`
        : `${dateOptions.length} ${optionLabel}`;
    html.push(`
      <section class="fs-date-group">
        <header class="fs-date-heading">
          <h2>${formatDateHeader(date)}</h2>
          <span>${escapeHtml(dayMeta)}</span>
        </header>
        <div class="fs-result-list">
          ${dateOptions.map((option) => renderResultCard(option, spec, currency)).join("")}
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
  currency: SearchCurrency,
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
    const originIata = cheapest?.segments[0]?.departureAirport;
    const destIata = cheapest?.destinationAirport;
    const distanceKm =
      originIata && destIata
        ? airportDistanceKm(originIata, destIata)
        : null;
    const distanceLabel =
      distanceKm !== null && distanceKm > 0
        ? ` · ${Math.round(distanceKm).toLocaleString("en-US")} km`
        : "";
    const cityMeta = cheapest
      ? `${cityGroup.dates.length} ${dayLabel}${distanceLabel} · from ${formatDisplayPrice(cheapest.price, cheapest.currency, currency)}`
      : `${cityGroup.dates.length} ${dayLabel}`;
    const [first, ...rest] = cityGroup.dates;
    html.push(`
      <section class="fs-city-group">
        <header class="fs-city-heading">
          <h2>${escapeHtml(cityGroup.city)}</h2>
          <span>${escapeHtml(cityMeta)}</span>
        </header>
        ${first ? renderCityDateBlock(first.date, first.option, spec, currency) : ""}
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
                renderCityDateBlock(date, option, spec, currency),
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
  currency: SearchCurrency,
): string {
  return `
    <section class="fs-date-group fs-date-group-nested">
      <header class="fs-date-heading">
        <h3>${formatDateHeader(date)}</h3>
        <span>${escapeHtml(formatDisplayPrice(option.price, option.currency, currency))}</span>
      </header>
      <div class="fs-result-list">
        ${renderResultCard(option, spec, currency)}
      </div>
    </section>
  `;
}

function renderResultCard(
  option: ItineraryOption,
  spec: LegSearch,
  currency: SearchCurrency,
): string {
  const firstSegment = option.segments[0]!;
  const lastSegment = option.segments.at(-1)!;
  const origin = airportLabel(firstSegment.departureAirport);
  const dest = option.destinationLabel ?? option.destinationAirport;
  const price = formatDisplayPrice(option.price, option.currency, currency);
  const priceNote =
    spec.adults > 1 ? `total for ${spec.adults} travelers` : "";
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
        ${
          priceNote
            ? `<span class="fs-result-price-note">${escapeHtml(priceNote)}</span>`
            : ""
        }
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
  const carriers = [...new Set(option.segments.map((segment) => segment.carrier))];
  const seatDetail = modeInvolvesLieFlat(spec.lieFlatPolicy)
    ? formatLieFlatSegments(option)
    : formatCabinDetail(option);
  const stopDetail = formatStops(option);
  const className = ["fs-result-leg", opts.extraClass].filter(Boolean).join(" ");
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
  const tierMarkup = renderLieFlatTierBadges(option, spec.cabin);
  return `
    <div class="${className}">
      ${
        opts.label
          ? `<span class="fs-result-leg-label">${escapeHtml(opts.label)}</span>`
          : ""
      }
      ${renderRouteLine(option)}
      <div class="fs-result-meta">${metaParts.join("")}</div>
      ${tierMarkup}
    </div>
  `;
}

/** One horizontal strip: clock times, flight time on each hop, layover at each stop. */
function renderRouteLine(option: ItineraryOption): string {
  const first = option.segments[0]!;
  const last = option.segments.at(-1)!;
  const parts: string[] = [
    `<span class="fs-route-end">
      <time class="fs-route-time">${escapeHtml(formatClock(first.departureTime))}</time>
      ${renderAirportCode(first.departureAirport)}
    </span>`,
  ];

  option.segments.forEach((segment, index) => {
    const isLast = index === option.segments.length - 1;
    const hop = renderFlightHop(segmentLegMinutes(segment));
    if (isLast) {
      parts.push(`<span class="fs-route-unit">
        ${hop}
        <span class="fs-route-end">
          ${renderAirportCode(segment.arrivalAirport)}
          <time class="fs-route-time">${escapeHtml(formatClock(last.arrivalTime))}</time>
        </span>
      </span>`);
      return;
    }
    const layover = layoverAfterSegment(option, index);
    const layoverMins = layover?.durationMinutes ?? 0;
    const layoverMarkup =
      layoverMins > 0
        ? `<span class="fs-route-lay">${CLOCK_ICON}${escapeHtml(formatDuration(layoverMins))}</span>`
        : "";
    parts.push(`<span class="fs-route-unit">
      ${hop}
      <span class="fs-route-stop">
        ${renderAirportCode(segment.arrivalAirport)}
        ${layoverMarkup}
      </span>
    </span>`);
  });

  return `<div class="fs-result-route" aria-label="${escapeAttr(
    routeAriaLabel(option),
  )}">${parts.join("")}</div>`;
}

function renderAirportCode(code: string): string {
  const city = airportCity(code);
  const iata = escapeHtml(code);
  if (city === code) {
    return `<span class="fs-route-code">${iata}</span>`;
  }
  return `<span class="fs-route-code is-interactive" aria-label="${escapeAttr(`${code}, ${city}`)}">
    <span class="fs-route-iata">${iata}</span>
    <span class="fs-route-city" aria-hidden="true">${escapeHtml(city)}</span>
  </span>`;
}

function renderFlightHop(minutes: number): string {
  const label = minutes > 0 ? formatDuration(minutes) : "";
  const meta = label
    ? `<span class="fs-route-flight-meta">${PLANE_ICON}${escapeHtml(label)}</span>`
    : "";
  return `<span class="fs-route-flight" aria-hidden="true">
    <span class="fs-route-rail"></span>
    ${meta}
    <span class="fs-route-rail"></span>
  </span>`;
}

function layoverAfterSegment(
  option: ItineraryOption,
  segmentIndex: number,
): { airport: string; durationMinutes: number } | undefined {
  const airport = option.segments[segmentIndex]?.arrivalAirport;
  const byIndex = option.layovers[segmentIndex];
  if (byIndex && (!airport || byIndex.airport === airport)) return byIndex;
  return option.layovers.find((layover) => layover.airport === airport);
}

function routeAriaLabel(option: ItineraryOption): string {
  const first = option.segments[0]!;
  const last = option.segments.at(-1)!;
  const bits = [
    `${formatClock(first.departureTime)} ${airportLabel(first.departureAirport)}`,
  ];
  option.segments.forEach((segment, index) => {
    const minutes = segmentLegMinutes(segment);
    if (minutes > 0) bits.push(`${formatDuration(minutes)} flight`);
    if (index < option.segments.length - 1) {
      const layover = layoverAfterSegment(option, index);
      const layoverText =
        layover && layover.durationMinutes > 0
          ? `${formatDuration(layover.durationMinutes)} layover`
          : "stop";
      bits.push(`${airportLabel(segment.arrivalAirport)} ${layoverText}`);
    } else {
      bits.push(
        `${airportLabel(segment.arrivalAirport)} ${formatClock(last.arrivalTime)}`,
      );
    }
  });
  return bits.join(", ");
}

function formatStops(option: ItineraryOption): string {
  const stops = Math.max(option.segments.length - 1, option.layovers.length);
  if (stops === 0) return "Nonstop";
  return stops === 1 ? "1 stop" : `${stops} stops`;
}

function formatClock(value: string): string {
  const match = value.match(/(?:^|\s)(\d{1,2}:\d{2})$/);
  return match?.[1] ?? (value || "—");
}

/** Prefer SearchAPI duration; else estimate from great-circle distance. */
function segmentLegMinutes(
  segment:
    | {
        departureAirport: string;
        arrivalAirport: string;
        durationMinutes: number;
      }
    | undefined,
): number {
  if (!segment) return 0;
  if (segment.durationMinutes > 0) return segment.durationMinutes;
  return (
    estimateFlightMinutes(segment.departureAirport, segment.arrivalAirport) ??
    0
  );
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

function renderLieFlatTierBadges(
  option: ItineraryOption,
  fallbackCabin: LegSearch["cabin"],
): string {
  const matches = lookupLieFlatTiersForSegments(option.segments, fallbackCabin);
  if (matches.length === 0) return "";
  const badges = matches
    .map((match) => {
      const title =
        match.products.length > 0
          ? ` title="${escapeAttr(match.products.join(", "))}"`
          : "";
      return `<span class="${tierBadgeClass(match.tier)}"${title}>${escapeHtml(
        match.tier,
      )}</span>`;
    })
    .join('<span class="fs-lie-flat-tier-sep" aria-hidden="true"> / </span>');
  const label = `Lie-flat tier: ${matches.map((match) => match.tier).join(" / ")}`;
  return `<div class="fs-lie-flat-tiers" aria-label="${escapeAttr(
    label,
  )}"><span class="fs-lie-flat-tiers-label">Lie-flat tier:</span> ${badges}</div>`;
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
  const originGrouped = Boolean(form.origin && isRegistryLocation(form.origin));
  const destGrouped = Boolean(form.dest && isRegistryLocation(form.dest));

  const originGroupings = root.querySelector<HTMLInputElement>(
    "#fs-origin-groupings",
  );
  const destGroupings = root.querySelector<HTMLInputElement>(
    "#fs-dest-groupings",
  );
  if (originGroupings) originGroupings.checked = originGrouped;
  if (destGroupings) destGroupings.checked = destGrouped;

  if (originGrouped) {
    setVal(root, "#fs-origin-reg", form.origin);
    clearAirportSearchSide(root, "origin");
  } else {
    setVal(root, "#fs-origin-reg", DEFAULT_GROUPING_ORIGIN);
    setAirportSearchSide(
      root,
      "origin",
      form.origin,
      form.originLabel || form.origin,
    );
  }

  if (destGrouped) {
    setVal(root, "#fs-dest-reg", form.dest);
    clearAirportSearchSide(root, "destination");
  } else {
    setVal(root, "#fs-dest-reg", DEFAULT_GROUPING_DEST);
    setAirportSearchSide(
      root,
      "destination",
      form.dest,
      form.destLabel || form.dest,
    );
  }

  syncLocationMode(root, "origin", originGrouped);
  syncLocationMode(root, "destination", destGrouped);

  const matchingMode = SEARCH_MODES.find(
    (m) => m.cabin === form.cabin && m.lieFlatPolicy === form.lieFlatPolicy,
  );
  setVal(root, "#fs-mode", matchingMode?.id ?? form.mode);
  setVal(root, "#fs-trip-length", String(form.tripLengthDays));
  setVal(root, "#fs-days", String(form.days));
  setVal(root, "#fs-max-stops", String(form.maxStops));
  setVal(root, "#fs-adults", String(form.adults));
  setVal(root, "#fs-max-hours", String(form.maxTotalHours));
  setVal(root, "#fs-topn", String(form.topN));
  setVal(root, "#fs-start", form.start);

  for (const input of root.querySelectorAll<HTMLInputElement>(
    'input[name="fs-currency"]',
  )) {
    input.checked = input.value === form.currency;
  }

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
 * otherwise preserve explicit cabin/policy from the previous form state.
 */
function readForm(root: HTMLElement, prev: FormState): FormState {
  const originGrouped = Boolean(
    root.querySelector<HTMLInputElement>("#fs-origin-groupings")?.checked,
  );
  const destGrouped = Boolean(
    root.querySelector<HTMLInputElement>("#fs-dest-groupings")?.checked,
  );
  const originSearch = readAirportSearchSide(root, "origin");
  const destSearch = readAirportSearchSide(root, "destination");
  const originReg =
    root.querySelector<HTMLSelectElement>("#fs-origin-reg")?.value ??
    DEFAULT_GROUPING_ORIGIN;
  const destReg =
    root.querySelector<HTMLSelectElement>("#fs-dest-reg")?.value ??
    DEFAULT_GROUPING_DEST;
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
    origin: originGrouped ? originReg : originSearch.id,
    dest: destGrouped ? destReg : destSearch.id,
    originLabel: originGrouped ? "" : originSearch.label,
    destLabel: destGrouped ? "" : destSearch.label,
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
    topN: (() => {
      const raw = Number(
        root.querySelector<HTMLSelectElement>("#fs-topn")?.value,
      );
      if (Number.isInteger(raw) && raw >= 1 && raw <= 10) return raw;
      return DEFAULT_FORM.topN;
    })(),
    adults: (() => {
      const raw = Number(
        root.querySelector<HTMLSelectElement>("#fs-adults")?.value,
      );
      if (raw === 2 || raw === 3 || raw === 4) return raw;
      return 1;
    })(),
    deepSearch: prev.deepSearch,
    currency: parseSearchCurrency(
      root.querySelector<HTMLInputElement>('input[name="fs-currency"]:checked')
        ?.value,
      prev.currency,
    ),
  };
}

function syncTripFields(
  root: HTMLElement,
  tripType: FormState["tripType"],
): void {
  const controls = root.querySelector<HTMLElement>("#fs-trip-controls");
  if (controls) controls.hidden = tripType !== "round_trip";
}

type AirportSearchSide = "origin" | "destination";

function sideSelectors(side: AirportSearchSide) {
  return side === "origin"
    ? {
        query: "#fs-origin-query",
        id: "#fs-origin-id",
        list: "#fs-origin-suggestions",
        select: "#fs-origin-reg",
        groupings: "#fs-origin-groupings",
        searchType: "departure" as const,
      }
    : {
        query: "#fs-dest-query",
        id: "#fs-dest-id",
        list: "#fs-dest-suggestions",
        select: "#fs-dest-reg",
        groupings: "#fs-dest-groupings",
        searchType: "arrival" as const,
      };
}

function syncLocationMode(
  root: HTMLElement,
  side: AirportSearchSide,
  grouped: boolean,
): void {
  const sel = sideSelectors(side);
  const search = root.querySelector<HTMLElement>(
    `.fs-airport-search[data-airport-search="${side}"]`,
  );
  const select = root.querySelector<HTMLSelectElement>(sel.select);
  const query = root.querySelector<HTMLInputElement>(sel.query);
  if (search) search.hidden = grouped;
  if (select) select.hidden = !grouped;
  if (query) query.tabIndex = grouped ? -1 : 0;
  root
    .querySelector<HTMLInputElement>(sel.groupings)
    ?.setAttribute("aria-expanded", String(grouped));
}

function clearAirportSearchSide(
  root: HTMLElement,
  side: AirportSearchSide,
): void {
  setAirportSearchSide(root, side, "", "");
  hideSuggestions(root, side);
  const searchWrap = root.querySelector<HTMLElement>(
    `.fs-airport-search[data-airport-search="${side}"]`,
  );
  searchWrap?.classList.remove("is-loading");
  const spinner = searchWrap?.querySelector<HTMLElement>(
    ".fs-airport-search-spinner",
  );
  if (spinner) spinner.hidden = true;
  root
    .querySelector<HTMLInputElement>(sideSelectors(side).query)
    ?.setAttribute("aria-busy", "false");
}

function setAirportSearchSide(
  root: HTMLElement,
  side: AirportSearchSide,
  id: string,
  label: string,
): void {
  const sel = sideSelectors(side);
  setVal(root, sel.id, id);
  setVal(root, sel.query, label);
}

function readAirportSearchSide(
  root: HTMLElement,
  side: AirportSearchSide,
): { id: string; label: string } {
  const sel = sideSelectors(side);
  const id = (
    root.querySelector<HTMLInputElement>(sel.id)?.value ?? ""
  ).trim();
  const label = (
    root.querySelector<HTMLInputElement>(sel.query)?.value ?? ""
  ).trim();
  if (id) return { id, label: label || id };
  // Accept a typed 3-letter IATA even if the user never clicked a suggestion.
  const typed = label.toUpperCase();
  if (looksLikeIata(typed)) return { id: typed, label: typed };
  return { id: "", label };
}

function hideSuggestions(root: HTMLElement, side: AirportSearchSide): void {
  const sel = sideSelectors(side);
  const list = root.querySelector<HTMLElement>(sel.list);
  const query = root.querySelector<HTMLInputElement>(sel.query);
  if (list) {
    list.hidden = true;
    list.innerHTML = "";
  }
  query?.setAttribute("aria-expanded", "false");
}

function mountAirportSearch(
  root: HTMLElement,
  side: AirportSearchSide,
  onChanged: () => void,
): void {
  const sel = sideSelectors(side);
  const query = root.querySelector<HTMLInputElement>(sel.query);
  const list = root.querySelector<HTMLUListElement>(sel.list);
  const idInput = root.querySelector<HTMLInputElement>(sel.id);
  const searchWrap = root.querySelector<HTMLElement>(
    `.fs-airport-search[data-airport-search="${side}"]`,
  );
  const spinner = searchWrap?.querySelector<HTMLElement>(
    ".fs-airport-search-spinner",
  );
  if (!query || !list || !idInput) return;

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let activeIndex = -1;
  let latestSuggestions: AirportLocationSuggestion[] = [];
  let requestSeq = 0;

  const setLoading = (loading: boolean) => {
    searchWrap?.classList.toggle("is-loading", loading);
    if (spinner) spinner.hidden = !loading;
    query.setAttribute("aria-busy", loading ? "true" : "false");
  };

  const renderSuggestions = (suggestions: AirportLocationSuggestion[]) => {
    latestSuggestions = suggestions;
    activeIndex = -1;
    setLoading(false);
    if (suggestions.length === 0) {
      hideSuggestions(root, side);
      return;
    }
    list.innerHTML = suggestions
      .map((suggestion, index) => {
        const meta = suggestion.description
          ? `<span class="fs-suggestion-meta">${escapeHtml(suggestion.description)}</span>`
          : "";
        const kind =
          suggestion.kind === "city" ? "fs-suggestion-city" : "fs-suggestion-airport";
        return `<li class="fs-suggestion ${kind}" role="option" id="${side}-opt-${index}" data-index="${index}" aria-selected="false"><span class="fs-suggestion-label">${escapeHtml(suggestion.label)}</span>${meta}</li>`;
      })
      .join("");
    list.hidden = false;
    query.setAttribute("aria-expanded", "true");
  };

  const selectSuggestion = (suggestion: AirportLocationSuggestion) => {
    idInput.value = suggestion.id;
    query.value =
      suggestion.kind === "city"
        ? `${suggestion.label} (all airports)`
        : suggestion.label;
    setLoading(false);
    hideSuggestions(root, side);
    onChanged();
  };

  const setActive = (index: number) => {
    const options = list.querySelectorAll<HTMLElement>(".fs-suggestion");
    activeIndex = index;
    options.forEach((option, i) => {
      const selected = i === index;
      option.classList.toggle("is-active", selected);
      option.setAttribute("aria-selected", String(selected));
      if (selected) query.setAttribute("aria-activedescendant", option.id);
    });
    if (index < 0) query.removeAttribute("aria-activedescendant");
  };

  const fetchSuggestions = async (q: string) => {
    const seq = ++requestSeq;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        search_type: sel.searchType,
      });
      const res = await fetch(`/api/flights/locations?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        suggestions?: AirportLocationSuggestion[];
      };
      if (seq !== requestSeq) return;
      // Field may have been cleared or switched while the request was in flight.
      if (query.value.trim().length < 2) {
        setLoading(false);
        hideSuggestions(root, side);
        return;
      }
      if (!res.ok || !data.ok || !Array.isArray(data.suggestions)) {
        setLoading(false);
        hideSuggestions(root, side);
        return;
      }
      renderSuggestions(data.suggestions);
    } catch {
      if (seq === requestSeq) {
        setLoading(false);
        hideSuggestions(root, side);
      }
    }
  };

  query.addEventListener("input", () => {
    // Typing invalidates a previously confirmed selection.
    idInput.value = "";
    const q = query.value.trim();
    if (debounceTimer) clearTimeout(debounceTimer);
    if (q.length < 2) {
      requestSeq += 1;
      setLoading(false);
      hideSuggestions(root, side);
      onChanged();
      return;
    }
    // Show spinner through the debounce gap so the field doesn't look frozen.
    setLoading(true);
    debounceTimer = setTimeout(() => {
      void fetchSuggestions(q);
    }, 250);
    onChanged();
  });

  query.addEventListener("keydown", (event) => {
    if (list.hidden || latestSuggestions.length === 0) {
      if (event.key === "Enter" && looksLikeIata(query.value.trim().toUpperCase())) {
        idInput.value = query.value.trim().toUpperCase();
        onChanged();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(latestSuggestions.length - 1, activeIndex + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(0, activeIndex - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = latestSuggestions[activeIndex];
      if (suggestion) selectSuggestion(suggestion);
    } else if (event.key === "Escape") {
      hideSuggestions(root, side);
    }
  });

  list.addEventListener("mousedown", (event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      ".fs-suggestion",
    );
    if (!target) return;
    event.preventDefault();
    const index = Number(target.dataset.index);
    const suggestion = latestSuggestions[index];
    if (suggestion) selectSuggestion(suggestion);
  });

  query.addEventListener("blur", () => {
    // Delay so suggestion mousedown can run first.
    setTimeout(() => {
      hideSuggestions(root, side);
      const typed = query.value.trim().toUpperCase();
      if (!idInput.value && looksLikeIata(typed)) {
        idInput.value = typed;
        query.value = typed;
        onChanged();
      }
    }, 120);
  });
}

/** Persist the search spec to the URL only after an explicit Search. */
function syncUrl(form: FormState): void {
  const params = formStateToSearchParams(form);
  const next = `${location.pathname}?${params.toString()}`;
  replaceUrlPreservingScroll(next);
}

/** Strip query params after Clear (back to a clean `/flights/search/`). */
function clearUrl(): void {
  replaceUrlPreservingScroll(location.pathname);
}

/** iOS Safari can reset scroll when the query string changes via replaceState. */
function replaceUrlPreservingScroll(url: string): void {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  history.replaceState(null, "", url);
  restoreScrollIfJumped(scrollX, scrollY);
}

/**
 * Replacing result markup (and some mobile browsers' live-region handling)
 * can yank the viewport toward the top. Restore the user's position if we
 * jumped up; leave it alone if they scrolled down themselves.
 */
function restoreScrollIfJumped(scrollX: number, scrollY: number): void {
  const restore = () => {
    if (window.scrollY < scrollY - 1 || window.scrollX !== scrollX) {
      window.scrollTo(scrollX, scrollY);
    }
  };
  restore();
  requestAnimationFrame(() => {
    restore();
    requestAnimationFrame(restore);
  });
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

/** Default start date in local calendar days (today + offset). */
function defaultLocalStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_START_OFFSET_DAYS);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
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
