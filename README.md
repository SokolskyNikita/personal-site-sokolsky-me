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
