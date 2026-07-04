// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || 'https://sokolsky.me';
const isPrivatePage = (page) => {
  const { pathname } = new URL(page);
  return pathname === '/private' || pathname.startsWith('/private/');
};

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  compressHTML: true,
  redirects: {
    '/apartments/palermo': '/apartments/buenos-aires',
    '/travel/best-of-antarctica': '/travel/best-of-polar-regions',
    '/travel/best-of-arctic': '/travel/best-of-polar-regions',
    '/travel/best-of-sa': '/travel/best-of-south-america',
  },
  integrations: [
    sitemap({
      filter: (page) => !isPrivatePage(page),
    }),
  ],
});
