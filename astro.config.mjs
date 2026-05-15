// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://personal-site-sokolsky-me.workers.dev',
  output: 'server',
  integrations: [sitemap()],
  adapter: cloudflare(),
});