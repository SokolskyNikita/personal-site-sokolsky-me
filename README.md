# personal-site-sokolsky-me

Minimal personal website rebuilt with Astro and deployed to Cloudflare Workers.

## stack

- Astro 6
- `@astrojs/cloudflare` adapter
- Wrangler 4
- GitHub Actions for CI/CD deploys

## local development

```bash
npm install
npm run dev
```

## production build

```bash
npm run build
```

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

Then push to `main` and the workflow deploys automatically.

## changing the domain later

When moving from temporary `workers.dev` to `sokolsky.me`:

1. Add the custom domain to the Worker in Cloudflare dashboard.
2. Update DNS records.
3. Set `SITE_URL=https://sokolsky.me` in your deploy environment.

`astro.config.mjs` uses `SITE_URL` (with a temporary workers.dev fallback) for canonical metadata.
