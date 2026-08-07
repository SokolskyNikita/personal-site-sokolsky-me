/**
 * Vite/Astro middleware so `astro dev` can serve Worker flight API routes
 * (`/api/flights/*`) using the same handlers + `.dev.vars` secrets.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDevVars(root = process.cwd()) {
  const vars = {};
  try {
    const text = readFileSync(resolve(root, ".dev.vars"), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const eq = trimmed.indexOf("=");
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      vars[key] = value;
    }
  } catch {
    // Missing .dev.vars — handlers return searchapi_key_missing.
  }
  return vars;
}

function createMemoryKv() {
  /** @type {Map<string, string>} */
  const store = new Map();
  return {
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async put(key, value) {
      store.set(key, value);
    },
  };
}

async function loadFlightApi(server) {
  // Prefer the Vite 6+ environment runner; fall back to ssrLoadModule.
  const runner = server.environments?.ssr?.runner;
  if (runner?.import) {
    return runner.import("/src/lib/flights/api.ts");
  }
  return server.ssrLoadModule("/src/lib/flights/api.ts");
}

function attachFlightApiMiddleware(server) {
  const devVars = loadDevVars(server.config.root);
  const memoryKv = createMemoryKv();

  server.middlewares.use(async (req, res, next) => {
    const url = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`,
    );
    if (!url.pathname.startsWith("/api/flights/")) {
      next();
      return;
    }

    try {
      const mod = await loadFlightApi(server);
      const { handleFlightApi, isFlightApiPath } = mod;
      if (!isFlightApiPath(url.pathname)) {
        next();
        return;
      }

      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks);

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value == null) continue;
        if (Array.isArray(value)) {
          for (const item of value) headers.append(key, item);
        } else {
          headers.set(key, value);
        }
      }
      // Same-origin fetches from astro may omit Origin; mirror Host for CSRF check.
      if (!headers.has("Origin") && headers.has("Host")) {
        headers.set("Origin", `http://${headers.get("Host")}`);
      }

      const request = new Request(url, {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method ?? "GET") ? undefined : body,
      });

      const env = {
        SEARCH_API_IO_KEY: devVars.SEARCH_API_IO_KEY,
        FLIGHT_CACHE: memoryKv,
        FLIGHT_DAILY_BUDGET: devVars.FLIGHT_DAILY_BUDGET,
        FLIGHT_CACHE_TTL_SECONDS: devVars.FLIGHT_CACHE_TTL_SECONDS,
      };

      const response = await handleFlightApi(request, env, url);
      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const ab = await response.arrayBuffer();
      res.end(Buffer.from(ab));
    } catch (error) {
      console.error("[flight-api-dev]", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ok: false,
          error: "dev_proxy_failed",
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  });
}

/** Vite plugin (also usable via Astro `vite.plugins`). */
export function flightApiDevPlugin() {
  return {
    name: "flight-api-dev",
    configureServer(server) {
      attachFlightApiMiddleware(server);
    },
  };
}

/** Astro integration — registers earlier in the Astro/Vite server lifecycle. */
export function flightApiDevIntegration() {
  return {
    name: "flight-api-dev",
    hooks: {
      "astro:server:setup": ({ server }) => {
        attachFlightApiMiddleware(server);
      },
    },
  };
}
