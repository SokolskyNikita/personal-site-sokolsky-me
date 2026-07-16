# personal-site-sokolsky-me

Minimal personal website rebuilt with Astro and deployed to Cloudflare Workers.

## stack

- Astro 6 (static output)
- Cloudflare Workers (custom worker router)
- Wrangler 4
- GitHub Actions for CI/CD deploys

## local development

```bash
npm install
npm run dev
```

## production build

To build locally with the production URL:

```bash
SITE_URL=https://sokolsky.me npm run build
```

To build and deploy manually:

```bash
SITE_URL=https://sokolsky.me npm run build
npx wrangler deploy
npm run cf:deploy:phanalytics
```

## posthog reverse proxy integration

PostHog is routed through a Cloudflare reverse proxy on `images.sokolsky.me`, matching the `gdphotos` setup.

- `astro.config.mjs` initializes the browser SDK with `api_host: https://images.sokolsky.me`.
- `images-proxy-worker.js` forwards allowed SDK asset and event paths to PostHog Cloud.
- `wrangler.phAnalytics.jsonc` deploys the proxy worker on `images.sokolsky.me`.
- The ingest host is fixed in code so stale build vars cannot fall back to direct PostHog ingest.
- `npm run verify:posthog` checks every generated HTML page for the proxy-backed snippet.
- Keep `PUBLIC_POSTHOG_UI_HOST` pointed at `https://us.posthog.com`.

## one-time cloudflare setup

1. Authenticate Wrangler:

```bash
npx wrangler login
```

1. Optional first manual deploy to get a temporary `workers.dev` URL:

```bash
npx wrangler deploy
```

1. Create an API token with `Workers Scripts:Edit` permission.
1. Get your account ID from Cloudflare dashboard.

## github ci/cd deployment

This repo includes `.github/workflows/deploy.yml` and deploys on push to `main`.

Set these GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

And set this GitHub repository variable (Settings > Secrets and variables > Actions > Variables):

- `SITE_URL` (e.g., `https://sokolsky.me`)
- `PUBLIC_POSTHOG_PROJECT_TOKEN`
- `PUBLIC_POSTHOG_UI_HOST` (e.g., `https://us.posthog.com`)

Then push to `main` and the workflow deploys automatically.

## changing the domain later

When moving from temporary `workers.dev` to `sokolsky.me`:

1. Add the custom domain to the Worker in the Cloudflare dashboard (or configure `routes` in `wrangler.jsonc`).
2. Update DNS records.
3. Set `SITE_URL=https://sokolsky.me` in your deploy environment (e.g., GitHub Secrets/Variables).

`astro.config.mjs` uses `SITE_URL` (with a temporary workers.dev fallback) for canonical metadata.

## flight search (`/flights/search`)

Dense one-way flight finder backed by SerpApi Google Flights. Core logic lives in `src/lib/flights/` (UI-agnostic). API routes are handled by the custom Worker (`POST /api/flights/plan`, `POST /api/flights/query`).

### secrets and env

Local (gitignored):

```bash
cp .dev.vars.example .dev.vars
# set SERPAPI_API_KEY=...
# optional: SEARCH_ACCESS_TOKEN=...
```

Production:

```bash
npx wrangler secret put SERPAPI_API_KEY
# optional gate for /api/flights/query:
npx wrangler secret put SEARCH_ACCESS_TOKEN
```

### KV namespace

Binding `FLIGHT_CACHE` is in `wrangler.jsonc`. To create a new namespace:

```bash
npx wrangler kv namespace create FLIGHT_CACHE
# paste the id into wrangler.jsonc kv_namespaces
```

### local API testing

APIs are Worker routes (not Astro endpoints). After a build:

```bash
npm run build
npx wrangler dev
# open http://localhost:8787/flights/search/
```

### example searches

- Default: EZE → USA gateways, business lie-flat, 7 days, max 1 stop
- Economy mode: same endpoints, no lie-flat filter (separate cache keys by cabin)
- Swap button reverses origin/destination; both sides accept registry ids or raw IATA

### extending

- **Add a region**: new entry in `src/lib/flights/locations.ts` (`airports` and/or `refs` to other ids)
- **Add a provider**: implement `FlightProvider` beside `SerpApiProvider` (do not leak provider field names into the interface)
- **Add a search mode**: new row in `SEARCH_MODES` (`src/lib/flights/modes.ts`)

### tests

```bash
npm test          # vitest, zero network
npm run check     # astro check
```
