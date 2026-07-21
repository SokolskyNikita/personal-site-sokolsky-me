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
  googleHotelsUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  facts?: {
    hasAC?: FactStatus;
    hasElevator?: FactStatus;
    hasWifi?: FactStatus;
    frontDesk24h?: FactStatus;
  };
  subscores?: Record<string, number | string | null>;
  gatedOut?: boolean;
  gates?: string[];
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
    mode: string;
    maxCreditsPerScan: number;
  };
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

  populateCities(citySelect);
  let form = formStateFromSearchParams(new URLSearchParams(location.search));
  applyFormToDom(root, form);
  populateNeighborhoods(neighborhoodSelect, form.city, form.neighborhood);
  syncComfortLabel(root, comfortValue);

  let isRunning = false;
  let activeController: AbortController | undefined;
  let latestRows: HotelRow[] = [];
  let latestMeta: Record<string, unknown> = {};

  formEl.addEventListener("change", () => {
    form = readForm(root);
    if ((form.city || form.q) && !form.q) {
      populateNeighborhoods(neighborhoodSelect, form.city, form.neighborhood);
    }
    syncUrl(form);
    syncComfortLabel(root, comfortValue);
  });

  root.querySelector("#hs-min-comfort")?.addEventListener("input", () => {
    syncComfortLabel(root, comfortValue);
    form = readForm(root);
    syncUrl(form);
    if (latestRows.length) renderTable(results, filterAndSort(latestRows, form));
  });

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
    summary.textContent = "Checking index…";
    const citySlug = resolveCitySlug(form);
    try {
      const plan = await fetchPlan(citySlug);
      if (plan.ok && plan.index && plan.index.propertiesOnHand > 0) {
        const stale =
          !plan.index.fresh && plan.index.scannedAt != null
            ? `<div class="fs-banner fs-banner-warn">Index is ${plan.index.ageDays?.toFixed(0) ?? "?"} days old. Scan to refresh (~${plan.costs?.scanCreditsEstimate ?? 6} credits).</div>`
            : "";
        banners.innerHTML = stale;
        summary.textContent = `Warm index: ${plan.index.propertiesOnHand} properties · mean ★ ${plan.index.meanRating?.toFixed(2) ?? "—"}.`;
        await loadIndex(citySlug);
        return;
      }
      summary.textContent = plan.ok
        ? `Never scanned. Plan: ~${plan.costs?.scanCreditsEstimate ?? 6} credits (${plan.costs?.mode ?? "fixture"}). Click Search to scan.`
        : "Ready.";
    } catch {
      summary.textContent =
        "Ready. Click Search to plan and scan (uses fixtures unless SEARCHAPI_LIVE=1).";
    }
  }

  async function runSearch(state: HotelFormState): Promise<void> {
    const controller = new AbortController();
    activeController = controller;
    setBusy(true, "Planning…");
    showProgress("Checking index");
    banners.innerHTML = "";
    results.innerHTML = "";
    footer.innerHTML = "";
    progress.textContent = "";

    const citySlug = resolveCitySlug(state);
    const q = state.q.trim() || undefined;
    const bbox = neighborhoodBbox(state);

    let plan: PlanResponse;
    try {
      plan = await fetchPlan(citySlug, controller.signal);
    } catch (err) {
      if (controller.signal.aborted) {
        summary.textContent = "Cancelled.";
        hideProgress();
        setBusy(false);
        return;
      }
      summary.textContent = `Plan failed: ${err instanceof Error ? err.message : String(err)}`;
      hideProgress();
      setBusy(false);
      return;
    }

    const estimate = plan.costs?.scanCreditsEstimate ?? 6;
    const onHand = plan.index?.propertiesOnHand ?? 0;
    const fresh = plan.index?.fresh ?? false;

    if (onHand > 0 && fresh && !state.q && !bbox) {
      summary.textContent = `Using warm index (${onHand} properties). Scan skipped.`;
      await loadIndex(citySlug, controller.signal);
      hideProgress();
      setBusy(false);
      return;
    }

    summary.textContent = `Scan will use ~${estimate} credits (${plan.costs?.mode ?? "?"}). ${onHand ? `${onHand} cached · ` : ""}Confirming…`;
    banners.innerHTML = `<div class="fs-banner">About to spend ~${estimate} SearchAPI credits (max ${plan.costs?.maxCreditsPerScan ?? 80}). Mode: ${escapeHtml(plan.costs?.mode ?? "unknown")}.</div>`;
    setBusy(true, "Scanning…");
    showProgress("Scanning hotels");

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
          highestRatingPages: 2,
        }),
        signal: controller.signal,
      });
      scan = (await res.json()) as ScanResponse;
    } catch (err) {
      if (controller.signal.aborted) {
        summary.textContent = "Scan cancelled.";
        hideProgress();
        setBusy(false);
        return;
      }
      summary.textContent = `Scan failed: ${err instanceof Error ? err.message : String(err)}`;
      hideProgress();
      setBusy(false);
      return;
    }

    if (!scan.ok) {
      summary.textContent = `Scan failed: ${scan.error ?? "unknown"}`;
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
        `<div class="fs-banner fs-banner-warn">High-rating demotions (plant penalty): ${scan.demoted
          .slice(0, 3)
          .map(
            (d) =>
              `${escapeHtml(d.name)} (−${Number(d.plantPenalty ?? 0).toFixed(0)} plant)`,
          )
          .join(" · ")}</div>`,
      );
    }

    summary.textContent = `Scan done · ${scan.found} found · ${scan.scored} scored · ${scan.gated_out} gated · ${scan.credits_used} credits · ${scan.durationMs ?? "?"}ms`;
    renderTable(results, filterAndSort(latestRows, state));
    renderFooter(footer, latestRows, latestMeta);
    hideProgress();
    setBusy(false);

    // Prefer D1 warm path if available after scan.
    if (!q && !bbox) {
      try {
        await loadIndex(citySlug);
      } catch {
        /* keep scan payload */
      }
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
      progress.textContent = `Warm D1 load ${data.durationMs}ms server · ${Math.round(clientMs)}ms client.`;
    }
    renderTable(results, filterAndSort(latestRows, form));
    renderFooter(footer, latestRows, latestMeta);
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
  signal?: AbortSignal,
): Promise<PlanResponse> {
  const res = await fetch(`/api/hotels/plan?city=${encodeURIComponent(city)}`, {
    signal,
  });
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
  setVal(root, "#hs-min-comfort", String(form.minComfort));
  setSelect(root, "#hs-strictness", form.strictness);
  setCheck(root, "#hs-require-ac", form.requireAC);
  setCheck(root, "#hs-require-elevator", form.requireElevator);
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
  const sort =
    (root.querySelector<HTMLSelectElement>("#hs-sort")?.value as HotelFormState["sort"]) ??
    "comfort";
  const budgetRaw = root.querySelector<HTMLInputElement>("#hs-budget-max")?.value;
  return {
    city: city || DEFAULT_HOTEL_FORM.city,
    q: root.querySelector<HTMLInputElement>("#hs-q")?.value.trim() ?? "",
    neighborhood:
      root.querySelector<HTMLSelectElement>("#hs-neighborhood")?.value ?? "",
    minComfort: Number(
      root.querySelector<HTMLInputElement>("#hs-min-comfort")?.value ?? 0,
    ),
    strictness:
      root.querySelector<HTMLSelectElement>("#hs-strictness")?.value ===
      "confirmed_only"
        ? "confirmed_only"
        : "confirmed_or_unknown",
    requireAC: !!root.querySelector<HTMLInputElement>("#hs-require-ac")?.checked,
    requireElevator: !!root.querySelector<HTMLInputElement>(
      "#hs-require-elevator",
    )?.checked,
    requireFrontDesk24h: !!root.querySelector<HTMLInputElement>(
      "#hs-require-desk",
    )?.checked,
    brandedOnly: !!root.querySelector<HTMLInputElement>("#hs-branded-only")
      ?.checked,
    minReviews:
      minReviews === 500 || minReviews === 1000 ? minReviews : 200,
    budgetMax: budgetRaw ? Number(budgetRaw) : null,
    sort:
      sort === "rating" || sort === "reviews" || sort === "unknowns"
        ? sort
        : "comfort",
    scanPages: Number(
      root.querySelector<HTMLInputElement>("#hs-scan-pages")?.value ?? 4,
    ),
  };
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
  let out = rows.filter((r) => {
    if ((r.score ?? 0) < form.minComfort) return false;
    if ((r.reviews ?? 0) < form.minReviews) return false;
    if (form.brandedOnly && (r.brandTier ?? 0) < 1) return false;
    if (
      form.budgetMax != null &&
      r.nightlyUsd != null &&
      r.nightlyUsd > form.budgetMax
    ) {
      return false;
    }
    if (form.requireAC && !factOk(r.facts?.hasAC, form.strictness)) return false;
    if (
      form.requireElevator &&
      !factOk(r.facts?.hasElevator, form.strictness)
    ) {
      return false;
    }
    if (
      form.requireFrontDesk24h &&
      !factOk(r.facts?.frontDesk24h, form.strictness)
    ) {
      return false;
    }
    return true;
  });

  out = [...out].sort((a, b) => {
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
  strictness: HotelFormState["strictness"],
): boolean {
  if (status === "confirmed") return true;
  if (strictness === "confirmed_or_unknown" && status === "unknown") return true;
  return false;
}

function countUnknown(r: HotelRow): number {
  const f = r.facts ?? {};
  return [f.hasAC, f.hasElevator, f.hasWifi, f.frontDesk24h].filter(
    (s) => s === "unknown",
  ).length;
}

function renderTable(container: HTMLElement, rows: HotelRow[]): void {
  if (!rows.length) {
    container.innerHTML = `<div class="fs-empty"><strong>No hotels match.</strong><span>Loosen comfort or hard requirements, or scan a city.</span></div>`;
    return;
  }
  const body = rows
    .map((r, i) => {
      const low =
        r.lowStarShare != null ? `${(r.lowStarShare * 100).toFixed(1)}%` : "—";
      const worst =
        r.worstCategory && r.worstCategoryNeg != null
          ? `<span class="hs-chip ${r.worstCategoryNeg >= 0.15 ? "hs-chip-bad" : ""}">${escapeHtml(r.worstCategory)} ${(r.worstCategoryNeg * 100).toFixed(0)}% neg</span>`
          : "—";
      const plant =
        (r.plantPenalty ?? 0) >= 5
          ? `<span class="hs-chip hs-chip-bad">plant −${Number(r.plantPenalty).toFixed(0)}</span>`
          : "";
      const facts = factIcons(r);
      const href = r.googleHotelsUrl || "#";
      return `<tr data-token="${escapeHtml(r.token)}">
        <td>${i + 1}</td>
        <td><strong>${Number(r.score ?? 0).toFixed(1)}</strong></td>
        <td><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.name)}</a> ${plant}</td>
        <td>${r.rating?.toFixed(1) ?? "—"} <span class="fs-muted">(${r.reviews ?? 0})</span></td>
        <td>${low}</td>
        <td>${worst}</td>
        <td>${r.hotelClass ?? "—"}</td>
        <td>T${r.brandTier ?? 0}</td>
        <td class="hs-facts">${facts}</td>
      </tr>
      <tr class="hs-detail" hidden>
        <td colspan="9">${detailCard(r)}</td>
      </tr>`;
    })
    .join("");

  container.innerHTML = `<div class="hs-table-wrap"><table class="hs-table">
    <thead><tr>
      <th>#</th><th>Comfort</th><th>Hotel</th><th>★ (n)</th><th>1–2★ %</th><th>Worst</th><th>Class</th><th>Brand</th><th>Facts</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table></div>`;

  container.querySelectorAll<HTMLTableRowElement>("tr[data-token]").forEach((tr) => {
    tr.addEventListener("click", () => {
      const detail = tr.nextElementSibling as HTMLTableRowElement | null;
      if (detail?.classList.contains("hs-detail")) {
        detail.hidden = !detail.hidden;
      }
    });
  });
}

function factIcons(r: HotelRow): string {
  const parts: string[] = [];
  const map: [string, FactStatus | undefined][] = [
    ["AC", r.facts?.hasAC],
    ["Wi‑Fi", r.facts?.hasWifi],
    ["Elev", r.facts?.hasElevator],
    ["Desk", r.facts?.frontDesk24h],
  ];
  for (const [label, status] of map) {
    if (status === "confirmed") parts.push(`<span title="${label} confirmed">✓ ${label}</span>`);
    else if (status === "unknown") parts.push(`<span class="hs-unknown" title="${label} unknown">? ${label}</span>`);
    else parts.push(`<span class="hs-weak" title="${label}">△ ${label}</span>`);
  }
  return parts.join(" ");
}

function detailCard(r: HotelRow): string {
  const sub = r.subscores ?? {};
  const bars = [
    ["quality", sub.quality ?? r.quality],
    ["consistencyPenalty", sub.consistencyPenalty ?? r.consistencyPenalty],
    ["plantPenalty", sub.plantPenalty ?? r.plantPenalty],
    ["brandBonus", sub.brandBonus],
    ["classNudge", sub.classNudge],
  ]
    .map(
      ([k, v]) =>
        `<div class="hs-bar"><span>${escapeHtml(String(k))}</span><strong>${Number(v ?? 0).toFixed(1)}</strong></div>`,
    )
    .join("");
  return `<div class="hs-card">
    <p>Strong / weak / unknown facts shown in the Facts column (✓ confirmed · ? unknown). Plant and consistency penalties explain demotions.</p>
    <div class="hs-bars">${bars}</div>
    ${r.googleHotelsUrl ? `<p><a href="${escapeHtml(r.googleHotelsUrl)}" target="_blank" rel="noopener noreferrer">Open in Google Hotels</a></p>` : ""}
  </div>`;
}

function renderFooter(
  footer: HTMLElement,
  rows: HotelRow[],
  meta: Record<string, unknown>,
): void {
  footer.innerHTML = `
    <span>Shown: ${rows.length}</span>
    <span>Credits: ${meta.credits_used ?? "—"}</span>
    <span>Gated: ${meta.gated_out ?? "—"}</span>
    <span>Exclusion: ${escapeHtml(String(meta.topExclusionReason ?? "—"))}</span>
    <span>D1: ${meta.indexDurationMs ?? "—"}ms</span>
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
