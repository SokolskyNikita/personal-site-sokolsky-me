import {
  HEATMAP_CONCURRENCY,
  HEATMAP_DAYS,
} from "../../lib/hotels/constants";
import {
  addUtcDays,
  defaultHeatmapStart,
  heatmapDayCount,
  heatmapFormFromSearchParams,
  heatmapFormToSearchParams,
  type HeatmapFormState,
} from "../../lib/hotels/heatmap-url";

type HotelSuggestion = {
  type: string;
  title: string;
  subtitle?: string | null;
  propertyToken?: string | null;
  thumbnail?: string | null;
};

type DayPrice = {
  checkIn: string;
  checkOut: string;
  nightlyUsd: number | null;
  totalUsd: number | null;
  cached: boolean;
  status: "pending" | "ok" | "unavailable" | "error";
  error?: string;
};

type HotelQuotaStatus = {
  reason?: "per_ip_limit_reached" | "global_budget_reached" | null;
  resetAt?: string;
};

type PropertyPriceResponse = {
  ok: boolean;
  nightly_usd?: number | null;
  total_usd?: number | null;
  price_resolved?: boolean;
  cached?: boolean;
  credits_used?: number;
  error?: string;
  quota?: HotelQuotaStatus;
};

export function mountHotelPriceHeatmap(root: HTMLElement): void {
  const formEl = root.querySelector<HTMLFormElement>("#hh-form")!;
  const summary = root.querySelector<HTMLElement>("#hh-search-summary")!;
  const banners = root.querySelector<HTMLElement>("#hh-banners")!;
  const offlineBanner = root.querySelector<HTMLElement>("#hh-offline-banner");
  const progress = root.querySelector<HTMLElement>("#hh-progress")!;
  const results = root.querySelector<HTMLElement>("#hh-results")!;
  const footer = root.querySelector<HTMLElement>("#hh-footer")!;
  const runBtn = root.querySelector<HTMLButtonElement>("#hh-run")!;
  const cancelBtn = root.querySelector<HTMLButtonElement>("#hh-cancel")!;
  const creditHint = root.querySelector<HTMLElement>("#hh-credit-hint")!;
  const progressDock = root.querySelector<HTMLElement>("#hh-search-progress")!;
  const progressTrack = root.querySelector<HTMLElement>(
    "#hh-search-progress-track",
  )!;
  const progressFill = root.querySelector<HTMLElement>(
    "#hh-search-progress-fill",
  )!;
  const progressLabel = root.querySelector<HTMLElement>(
    "#hh-search-progress-label",
  )!;
  const progressCount = root.querySelector<HTMLElement>(
    "#hh-search-progress-count",
  )!;

  const queryInput = root.querySelector<HTMLInputElement>("#hh-hotel-query")!;
  const tokenInput = root.querySelector<HTMLInputElement>("#hh-hotel-token")!;
  const nameInput = root.querySelector<HTMLInputElement>("#hh-hotel-name")!;
  const suggestionsList = root.querySelector<HTMLElement>(
    "#hh-hotel-suggestions",
  )!;
  const spinner = root.querySelector<HTMLElement>("#hh-hotel-spinner");
  const startInput = root.querySelector<HTMLInputElement>("#hh-start")!;
  const monthsSelect = root.querySelector<HTMLSelectElement>("#hh-months")!;
  const nightsInput = root.querySelector<HTMLInputElement>("#hh-nights")!;
  const adultsInput = root.querySelector<HTMLInputElement>("#hh-adults")!;

  let abortController: AbortController | null = null;
  let dayPrices: DayPrice[] = [];
  let latestSuggestions: HotelSuggestion[] = [];
  let activeIndex = -1;
  let requestSeq = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let progressHideTimer: ReturnType<typeof setTimeout> | undefined;

  const readForm = (): HeatmapFormState => ({
    q: queryInput.value.trim(),
    token: tokenInput.value.trim(),
    name: nameInput.value.trim() || queryInput.value.trim(),
    start: startInput.value,
    months: clampInt(monthsSelect.value, 1, 6, 1),
    nights: clampInt(nightsInput.value, 1, 14, 1),
    adults: clampInt(adultsInput.value, 1, 8, 2),
  });

  const writeForm = (state: HeatmapFormState): void => {
    queryInput.value = state.q || state.name;
    tokenInput.value = state.token;
    nameInput.value = state.name;
    startInput.value = state.start || defaultHeatmapStart();
    monthsSelect.value = String(state.months);
    nightsInput.value = String(state.nights);
    adultsInput.value = String(state.adults);
    updateCreditHint(state);
  };

  const syncUrl = (state: HeatmapFormState): void => {
    const params = heatmapFormToSearchParams(state);
    const next = params.toString();
    const url = next
      ? `${window.location.pathname}?${next}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  };

  const updateCreditHint = (state: HeatmapFormState): void => {
    const days = heatmapDayCount(state.months);
    creditHint.textContent = `About ${days} credits when nothing is cached (1 per day · ${state.nights} night${state.nights === 1 ? "" : "s"}).`;
  };

  const setOffline = (): void => {
    if (offlineBanner) offlineBanner.hidden = navigator.onLine;
  };

  const setRunning = (running: boolean): void => {
    runBtn.disabled = running;
    cancelBtn.hidden = !running;
    queryInput.disabled = running;
    startInput.disabled = running;
    monthsSelect.disabled = running;
    nightsInput.disabled = running;
    adultsInput.disabled = running;
  };

  const setSearchProgress = (
    label: string,
    completed: number,
    total: number,
  ): void => {
    if (progressHideTimer) {
      clearTimeout(progressHideTimer);
      progressHideTimer = undefined;
    }
    progressDock.hidden = false;
    progressLabel.textContent = label;
    progressCount.textContent =
      total > 0 ? `${completed} / ${total}` : "";
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressFill.style.width = `${pct}%`;
    progressTrack.setAttribute("aria-valuenow", String(pct));
  };

  const hideSearchProgressSoon = (): void => {
    progressHideTimer = setTimeout(() => {
      progressDock.hidden = true;
    }, 1200);
  };

  const showBanner = (
    message: string,
    tone: "warn" | "danger" | "ok" = "warn",
  ): void => {
    banners.innerHTML = `<div class="fs-banner fs-banner-${tone}">${escapeHtml(message)}</div>`;
  };

  const clearBanners = (): void => {
    banners.innerHTML = "";
  };

  const hideSuggestions = (): void => {
    suggestionsList.hidden = true;
    suggestionsList.innerHTML = "";
    queryInput.setAttribute("aria-expanded", "false");
    queryInput.removeAttribute("aria-activedescendant");
    activeIndex = -1;
    latestSuggestions = [];
  };

  const setLoadingSuggestions = (loading: boolean): void => {
    if (spinner) spinner.hidden = !loading;
    queryInput.setAttribute("aria-busy", loading ? "true" : "false");
  };

  const renderSuggestions = (suggestions: HotelSuggestion[]): void => {
    latestSuggestions = suggestions;
    activeIndex = -1;
    setLoadingSuggestions(false);
    if (!suggestions.length) {
      hideSuggestions();
      return;
    }
    suggestionsList.innerHTML = suggestions
      .map((suggestion, index) => {
        const meta = suggestion.subtitle
          ? `<span class="fs-suggestion-meta">${escapeHtml(suggestion.subtitle)}</span>`
          : "";
        return `<li class="fs-suggestion" role="option" id="hh-opt-${index}" data-index="${index}" aria-selected="false"><span class="fs-suggestion-label">${escapeHtml(suggestion.title)}</span>${meta}</li>`;
      })
      .join("");
    suggestionsList.hidden = false;
    queryInput.setAttribute("aria-expanded", "true");
  };

  const selectSuggestion = async (
    suggestion: HotelSuggestion,
  ): Promise<void> => {
    queryInput.value = suggestion.title;
    nameInput.value = suggestion.title;
    tokenInput.value = "";
    hideSuggestions();
    setLoadingSuggestions(true);
    progress.textContent = "Resolving hotel…";
    try {
      const data = await fetchJson<{
        ok: boolean;
        token?: string;
        name?: string | null;
        error?: string;
        credits_used?: number;
      }>("/api/hotels/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: suggestion.title,
          subtitle: suggestion.subtitle ?? undefined,
          propertyToken: suggestion.propertyToken ?? undefined,
          adults: clampInt(adultsInput.value, 1, 8, 2),
        }),
        timeoutMs: 45_000,
        retries: 1,
      });
      if (!data.ok || !data.token) {
        throw new Error(data.error ?? "Could not resolve hotel");
      }
      tokenInput.value = data.token;
      nameInput.value = data.name ?? suggestion.title;
      queryInput.value = nameInput.value;
      progress.textContent = "Hotel ready.";
      clearBanners();
      syncUrl(readForm());
    } catch (error) {
      tokenInput.value = "";
      showBanner(
        error instanceof Error ? error.message : "Could not resolve hotel",
        "danger",
      );
      progress.textContent = "";
    } finally {
      setLoadingSuggestions(false);
      updateCreditHint(readForm());
    }
  };

  const setActiveSuggestion = (index: number): void => {
    const options = suggestionsList.querySelectorAll<HTMLElement>(
      ".fs-suggestion",
    );
    activeIndex = index;
    options.forEach((option, i) => {
      const selected = i === index;
      option.classList.toggle("is-active", selected);
      option.setAttribute("aria-selected", String(selected));
      if (selected) {
        queryInput.setAttribute("aria-activedescendant", option.id);
      }
    });
    if (index < 0) queryInput.removeAttribute("aria-activedescendant");
  };

  const fetchSuggestions = async (q: string): Promise<void> => {
    const seq = ++requestSeq;
    setLoadingSuggestions(true);
    try {
      const data = await fetchJson<{
        ok?: boolean;
        suggestions?: HotelSuggestion[];
        error?: string;
      }>(`/api/hotels/autocomplete?${new URLSearchParams({ q })}`, {
        timeoutMs: 20_000,
        retries: 0,
      });
      if (seq !== requestSeq) return;
      if (queryInput.value.trim().length < 2) {
        setLoadingSuggestions(false);
        hideSuggestions();
        return;
      }
      if (!data.ok || !Array.isArray(data.suggestions)) {
        setLoadingSuggestions(false);
        hideSuggestions();
        return;
      }
      renderSuggestions(data.suggestions);
    } catch {
      if (seq === requestSeq) {
        setLoadingSuggestions(false);
        hideSuggestions();
      }
    }
  };

  const renderHeatmap = (state: HeatmapFormState): void => {
    if (!dayPrices.length) {
      results.innerHTML = `<div class="fs-empty"><strong>No heatmap yet.</strong><span>Choose a hotel and build the ${HEATMAP_DAYS}-day price grid.</span></div>`;
      return;
    }

    const priced = dayPrices
      .map((d) => d.nightlyUsd)
      .filter((n): n is number => n != null && Number.isFinite(n));
    const min = priced.length ? Math.min(...priced) : null;
    const max = priced.length ? Math.max(...priced) : null;
    const hotelLabel = state.name || state.q || "Hotel";

    const cells = dayPrices
      .map((day) => {
        const tone = priceTone(day.nightlyUsd, min, max);
        const label =
          day.status === "pending"
            ? "…"
            : day.nightlyUsd != null
              ? `$${Math.round(day.nightlyUsd)}`
              : day.status === "unavailable"
                ? "—"
                : "!";
        const title =
          day.nightlyUsd != null
            ? `${day.checkIn}: $${Math.round(day.nightlyUsd)}/night`
            : `${day.checkIn}: ${day.status}`;
        const dow = weekdayShort(day.checkIn);
        const dom = day.checkIn.slice(-2).replace(/^0/, "");
        return `<button type="button" class="hh-cell hh-tone-${tone}" data-check-in="${escapeHtml(day.checkIn)}" title="${escapeHtml(title)}" ${day.status === "pending" ? "disabled" : ""}>
          <span class="hh-cell-dow">${escapeHtml(dow)}</span>
          <span class="hh-cell-day">${escapeHtml(dom)}</span>
          <span class="hh-cell-price">${escapeHtml(label)}</span>
        </button>`;
      })
      .join("");

    const legend =
      min != null && max != null
        ? `<div class="hh-legend" aria-hidden="true">
            <span>$${Math.round(min)}</span>
            <span class="hh-legend-bar"></span>
            <span>$${Math.round(max)}</span>
          </div>`
        : "";

    results.innerHTML = `
      <section class="hh-heatmap" aria-label="Price heatmap for ${escapeHtml(hotelLabel)}">
        <header class="hh-heatmap-head">
          <div>
            <h2 class="hh-heatmap-title">${escapeHtml(hotelLabel)}</h2>
            <p class="hh-heatmap-meta">${escapeHtml(state.start)} → ${escapeHtml(addUtcDays(state.start, dayPrices.length - 1))} · ${state.nights} night${state.nights === 1 ? "" : "s"} · ${state.adults} adult${state.adults === 1 ? "" : "s"}</p>
          </div>
          ${legend}
        </header>
        <div class="hh-grid">${cells}</div>
      </section>`;
  };

  const runScan = async (): Promise<void> => {
    clearBanners();
    const state = readForm();
    if (!state.start) {
      showBanner("Pick a start date.", "warn");
      startInput.focus();
      return;
    }
    if (!state.token && !state.q) {
      showBanner("Pick a hotel from the autocomplete list.", "warn");
      queryInput.focus();
      return;
    }

    abortController?.abort();
    abortController = new AbortController();
    const { signal } = abortController;
    setRunning(true);
    syncUrl(state);

    try {
      let token = state.token;
      let hotelName = state.name || state.q;
      if (!token) {
        setSearchProgress("Resolving hotel", 0, 1);
        progress.textContent = "Resolving hotel…";
        const resolved = await fetchJson<{
          ok: boolean;
          token?: string;
          name?: string | null;
          error?: string;
        }>("/api/hotels/resolve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: state.q,
            adults: state.adults,
          }),
          signal,
          timeoutMs: 45_000,
          retries: 1,
        });
        if (!resolved.ok || !resolved.token) {
          throw new Error(resolved.error ?? "Could not resolve hotel");
        }
        token = resolved.token;
        hotelName = resolved.name ?? hotelName;
        tokenInput.value = token;
        nameInput.value = hotelName;
        queryInput.value = hotelName;
        state.token = token;
        state.name = hotelName;
        syncUrl(state);
      }

      const days = heatmapDayCount(state.months);
      dayPrices = Array.from({ length: days }, (_, i) => {
        const checkIn = addUtcDays(state.start, i);
        return {
          checkIn,
          checkOut: addUtcDays(checkIn, state.nights),
          nightlyUsd: null,
          totalUsd: null,
          cached: false,
          status: "pending" as const,
        };
      });
      renderHeatmap({ ...state, token, name: hotelName });
      summary.textContent = `Scanning ${hotelName} · ${days} days`;
      setSearchProgress("Checking prices", 0, days);

      let next = 0;
      let completed = 0;
      let credits = 0;
      let cacheHits = 0;
      let unavailable = 0;
      let failed = 0;
      let quotaReason:
        | "per_ip_limit_reached"
        | "global_budget_reached"
        | null = null;

      const resolveNext = async (): Promise<void> => {
        while (next < dayPrices.length) {
          if (signal.aborted || quotaReason) return;
          const index = next++;
          const day = dayPrices[index];
          if (!day) return;
          const params = new URLSearchParams({
            checkIn: day.checkIn,
            checkOut: day.checkOut,
            adults: String(state.adults),
            priceOnly: "1",
          });
          try {
            const exact = await fetchJson<PropertyPriceResponse>(
              `/api/hotels/property/${encodeURIComponent(token)}?${params}`,
              {
                signal,
                timeoutMs: 45_000,
                retries: 1,
              },
            );
            if (!exact.ok && isHotelQuotaError(exact.error)) {
              quotaReason = exact.error;
              day.status = "error";
              day.error = exact.error;
              return;
            }
            if (!exact.ok || exact.price_resolved !== true) {
              throw new Error(exact.error ?? "Price was not resolved");
            }
            day.nightlyUsd = exact.nightly_usd ?? null;
            day.totalUsd = exact.total_usd ?? null;
            day.cached = exact.cached === true;
            day.status =
              day.nightlyUsd == null && day.totalUsd == null
                ? "unavailable"
                : "ok";
            if (day.status === "unavailable") unavailable += 1;
            credits += exact.credits_used ?? 0;
            if (exact.cached) cacheHits += 1;
          } catch (error) {
            if (signal.aborted) throw error;
            day.status = "error";
            day.error =
              error instanceof Error ? error.message : "lookup_failed";
            failed += 1;
          } finally {
            completed += 1;
            setSearchProgress("Checking prices", completed, days);
            renderHeatmap({ ...state, token, name: hotelName });
            progress.textContent = `${completed}/${days} days · ${credits} credits · ${cacheHits} cached`;
          }
        }
      };

      await Promise.all(
        Array.from(
          { length: Math.min(HEATMAP_CONCURRENCY, dayPrices.length) },
          async () => resolveNext(),
        ),
      );

      if (quotaReason) {
        showBanner(
          quotaReason === "global_budget_reached"
            ? "Shared daily SearchAPI budget was reached. Partial heatmap kept."
            : "Your daily hotel price-search limit was reached. Partial heatmap kept.",
          "warn",
        );
      }

      const pricedCount = dayPrices.filter((d) => d.nightlyUsd != null).length;
      summary.textContent = `${hotelName} · ${pricedCount}/${days} priced · ${credits} credits (${cacheHits} cached)`;
      footer.textContent = `Window ${state.start} → ${addUtcDays(state.start, days - 1)} · ${state.nights} night stay · unavailable ${unavailable} · failed ${failed}`;
      hideSearchProgressSoon();
    } catch (error) {
      if (isAbortError(error)) {
        summary.textContent = "Scan cancelled.";
        progress.textContent = "";
      } else {
        showBanner(
          error instanceof Error ? error.message : "Heatmap scan failed",
          "danger",
        );
        summary.textContent = "Scan failed.";
      }
      hideSearchProgressSoon();
    } finally {
      setRunning(false);
      abortController = null;
    }
  };

  // Wire events
  queryInput.addEventListener("input", () => {
    tokenInput.value = "";
    nameInput.value = "";
    const q = queryInput.value.trim();
    if (debounceTimer) clearTimeout(debounceTimer);
    if (q.length < 2) {
      requestSeq += 1;
      setLoadingSuggestions(false);
      hideSuggestions();
      return;
    }
    setLoadingSuggestions(true);
    debounceTimer = setTimeout(() => {
      void fetchSuggestions(q);
    }, 250);
  });

  queryInput.addEventListener("keydown", (event) => {
    if (suggestionsList.hidden || latestSuggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion(
        Math.min(latestSuggestions.length - 1, activeIndex + 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion(Math.max(0, activeIndex - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = latestSuggestions[activeIndex];
      if (suggestion) void selectSuggestion(suggestion);
    } else if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  suggestionsList.addEventListener("mousedown", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      ".fs-suggestion",
    );
    if (!target) return;
    event.preventDefault();
    const index = Number(target.dataset.index);
    const suggestion = latestSuggestions[index];
    if (suggestion) void selectSuggestion(suggestion);
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target as Node)) return;
    const search = root.querySelector(".hh-hotel-search");
    if (search && !search.contains(event.target as Node)) hideSuggestions();
  });

  for (const el of [monthsSelect, nightsInput, adultsInput, startInput]) {
    el.addEventListener("change", () => {
      const state = readForm();
      updateCreditHint(state);
      syncUrl(state);
    });
  }

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    void runScan();
  });

  cancelBtn.addEventListener("click", () => {
    abortController?.abort();
  });

  window.addEventListener("online", setOffline);
  window.addEventListener("offline", setOffline);
  setOffline();

  const initial = heatmapFormFromSearchParams(
    new URLSearchParams(window.location.search),
  );
  if (!initial.start) initial.start = defaultHeatmapStart();
  if (!initial.q && initial.name) initial.q = initial.name;
  writeForm(initial);
  if (initial.token && initial.name) {
    summary.textContent = `Ready to scan ${initial.name}.`;
  }
}

function priceTone(
  nightly: number | null,
  min: number | null,
  max: number | null,
): string {
  if (nightly == null || min == null || max == null) return "empty";
  if (max <= min) return "mid";
  const t = (nightly - min) / (max - min);
  if (t <= 0.2) return "low";
  if (t <= 0.4) return "low-mid";
  if (t <= 0.6) return "mid";
  if (t <= 0.8) return "high-mid";
  return "high";
}

function weekdayShort(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()] ?? "";
}

function clampInt(
  raw: string,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function isHotelQuotaError(
  value: unknown,
): value is "per_ip_limit_reached" | "global_budget_reached" {
  return (
    value === "per_ip_limit_reached" || value === "global_budget_reached"
  );
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type FetchJsonOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  retries?: number;
};

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
      await sleep(Math.min(800 * 2 ** (attempt - 1), 4_000), opts.signal);
    }

    const timeout = new AbortController();
    const timer = setTimeout(() => {
      timeout.abort(new DOMException("Timed out", "TimeoutError"));
    }, timeoutMs);

    const onParentAbort = (): void => {
      timeout.abort(
        opts.signal?.reason ?? new DOMException("Aborted", "AbortError"),
      );
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
      if (attempt >= retries) throw error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("request_failed");
}

function shouldRetryHttpStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}
