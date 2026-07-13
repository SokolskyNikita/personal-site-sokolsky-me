#!/usr/bin/env node
/**
 * Submit sitemap URLs to IndexNow (https://www.indexnow.org/documentation).
 *
 * Prerequisites:
 * - Key file hosted at https://{host}/{key}.txt containing the key (Option 1).
 * - INDEXNOW_KEY env var, or --key flag, matching that file.
 *
 * Usage:
 *   INDEXNOW_KEY=... node scripts/submit-indexnow.mjs
 *   node scripts/submit-indexnow.mjs --key=... --host=sokolsky.me
 *   node scripts/submit-indexnow.mjs --url=https://sokolsky.me/some-page/
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_HOST = "sokolsky.me";
const DEFAULT_SITE = `https://${DEFAULT_HOST}`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10_000;
const KEY_FILE_RE = /^[a-zA-Z0-9-]{8,128}\.txt$/;

function discoverKeyFromPublic() {
  const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
  try {
    for (const name of readdirSync(publicDir)) {
      if (!KEY_FILE_RE.test(name)) continue;
      const key = name.slice(0, -".txt".length);
      const contents = readFileSync(join(publicDir, name), "utf8").trim();
      if (contents === key) return key;
    }
  } catch {
    // ignore missing public/
  }
  return "";
}

function parseArgs(argv) {
  const args = {
    urls: [],
    host: DEFAULT_HOST,
    site: DEFAULT_SITE,
    key: process.env.INDEXNOW_KEY || discoverKeyFromPublic(),
  };
  for (const arg of argv) {
    if (arg.startsWith("--key=")) args.key = arg.slice("--key=".length);
    else if (arg.startsWith("--host=")) args.host = arg.slice("--host=".length);
    else if (arg.startsWith("--site=")) args.site = arg.slice("--site=".length).replace(/\/$/, "");
    else if (arg.startsWith("--url=")) args.urls.push(arg.slice("--url=".length));
    else if (arg === "--help" || arg === "-h") args.help = true;
  }
  return args;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
}

async function collectSitemapUrls(site) {
  const indexUrl = `${site}/sitemap-index.xml`;
  const indexXml = await fetchText(indexUrl);
  const locs = extractLocs(indexXml);
  if (locs.length === 0) {
    throw new Error(`No <loc> entries found in ${indexUrl}`);
  }

  const pageUrls = new Set();
  for (const loc of locs) {
    if (loc.includes("sitemap") && loc.endsWith(".xml")) {
      const childXml = await fetchText(loc);
      for (const page of extractLocs(childXml)) pageUrls.add(page);
    } else {
      pageUrls.add(loc);
    }
  }
  return [...pageUrls];
}

async function verifyKeyFile(site, key) {
  const keyLocation = `${site}/${key}.txt`;
  const body = (await fetchText(keyLocation)).trim();
  if (body !== key) {
    throw new Error(
      `Key file at ${keyLocation} does not match key (got ${JSON.stringify(body.slice(0, 64))})`,
    );
  }
  return keyLocation;
}

async function submitBatch({ host, key, keyLocation, urlList }) {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  const text = await res.text().catch(() => "");
  return { status: res.status, statusText: res.statusText, body: text };
}

function usage() {
  console.log(`Submit URLs to IndexNow.

Usage:
  INDEXNOW_KEY=<key> node scripts/submit-indexnow.mjs
  node scripts/submit-indexnow.mjs --key=<key> [--host=sokolsky.me] [--site=https://sokolsky.me]
  node scripts/submit-indexnow.mjs --key=<key> --url=https://sokolsky.me/page/

Key file must be live at https://{host}/{key}.txt (UTF-8, contents = key).`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  if (!args.key) {
    console.error("Missing IndexNow key. Set INDEXNOW_KEY or pass --key=...");
    usage();
    process.exit(1);
  }
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(args.key)) {
    console.error("Key must be 8–128 chars of a-z, A-Z, 0-9, or -");
    process.exit(1);
  }

  const site = args.site.replace(/\/$/, "");
  console.log(`Verifying key file for ${site}...`);
  const keyLocation = await verifyKeyFile(site, args.key);
  console.log(`Key OK: ${keyLocation}`);

  const urls =
    args.urls.length > 0
      ? args.urls
      : await collectSitemapUrls(site);

  if (urls.length === 0) {
    console.error("No URLs to submit.");
    process.exit(1);
  }

  console.log(`Submitting ${urls.length} URL(s) to ${INDEXNOW_ENDPOINT}...`);

  let ok = 0;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const urlList = urls.slice(i, i + BATCH_SIZE);
    const result = await submitBatch({
      host: args.host,
      key: args.key,
      keyLocation,
      urlList,
    });
    console.log(
      `Batch ${Math.floor(i / BATCH_SIZE) + 1}: HTTP ${result.status} ${result.statusText}` +
        (result.body ? ` — ${result.body}` : ""),
    );
    // 200 = accepted; 202 = accepted, key validation pending
    if (result.status === 200 || result.status === 202) ok += urlList.length;
    else {
      console.error("Submission failed. Aborting remaining batches.");
      process.exit(1);
    }
  }

  console.log(`Done. Submitted ${ok} URL(s).`);
  console.log("Verify receipt in Bing Webmaster Tools: https://www.bing.com/webmasters");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
