// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://personal-site-sokolsky-me.workers.dev',
  output: 'server',
  adapter: cloudflare(),
});