import {
  formatDateHeader,
  formatDuration,
  formatPrice,
} from "../../lib/flights/format";
import { SERPAPI_ESTIMATED_COST_PER_SEARCH_USD } from "../../lib/flights/constants";
import { groupResults } from "../../lib/flights/group";
import { listRegistryOptions } from "../../lib/flights/resolver";
import {
  SEARCH_MODES,
  getSearchMode,
  modeInvolvesLieFlat,
} from "../../lib/flights/modes";
import {
  MAX_TOTAL_HOURS_OPTIONS,
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

const CONCURRENCY = 3;

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
      target?.id === "fs-days"
    ) {
      return;
    }
    onFormChanged();
  });

  function onFormChanged(): void {
    form = readForm(root, form);
    syncUrl(form);
    invalidateSearch();
  }

  function invalidateSearch(): void {
    runBtn.disabled = isRunning;
    hideSearchProgress();
    searchSummary.textContent = "Cached results are reused automatically.";
    banners.innerHTML = "";
    progress.textContent = "";
    results.innerHTML = "";
    footer.innerHTML = "";
  }

  function setSearchBusy(busy: boolean, label = "Run search"): void {
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
    else runBtn.removeAttribute("aria-busy");
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

  runBtn.addEventListener("click", async () => {
    const controller = new AbortController();
    activeController = controller;
    form = readForm(root, form);
    const spec = formStateToLegSearch(form);
    syncUrl(form);
    setSearchBusy(true, "Checking…");
    showSearchProgress("Preparing search");
    banners.innerHTML = "";
    results.innerHTML = "";
    footer.innerHTML = "";
    progress.textContent = "";
    searchSummary.textContent = "Checking cache and daily budget…";

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

    const maxCalls = planData.plan.estimatedMaxCalls;
    const callLabel = maxCalls === 1 ? "call" : "calls";
    const qualifier = spec.tripType === "round_trip" ? "up to " : "";
    searchSummary.textContent = `${qualifier}${maxCalls} ${callLabel} · ${cached} cached steps · ${remaining} daily budget remaining.`;
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
    let partialReturnFailures = 0;
    let completedSteps = 0;

    await mapPool(planData.plan.steps, CONCURRENCY, async (step) => {
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
        banners.innerHTML += `<div class="fs-banner fs-banner-warn">Daily quota reached — cached results only.</div>`;
      }

      if (
        outcome.warning === "step_failed" ||
        (outcome.error && outcome.warning !== "cancelled")
      ) {
        const message =
          outcome.message ?? outcome.error ?? "step failed";
        stepErrors.push({ stepIndex: step.stepIndex, message });
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
        renderResults(results, allOptions, spec);
      }

      progress.textContent = `Progress: ${completedSteps}/${planData.plan!.callCount} · cache hits ${stats.cacheHits} · live calls ${stats.callsMade}`;
      showSearchProgress(
        "Searching flights",
        completedSteps,
        planData.plan!.callCount,
      );
    });

    const wasCancelled = controller.signal.aborted;
    activeController = undefined;

    if (allOptions.length === 0) {
      results.insertAdjacentHTML(
        "afterbegin",
        `<div class="fs-empty"><strong>No matching flights found.</strong><span>Try another cabin, fewer seat restrictions, or a wider date range.</span></div>`,
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

    progress.textContent = wasCancelled
      ? `Cancelled after ${completedSteps} of ${planData.plan.callCount} batches. Partial results are shown.`
      : `Done. ${stats.callsMade} live calls, ${stats.cacheHits} cache hits.`;
    renderCostSummary(searchSummary, stats.callsMade, stats.cacheHits);
    results.removeAttribute("aria-busy");
    if (wasCancelled) hideSearchProgress();
    else completeSearchProgress(planData.plan.callCount);
    setSearchBusy(false);
  });
}

function renderCostSummary(
  container: HTMLElement,
  searchesUsed: number,
  cacheHits: number,
): void {
  const estimatedCost =
    searchesUsed * SERPAPI_ESTIMATED_COST_PER_SEARCH_USD;
  const formattedCost = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(estimatedCost);
  const searchLabel = searchesUsed === 1 ? "search" : "searches";

  container.replaceChildren();
  const cost = document.createElement("strong");
  cost.textContent = `Approx. SerpApi cost: ${formattedCost}`;
  const detail = document.createTextNode(
    ` · ${searchesUsed} billable ${searchLabel} · ${cacheHits} cached (free) · `,
  );
  const pricing = document.createElement("a");
  pricing.href = "https://serpapi.com/pricing";
  pricing.target = "_blank";
  pricing.rel = "noopener noreferrer";
  pricing.textContent = "Starter pricing ↗";
  container.append(cost, detail, pricing);
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
): void {
  const grouped = groupResults(options, { groupBy: "date", topN: spec.topN });
  const dates = Object.keys(grouped).sort();
  const errors = [...container.querySelectorAll(".fs-step-error")];
  const html: string[] = [];
  for (const date of dates) {
    const dateOptions = grouped[date]!;
    const optionLabel = dateOptions.length === 1 ? "option" : "options";
    html.push(`
      <section class="fs-date-group">
        <header class="fs-date-heading">
          <h2>${formatDateHeader(date)}</h2>
          <span>${dateOptions.length} ${optionLabel}</span>
        </header>
        <div class="fs-result-list">
    `);
    for (const option of dateOptions) {
      const dest = option.destinationLabel ?? option.destinationAirport;
      const price = formatPrice(option.price, option.currency);
      const firstSegment = option.segments[0]!;
      const lastSegment = option.segments.at(-1)!;
      const carriers = [...new Set(option.segments.map((segment) => segment.carrier))];
      const carrierLabel = carriers.join(" + ");
      const route = option.segments
        .map((segment, index) =>
          index === 0
            ? `${segment.departureAirport} → ${segment.arrivalAirport}`
            : ` → ${segment.arrivalAirport}`,
        )
        .join("");
      const stopDetail = formatStops(option);
      const outboundTimes = formatSegmentTimes(option.segments);
      const seatDetail = modeInvolvesLieFlat(spec.lieFlatPolicy)
        ? formatLieFlatSegments(option)
        : formatCabinDetail(option);
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
        const returnRoute = option.returnSegments
          .map((segment, index) =>
            index === 0
              ? `${segment.departureAirport} → ${segment.arrivalAirport}`
              : ` → ${segment.arrivalAirport}`,
          )
          .join("");
        const returnCarriers = [
          ...new Set(option.returnSegments.map((segment) => segment.carrier)),
        ].join(" + ");
        const returnSeatDetail = modeInvolvesLieFlat(spec.lieFlatPolicy)
          ? formatLieFlatSegments(returnOption)
          : formatCabinDetail(returnOption);
        returnMarkup = `
          <div class="fs-result-return">
            <span class="fs-result-leg-label">Return · ${escapeHtml(
              formatDateHeader(option.returnDate ?? ""),
            )}</span>
            <strong>${escapeHtml(returnCarriers)}</strong>
            <span>${escapeHtml(returnRoute)}</span>
            <span>${escapeHtml(formatSegmentTimes(option.returnSegments))} · ${escapeHtml(
              returnSeatDetail,
            )} · ${escapeHtml(
              formatStops(returnOption),
            )} · ${formatDuration(returnOption.totalDurationMinutes)}</span>
          </div>
        `;
      }
      const tag = option.googleFlightsUrl ? "a" : "div";
      const href = option.googleFlightsUrl
        ? ` href="${escapeAttr(option.googleFlightsUrl)}" target="_blank" rel="noopener noreferrer"`
        : "";
      const unavailableClass = option.googleFlightsUrl ? "" : " fs-result-unavailable";
      html.push(`
        <${tag} class="fs-result${unavailableClass}"${href}>
          <div class="fs-result-price">
            <strong>${escapeHtml(price)}</strong>
            <span>to ${escapeHtml(dest)}</span>
          </div>
          <div class="fs-result-journey">
            <div class="fs-result-route">
              ${
                option.returnSegments?.length
                  ? `<span class="fs-result-leg-label">Outbound · ${escapeHtml(
                      formatDateHeader(option.departureDate),
                    )}</span>`
                  : ""
              }
              <strong>${escapeHtml(carrierLabel)}</strong>
              <span>${escapeHtml(route)}</span>
            </div>
            <div class="fs-result-meta">
              <span class="fs-result-times">${escapeHtml(outboundTimes)}</span>
              <span class="fs-seat-detail">${escapeHtml(seatDetail)}</span>
              <span>${escapeHtml(stopDetail)}</span>
            </div>
            ${returnMarkup}
          </div>
          <div class="fs-result-duration">
            <strong>${formatDuration(option.totalDurationMinutes)}</strong>
            <span>${escapeHtml(firstSegment.departureAirport)}–${escapeHtml(lastSegment.arrivalAirport)}</span>
          </div>
          ${option.googleFlightsUrl ? '<span class="fs-result-arrow" aria-hidden="true">↗</span>' : ""}
        </${tag}>
      `);
    }
    html.push("</div></section>");
  }
  container.innerHTML = html.join("");
  for (const err of errors) container.appendChild(err);
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

function formatSegmentTimes(
  segments: ItineraryOption["segments"],
): string {
  const first = segments[0];
  const last = segments.at(-1);
  if (!first || !last) return "Times unavailable";
  return `${formatClock(first.departureTime)} → ${formatClock(last.arrivalTime)}`;
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
  const cabin = longest.cabin?.replace("_", " ") ?? "Cabin unknown";
  const legroom =
    longest.legroom ??
    longest.amenities.find((amenity) => /legroom/i.test(amenity));
  return legroom ? `${cabin} · ${legroom}` : cabin;
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
  const deep = root.querySelector<HTMLInputElement>("#fs-deep");
  if (deep) deep.checked = form.deepSearch;
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
      30,
      Math.max(
        1,
        Number(
          root.querySelector<HTMLSelectElement>("#fs-trip-length")?.value,
        ) || base.tripLengthDays,
      ),
    ),
    start:
      root.querySelector<HTMLInputElement>("#fs-start")?.value || base.start,
    days: Number(root.querySelector<HTMLInputElement>("#fs-days")?.value) || 7,
    maxStops:
      Number(root.querySelector<HTMLSelectElement>("#fs-max-stops")?.value) ===
      2
        ? 2
        : 1,
    maxTotalHours: MAX_TOTAL_HOURS_OPTIONS.includes(maxTotalHoursValue)
      ? maxTotalHoursValue
      : base.maxTotalHours,
    topN: Number(root.querySelector<HTMLInputElement>("#fs-topn")?.value) || 2,
    deepSearch:
      root.querySelector<HTMLInputElement>("#fs-deep")?.checked ?? false,
  };
}

function syncTripFields(
  root: HTMLElement,
  tripType: FormState["tripType"],
): void {
  const field = root.querySelector<HTMLElement>("#fs-trip-length-field");
  if (field) field.hidden = tripType !== "round_trip";
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
