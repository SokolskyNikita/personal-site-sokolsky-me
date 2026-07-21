# Hotels SearchAPI — CP0 notes (observed 2026-07-20)

Schema source of truth for consumed fields. Fixtures: `fixtures/hotels/`.

## Live probes (budget 6)

| # | Call | Result |
|---|------|--------|
| 1 | `google_hotels` BA `sort_by=most_reviewed` p1 | OK, 18 props, `next_page_token=CBI=` |
| 2 | same + `next_page_token` p2 | OK, 18 props, next `CCQ=` |
| 3 | `google_hotels_property` Four Seasons + `hl=en` | **400** `Unsupported value en in hl` |
| 4 | `google_hotels` BA `sort_by=highest_rating` p1 | OK |
| 5 | `tripadvisor` `q=Four Seasons Hotel Buenos Aires` | OK, `place_results[]` |
| 6 | property retry **without** `hl` | OK |

Auth: `Authorization: Bearer` works (preferred). Flights also use `api_key` query — both valid. Credits: no `credits_used` in metadata; treat **1 successful search = 1 credit** (SearchAPI Developer plan; flights estimate `$0.004/search`). Failed #3 may or may not bill — do not rely either way.

## Pagination & page size

- Mechanism: `pagination.next_page_token` → request param `next_page_token`.
- Also: `records_from` / `records_to` (1–18, 19–36, …).
- ~**18 properties/page** observed for BA hotel list.

## List vs property — enrichment decision

**List includes `reviews_histogram` + `reviews_breakdown` on all 18/18 p1 rows.** Per §0: **skip enrichment** for scan scoring (histogram/breakdown already present). Property fetch still useful later for offers / `top_things` / free-cancel flags (P2).

- List breakdown item: `{ name, description, total, positive, neutral, negative }`.
- Property breakdown item: `{ name, description, total_mentions, positive, neutral, negative }` — **field rename**.
- Observed breakdown names (canonicalize in `categories.json`): Bathroom, Room, Sleep, Cleanliness, Wi-Fi, Property, Service, Location, Dining, Breakfast, Bar, Pool, Spa, Fitness, Gym, Wellness, Atmosphere, Safety, Business, Nightlife, Restaurant, Kitchen, Family, Accessibility, Air Conditioning.

## Consumed field paths (hand-typed)

### `google_hotels` list — `properties[]`

| Path | Type | Notes |
|------|------|-------|
| `property_token` | string | Canonical Google id (v1 PK) |
| `name` | string | |
| `type` | string | `hotel` \| `vacation_rental` (VR still appears with `property_type=hotel`) |
| `gps_coordinates.{latitude,longitude}` | number | |
| `rating` | number | |
| `reviews` | number | |
| `hotel_class` / `extracted_hotel_class` | string / number | |
| `amenities` | string[] \| null | **Incomplete** — see ADR |
| `reviews_histogram` | `{ "1"…"5": number }` | |
| `reviews_breakdown` | array | see above |
| `price_per_night.extracted_price` | number | **post-tax basis** |
| `price_per_night.extracted_price_before_taxes` | number | pre-tax |
| `total_price.extracted_*` | number | stay total |
| `link` | string | **Hotel website**, not Google Hotels |
| `data_id`, `city`, `country`, `check_in_time`, `check_out_time` | | optional |
| `raw` | unknown | remainder |

### `google_hotels_property` — `property`

Same identity/rating/hist/breakdown/price fields as list. **No `amenities` key** in observed Four Seasons payload. Extra: `featured_offers[]`, `all_offers[]` (`source`, prices, `has_free_cancellation`, `free_cancellation_until`, links), `price_insights`, `review_results` (only `on_other_sites` here — no `top_things_to_know` in this sample), `address`, `phone`.

### `tripadvisor` — `place_results[]`

`title`, `place_id`, `type`, `link`, `rating`, `reviews`, `location`, `description`, `position`. **No ranking_position / GPS** in this engine response — TA rank/decile needs deeper endpoint (P2+). Match by normalized title + city; ambiguous → leave TA null.

## Server-side filters (docs; not live-probed — budget spent on hl retry)

Documented on SearchAPI Google Hotels: `sort_by`=`relevance|lowest_price|highest_rating|most_reviewed`; `rating`=`7|8|9` (3.5+/4.0+/4.5+); `hotel_class`=`2,3,4,5`; `price_min`/`price_max`; `amenities` ids; `property_types` ids; `property_type`=`hotel|vacation_rental`; `free_cancellation`=true; `bounding_box`=`[min_lng,min_lat,max_lng,max_lat]` **mutually exclusive with `q`**. ADR: use documented filters when helpful; any missing/broken filter → post-fetch in code.

Always send `gl=us&hl=en&currency=USD` on **list**; **omit `hl` on property** until Travel-hl list confirmed (live API rejected `en`).

## Amenities completeness (unknown ≠ false)

Luxury BA hotels (Four Seasons, Palacio Duhau, Alvear, Hilton) list **Air conditioning** + **Free Wi‑Fi** but **never Elevator / 24h desk** across p1+p2+highest fixtures. Florida Garden: `amenities: null`. Property details also omitted amenities. → Facts `hasElevator` / `frontDesk24h` default **unknown**; never gate on absence.

## Prices

Dated **list** returns nightly + total (USD). Basis for all math: **`extracted_price` (post-tax / guest-facing)**. Per-OTA detail only on property `all_offers[]` / `featured_offers[]`.

## Outbound Google Hotels links

- List/property `link` = brand site — do not use as GH deep link.
- Property `search_metadata.request_url` = `https://www.google.com/travel/search?qs=…` (opaque property selector; dates not in qs).
- Constructed fallback: `https://www.google.com/travel/search?q={name}+{city}&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD`.
- Headless curl → `/travel/unsupported` (bot wall). ADR: UI uses **q + checkin/checkout** fallback; optionally append dates to stored `qs` URL after property fetch. Re-verify by hand in CP2.

## Neighborhood bboxes (Nominatim → SearchAPI order)

`bounding_box = [min_lng, min_lat, max_lng, max_lat]`:

- Palermo: `[-58.4491, -34.5979, -58.3929, -34.5509]`
- Recoleta: `[-58.4160, -34.5998, -58.3621, -34.5672]`
- Puerto Madero: `[-58.3695, -34.6251, -58.3397, -34.5950]`

## ADRs

1. **Enrichment:** skip during P1 scan — list already has hist/breakdown.
2. **Price basis:** post-tax `extracted_price`.
3. **Property `hl`:** omit (live wins over docs default `en`).
4. **Deep link:** q+dates fallback; brand `link` is not GH.
5. **TA join (P2):** title+city only; no rank in search payload. Ambiguous → null. Opt-in via `joinTa` on `/api/hotels/prices` (default off so a 7-window sweep stays ≤7 credits).
9. **Price sweep (P2):** one dated `google_hotels` list call per stay window; join by `property_token`; `price_cache` TTL 6h and is keyed by dates + adults; window marker `__window__:{slug}` skips re-fetch. List pages miss many comfort-ranked hotels → single-window searches may top-up missing top-20 via `google_hotels_property` (cap 15); flexible sweeps never top-up and stay ≤1 credit/window.
6. **Multi-source identity (P4 seam, no code):** mapping table by normalized name + GPS proximity; v1 uses `properties.token` + `provider`.
7. **Filters unprobed live:** trust docs; post-fetch if needed.
8. **`freeCancellationSeen`:** from offer `has_free_cancellation===true` when property fetched; else unknown (list has no field).
10. **Review signals (P3):** `tripadvisor` title+city match → `tripadvisor_reviews` latest 20. Deterministic `topics-v1` classifier covers noise, cleanliness, bathroom, AC, heating, hot water, pressure, mattress, datedness, maintenance, smell, pests, elevators, Wi‑Fi. Recency weight `exp(-ageDays/365)`; cache key `(token, corpus_hash, model_version)`, 30-day freshness; ambiguous TA matches abort.
11. **Review-derived facts:** AC/elevator/Wi‑Fi remain confirmed when structured evidence exists. Otherwise sufficient positive review evidence becomes `inferred:true`, negative becomes `inferred:false`, mixed becomes `conflicting`; excerpts stay attached to topic signals.
12. **Spend confirmation:** property details and review analysis are explicit expanded-row buttons (`~1` and `~2` credits). Single-window pricing plans up to 15 property top-ups for ≥80% top-20 coverage; multi-window sweeps disable top-ups and remain one credit/window.

## Fixtures

`ba-most-reviewed-p1|p2.json`, `ba-highest-rating-p1.json` (arrays ≤8, pagination kept), `property-fourseasons.json` (**full**), `tripadvisor-fourseasons.json` (8 places).
