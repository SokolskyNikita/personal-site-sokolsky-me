// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://sokolsky-me-temp.sokolx.workers.dev',
  output: 'static',
  compressHTML: true,
  integrations: [sitemap()],
});