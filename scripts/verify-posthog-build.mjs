import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const distDir = new URL('../dist/', import.meta.url).pathname;
const proxyHost = 'https://images.sokolsky.me';
const directIngestHosts = ['https://us.i.posthog.com', 'https://us-assets.i.posthog.com'];

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return listHtmlFiles(path);
      if (entry.isFile() && entry.name.endsWith('.html')) return [path];
      return [];
    }),
  );

  return files.flat();
}

const htmlFiles = await listHtmlFiles(distDir);
const failures = [];

if (htmlFiles.length === 0) {
  failures.push('No generated HTML files found. Run `npm run build` first.');
}

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const name = relative(distDir, file);

  if (!html.includes('posthog.init(')) {
    failures.push(`${name}: missing PostHog init`);
  }

  if (!html.includes(proxyHost)) {
    failures.push(`${name}: missing proxy host ${proxyHost}`);
  }

  if (html.includes('posthog.init("",') || html.includes('if ("" && !window.__posthog_initialized)')) {
    failures.push(`${name}: PostHog project token is empty`);
  }

  for (const host of directIngestHosts) {
    if (html.includes(host)) {
      failures.push(`${name}: references direct PostHog ingest host ${host}`);
    }
  }
}

if (failures.length > 0) {
  console.error('PostHog build verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Verified PostHog proxy tracking on ${htmlFiles.length} generated HTML pages.`);
