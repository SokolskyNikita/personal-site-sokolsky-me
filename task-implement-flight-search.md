# Feature: /flights/search on sokolsky.me

Add a page at `/flights/search` to this existing Astro.js site (deployed on Cloudflare Workers — adapter, wrangler config, and deploy pipeline are already set up; extend them, don't recreate them). The page finds the cheapest itineraries for a chosen search mode — economy, premium economy, business (lie-flat not required), or business (all segments TRUE lie-flat) — over the next X days. V1 ships with defaults of EZE ↔ USA gateway airports, but the domain layer must already BE anywhere-to-anywhere: "USA" and "EZE" exist only as registry data and form defaults, never as concepts in code. The core logic must also be reusable outside this page (future CLI or cron price-tracker).

## Operating rules — read before writing any code
These override your defaults. Violating them wastes the entire run.

1. GROUND TRUTH FIRST. Before any code: read package.json, the Astro config, the wrangler config, one existing page, and one existing component/island. State (briefly) the conventions you found — TS config, styling system, island framework, layout components — and which you'll follow. If anything in this spec conflicts with the repo, stop and ask; do not improvise an integration.
2. FIXTURE-FIRST IS A HARD GATE. Zero parser code before real SerpApi fixtures exist on disk. Use the SerpApi MCP available in this workspace to make real queries and save the raw JSON — at least one BUSINESS-cabin response and one ECONOMY-cabin response (their amenity strings differ, and the parser must handle both). If the MCP or key fails, STOP and report the error verbatim — never hand-write "example" fixture JSON. A parser built on invented schema is worthless output.
3. STAGE GATES. Follow the build order below. At the end of each stage run typecheck (tsc --noEmit or astro check), lint, and vitest, and show the results. Do not start the next stage with failures present. Commit at each passing stage with a conventional message so a bad later stage can be rolled back.
4. NO PLACEHOLDERS. No TODO stubs, no mock data presented as real, no "simplified for brevity", no commented-out code, no unwired files. Everything you write must be complete and reachable.
5. SCOPE DISCIPLINE. Build exactly what's specified. No extra features, no speculative abstractions beyond the interfaces named here, no new dependencies beyond those listed — if you're convinced one is essential, ask first.
6. SURGICAL DIFFS. Changes to existing files (wrangler config, package.json, layouts) are minimal additions. Never reformat, restructure, or "clean up" unrelated code.
7. WHEN BLOCKED OR AMBIGUOUS, ask one targeted question instead of guessing. A wrong guess about repo integration invalidates everything downstream.
8. NO UNVERIFIED "DONE". Any claim that something works must be backed by a command you actually ran in that stage. The acceptance checklist at the bottom is the definition of done — literal commands, all passing.

Match the repo's existing conventions everywhere: TypeScript config, styling system, island framework (if the site already uses React/Preact/Svelte islands, use that; if none, use Preact or vanilla TS), lint/format setup, and the site's layout/header/footer components.

## Generality invariants — anywhere-to-anywhere readiness
These are structural requirements, each with an enforcement mechanism. The future feature "search any location set against any location set" must require ONLY new registry data and changed form defaults.

1. NO DIRECTION IN THE DOMAIN. `LegSearch = { origin: LocationRef, dest: LocationRef, dateRange, maxStops, cabin, lieFlatPolicy, currency, gl, hl }`. There is no to-usa/from-usa concept anywhere; reversing a search means swapping origin and dest. The UI gets a swap button instead of a direction toggle.
2. SYMMETRIC ENDPOINTS. `LocationRef` = a registry id OR a raw validated IATA code, accepted identically on either side. Origin and destination use the same component, same validation, same resolution path.
3. COMPOSABLE REGISTRY. A registry entry may list airports AND/OR other registry ids (e.g., `western-europe` references `france`, `germany`, `LHR`). Resolution is recursive with cycle detection and airport dedupe.
4. PURE CROSS-PRODUCT PLANNER. Planner output = origin batches × destination batches × dates, with exact call count for arbitrary set sizes on both sides — not 1 × M. Batching applies to both endpoints.
5. PARAMETERIZED VARIANTS. Ranking/grouping is one pure function `groupResults(result, { groupBy: 'date', topN })` — future `groupBy: 'destination' | 'origin'` must be new values of the same parameter. Search modes are one exported data table (see SEARCH_MODES) — future modes must be new rows, not new code paths.
6. NO HARDCODED MARKET OR CABIN. `currency`, `gl`, `hl`, `cabin` are LegSearch fields (defaults USD/us/en; cabin from the selected mode) threaded through to the provider — never constants inside the provider.
7. SELF-DESCRIBING STATE. The full search spec round-trips to URL query params (spec → URL on run, URL → prefilled form on load), carrying `cabin` and `lieFlatPolicy` explicitly (not just a preset id) so any combination is expressible and shareable.
8. NAMING GATE. The string "usa" appears only in the locations registry data and the form's default-value constant — never in type names, function names, route names, or logic. Mechanically enforced in acceptance.
9. GENERALITY PROOF TEST. A vitest e2e (fake provider) runs a composed non-USA pair — add registry entries `western-europe-sample` (composing 2 country entries + 1 raw airport) and `south-america-sample` — through resolver → planner → classifier → policy → grouping. The test exists to prove the pair required only data.

## Stack additions
Zod (runtime validation of provider responses + API route inputs), vitest (if not already present), Cloudflare KV (cache + counters). Nothing else without asking.

## Data source
SerpApi's Google Flights engine (`https://serpapi.com/search?engine=google_flights`) via native fetch, SERVER-SIDE ONLY — the key must never reach client code or client-visible responses. Read `SERPAPI_API_KEY` from the Cloudflare env binding in API routes; for local dev, add it to `.dev.vars` (gitignored) plus a `.dev.vars.example`, and document `wrangler secret put SERPAPI_API_KEY` for prod in the README.

Key request params: `type=2` (one-way), `travel_class` mapped from the spec's cabin (economy=1, premium_economy=2, business=3, first=4 — verify against docs/MCP), `outbound_date=YYYY-MM-DD`, `stops` (use SerpApi's server-side stop filtering — verify exact enum values against docs/MCP, don't guess), `currency`/`gl`/`hl` from the spec, `adults=1`, optional `deep_search=true` (user-facing toggle; slower, matches browser results). SerpApi accepts comma-separated multi-airport values for `departure_id`/`arrival_id` — batch on BOTH sides into as few calls as possible; verify the max accepted list length empirically via the MCP and encode it as a constant with a comment citing what you observed. Cache keys are the normalized request params, so cabin is naturally part of the key — an economy search never serves business cache entries or vice versa.

## Core lib — src/lib/flights/ (UI-agnostic, no Astro imports)
- `FlightProvider` interface: `search(spec: LegSearch): Promise<ItineraryOption[]>`. `SerpApiProvider` is the only implementation now; the interface must not leak SerpApi field names. Future: Amadeus, Duffel.
- `locations.ts`: typed registry per invariant 3. Ships with: `usa-gateways` `{type: "country", airports: ["JFK","EWR","BOS","IAD","PHL","CLT","ATL","MIA","ORD","DTW","DFW","IAH","DEN","LAX","SFO","SEA"]}`, `EZE` `{type: "airport"}`, and the two composed sample entries from invariant 9. Types: airport | city | country | region | continent.
- `LocationResolver`: LocationRef → deduped airport list; recursive for composed entries; cycle-safe; validates raw IATA codes (3 letters, uppercase).
- `SearchPlanner`: per invariant 4 → `QueryPlan` with exact call count.
- `Cabin` enum: economy | premium_economy | business | first (first has no UI preset in v1 but must work end-to-end via URL params).
- `LieFlatClassifier`: pure function over a segment's amenity strings (SerpApi per-segment `extensions`), run on every segment regardless of cabin (classification is displayed even when not filtered on). Case-insensitive substring rules kept in one exported table:
  - LIE_FLAT: "lie flat", "flat bed", "individual suite", "suite"
  - NOT_LIE_FLAT: "angled flat", "reclining seat", "extra reclining", "average legroom", "below average legroom", "above average legroom"
  - UNKNOWN: no seat-type string present
- `LieFlatPolicy`: `none` | `any_segment` | `longest_segment` | `all_segments`, applied at itinerary level. `none` filters nothing. For the others: UNKNOWN never satisfies a policy; itineraries qualifying only via UNKNOWN segments are excluded unless `includeUnverified`, then shown marked "unverified". `includeUnverified` is meaningless when policy is `none`.
- `SEARCH_MODES`: exported constant table mapping UI presets → {cabin, lieFlatPolicy}. Ships with exactly four rows:
  - `economy` → { economy, none }
  - `premium-economy` → { premium_economy, none }
  - `business` → { business, none }
  - `business-lie-flat` → { business, all_segments } (default)
  All four policies remain implemented and tested; presets are just the rows exposed in the UI.
- Types via Zod schemas: `LocationRef`, `Segment` (carrier, flight no, aircraft, dep/arr airport+time, duration, cabin, amenities, seatClassification), `ItineraryOption` (segments, layovers, totalDuration, price, currency, provider, googleFlightsUrl, raw provider blob retained), `LegSearch`, `QueryPlan`, `SearchResult`.
- `groupResults` per invariant 5.
- Parsing: consume both `best_flights` and `other_flights`; drop options missing a price (debug log); dedupe identical itineraries (same segments + price) across batches. Must parse business AND economy fixtures cleanly.

## Runtime topology (fit Worker constraints)
Two API routes + a client island that orchestrates. Each Worker invocation performs AT MOST ONE SerpApi subrequest — this respects Workers subrequest/wall-time limits and gives progressive rendering for free.
- `POST /api/flights/plan`: validates the form spec (Zod), returns the QueryPlan, exact call count, how many steps are already KV-cached, and the remaining daily budget. No SerpApi calls.
- `POST /api/flights/query`: executes exactly ONE plan step (one date × one origin batch × one dest batch). Order: KV cache check → budget check → rate-limit check → SerpApi fetch → parse/classify/filter → cache raw JSON in KV (TTL 6h, configurable) → return qualifying options. Timeout + one retry with backoff on 429/5xx; on final failure return a structured error the client renders as a per-step warning, never a page failure.
- Client island: form → call /plan → show "This search = N API calls (M cached, R budget remaining). Run?" → if uncached calls exceed remaining budget, DISABLE run and say so (this is what keeps future large anywhere-to-anywhere plans from torching the quota) → else execute steps with concurrency 3 → render results progressively grouped by date. A failed step shows inline and the rest continue.

## Cost & abuse controls (public page, metered API)
- Global daily SerpApi budget: KV counter, default 100 calls/day. Over budget → /query serves cache-only and the UI shows a "daily quota reached — cached results only" banner.
- Per-IP rate limit on /query (KV, e.g. 15 calls/min) using the CF-Connecting-IP header.
- Optional `SEARCH_ACCESS_TOKEN` secret: if set, /query requires it (simple field on the form); if unset, page is fully public. /plan is always open.
- Add the KV namespace binding (e.g. `FLIGHT_CACHE`) to the existing wrangler config; README documents `wrangler kv namespace create` and both secrets.
- Every completed search shows a footer: calls made, cache hits, options parsed, options passing filters.

## Page UI (/flights/search) — dense, responsive
Information density over decoration. Requirements:
- Typography: page title small — roughly 1.25–1.5rem (text-xl/2xl class range), rendered as a single top line, no hero section. Date group headers ~1–1.125rem semibold. Body/result text ~0.875–1rem.
- Whitespace: compact spacing scale throughout — tight vertical rhythm between form, groups, and rows; no large empty bands. Every vertical px should earn its place.
- Desktop (≥1024px): wide content container (~1100–1200px max-width or the site's full content width if wider); the title and date headers span that full width. Form controls arranged in one horizontal wrapping row. Results as dense single-line rows exactly like the sample format below.
- Mobile (≤640px): form stacks full-width; each result becomes a compact two-line card — line 1: price + destination (bold), line 2: the rest. No horizontal scrolling anywhere. Keep tap targets ≥44px despite the density.
- Verify at 375px and 1440px viewport widths before calling the stage done: no overflow, no broken wrapping, no scrollbar-x.
- Respect the site's existing styling system and dark mode if present.

Form: origin and destination are the SAME LocationPicker component — registry dropdown plus free-text IATA entry, validated — with a swap button between them. Defaults: origin EZE, dest usa-gateways. Search mode select showing the four SEARCH_MODES presets (default business-lie-flat). Remaining controls: days slider 1–14 (default 7), max stops 1|2, include-unverified checkbox (hidden or disabled when the mode's policy is `none`), deep-search checkbox, top-N per date (default 2). Spec syncs to URL query params per invariant 7. Results grouped by departure date, top-N cheapest qualifying per date. Row content is mode-aware — lie-flat detail when the policy involves lie-flat, cabin + seat descriptor (legroom if known) otherwise:

  Thursday, July 23
  $1,719 — Dallas (DFW) — Avianca via BOG — lie-flat: EZE→BOG (787-8) — layover 2h10m — total 14h05m
  $412 — Chicago (ORD) — Avianca via BOG — economy, 31in legroom — layover 2h10m — total 14h05m

Plus a "download JSON" link with the full SearchResult.

## Testing (vitest, zero network)
- Fixtures: real SerpApi responses under `src/lib/flights/__fixtures__/` — at least one business-cabin and one economy-cabin (via MCP or a one-shot `scripts/record-fixture.ts`). See operating rule 2.
- Unit: classifier against a table of real amenity strings from BOTH cabins (include "Angled flat seat" → NOT_LIE_FLAT, legroom strings → NOT_LIE_FLAT, empty → UNKNOWN); each policy including `none` passing everything through; SEARCH_MODES rows map to the correct {cabin, policy}; resolver on composed entries incl. cycle detection and dedupe; planner cross-product call-count math with multi-batch sets on BOTH sides; groupResults; dedup; Zod parse of both fixtures; budget/rate-limit logic with a mocked KV; spec↔URL round-trip including cabin and policy.
- Integration: fake provider fed fixture data through planner → classifier → policy → grouping, run for both a lie-flat mode and an economy mode.
- The generality proof test from invariant 9.

## Non-goals v1 (don't paint into a corner)
Round trips (model a TripSpec that could hold two legs; implement one-way only), award fares, SerpApi booking-options endpoint (Google Flights URL suffices), multi-provider merging, a first-class UI preset (the Cabin enum includes `first` and it must work via URL params; adding the preset is one SEARCH_MODES row), grouping by destination/origin (parameter reserved, unimplemented), accounts/auth beyond the optional token, any database beyond KV.

## Build order (stage gate + commit after each — see operating rule 3)
1. Repo recon (rule 1), then core lib: types, Cabin, locations registry, resolver (composed entries), classifier, policies incl. `none`, SEARCH_MODES, groupResults — tested.
2. Record real fixtures via MCP (business + economy); SerpApiProvider parser against both — tested.
3. Planner (cross-product) + KV cache + budget/rate-limit modules — tested with mocked KV; generality proof test.
4. API routes.
5. Page + island + URL sync + progressive rendering + mode-aware rows + responsive/density pass (375px and 1440px checks).
6. README section: env/secrets, KV setup, example searches, how to add a region, a provider, and a search mode.

## Acceptance checklist — run each, all must pass
- [ ] typecheck (astro check or tsc --noEmit) clean
- [ ] lint clean
- [ ] vitest: all green, zero network access, including the generality proof test
- [ ] `grep -rin "usa" src/lib/flights src/pages src/components` (adjust paths to repo layout): hits ONLY in the locations registry data and the form default constant
- [ ] astro build succeeds
- [ ] grep the build output for the SerpApi key value and "SERPAPI": appears nowhere in client bundles
- [ ] astro dev with .dev.vars: /plan returns an accurate call count and remaining budget for EZE→usa-gateways, 7 days, max 1 stop, business-lie-flat mode
- [ ] running that search renders grouped-by-date results in the sample format; immediate rerun reports ~all cache hits
- [ ] switching mode to Economy and rerunning works, applies no lie-flat filter, and does NOT hit the business-mode cache entries
- [ ] copying the results URL into a new tab restores the exact form spec including mode
- [ ] a plan whose uncached calls exceed remaining budget shows a disabled Run with an explanation
- [ ] page renders without overflow or horizontal scroll at 375px and 1440px
- [ ] wrangler config contains the KV binding; README documents both secrets and KV creation