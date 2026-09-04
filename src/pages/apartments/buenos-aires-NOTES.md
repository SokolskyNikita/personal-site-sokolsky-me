# Buenos Aires apartments — Airbnb visitor rules

Agents working on `buenos-aires.astro` must check **visitor rules** whenever an Airbnb URL is added or replaced. The page shows a warning icon from `airbnbGuestRestrictionsByUrl` in `src/data/apartments-buenos-aires-listings.json`.

Goal: be able to bring **visitors into the unit 24/7**. Flag anything that blocks that. Occupancy caps for the people *staying* on the booking are fine.

## What to flag

**Hard (flag)** — quote the exact EN/ES sentence, then store the **English** wording on the page (translate if the listing is Spanish). Needs visitor / external-guest language, or a rule that clearly blocks bringing someone into the unit:

- Visitors banned from the unit or building (`visitors are not allowed`, `visitas no permitidas`, `terceros`, `no additional people`, `only people listed on the reservation may enter`)
- Overnight visitor bans (`guest visitors cannot stay overnight`, `no overnight guests/visitors`)
- After-hours cutoffs (`no guests after 22:00`, visitors only until a clock time, weekday-only visitors)
- Visitors must be pre-registered with the host or building (`visits only if previously registered`, `external guests must be registered`)

**Soft (do not flag):**

- No parties / no events / no unregistered *gatherings*
- No visitors in the pool, gym, SUM, or other amenities only
- Occupancy alone (`2 guests maximum`, “only N people may stay”)
- Booked renters showing ID / passport at check-in or at reservation time (that is *not* a visitor rule)

`guests` on Airbnb often means the people staying. Only treat it as visitors when the text says visitors, visits, invitados/visitas, external/third parties, additional people entering, or overnight/after-hours *guests* in that visitor sense. Do not flag “all guests must send passports before check-in.”

## How to scrape

1. Collect `https://www.airbnb.com/rooms/<id>` from `apartments-buenos-aires.json` (`buildings[].airbnb.url`) and `apartments-buenos-aires-listings.json` (`additionalAirbnbListingsByBuilding`). Skip `removedAirbnbUrls`.
2. BrightData `scrape_batch` in groups of ≤5. Hit `/house-rules` first, then the room page if “During your stay” / “Additional rules” is missing.
3. Empty or “Something went wrong”: retry the room page, then `airbnb.ar` / `airbnb.es`. A real 404 goes in `removedAirbnbUrls` (and drop it from listings / the building primary URL).
4. Search EN/ES: `visitor`, `visitors`, `visita`, `visitas`, `visitante`, `invitado`, `invitados`, `terceros`, `external`, `overnight`, `pernoct`, `after 22`, `después de`, `registered` + visit/visitor, `no additional`, `no se permite`.
5. Write hard hits into `airbnbGuestRestrictionsByUrl` keyed by the canonical `.com` room URL:

```json
"https://www.airbnb.com/rooms/1180531383113720822": {
  "rule": "Only the guests included in the reservation are permitted on the property, no additional visitors are allowed at any time.",
  "source": "description",
  "buildingName": "Palacio Cabrera"
}
```

`source` is `description`, `house_rules`, or `both`. Keep keys sorted. The Astro page maps by room id.

## After writing flags

Confirm the warning triangle + tooltip on `/apartments/buenos-aires`. Do not invent a flag without a quoted hard rule.

Full recheck 2026-09-04 (309 live URLs): overnight visitor bans, after-hours cutoffs, and visitor pre-registration are hard. Booked-renter passport/ID and amenity-only “no guests” are not.
