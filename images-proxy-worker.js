// Internal naming: phAnalytics* = PostHog integration internals.
const phAnalyticsApiHost = `us.i.${'post'}${'hog'}.com`;
const phAnalyticsAssetHost = `us-assets.i.${'post'}${'hog'}.com`;
const phAnalyticsAllowedApiPrefixes = ['/i/', '/e/', '/batch/', '/decide/', '/flags/', '/s/', '/engage/', '/capture/'];

function isAllowedApiPath(pathname) {
  return phAnalyticsAllowedApiPrefixes.some((prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix));
}

function buildCorsHeaders(request) {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || '*',
    'Access-Control-Allow-Credentials': 'false',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin, Access-Control-Request-Headers',
  };
}

function withCors(response, request) {
  const headers = new Headers(response.headers);
  const corsHeaders = buildCorsHeaders(request);
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function retrieveAsset(request, pathWithParams, ctx) {
  let response = await caches.default.match(request);

  if (!response) {
    response = await fetch(`https://${phAnalyticsAssetHost}${pathWithParams}`);
    ctx.waitUntil(caches.default.put(request, response.clone()));
  }

  return response;
}

async function forwardRequest(request, pathWithSearch) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const phAnalyticsOriginHeaders = new Headers(request.headers);
  phAnalyticsOriginHeaders.delete('cookie');
  phAnalyticsOriginHeaders.set('X-Forwarded-For', ip);

  const phAnalyticsOriginRequest = new Request(`https://${phAnalyticsApiHost}${pathWithSearch}`, {
    method: request.method,
    headers: phAnalyticsOriginHeaders,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : null,
    redirect: request.redirect,
  });

  return fetch(phAnalyticsOriginRequest);
}

export default {
  async fetch(request, env, ctx) {
    void env;
    const url = new URL(request.url);
    const pathWithParams = url.pathname + url.search;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(request),
      });
    }

    if (url.pathname.startsWith('/static/') || url.pathname.startsWith('/array/')) {
      const response = await retrieveAsset(request, pathWithParams, ctx);
      return withCors(response, request);
    }

    if (!isAllowedApiPath(url.pathname)) {
      return withCors(new Response('Not Found', { status: 404 }), request);
    }

    const response = await forwardRequest(request, pathWithParams);
    return withCors(response, request);
  },
};
