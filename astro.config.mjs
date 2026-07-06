// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const site = process.env.SITE_URL || 'https://sokolsky.me';
const posthogProjectToken = process.env.PUBLIC_POSTHOG_PROJECT_TOKEN || env.PUBLIC_POSTHOG_PROJECT_TOKEN || '';
const posthogHost = 'https://images.sokolsky.me';
const posthogUiHost = process.env.PUBLIC_POSTHOG_UI_HOST || env.PUBLIC_POSTHOG_UI_HOST || 'https://us.posthog.com';
const isPrivatePage = (page) => {
  const { pathname } = new URL(page);
  return pathname === '/private' || pathname.startsWith('/private/');
};
const posthogSnippet = `
if (${JSON.stringify(posthogProjectToken)} && !window.__posthog_initialized) {
  window.__posthog_initialized = true;
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init(${JSON.stringify(posthogProjectToken)}, {
    api_host: ${JSON.stringify(posthogHost)},
    ui_host: ${JSON.stringify(posthogUiHost)},
    defaults: "2026-01-30",
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: false,
    disable_surveys: true,
    opt_in_site_apps: false,
    loaded: function(instance) {
      if (typeof instance.startSessionRecording === "function") {
        instance.startSessionRecording();
      }
    }
  });
}
`;
const posthogAnalytics = {
  name: 'posthog-analytics',
  hooks: {
    'astro:config:setup': ({ injectScript }) => {
      injectScript('head-inline', posthogSnippet);
    },
  },
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
    posthogAnalytics,
    sitemap({
      filter: (page) => !isPrivatePage(page),
    }),
  ],
});
