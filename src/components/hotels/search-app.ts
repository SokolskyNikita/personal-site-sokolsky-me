import {
  cityOptions,
  DEFAULT_HOTEL_FORM,
  formStateFromSearchParams,
  formStateToSearchParams,
  neighborhoodsFor,
  slugifyCity,
  type HotelFormState,
} from "../../lib/hotels/url";

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
  const progress = root.querySelector<HTMLElement>("#hs-progress")!;
  const results = root.querySelector<HTMLElement>("#hs-results")!;
  const footer = root.querySelector<HTMLElement>("#hs-footer")!;
  const runBtn = root.querySelector<HTMLButtonElement>("#hs-run")!;
  const cancelBtn = root.querySelector<HTMLButtonElement>("#hs-cancel")!;
  const comfortValue = root.querySelector<HTMLElement>("#hs-comfort-value")!;
  const progressDock = root.querySelector<HTMLElement>("#hs-search-progress")!;
  const progressLabel = root.querySelector<HTMLElement>(
    "#hs-search-progress-label",
  )!;
  const citySelect = root.querySelector<HTMLSelectElement>("#hs-city")!;
  const neighborhoodSelect =
    root.querySelector<HTMLSelectElement>("#hs-neighborhood")!;
  const qInput = root.querySelector<HTMLInputElement>("#hs-q")!;
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
  applyFormToDom(root, form);
  populateNeighborhoods(neighborhoodSelect, form.city, form.neighborhood);
  syncComfortLabel(root, comfortValue);
  syncCityMode();
  syncCreditHint();
  syncSortOptions();

  let isRunning = false;
  let activeController: AbortController | undefined;
  let latestRows: HotelRow[] = [];
  let latestMeta: Record<string, unknown> = {};

  // Controls that only filter/sort already-loaded rows. Changing them never
  // costs credits and should update the table instantly.
  const refineIds = new Set([
    "hs-min-comfort",
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
    form = readForm(root);
    if (targetId === "hs-city" && form.city) {
      // Picking a listed city takes over from any free-text city.
      qInput.value = "";
      form = readForm(root);
    }
    syncCityMode();
    if (!form.q) {
      populateNeighborhoods(neighborhoodSelect, form.city, form.neighborhood);
    }
    syncUrl(form);
    syncComfortLabel(root, comfortValue);
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

  root.querySelector("#hs-min-comfort")?.addEventListener("input", () => {
    syncComfortLabel(root, comfortValue);
    form = readForm(root);
    syncUrl(form);
    if (latestRows.length) {
      renderTable(results, filterAndSort(latestRows, form), form);
    }
  });

  function syncCityMode(): void {
    const hasQ = qInput.value.trim().length > 0;
    if (hasQ) {
      citySelect.value = "";
      neighborhoodSelect.value = "";
      neighborhoodSelect.disabled = true;
      neighborhoodSelect.title =
        "Neighborhood filters are only available for listed cities.";
    } else {
      if (!citySelect.value) citySelect.value = DEFAULT_HOTEL_FORM.city;
      neighborhoodSelect.disabled = false;
      neighborhoodSelect.title = "";
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
        "No dates set — the search returns hotels without prices.";
      return;
    }
    const checkOut = checkOutDate(state);
    const nights = state.nightsMin;
    creditHint.textContent = `Prices for ${formatDateRange(state.checkInStart, checkOut)} (${nights} night${nights === 1 ? "" : "s"}) · up to 1 extra credit.`;
  }

  cancelBtn.addEventListener("click", () => {
    activeController?.abort();
    cancelBtn.disabled = true;
    progress.textContent = "Cancelling…";
  });

  // Auto-load warm index for shareable URLs / BA default.
  void bootstrap();

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isRunning) return;
    form = readForm(root);
    syncUrl(form);
    await runSearch(form);
  });

  async function bootstrap(): Promise<void> {
    summary.textContent = "Loading saved results…";
    const citySlug = resolveCitySlug(form);
    try {
      const plan = await fetchPlan(citySlug, form);
      if (plan.ok && plan.index && plan.index.propertiesOnHand > 0) {
        const stale =
          !plan.index.fresh && plan.index.scannedAt != null
            ? `<div class="fs-banner fs-banner-warn">These results are ${plan.index.ageDays?.toFixed(0) ?? "?"} days old. Update them for about ${plan.costs?.scanCreditsEstimate ?? 6} credits.</div>`
            : "";
        banners.innerHTML = stale;
        summary.textContent = `${plan.index.propertiesOnHand} saved hotels. Average rating: ${plan.index.meanRating?.toFixed(2) ?? "—"}.`;
        await loadIndex(citySlug);
        if (hasDates(form)) {
          summary.textContent =
            "Saved hotels loaded. Search to fetch prices for your dates.";
        }
        return;
      }
      summary.textContent = plan.ok
        ? `No saved hotels yet. A new search will use about ${plan.costs?.scanCreditsEstimate ?? 6} credits.`
        : "Ready.";
    } catch {
      summary.textContent = "Ready.";
    }
  }

  async function runSearch(state: HotelFormState): Promise<void> {
    const controller = new AbortController();
    activeController = controller;
    setBusy(true, "Searching…");
    showProgress("Checking saved results");
    banners.innerHTML = "";
    results.innerHTML = "";
    footer.innerHTML = "";
    progress.textContent = "";

    const citySlug = resolveCitySlug(state);
    const q = state.q.trim() || undefined;
    const bbox = neighborhoodBbox(state);

    let plan: PlanResponse;
    try {
      plan = await fetchPlan(citySlug, state, controller.signal);
    } catch (err) {
      if (controller.signal.aborted) {
        summary.textContent = "Cancelled.";
        hideProgress();
        setBusy(false);
        return;
      }
      summary.textContent = `Couldn't check the search cost: ${err instanceof Error ? err.message : String(err)}`;
      hideProgress();
      setBusy(false);
      return;
    }

    const estimate = plan.costs?.scanCreditsEstimate ?? 6;
    const onHand = plan.index?.propertiesOnHand ?? 0;
    const fresh = plan.index?.fresh ?? false;

    if (onHand > 0 && fresh && !state.q && !bbox) {
      summary.textContent = `Using ${onHand} saved hotel${onHand === 1 ? "" : "s"}.`;
      await loadIndex(citySlug, controller.signal);
      if (hasDates(state)) {
        await loadPrices(citySlug, state, controller.signal);
      }
      hideProgress();
      setBusy(false);
      return;
    }

    summary.textContent = `Searching hotels now. Expected cost: about ${estimate} credits${onHand ? `; ${onHand} saved hotels are also available` : ""}.`;
    banners.innerHTML = `<div class="fs-banner">SearchAPI credit limit for this run: ${plan.costs?.maxCreditsPerScan ?? 80}.</div>`;
    setBusy(true, "Searching…");
    showProgress("Searching hotels");

    let scan: ScanResponse;
    try {
      const res = await fetch("/api/hotels/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          citySlug,
          q,
          bbox,
          force: true,
          mostReviewedPages: state.scanPages,
          highestRatingPages: 4,
        }),
        signal: controller.signal,
      });
      scan = (await res.json()) as ScanResponse;
    } catch (err) {
      if (controller.signal.aborted) {
        summary.textContent = "Search cancelled.";
        hideProgress();
        setBusy(false);
        return;
      }
      summary.textContent = `Search failed: ${err instanceof Error ? err.message : String(err)}`;
      hideProgress();
      setBusy(false);
      return;
    }

    if (!scan.ok) {
      summary.textContent = `Search failed: ${scan.error ?? "unknown"}`;
      hideProgress();
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
              `${escapeHtml(d.name)} (−${Number(d.plantPenalty ?? 0).toFixed(0)} points)`,
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
    hideProgress();
    setBusy(false);

    // Prefer D1 warm path if available after scan. Skip the city-wide index
    // for neighborhood searches so the bbox-filtered scan rows are kept.
    try {
      if (!bbox) {
        await loadIndex(citySlug);
      }
      if (hasDates(state)) {
        await loadPrices(
          citySlug,
          state,
          undefined,
          bbox ? new Set(latestRows.map((r) => r.token)) : undefined,
        );
      }
    } catch {
      /* keep scan payload */
    }
  }

  async function loadIndex(
    citySlug: string,
    signal?: AbortSignal,
  ): Promise<void> {
    const t0 = performance.now();
    const res = await fetch(
      `/api/hotels/index?city=${encodeURIComponent(citySlug)}`,
      { signal },
    );
    const data = (await res.json()) as IndexResponse;
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
    const visible = filterAndSort(latestRows, form);
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
    showProgress("Checking prices");
    const res = await fetch("/api/hotels/prices", {
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
    });
    const data = (await res.json()) as PricesResponse;
    if (!data.ok || !data.properties?.length) {
      summary.textContent = `Couldn't load prices: ${data.error ?? "unknown"}`;
      return;
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
  }

  function showProgress(label: string): void {
    progressDock.hidden = false;
    progressDock.classList.add("is-indeterminate");
    progressLabel.textContent = label;
  }

  function hideProgress(): void {
    progressDock.hidden = true;
    progressDock.classList.remove("is-indeterminate");
  }
}

async function fetchPlan(
  city: string,
  form?: HotelFormState,
  signal?: AbortSignal,
): Promise<PlanResponse> {
  const params = new URLSearchParams({ city });
  if (form) params.set("scanPages", String(form.scanPages));
  if (form?.checkInStart) {
    params.set("checkInStart", form.checkInStart);
    params.set("checkInEnd", form.checkInEnd || form.checkInStart);
    params.set("nightsMin", String(form.nightsMin));
    params.set("nightsMax", String(form.nightsMax));
    params.set("adults", String(form.adults));
  }
  const res = await fetch(`/api/hotels/plan?${params}`, { signal });
  return (await res.json()) as PlanResponse;
}

function resolveCitySlug(form: HotelFormState): string {
  if (form.q.trim()) return slugifyCity(form.q);
  return form.city || "buenos-aires";
}

function neighborhoodBbox(
  form: HotelFormState,
): [number, number, number, number] | undefined {
  if (!form.neighborhood) return undefined;
  const n = neighborhoodsFor(form.city).find((x) => x.name === form.neighborhood);
  if (!n || n.bbox.length !== 4) return undefined;
  return n.bbox as [number, number, number, number];
}

function populateCities(select: HTMLSelectElement): void {
  select.replaceChildren();
  for (const c of cityOptions()) {
    const opt = document.createElement("option");
    opt.value = c.slug;
    opt.textContent = c.display;
    select.append(opt);
  }
  const custom = document.createElement("option");
  custom.value = "";
  custom.textContent = "Other (use free text)";
  select.append(custom);
}

function populateNeighborhoods(
  select: HTMLSelectElement,
  citySlug: string,
  selected: string,
): void {
  select.replaceChildren();
  const all = document.createElement("option");
  all.value = "";
  all.textContent = "All neighborhoods";
  select.append(all);
  for (const n of neighborhoodsFor(citySlug)) {
    const opt = document.createElement("option");
    opt.value = n.name;
    opt.textContent = n.name;
    if (n.name === selected) opt.selected = true;
    select.append(opt);
  }
}

function applyFormToDom(root: HTMLElement, form: HotelFormState): void {
  setSelect(root, "#hs-city", form.city);
  setVal(root, "#hs-q", form.q);
  setSelect(root, "#hs-neighborhood", form.neighborhood);
  setVal(root, "#hs-checkin-start", form.checkInStart);
  // Legacy URLs carry checkInEnd + nights ranges; collapse to one stay.
  setVal(root, "#hs-checkout", form.checkInStart ? checkOutDate(form) : "");
  setVal(root, "#hs-adults", String(form.adults));
  setVal(root, "#hs-min-comfort", String(form.minComfort));
  setSelect(root, "#hs-strictness", form.strictness);
  setCheck(root, "#hs-require-ac", form.requireAC);
  setCheck(root, "#hs-require-desk", form.requireFrontDesk24h);
  setCheck(root, "#hs-branded-only", form.brandedOnly);
  setSelect(root, "#hs-min-reviews", String(form.minReviews));
  setVal(root, "#hs-budget-max", form.budgetMax != null ? String(form.budgetMax) : "");
  setSelect(root, "#hs-sort", form.sort);
  setVal(root, "#hs-scan-pages", String(form.scanPages));
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
  return {
    city: city || DEFAULT_HOTEL_FORM.city,
    q: root.querySelector<HTMLInputElement>("#hs-q")?.value.trim() ?? "",
    neighborhood:
      root.querySelector<HTMLSelectElement>("#hs-neighborhood")?.value ?? "",
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
    minComfort: Number(
      root.querySelector<HTMLInputElement>("#hs-min-comfort")?.value ?? 0,
    ),
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
    scanPages: Number(
      root.querySelector<HTMLInputElement>("#hs-scan-pages")?.value ?? 8,
    ),
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

function syncUrl(form: HotelFormState): void {
  const params = formStateToSearchParams(form);
  const qs = params.toString();
  const next = qs ? `${location.pathname}?${qs}` : location.pathname;
  history.replaceState(null, "", next);
}

function syncComfortLabel(root: HTMLElement, label: HTMLElement): void {
  const v = root.querySelector<HTMLInputElement>("#hs-min-comfort")?.value ?? "0";
  label.textContent = v;
}

function filterAndSort(rows: HotelRow[], form: HotelFormState): HotelRow[] {
  // Once a price sweep has run, hotels without a found price are dropped.
  const pricesLoaded = rows.some(
    (r) => (r.nightly_usd ?? r.nightlyUsd) != null,
  );
  let out = rows.filter((r) => {
    if ((r.score ?? 0) < form.minComfort) return false;
    if ((r.reviews ?? 0) < form.minReviews) return false;
    if (form.brandedOnly && (r.brandTier ?? 0) < 1) return false;
    const nightly = r.nightly_usd ?? r.nightlyUsd;
    if (pricesLoaded && nightly == null) return false;
    if (form.budgetMax != null && nightly != null && nightly > form.budgetMax) {
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
      const na = a.nightly_usd ?? a.nightlyUsd;
      const nb = b.nightly_usd ?? b.nightlyUsd;
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
  return [f.hasAC, f.hasWifi, f.frontDesk24h].filter(
    (s) => s === "unknown",
  ).length;
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
    (r) => (r.nightly_usd ?? r.nightlyUsd) != null || r.deal_pct != null,
  );
  const columnCount = hasPrices ? 8 : 6;
  const body = rows
    .map((r, i) => {
      const low =
        r.lowStarShare != null ? `${(r.lowStarShare * 100).toFixed(1)}%` : "—";
      const plant =
        (r.plantPenalty ?? 0) >= 5
          ? `<span class="hs-chip hs-chip-bad" title="Penalized for room-condition complaints">room issues −${Number(r.plantPenalty).toFixed(0)}</span>`
          : "";
      const facts = factIcons(r);
      const href = datedHotelUrl(r.googleHotelsUrl, form);
      const nightly = r.nightly_usd ?? r.nightlyUsd;
      const stayDates = r.bestStay
        ? formatDateRange(r.bestStay.checkIn, r.bestStay.checkOut)
        : "";
      const deal = r.deal_pct != null ? dealChip(r.deal_pct, r.dealMethod) : "—";
      const priceCells = hasPrices
        ? `<td class="hs-cell-price hs-cell-num ${nightly == null ? "hs-cell-empty" : ""}">${nightly != null ? `$${Math.round(nightly)}` : "—"}${stayDates ? `<div class="fs-muted">${escapeHtml(stayDates)}</div>` : ""}</td>
        <td class="hs-cell-deal ${deal === "—" ? "hs-cell-empty" : ""}">${deal}</td>`
        : "";
      return `<tr data-token="${escapeHtml(r.token)}">
        <td class="hs-cell-rank">${i + 1}</td>
        <td class="hs-cell-score"><strong>${Number(r.score ?? 0).toFixed(1)}</strong></td>
        <td class="hs-cell-hotel"><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.name)}</a> ${plant}</td>
        <td class="hs-cell-rating hs-cell-num">${r.rating?.toFixed(1) ?? "—"} <span class="fs-muted">(${formatReviewCount(r.reviews)})</span></td>
        <td class="hs-cell-low hs-cell-num">${low}</td>
        ${priceCells}
        <td class="hs-facts">${facts}</td>
      </tr>
      <tr class="hs-detail" hidden>
        <td colspan="${columnCount}">${detailCard(r, form)}</td>
      </tr>`;
    })
    .join("");

  const priceHead = hasPrices
    ? `<th class="hs-cell-num">$/night</th><th>Deal</th>`
    : "";
  container.innerHTML = `<div class="hs-table-wrap"><table class="hs-table">
    <thead><tr>
      <th class="hs-cell-rank">#</th><th>Comfort</th><th>Hotel</th><th class="hs-cell-num">Rating</th><th class="hs-cell-num" title="Share of 1- and 2-star reviews">1–2★</th>${priceHead}<th>Amenities</th>
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

function dealChip(
  dealPct: number,
  method: "fit" | "fallback" | null | undefined,
): string {
  const pct = `${Math.abs(dealPct * 100).toFixed(0)}%`;
  const better = dealPct >= 0;
  const label = better ? `${pct} under` : `${pct} over`;
  const explanation =
    method === "fallback"
      ? `${pct} ${better ? "better" : "worse"} value than the city median`
      : `${pct} ${better ? "below" : "above"} the price expected for this quality`;
  const tone =
    dealPct >= 0.2 ? "hs-chip-good" : dealPct <= -0.15 ? "hs-chip-bad" : "";
  return `<span class="hs-chip ${tone}" title="${escapeHtml(explanation)}">${label}</span>`;
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

function factIcons(r: HotelRow): string {
  const parts: string[] = [];
  const map: [string, FactStatus | undefined][] = [
    ["AC", r.facts?.hasAC],
    ["Wi‑Fi", r.facts?.hasWifi],
    ["Desk", r.facts?.frontDesk24h],
  ];
  for (const [label, status] of map) {
    if (status === "confirmed") parts.push(`<span title="${label} confirmed">✓ ${label}</span>`);
    else if (status === "inferred") {
      parts.push(`<span title="${label} inferred from reviews">≈ ${label}</span>`);
    }
    else if (status === "conflicting") {
      parts.push(`<span class="hs-weak" title="${label} conflicting evidence">± ${label}</span>`);
    }
    else if (status === "unknown") parts.push(`<span class="hs-unknown" title="${label} unknown">? ${label}</span>`);
    else parts.push(`<span class="hs-weak" title="${label}">△ ${label}</span>`);
  }
  return parts.join(" ");
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
  const factGroups = factLists(r);
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
    <div class="hs-fact-lists">${factGroups}</div>
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

function factLists(r: HotelRow): string {
  const labels: Array<[string, keyof NonNullable<HotelRow["facts"]>]> = [
    ["Air conditioning", "hasAC"],
    ["Wi-Fi", "hasWifi"],
    ["24-hour front desk", "frontDesk24h"],
  ];
  const groups: Record<string, string[]> = {
    Confirmed: [],
    Conflicting: [],
    Unknown: [],
  };
  for (const [label, key] of labels) {
    const status = r.facts?.[key];
    const value = r.factValues?.[key];
    if (status === "confirmed" || (status === "inferred" && value === true)) {
      groups.Confirmed!.push(`${status === "confirmed" ? "✓" : "≈"} ${label}`);
    } else if (
      status === "conflicting" ||
      (status === "inferred" && value === false)
    ) {
      groups.Conflicting!.push(`${status === "conflicting" ? "±" : "△"} ${label}`);
    } else {
      groups.Unknown!.push(`? ${label}`);
    }
  }
  return Object.entries(groups)
    .map(
      ([group, items]) =>
        `<div><strong>${group}</strong><span>${items.map(escapeHtml).join(" · ") || "—"}</span></div>`,
    )
    .join("");
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
    const res = await fetch(
      `/api/hotels/property/${encodeURIComponent(token)}?${params}`,
    );
    const data = (await res.json()) as {
      ok: boolean;
      freeCancellationSeen?: boolean;
      address?: string | null;
      offers?: { source?: string; total_price?: { extracted_price?: number } }[];
      topThings?: unknown;
      error?: string;
    };
    if (!data.ok) {
      slot.textContent = `Couldn't load hotel details: ${data.error ?? "unknown"}`;
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
    slot.textContent = `Couldn't load hotel details: ${e instanceof Error ? e.message : String(e)}`;
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
  button.addEventListener("click", async (event) => {
    event.stopPropagation();
    button.disabled = true;
    button.textContent = "Loading hotel details…";
    await expandProperty(detailRow, token, form);
  });
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
      const res = await fetch(
        `/api/hotels/reviews/${encodeURIComponent(token)}`,
        { method: "POST" },
      );
      const data = (await res.json()) as {
        ok: boolean;
        analysis?: { features?: HotelRow["reviewFeatures"] };
        credits_used?: number;
        error?: string;
      };
      if (!data.ok || !data.analysis?.features) {
        button.disabled = false;
        button.textContent = `Analysis failed: ${data.error ?? "unknown"}`;
        return;
      }
      slot.innerHTML = `${reviewSignalsMarkup(data.analysis.features)}<p class="fs-muted">${data.credits_used ?? 0} credits used. Hotel details updated.</p>`;
    } catch (error) {
      button.disabled = false;
      button.textContent =
        error instanceof Error ? error.message : "Analysis failed";
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
