#!/usr/bin/env node
/**
 * Pre-parses local-text/imdb-scores.csv into src/data/imdb-scores.json.
 *
 * Usage:
 *   npm run parse:imdb
 *   node scripts/parse-imdb-scores.mjs [path/to/imdb-scores.csv]
 *
 * Drop an updated IMDb ratings export at local-text/imdb-scores.csv, then re-run.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = resolve(
  root,
  process.argv[2] ?? "local-text/imdb-scores.csv",
);
const outputPath = resolve(root, "src/data/imdb-scores.json");

/** @param {string} text */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (char === "\r") i += 1;
      continue;
    }

    if (char === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

const raw = readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
const [header, ...body] = parseCsv(raw);

if (!header) {
  throw new Error(`No header row found in ${inputPath}`);
}

const indexOf = (name) => {
  const index = header.indexOf(name);
  if (index === -1) {
    throw new Error(`Missing required column "${name}" in ${inputPath}`);
  }
  return index;
};

const col = {
  id: indexOf("Const"),
  myRating: indexOf("Your Rating"),
  title: indexOf("Title"),
  url: indexOf("URL"),
  titleType: indexOf("Title Type"),
  imdbRating: indexOf("IMDb Rating"),
  year: indexOf("Year"),
};

const collator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

const ratings = body
  .map((cells) => {
    const id = cells[col.id]?.trim() ?? "";
    const title = cells[col.title]?.trim() ?? "";
    const url = cells[col.url]?.trim() ?? "";
    const year = Number(cells[col.year]);
    const myRating = Number(cells[col.myRating]);
    const imdbRating = Number(cells[col.imdbRating]);

    if (!id || !title || !url || !Number.isFinite(year)) {
      return null;
    }

    return {
      id,
      title,
      year,
      myRating: Number.isFinite(myRating) ? myRating : null,
      imdbRating: Number.isFinite(imdbRating) ? imdbRating : null,
      url,
      titleType: cells[col.titleType]?.trim() || "Movie",
    };
  })
  .filter(Boolean)
  .sort(
    (a, b) =>
      b.year - a.year ||
      collator.compare(a.title, b.title) ||
      collator.compare(a.id, b.id),
  );

const payload = {
  generatedAt: new Date().toISOString(),
  source: "local-text/imdb-scores.csv",
  count: ratings.length,
  ratings,
};

writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${ratings.length} ratings to ${outputPath}`);
