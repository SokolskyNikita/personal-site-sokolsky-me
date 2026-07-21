import {
  cityOptions,
  DEFAULT_HOTEL_FORM,
  formStateFromSearchParams,
  formStateToSearchParams,
  slugifyCity,
  type HotelFormState,
} from "../../lib/hotels/url";
import { SCAN_PAGES_MOST_REVIEWED } from "../../lib/hotels/constants";
import { displayHotelName } from "../../lib/hotels/display";

type FactStatus = "confirmed" | "inferred" | "unknown" | "conflicting";

type StayPrice = {
  checkIn: string;
  checkOut: string;
  nights: number;
  nightlyUsd: number;
  totalUsd: number | null;
};

type HotelRow = {
  token: string;
  name: string;
  score: number | null;
  rating: number | null;
  reviews: number | null;
  hotelClass: number | null;
  brandTier: number;
  lowStarShare: number | null;
  worstCategory: string | null;
  worstCategoryNeg: number | null;
  plantPenalty?: number;
  consistencyPenalty?: number;
  quality?: number;
  nightlyUsd?: number | null;
  nightly_usd?: number | null;
  total_usd?: number | null;
  expected_usd?: number | null;
  deal_pct?: number | null;
  dealMethod?: "fit" | "fallback" | null;
  taRating?: number | null;
  taReviews?: number | null;
  concordance?: string;
  bestStay?: StayPrice | null;
  matrix?: { checkIn: string; checkOut: string; nightlyUsd: number | null }[];
  googleHotelsUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  facts?: {
    hasAC?: FactStatus;
    hasElevator?: FactStatus;
    hasWifi?: FactStatus;
    frontDesk24h?: FactStatus;
  };
  factValues?: {
    hasAC?: boolean | null;
    hasElevator?: boolean | null;
    hasWifi?: boolean | null;
    frontDesk24h?: boolean | null;
  };
  reviewFeatures?: {
    modelVersion: string;
    reviewCount: number;
    topics: Record<
      string,
      {
        positive: number;
        negative: number;
        sampleSize: number;
        confidence: number;
        evidence?: Array<{
          excerpt: string;
          sentiment: "positive" | "negative";
        }>;
      }
    >;
  } | null;
  breakdown?: Array<{
    name: string;
    positive: number;
    negative: number;
    total: number;
    negRate: number | null;
  }>;
  whitelist?: string[];
  subscores?: Record<string, number | string | null>;
  gatedOut?: boolean;
  gates?: string[];
  expand?: {
    freeCancellationSeen?: boolean;
    offers?: unknown[];
    topThings?: unknown;
    address?: string | null;
  };
};

type PlanResponse = {
  ok: boolean;
  city?: string;
  display?: string;
  index?: {
    fresh: boolean;
    ageDays: number | null;
    scannedAt: number | null;
    meanRating: number | null;
    propertiesOnHand: number;
    scoringVersion: number;
  };
  costs?: {
    scanCreditsEstimate: number;
    priceSweepEstimate?: number;
    windowCount?: number;
    mode: string;
    maxCreditsPerScan: number;
  };
  error?: string;
};

type PricesResponse = {
  ok: boolean;
  properties?: HotelRow[];
  pricedCount?: number;
  top20PricedShare?: number;
  credits_used?: number;
  windows?: unknown[];
  ops?: Record<string, unknown>;
  durationMs?: number;
  error?: string;
};

type ScanResponse = {
  ok: boolean;
  found?: number;
  scored?: number;
  gated_out?: number;
  topExclusionReason?: string | null;
  credits_used?: number;
  cityMeanRating?: number;
  top10?: HotelRow[];
  properties?: HotelRow[];
  demoted?: HotelRow[];
  durationMs?: number;
  ops?: Record<string, unknown>;
  error?: string;
};

type IndexResponse = {
  ok: boolean;
  neverScanned?: boolean;
  properties?: HotelRow[];
  meanRating?: number | null;
  scannedAt?: number | null;
  durationMs?: number;
  error?: string;
};

export function mountHotelSearch(root: HTMLElement): void {
  const formEl = root.querySelector<HTMLFormElement>("#hs-form")!;
  const summary = root.querySelector<HTMLElement>("#hs-search-summary")!;
  const banners = root.querySelector<HTMLElement>("#hs-banners")!;
  const offlineBanner = root.querySelector<HTMLElement>("#hs-offline-banner");
  const progress = root.querySelector<HTMLElement>("#hs-progress")!;
  const results = root.querySelector<HTMLElement>("#hs-results")!;
  const footer = root.querySelector<HTMLElement>("#hs-footer")!;
  const runBtn = root.querySelector<HTMLButtonElement>("#hs-run")!;
  const rankingBtn = root.querySelector<HTMLButtonElement>("#hs-ranking")!;
  const cancelBtn = root.querySelector<HTMLButtonElement>("#hs-cancel")!;
  const progressDock = root.querySelector<HTMLElement>("#hs-search-progress")!;
  const progressTrack = root.querySelector<HTMLElement>(
    "#hs-search-progress-track",
  )!;
  const progressFill = root.querySelector<HTMLElement>(
    "#hs-search-progress-fill",
  )!;
  const progressLabel = root.querySelector<HTMLElement>(
    "#hs-search-progress-label",
  )!;
  const progressCount = root.querySelector<HTMLElement>(
    "#hs-search-progress-count",
  )!;
  let progressHideTimer: ReturnType<typeof setTimeout> | undefined;
  let progressCompleted = 0;
  let progressTotal = 1;
  const citySelect = root.querySelector<HTMLSelectElement>("#hs-city")!;
  const qInput = root.querySelector<HTMLInputElement>("#hs-q")!;
  const qWrap = root.querySelector<HTMLElement>("#hs-q-wrap");
  const otherCityCheck =
    root.querySelector<HTMLInputElement>("#hs-other-city")!;
  const primaryFields = root.querySelector<HTMLElement>(
    ".hs-section-where .fs-primary",
  );
  const creditHint = root.querySelector<HTMLElement>("#hs-credit-hint");

  populateCities(citySelect);
  // Local date, not UTC: same-day check-in must stay selectable in the
  // evening for timezones behind UTC.
  const today = localIsoDate();
  for (const sel of ["#hs-checkin-start", "#hs-checkout"]) {
    const el = root.querySelector<HTMLInputElement>(sel);
    if (el) el.min = today;
  }
  let form = formStateFromSearchParams(new URLSearchParams(location.search));
  let isRunning = false;
  let activeController: AbortController | undefined;
  let latestRows: HotelRow[] = [];
  let latestMeta: Record<string, unknown> = {};
  applyFormToDom(root, form);
  syncCityMode();
  syncCreditHint();
  syncSortOptions();

  // Controls that only filter/sort already-loaded rows. Changing them never
  // costs credits and should update the table instantly.
  const refineIds = new Set([
    "hs-sort",
    "hs-strictness",
    "hs-require-ac",
    "hs-require-desk",
    "hs-branded-only",
    "hs-min-reviews",
    "hs-budget-max",
  ]);

  formEl.addEventListener("change", (event) => {
    const targetId = (event.target as HTMLElement | null)?.id ?? "";
    normalizeRanges(root, targetId);
    if (targetId === "hs-other-city") {
      if (otherCityCheck.checked) {
        qInput.focus();
      } else {
        qInput.value = "";
        if (!citySelect.value) citySelect.value = DEFAULT_HOTEL_FORM.city;
      }
    }
    if (targetId === "hs-city" && citySelect.value) {
      // Picking a listed city turns off free-text mode.
      otherCityCheck.checked = false;
      qInput.value = "";
    }
    syncCityMode();
    form = readForm(root);
    syncUrl(form);
    syncCreditHint();
    syncSortOptions();
    if (refineIds.has(targetId)) {
      if (latestRows.length) {
        const visible = filterAndSort(latestRows, form);
        renderTable(results, visible, form);
        renderFooter(footer, visible, latestMeta);
      }
    }
  });

  function syncCityMode(): void {
    const other = otherCityCheck.checked;
    if (qWrap) qWrap.hidden = !other;
    citySelect.disabled = other;
    primaryFields?.classList.toggle("is-other-city", other);
    rankingBtn.disabled = isRunning || other;
    rankingBtn.title = other
      ? "Saved ranking is only available for listed cities. Use Search for other cities."
      : "Load the saved comfort ranking — free, no scan or prices.";
    if (!other && !citySelect.value) {
      citySelect.value = DEFAULT_HOTEL_FORM.city;
    }
  }

  function syncSortOptions(): void {
    const sortSelect = root.querySelector<HTMLSelectElement>("#hs-sort");
    const dealOption = sortSelect?.querySelector<HTMLOptionElement>(
      'option[value="deal"]',
    );
    if (!sortSelect || !dealOption) return;
    const datesSet = hasDates(readForm(root));
    dealOption.disabled = !datesSet;
    if (!datesSet && sortSelect.value === "deal") {
      sortSelect.value = "comfort";
      form = readForm(root);
    }
  }

  function syncCreditHint(): void {
    if (!creditHint) return;
    const state = readForm(root);
    if (!hasDates(state)) {
      creditHint.textContent =
        "No dates — Search returns hotels without prices. Show ranking is always free.";
      return;
    }
    const checkOut = checkOutDate(state);
    const nights = state.nightsMin;
    creditHint.textContent = `Search: prices for ${formatDateRange(state.checkInStart, checkOut)} (${nights} night${nights === 1 ? "" : "s"}) · up to 1 extra credit. Show ranking skips prices.`;
  }

  cancelBtn.addEventListener("click", () => {
    activeController?.abort();
    cancelBtn.disabled = true;
    progress.textContent = "Cancelling…";
  });

  const syncOfflineBanner = (): void => {
    if (!offlineBanner) return;
    offlineBanner.hidden = navigator.onLine;
  };
  syncOfflineBanner();
  window.addEventListener("offline", () => {
    syncOfflineBanner();
    if (!isRunning) {
      summary.textContent =
        "You're offline. Saved hotels still show; reconnect to search or load prices.";
    }
  });
  window.addEventListener("online", () => {
    syncOfflineBanner();
    if (!isRunning) {
      summary.textContent = "Back online. You can search again.";
    }
  });

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isRunning) return;
    if (!navigator.onLine) {
      syncOfflineBanner();
      summary.textContent =
        "You're offline — reconnect to run a new hotel search.";
      return;
    }
    form = readForm(root);
    syncUrl(form);
    await runSearch(form);
  });

  rankingBtn.addEventListener("click", async () => {
    if (isRunning) return;
    form = readForm(root);
    if (otherCityCheck.checked || form.q.trim()) {
      summary.textContent =
        "Saved ranking is only available for listed cities. Clear Other city, or use Search.";
      return;
    }
    syncUrl(form);
    await showRanking(form);
  });

  function retryHook(label: string) {
    return (attempt: number, max: number) => {
      setSearchProgress(
        `${label} — retry ${attempt}/${max}`,
        progressCompleted,
        progressTotal,
      );
      progress.textContent = `Weak connection — retrying ${label.toLowerCase()} (${attempt}/${max})…`;
    };
  }

  async function showRanking(state: HotelFormState): Promise<void> {
    const controller = new AbortController();
    activeController = controller;
    setBusy(true);
    rankingBtn.textContent = "Loading…";
    banners.innerHTML = "";
    progress.textContent = "";
    setSearchProgress("Loading ranking", 0, 1);
    summary.textContent = "Loading comfort ranking…";

    const citySlug = resolveCitySlug(state);
    try {
      await loadIndex(citySlug, controller.signal, {
        full: true,
        applyFilters: false,
      });
    } catch (err) {
      if (controller.signal.aborted) {
        summary.textContent = "Cancelled.";
        hideSearchProgress();
        setBusy(false);
        return;
      }
      summary.textContent = `Couldn't load ranking: ${formatNetworkError(err)}.`;
      hideSearchProgress();
      setBusy(false);
      return;
    }

    if (!latestRows.length) {
      summary.textContent =
        "No saved ranking for this city yet. Use Search hotels to build one.";
      hideSearchProgress();
      setBusy(false);
      return;
    }

    renderTable(results, latestRows, state);
    renderFooter(footer, latestRows, latestMeta);
    const mean =
      latestMeta.meanRating != null
        ? ` Average rating: ${Number(latestMeta.meanRating).toFixed(2)}.`
        : "";
    summary.textContent = `Full comfort ranking · ${latestRows.length} hotel${latestRows.length === 1 ? "" : "s"} (filters ignored; no search or prices).${mean}`;
    finishSearchProgress();
    setBusy(false);
  }

  async function runSearch(state: HotelFormState): Promise<void> {
    const controller = new AbortController();
    activeController = controller;
    setBusy(true, "Searching…");
    // Keep prior results visible until newer data arrives (shitty-wifi friendly).
    banners.innerHTML = "";
    progress.textContent = "";

    const citySlug = resolveCitySlug(state);
    const q = state.q.trim() || undefined;
    const needsPrices = hasDates(state);
    const priorRows = latestRows;
    const priorMeta = latestMeta;

    // Provisional total until we know warm vs cold path after /plan.
    setSearchProgress("Checking saved results", 0, needsPrices ? 4 : 3);

    let plan: PlanResponse;
    try {
      plan = await fetchPlan(citySlug, state, controller.signal, (a, m) =>
        retryHook("Checking saved results")(a, m),
      );
    } catch (err) {
      if (controller.signal.aborted) {
        summary.textContent = "Cancelled.";
        hideSearchProgress();
        setBusy(false);
        return;
      }
      summary.textContent = `Couldn't reach the server: ${formatNetworkError(err)}. Prior results kept.`;
      if (priorRows.length) {
        banners.innerHTML = `<div class="fs-banner fs-banner-warn">Connection problem — showing previous results. Tap Search hotels to retry.</div>`;
        renderTable(results, filterAndSort(priorRows, state), state);
        renderFooter(footer, filterAndSort(priorRows, state), priorMeta);
      }
      hideSearchProgress();
      setBusy(false);
      return;
    }

    const estimate = plan.costs?.scanCreditsEstimate ?? 6;
    const onHand = plan.index?.propertiesOnHand ?? 0;
    const fresh = plan.index?.fresh ?? false;

    if (onHand > 0 && fresh && !state.q) {
      const total = needsPrices ? 3 : 2;
      summary.textContent = `Using ${onHand} saved hotel${onHand === 1 ? "" : "s"}.`;
      setSearchProgress("Loading saved hotels", 1, total);
      try {
        await loadIndex(citySlug, controller.signal);
      } catch (err) {
        if (controller.signal.aborted) {
          summary.textContent = "Cancelled.";
          hideSearchProgress();
          setBusy(false);
          return;
        }
        summary.textContent = `Couldn't load saved hotels: ${formatNetworkError(err)}.`;
        hideSearchProgress();
        setBusy(false);
        return;
      }
      if (needsPrices) {
        setSearchProgress("Checking prices", 2, total);
        try {
          await loadPrices(citySlug, state, controller.signal);
        } catch (err) {
          if (!controller.signal.aborted) {
            banners.insertAdjacentHTML(
              "beforeend",
              `<div class="fs-banner fs-banner-warn">Prices failed (${formatNetworkError(err)}). Hotels are shown without live prices — search again to retry.</div>`,
            );
            summary.textContent =
              "Saved hotels loaded, but prices couldn't be fetched on this connection.";
          }
        }
      }
      finishSearchProgress();
      setBusy(false);
      return;
    }

    const total = needsPrices ? 4 : 3;
    summary.textContent = `Searching hotels now. Expected cost: about ${estimate} credits${onHand ? `; ${onHand} saved hotels are also available` : ""}.`;
    banners.innerHTML = `<div class="fs-banner">SearchAPI credit limit for this run: ${plan.costs?.maxCreditsPerScan ?? 80}.</div>`;
    setBusy(true, "Searching…");
    setSearchProgress("Searching hotels", 1, total);

    let scan: ScanResponse;
    try {
      scan = await fetchJson<ScanResponse>("/api/hotels/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          citySlug,
          q,
          force: true,
          mostReviewedPages: SCAN_PAGES_MOST_REVIEWED,
          highestRatingPages: 4,
        }),
        signal: controller.signal,
        timeoutMs: 150_000,
        retries: 1,
        onRetry: (a, m) => retryHook("Searching hotels")(a, m),
      });
    } catch (err) {
      if (controller.signal.aborted) {
        summary.textContent = "Search cancelled.";
        hideSearchProgress();
        setBusy(false);
        return;
      }
      summary.textContent = `Search failed: ${formatNetworkError(err)}. Prior results kept.`;
      if (priorRows.length) {
        banners.insertAdjacentHTML(
          "beforeend",
          `<div class="fs-banner fs-banner-warn">Search didn't finish — showing previous results. Tap Search hotels to retry.</div>`,
        );
        latestRows = priorRows;
        latestMeta = priorMeta;
        renderTable(results, filterAndSort(priorRows, state), state);
        renderFooter(footer, filterAndSort(priorRows, state), priorMeta);
      }
      hideSearchProgress();
      setBusy(false);
      return;
    }

    if (!scan.ok) {
      summary.textContent = `Search failed: ${scan.error ?? "unknown"}`;
      hideSearchProgress();
      setBusy(false);
      return;
    }

    latestRows = scan.properties ?? scan.top10 ?? [];
    latestMeta = {
      found: scan.found,
      scored: scan.scored,
      gated_out: scan.gated_out,
      credits_used: scan.credits_used,
      topExclusionReason: scan.topExclusionReason,
      cityMeanRating: scan.cityMeanRating,
      demoted: scan.demoted,
      ops: scan.ops,
      durationMs: scan.durationMs,
    };

    if (scan.demoted?.length) {
      banners.insertAdjacentHTML(
        "beforeend",
        `<div class="fs-banner fs-banner-warn">Hotels moved down because of room-condition complaints: ${scan.demoted
          .slice(0, 3)
          .map(
            (d) =>
              `${escapeHtml(displayHotelName(d.name))} (−${Number(d.plantPenalty ?? 0).toFixed(0)} points)`,
          )
          .join(" · ")}</div>`,
      );
    }

    summary.textContent = `Search finished: ${scan.found} hotels found, ${scan.scored} shown, ${scan.credits_used} credits used (${scan.durationMs ?? "?"} ms).`;
    {
      const visible = filterAndSort(latestRows, state);
      renderTable(results, visible, state);
      renderFooter(footer, visible, latestMeta);
    }

    // Prefer D1 warm path if available after scan.
    setSearchProgress("Updating results", 2, total);
    try {
      await loadIndex(citySlug, controller.signal);
    } catch {
      /* keep scan payload */
      banners.insertAdjacentHTML(
        "beforeend",
        `<div class="fs-banner fs-banner-warn">Couldn't refresh the saved index — showing this search's results.</div>`,
      );
    }
    if (needsPrices) {
      setSearchProgress("Checking prices", 3, total);
      try {
        await loadPrices(citySlug, state, controller.signal);
      } catch (err) {
        if (!controller.signal.aborted) {
          banners.insertAdjacentHTML(
            "beforeend",
            `<div class="fs-banner fs-banner-warn">Prices failed (${formatNetworkError(err)}). Hotels are shown without live prices — search again to retry.</div>`,
          );
        }
      }
    }

    finishSearchProgress();
    setBusy(false);
  }

  async function loadIndex(
    citySlug: string,
    signal?: AbortSignal,
    options: { full?: boolean; applyFilters?: boolean } = {},
  ): Promise<void> {
    const t0 = performance.now();
    const params = new URLSearchParams({ city: citySlug });
    if (options.full) params.set("full", "1");
    const data = await fetchJson<IndexResponse>(
      `/api/hotels/index?${params}`,
      {
        signal,
        timeoutMs: 20_000,
        retries: 2,
        onRetry: (a, m) => retryHook("Loading saved hotels")(a, m),
      },
    );
    const clientMs = performance.now() - t0;
    if (!data.ok || data.neverScanned || !data.properties?.length) return;
    latestRows = data.properties;
    latestMeta = {
      ...latestMeta,
      meanRating: data.meanRating,
      scannedAt: data.scannedAt,
      indexDurationMs: data.durationMs,
      clientFetchMs: Math.round(clientMs),
    };
    if (data.durationMs != null && data.durationMs < 500) {
      progress.textContent = `Saved results loaded in ${Math.round(clientMs)} ms.`;
    }
    const visible =
      options.applyFilters === false
        ? latestRows
        : filterAndSort(latestRows, form);
    renderTable(results, visible, form);
    renderFooter(footer, visible, latestMeta);
  }

  async function loadPrices(
    citySlug: string,
    state: HotelFormState,
    signal?: AbortSignal,
    onlyTokens?: Set<string>,
  ): Promise<void> {
    if (!hasDates(state)) return;
    summary.textContent =
      "Checking prices for your dates (~1 credit; cached for six hours)…";
    const data = await fetchJson<PricesResponse>("/api/hotels/prices", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        citySlug,
        checkInStart: state.checkInStart,
        checkInEnd: state.checkInStart,
        nightsMin: state.nightsMin,
        nightsMax: state.nightsMin,
        adults: state.adults,
        // Single window → top-up missing top-20 prices is allowed.
        topUp: true,
        // TA join is optional (+≤5 credits); keep price sweep ≤ window count.
        joinTa: false,
      }),
      signal,
      timeoutMs: 90_000,
      retries: 1,
      onRetry: (a, m) => retryHook("Checking prices")(a, m),
    });
    if (!data.ok || !data.properties?.length) {
      throw new Error(data.error ?? "No prices returned");
    }
    latestRows = data.properties
      .filter((r) => !onlyTokens || onlyTokens.has(r.token))
      .map((r) => ({
        ...r,
        nightlyUsd: r.nightly_usd ?? r.nightlyUsd ?? null,
      }));
    latestMeta = {
      ...latestMeta,
      credits_used: data.credits_used,
      pricedCount: data.pricedCount,
      top20PricedShare: data.top20PricedShare,
      priceOps: data.ops,
      priceDurationMs: data.durationMs,
    };
    const share = data.top20PricedShare != null
      ? `${Math.round(data.top20PricedShare * 100)}% of top-20 priced`
      : "";
    summary.textContent = `Prices found for ${data.pricedCount ?? 0} hotels. ${share ? `${share}. ` : ""}${data.credits_used ?? 0} credits used (${data.durationMs ?? "?"} ms).`;
    const visible = filterAndSort(latestRows, state);
    renderTable(results, visible, state);
    renderFooter(footer, visible, latestMeta);
  }

  function setBusy(busy: boolean, label = "Search hotels"): void {
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
    if (!busy) {
      rankingBtn.textContent = "Show ranking";
      syncCityMode();
    }
  }

  function setSearchProgress(
    label: string,
    completed: number,
    total: number,
  ): void {
    if (progressHideTimer) clearTimeout(progressHideTimer);
    const safeTotal = Math.max(1, total);
    const safeCompleted = Math.max(0, Math.min(completed, safeTotal));
    progressCompleted = safeCompleted;
    progressTotal = safeTotal;
    const percent = (safeCompleted / safeTotal) * 100;
    progressDock.hidden = false;
    progressDock.classList.remove("is-indeterminate");
    progressLabel.textContent = label;
    progressFill.style.transform = `scaleX(${percent / 100})`;
    progressCount.textContent = `${safeCompleted} of ${safeTotal}`;
    progressTrack.setAttribute("aria-valuenow", String(Math.round(percent)));
  }

  function hideSearchProgress(): void {
    if (progressHideTimer) clearTimeout(progressHideTimer);
    progressDock.hidden = true;
    progressDock.classList.remove("is-indeterminate");
    progressFill.style.removeProperty("transform");
    progressCount.textContent = "";
    progressTrack.removeAttribute("aria-valuenow");
  }

  function finishSearchProgress(): void {
    const countText = progressCount.textContent ?? "";
    const match = /^(\d+)\s+of\s+(\d+)$/.exec(countText);
    const total = match ? Number(match[2]) : 1;
    setSearchProgress("Done", total, total);
    if (progressHideTimer) clearTimeout(progressHideTimer);
    progressHideTimer = setTimeout(hideSearchProgress, 900);
  }
}

async function fetchPlan(
  city: string,
  form?: HotelFormState,
  signal?: AbortSignal,
  onRetry?: (attempt: number, max: number) => void,
): Promise<PlanResponse> {
  const params = new URLSearchParams({ city });
  if (form) params.set("scanPages", String(SCAN_PAGES_MOST_REVIEWED));
  if (form?.checkInStart) {
    params.set("checkInStart", form.checkInStart);
    params.set("checkInEnd", form.checkInEnd || form.checkInStart);
    params.set("nightsMin", String(form.nightsMin));
    params.set("nightsMax", String(form.nightsMax));
    params.set("adults", String(form.adults));
  }
  return fetchJson<PlanResponse>(`/api/hotels/plan?${params}`, {
    signal,
    timeoutMs: 15_000,
    retries: 2,
    onRetry,
  });
}

type FetchJsonOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  onRetry?: (attempt: number, maxRetries: number, error: unknown) => void;
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function isTimeoutError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "TimeoutError") ||
    (error instanceof Error &&
      (error.name === "TimeoutError" ||
        /timed out|timeout/i.test(error.message)))
  );
}

function shouldRetryHttpStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function formatNetworkError(error: unknown): string {
  if (!navigator.onLine) return "you're offline";
  if (isTimeoutError(error)) return "request timed out";
  if (error instanceof TypeError) return "network error";
  if (error instanceof Error && error.message) return error.message;
  return "connection problem";
}

async function fetchJson<T>(
  url: string,
  opts: FetchJsonOptions = {},
): Promise<T> {
  const retries = opts.retries ?? 2;
  const timeoutMs = opts.timeoutMs ?? 20_000;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (opts.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    if (attempt > 0) {
      opts.onRetry?.(attempt, retries, lastError);
      const delay =
        opts.retryDelayMs ?? Math.min(800 * 2 ** (attempt - 1), 4_000);
      await sleep(delay, opts.signal);
    }

    const timeout = new AbortController();
    const timer = setTimeout(() => {
      timeout.abort(new DOMException("Timed out", "TimeoutError"));
    }, timeoutMs);

    const onParentAbort = (): void => {
      timeout.abort(opts.signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    if (opts.signal) {
      if (opts.signal.aborted) onParentAbort();
      else opts.signal.addEventListener("abort", onParentAbort, { once: true });
    }

    try {
      const res = await fetch(url, {
        method: opts.method,
        headers: opts.headers,
        body: opts.body,
        signal: timeout.signal,
      });
      clearTimeout(timer);
      opts.signal?.removeEventListener("abort", onParentAbort);

      let data: T | undefined;
      try {
        data = (await res.json()) as T;
      } catch {
        if (!res.ok && shouldRetryHttpStatus(res.status) && attempt < retries) {
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }
        throw new Error(
          res.ok ? "Invalid response from server" : `HTTP ${res.status}`,
        );
      }

      if (!res.ok && shouldRetryHttpStatus(res.status) && attempt < retries) {
        lastError = new Error(
          (data as { error?: string } | undefined)?.error ??
            `HTTP ${res.status}`,
        );
        continue;
      }
      return data;
    } catch (error) {
      clearTimeout(timer);
      opts.signal?.removeEventListener("abort", onParentAbort);
      lastError = error;

      if (isAbortError(error) && opts.signal?.aborted) throw error;

      const timedOut = isTimeoutError(error) || (isAbortError(error) && !opts.signal?.aborted);
      if (timedOut) {
        lastError = new Error("Request timed out — check your connection and try again");
      }

      const retriable =
        timedOut ||
        error instanceof TypeError ||
        (error instanceof Error && /network|failed to fetch/i.test(error.message));
      if (attempt < retries && retriable) continue;
      throw lastError instanceof Error ? lastError : new Error(String(lastError));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function resolveCitySlug(form: HotelFormState): string {
  if (form.q.trim()) return slugifyCity(form.q);
  return form.city || "buenos-aires";
}

function populateCities(select: HTMLSelectElement): void {
  select.replaceChildren();
  for (const c of cityOptions()) {
    const opt = document.createElement("option");
    opt.value = c.slug;
    opt.textContent = c.display;
    select.append(opt);
  }
}

function applyFormToDom(root: HTMLElement, form: HotelFormState): void {
  setSelect(root, "#hs-city", form.city);
  setVal(root, "#hs-q", form.q);
  setCheck(root, "#hs-other-city", Boolean(form.q.trim()));
  setVal(root, "#hs-checkin-start", form.checkInStart);
  // Legacy URLs carry checkInEnd + nights ranges; collapse to one stay.
  setVal(root, "#hs-checkout", form.checkInStart ? checkOutDate(form) : "");
  setVal(root, "#hs-adults", String(form.adults));
  setSelect(root, "#hs-strictness", form.strictness);
  setCheck(root, "#hs-require-ac", form.requireAC);
  setCheck(root, "#hs-require-desk", form.requireFrontDesk24h);
  setCheck(root, "#hs-branded-only", form.brandedOnly);
  setSelect(root, "#hs-min-reviews", String(form.minReviews));
  setVal(root, "#hs-budget-max", form.budgetMax != null ? String(form.budgetMax) : "");
  setSelect(root, "#hs-sort", form.sort);
}

function readForm(root: HTMLElement): HotelFormState {
  const city = root.querySelector<HTMLSelectElement>("#hs-city")?.value ?? "";
  const minReviews = Number(
    root.querySelector<HTMLSelectElement>("#hs-min-reviews")?.value ?? 200,
  ) as 200 | 500 | 1000;
  const sortRaw =
    root.querySelector<HTMLSelectElement>("#hs-sort")?.value ?? "comfort";
  const sortAllowed: HotelFormState["sort"][] = [
    "comfort",
    "deal",
    "nightly",
    "rating",
    "reviews",
    "unknowns",
  ];
  const sort = sortAllowed.includes(sortRaw as HotelFormState["sort"])
    ? (sortRaw as HotelFormState["sort"])
    : "comfort";
  const budgetRaw = root.querySelector<HTMLInputElement>("#hs-budget-max")?.value;
  const checkIn =
    root.querySelector<HTMLInputElement>("#hs-checkin-start")?.value ?? "";
  const checkOut =
    root.querySelector<HTMLInputElement>("#hs-checkout")?.value ?? "";
  const nights = nightsBetween(checkIn, checkOut) ?? 2;
  const otherCity = !!root.querySelector<HTMLInputElement>("#hs-other-city")
    ?.checked;
  const qRaw =
    root.querySelector<HTMLInputElement>("#hs-q")?.value.trim() ?? "";
  return {
    city: city || DEFAULT_HOTEL_FORM.city,
    q: otherCity ? qRaw : "",
    checkInStart: checkIn,
    // A single check-in date with nights derived from the check-out picker.
    checkInEnd: checkIn,
    nightsMin: nights,
    nightsMax: nights,
    adults: Number(
      root.querySelector<HTMLInputElement>("#hs-adults")?.value ?? 2,
    ),
    pinLat: null,
    pinLng: null,
    strictness:
      root.querySelector<HTMLSelectElement>("#hs-strictness")?.value ===
      "confirmed_only"
        ? "confirmed_only"
        : "confirmed_or_unknown",
    requireAC: !!root.querySelector<HTMLInputElement>("#hs-require-ac")?.checked,
    requireFrontDesk24h: !!root.querySelector<HTMLInputElement>(
      "#hs-require-desk",
    )?.checked,
    brandedOnly: !!root.querySelector<HTMLInputElement>("#hs-branded-only")
      ?.checked,
    minReviews:
      minReviews === 500 || minReviews === 1000 ? minReviews : 200,
    budgetMax: budgetRaw ? Number(budgetRaw) : null,
    sort,
  };
}

function localIsoDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nightsBetween(checkIn: string, checkOut: string): number | null {
  if (!checkIn || !checkOut) return null;
  const a = Date.parse(`${checkIn}T00:00:00Z`);
  const b = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const nights = Math.round((b - a) / 86400000);
  return nights >= 1 ? Math.min(14, nights) : null;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function checkOutDate(form: HotelFormState): string {
  return addDaysIso(form.checkInStart, Math.max(1, form.nightsMin));
}

/** Keep check-out after check-in; default to a 2-night stay. */
function normalizeRanges(root: HTMLElement, changedId: string): void {
  const start = root.querySelector<HTMLInputElement>("#hs-checkin-start");
  const end = root.querySelector<HTMLInputElement>("#hs-checkout");
  if (!start || !end) return;
  if (start.value && !end.value) {
    end.value = addDaysIso(start.value, 2);
    return;
  }
  if (!start.value || !end.value) return;
  if (end.value <= start.value) {
    if (changedId === "hs-checkout") start.value = addDaysIso(end.value, -1);
    else end.value = addDaysIso(start.value, 2);
  }
}

function hasDates(form: HotelFormState): boolean {
  return Boolean(form.checkInStart);
}

/** Prefer API total; otherwise nightly × nights for the best stay. */
function stayTotalUsd(r: HotelRow): number | null {
  const total = r.total_usd ?? r.bestStay?.totalUsd ?? null;
  if (total != null && Number.isFinite(total)) return total;
  const nightly =
    r.nightly_usd ?? r.nightlyUsd ?? r.bestStay?.nightlyUsd ?? null;
  const nights = r.bestStay?.nights ?? null;
  if (nightly != null && nights != null && nights > 0) {
    return nightly * nights;
  }
  return null;
}

function syncUrl(form: HotelFormState): void {
  const params = formStateToSearchParams(form);
  const qs = params.toString();
  const next = qs ? `${location.pathname}?${qs}` : location.pathname;
  history.replaceState(null, "", next);
}

function filterAndSort(rows: HotelRow[], form: HotelFormState): HotelRow[] {
  // Once a price sweep has run, hotels without a found price are dropped.
  const pricesLoaded = rows.some((r) => stayTotalUsd(r) != null);
  let out = rows.filter((r) => {
    if ((r.reviews ?? 0) < form.minReviews) return false;
    if (form.brandedOnly && (r.brandTier ?? 0) < 1) return false;
    const total = stayTotalUsd(r);
    if (pricesLoaded && total == null) return false;
    if (form.budgetMax != null && total != null && total > form.budgetMax) {
      return false;
    }
    if (
      form.requireAC &&
      !factOk(r.facts?.hasAC, r.factValues?.hasAC, form.strictness)
    ) {
      return false;
    }
    if (
      form.requireFrontDesk24h &&
      !factOk(
        r.facts?.frontDesk24h,
        r.factValues?.frontDesk24h,
        form.strictness,
      )
    ) {
      return false;
    }
    return true;
  });

  out = [...out].sort((a, b) => {
    if (form.sort === "deal") {
      const da = a.deal_pct;
      const db = b.deal_pct;
      if (da == null && db == null) return (b.score ?? 0) - (a.score ?? 0);
      if (da == null) return 1;
      if (db == null) return -1;
      return db - da;
    }
    if (form.sort === "nightly") {
      const na = stayTotalUsd(a);
      const nb = stayTotalUsd(b);
      if (na == null && nb == null) return 0;
      if (na == null) return 1;
      if (nb == null) return -1;
      return na - nb;
    }
    if (form.sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (form.sort === "reviews") return (b.reviews ?? 0) - (a.reviews ?? 0);
    if (form.sort === "unknowns") {
      return countUnknown(a) - countUnknown(b);
    }
    return (b.score ?? 0) - (a.score ?? 0);
  });
  return out;
}

function factOk(
  status: FactStatus | undefined,
  value: boolean | null | undefined,
  strictness: HotelFormState["strictness"],
): boolean {
  if (status === "confirmed") return true;
  if (status === "inferred") return value === true;
  if (strictness === "confirmed_or_unknown" && status === "unknown") return true;
  return false;
}

function countUnknown(r: HotelRow): number {
  const f = r.facts ?? {};
  return [f.hasAC, f.hasWifi].filter((s) => s === "unknown").length;
}

function renderTable(
  container: HTMLElement,
  rows: HotelRow[],
  form?: HotelFormState,
): void {
  if (!rows.length) {
    container.innerHTML = `<div class="fs-empty"><strong>No hotels match.</strong><span>Lower the minimum comfort score, remove a requirement or search again.</span></div>`;
    return;
  }
  if (form?.sort === "deal" && !hasDates(form)) {
    container.innerHTML = `<div class="fs-empty"><strong>Set dates for best-deal sort.</strong><span>Pick a check-in range, then search again.</span></div>`;
    return;
  }
  // Price columns only appear once at least one row has price data,
  // so a dateless search isn't padded with empty "—" columns.
  const hasPrices = rows.some(
    (r) => stayTotalUsd(r) != null || r.deal_pct != null,
  );
  const columnCount = hasPrices ? 6 : 4;
  const body = rows
    .map((r, i) => {
      const href = datedHotelUrl(r.googleHotelsUrl, form);
      const total = stayTotalUsd(r);
      const stayDates = r.bestStay
        ? formatDateRange(r.bestStay.checkIn, r.bestStay.checkOut)
        : "";
      const deal = r.deal_pct != null ? dealChip(r.deal_pct, r.dealMethod) : "—";
      const priceCells = hasPrices
        ? `<td class="hs-cell-price hs-cell-num ${total == null ? "hs-cell-empty" : ""}">${total != null ? `$${Math.round(total)}` : "—"}${stayDates ? `<div class="fs-muted">${escapeHtml(stayDates)}</div>` : ""}</td>
        <td class="hs-cell-deal ${deal === "—" ? "hs-cell-empty" : ""}">${deal}</td>`
        : "";
      return `<tr data-token="${escapeHtml(r.token)}">
        <td class="hs-cell-rank">${i + 1}</td>
        <td class="hs-cell-score"><strong>${Number(r.score ?? 0).toFixed(1)}</strong></td>
        <td class="hs-cell-hotel"><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(displayHotelName(r.name))}</a></td>
        <td class="hs-cell-rating hs-cell-num">${r.rating?.toFixed(1) ?? "—"} <span class="fs-muted">(${formatReviewCount(r.reviews)})</span></td>
        ${priceCells}
      </tr>
      <tr class="hs-detail" hidden>
        <td colspan="${columnCount}">${detailCard(r, form)}</td>
      </tr>`;
    })
    .join("");

  const priceHead = hasPrices
    ? `<th class="hs-cell-num">Total stay $</th><th>Deal</th>`
    : "";
  container.innerHTML = `<div class="hs-table-wrap"><table class="hs-table">
    <thead><tr>
      <th class="hs-cell-rank">#</th><th>Comfort</th><th>Hotel</th><th class="hs-cell-num">Rating</th>${priceHead}
    </tr></thead>
    <tbody>${body}</tbody>
  </table></div>`;

  container.querySelectorAll<HTMLTableRowElement>("tr[data-token]").forEach((tr) => {
    const toggleDetail = async () => {
      const detail = tr.nextElementSibling as HTMLTableRowElement | null;
      if (!detail?.classList.contains("hs-detail")) return;
      detail.hidden = !detail.hidden;
      if (!detail.hidden) {
        const token = tr.dataset.token;
        if (token) {
          bindReviewAnalysis(detail, token);
          bindPropertyExpand(detail, token, form);
        }
      }
    };
    tr.addEventListener("click", (event) => {
      if ((event.target as HTMLElement).closest("a,button")) return;
      void toggleDetail();
    });
  });
}

function formatReviewCount(reviews: number | null | undefined): string {
  return (reviews ?? 0).toLocaleString("en-US");
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-08-10", "2026-08-12" → "Aug 10–12" (or "Aug 30 – Sep 1"). */
function formatDateRange(checkIn: string, checkOut: string): string {
  const a = checkIn.split("-").map(Number);
  const b = checkOut.split("-").map(Number);
  if (a.length !== 3 || b.length !== 3) return `${checkIn}→${checkOut}`;
  const [, am, ad] = a as [number, number, number];
  const [, bm, bd] = b as [number, number, number];
  const aLabel = `${MONTHS[am - 1]} ${ad}`;
  return am === bm
    ? `${aLabel}–${bd}`
    : `${aLabel} – ${MONTHS[bm - 1]} ${bd}`;
}

/** Only surface meaningful bargains (≥25% under expected). */
const DEAL_CHIP_MIN = 0.25;

function dealChip(
  dealPct: number,
  method: "fit" | "fallback" | null | undefined,
): string {
  if (dealPct < DEAL_CHIP_MIN) return "—";
  const pct = `${Math.round(dealPct * 100)}%`;
  const label = `${pct} under`;
  const explanation =
    method === "fallback"
      ? `${pct} better value than the city median`
      : `${pct} below the price expected for this quality`;
  return `<span class="hs-chip hs-chip-good" title="${escapeHtml(explanation)}">${label}</span>`;
}

function datedHotelUrl(
  raw: string | null | undefined,
  form?: HotelFormState,
): string {
  if (!raw) return "#";
  try {
    const url = new URL(raw);
    // Always pin USA / English / USD so locale doesn't follow the browser.
    url.searchParams.set("gl", "us");
    url.searchParams.set("hl", "en");
    url.searchParams.set("curr", "USD");
    if (form?.checkInStart) {
      url.searchParams.set("checkin", form.checkInStart);
      url.searchParams.set("checkout", checkOutDate(form));
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function detailCard(r: HotelRow, form?: HotelFormState): string {
  const sub = r.subscores ?? {};
  const bars = [
    ["Base rating", sub.quality ?? r.quality],
    ["Low-rating penalty", sub.consistencyPenalty ?? r.consistencyPenalty],
    ["Room-condition penalty", sub.plantPenalty ?? r.plantPenalty],
    ["Brand adjustment", sub.brandBonus],
    ["Tripadvisor adjustment", sub.taBonus],
    ["Hotel class adjustment", sub.classNudge],
  ]
    .map(
      ([k, v]) =>
        `<div class="hs-bar"><span>${escapeHtml(String(k))}</span><strong>${Number(v ?? 0).toFixed(1)}</strong></div>`,
    )
    .join("");
  const matrix =
    r.matrix?.length
      ? `<table class="hs-matrix"><thead><tr><th>In</th><th>Out</th><th>$/n</th></tr></thead><tbody>${r.matrix
          .map(
            (m) =>
              `<tr><td>${escapeHtml(m.checkIn)}</td><td>${escapeHtml(m.checkOut)}</td><td>${m.nightlyUsd != null ? `$${Math.round(m.nightlyUsd)}` : "—"}</td></tr>`,
          )
          .join("")}</tbody></table>`
      : "";
  const breakdown = (r.breakdown ?? [])
    .filter((item) => item.total >= 20)
    .sort((a, b) => (b.negRate ?? 0) - (a.negRate ?? 0))
    .slice(0, 8)
    .map(
      (item) =>
        `<span class="hs-chip ${(item.negRate ?? 0) >= 0.15 ? "hs-chip-bad" : ""}">${escapeHtml(item.name)} · ${item.negRate == null ? "no rating" : `${Math.round(item.negRate * 100)}% negative`}, ${item.total} mentions</span>`,
    )
    .join(" ");
  const whitelist = (r.whitelist ?? [])
    .map((badge) => `<span class="hs-chip hs-chip-good">${escapeHtml(badge)}</span>`)
    .join(" ");
  const mapsUrl =
    r.lat != null && r.lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.lat},${r.lng}`)}`
      : null;
  return `<div class="hs-card">
    <div class="hs-bars">${bars}</div>
    ${breakdown ? `<div class="hs-breakdown"><strong>Review categories</strong><div>${breakdown}</div></div>` : ""}
    ${whitelist ? `<div class="hs-whitelist"><strong>List matches</strong> ${whitelist}</div>` : ""}
    ${matrix ? `<div class="hs-matrix-wrap"><strong>Date × price</strong>${matrix}</div>` : ""}
    <div class="hs-review-signals" data-review-slot>
      ${reviewSignalsMarkup(r.reviewFeatures)}
    </div>
    <div class="hs-expand" data-expand-slot>
      <button type="button" class="fs-btn" data-load-property>Load prices and hotel details (~1 credit)</button>
    </div>
    ${mapsUrl ? `<a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer">Open map</a> · ` : ""}
    ${r.googleHotelsUrl ? `<p><a href="${escapeHtml(datedHotelUrl(r.googleHotelsUrl, form))}" target="_blank" rel="noopener noreferrer">Open in Google Hotels</a></p>` : ""}
  </div>`;
}

function reviewSignalsMarkup(
  features: HotelRow["reviewFeatures"],
): string {
  if (!features) {
    return `<button type="button" class="fs-btn" data-analyze-reviews>Analyze recent reviews (~2 credits)</button>`;
  }
  const topics = Object.entries(features.topics)
    .filter(([, signal]) => signal.sampleSize > 0)
    .sort((a, b) => b[1].confidence - a[1].confidence)
    .slice(0, 8)
    .map(([topic, signal]) => {
      const summary =
        signal.negative > signal.positive
          ? "mostly negative"
          : signal.positive > signal.negative
            ? "mostly positive"
            : "mixed";
      const tone =
        signal.negative > signal.positive
          ? "hs-chip-bad"
          : signal.positive > signal.negative
            ? "hs-chip-good"
            : "";
      return `<span class="hs-chip ${tone}" title="Based on ${signal.sampleSize} matching review passages">${escapeHtml(topic)} · ${summary} (${signal.sampleSize})</span>`;
    })
    .join(" ");
  const evidence = Object.entries(features.topics)
    .flatMap(([topic, signal]) =>
      (signal.evidence ?? [])
        .filter((item) => item.sentiment === "negative")
        .slice(0, 1)
        .map(
          (item) =>
            `<li><strong>${escapeHtml(topic)}:</strong> “${escapeHtml(item.excerpt)}”</li>`,
        ),
    )
    .slice(0, 5)
    .join("");
  return `<p><strong>What recent reviews mention</strong> (${features.reviewCount} reviews)</p><div>${topics || "These reviews don't mention the tracked comfort details."}</div>${evidence ? `<details><summary>Review quotes</summary><ul class="hs-evidence">${evidence}</ul></details>` : ""}`;
}

async function expandProperty(
  detailRow: HTMLTableRowElement,
  token: string,
  form?: HotelFormState,
): Promise<void> {
  const slot = detailRow.querySelector<HTMLElement>("[data-expand-slot]");
  if (!slot || slot.dataset.loaded === "1") return;
  slot.textContent = "Loading hotel details…";
  const params = new URLSearchParams();
  const checkIn = form?.checkInStart;
  if (checkIn) {
    params.set("checkIn", checkIn);
    const d = new Date(`${checkIn}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + (form?.nightsMin ?? 2));
    params.set("checkOut", d.toISOString().slice(0, 10));
  }
  if (form?.adults) params.set("adults", String(form.adults));
  try {
    const data = await fetchJson<{
      ok: boolean;
      freeCancellationSeen?: boolean;
      address?: string | null;
      offers?: { source?: string; total_price?: { extracted_price?: number } }[];
      topThings?: unknown;
      error?: string;
    }>(`/api/hotels/property/${encodeURIComponent(token)}?${params}`, {
      timeoutMs: 45_000,
      retries: 2,
    });
    if (!data.ok) {
      slot.innerHTML = `<p>Couldn't load hotel details: ${escapeHtml(data.error ?? "unknown")}</p><button type="button" class="fs-btn" data-load-property>Retry</button>`;
      delete slot.dataset.loaded;
      return;
    }
    const offers = (data.offers ?? [])
      .slice(0, 5)
      .map((o) => {
        const price = o.total_price?.extracted_price;
        return `<li>${escapeHtml(o.source ?? "offer")}${price != null ? ` · $${Math.round(price)}` : ""}</li>`;
      })
      .join("");
    slot.innerHTML = `
      ${data.address ? `<p>${escapeHtml(data.address)}</p>` : ""}
      <p>Free cancellation: ${data.freeCancellationSeen ? "listed" : "not listed in these prices"}</p>
      ${data.topThings ? `<details><summary>Hotel notes</summary><pre class="hs-top-things">${escapeHtml(JSON.stringify(data.topThings, null, 2))}</pre></details>` : ""}
      ${offers ? `<ul class="hs-offers">${offers}</ul>` : "<p>No prices found.</p>"}
    `;
    slot.dataset.loaded = "1";
  } catch (e) {
    slot.innerHTML = `<p>Couldn't load hotel details: ${escapeHtml(formatNetworkError(e))}</p><button type="button" class="fs-btn" data-load-property>Retry</button>`;
    delete slot.dataset.loaded;
  }
}

function bindPropertyExpand(
  detailRow: HTMLTableRowElement,
  token: string,
  form?: HotelFormState,
): void {
  const button =
    detailRow.querySelector<HTMLButtonElement>("[data-load-property]");
  if (!button || button.dataset.bound === "1") return;
  button.dataset.bound = "1";
  const run = async (event: Event) => {
    event.stopPropagation();
    const btn =
      detailRow.querySelector<HTMLButtonElement>("[data-load-property]");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Loading hotel details…";
    }
    await expandProperty(detailRow, token, form);
    const retry =
      detailRow.querySelector<HTMLButtonElement>("[data-load-property]");
    if (retry && retry !== btn) {
      retry.addEventListener("click", run, { once: true });
    }
  };
  button.addEventListener("click", run);
}

function bindReviewAnalysis(
  detailRow: HTMLTableRowElement,
  token: string,
): void {
  const button =
    detailRow.querySelector<HTMLButtonElement>("[data-analyze-reviews]");
  const slot = detailRow.querySelector<HTMLElement>("[data-review-slot]");
  if (!button || !slot || button.dataset.bound === "1") return;
  button.dataset.bound = "1";
  button.addEventListener("click", async (event) => {
    event.stopPropagation();
    button.disabled = true;
    button.textContent = "Analyzing reviews…";
    try {
      const data = await fetchJson<{
        ok: boolean;
        analysis?: { features?: HotelRow["reviewFeatures"] };
        credits_used?: number;
        error?: string;
      }>(`/api/hotels/reviews/${encodeURIComponent(token)}`, {
        method: "POST",
        timeoutMs: 60_000,
        retries: 1,
      });
      if (!data.ok || !data.analysis?.features) {
        button.disabled = false;
        button.textContent = `Retry analysis (${data.error ?? "failed"})`;
        return;
      }
      slot.innerHTML = `${reviewSignalsMarkup(data.analysis.features)}<p class="fs-muted">${data.credits_used ?? 0} credits used. Hotel details updated.</p>`;
    } catch (error) {
      button.disabled = false;
      button.textContent = `Retry analysis (${formatNetworkError(error)})`;
    }
  });
}

function renderFooter(
  footer: HTMLElement,
  rows: HotelRow[],
  meta: Record<string, unknown>,
): void {
  const stats = [`<span>Hotels shown: ${rows.length}</span>`];
  if (meta.credits_used != null) {
    stats.push(`<span>Credits used: ${meta.credits_used}</span>`);
  }
  if (meta.gated_out != null) {
    stats.push(`<span>Filtered out: ${meta.gated_out}</span>`);
  }
  if (meta.topExclusionReason != null) {
    stats.push(
      `<span>Most common filter: ${escapeHtml(exclusionReasonLabel(meta.topExclusionReason))}</span>`,
    );
  }
  if (meta.indexDurationMs != null) {
    stats.push(`<span>Load time: ${meta.indexDurationMs} ms</span>`);
  }
  footer.innerHTML = `
    ${stats.join("")}
    <a id="hs-download" href="#">Download JSON</a>
  `;
  footer.querySelector("#hs-download")?.addEventListener("click", (e) => {
    e.preventDefault();
    const blob = new Blob(
      [JSON.stringify({ meta, properties: rows }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hotel-search-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

function exclusionReasonLabel(value: unknown): string {
  const labels: Record<string, string> = {
    reviews_below_min: "too few reviews",
    rating_below_min: "rating too low",
    excluded_type: "excluded property type",
    require_ac: "air conditioning not confirmed",
    require_elevator: "elevator not confirmed",
    require_front_desk_24h: "24-hour front desk not confirmed",
    branded_only: "not a recognized brand",
    price_below_min: "price below minimum",
    price_above_max: "price above maximum",
  };
  return labels[String(value)] ?? "—";
}

function setVal(root: HTMLElement, sel: string, value: string): void {
  const el = root.querySelector<HTMLInputElement>(sel);
  if (el) el.value = value;
}
function setSelect(root: HTMLElement, sel: string, value: string): void {
  const el = root.querySelector<HTMLSelectElement>(sel);
  if (el) el.value = value;
}
function setCheck(root: HTMLElement, sel: string, checked: boolean): void {
  const el = root.querySelector<HTMLInputElement>(sel);
  if (el) el.checked = checked;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
