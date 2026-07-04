import type { TravelSpot } from "../components/travel/TravelSpotGuide.astro";

const mapsSearchUrl = (query: string, placeId?: string) => {
  const params = new URLSearchParams({ api: "1", query });
  if (placeId) params.set("query_place_id", placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
};

const scanBalanced = (source: string, openIndex: number, openChar: "[" | "{") => {
  const closeChar = openChar === "[" ? "]" : "}";
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "\"" || character === "'" || character === "`") {
      quote = character;
      continue;
    }

    if (character === openChar) depth += 1;
    if (character === closeChar) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
};

const readQuotedString = (source: string, startIndex: number) => {
  const quote = source[startIndex];
  let escaped = false;

  for (let index = startIndex + 1; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (character === quote) {
      const raw = source.slice(startIndex + 1, index);
      return {
        value: raw
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, "\"")
          .replace(/\\'/g, "'")
          .replace(/\\\\/g, "\\"),
        end: index + 1,
      };
    }
  }

  return undefined;
};

const propertyPattern = (key: string) => new RegExp(`(?:"${key}"|${key})\\s*:`, "s");

const getPropertyIndex = (source: string, key: string) => {
  const match = propertyPattern(key).exec(source);
  return match ? match.index + match[0].length : -1;
};

const getStringProperty = (source: string, key: string) => {
  const valueIndex = getPropertyIndex(source, key);
  if (valueIndex === -1) return undefined;
  const quoteIndex = source.slice(valueIndex).search(/["']/);
  if (quoteIndex === -1) return undefined;
  return readQuotedString(source, valueIndex + quoteIndex)?.value;
};

const getRawProperty = (source: string, key: string) => {
  const valueIndex = getPropertyIndex(source, key);
  if (valueIndex === -1) return undefined;
  let index = valueIndex;
  while (/\s/.test(source[index] ?? "")) index += 1;
  let quote: string | null = null;
  let escaped = false;
  let depth = 0;

  for (; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "\"" || character === "'" || character === "`") {
      quote = character;
      continue;
    }

    if (character === "(" || character === "{" || character === "[") depth += 1;
    if (character === ")" || character === "}" || character === "]") depth -= 1;
    if (depth <= 0 && (character === "," || character === "\n")) {
      return source.slice(valueIndex, index).trim();
    }
  }

  return source.slice(valueIndex).trim();
};

const getNumberProperty = (source: string, key: string) => {
  const raw = getRawProperty(source, key);
  const match = raw?.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
};

const getObjectProperty = (source: string, key: string) => {
  const valueIndex = getPropertyIndex(source, key);
  if (valueIndex === -1) return undefined;
  const openIndex = source.indexOf("{", valueIndex);
  if (openIndex === -1) return undefined;
  const closeIndex = scanBalanced(source, openIndex, "{");
  return closeIndex === -1 ? undefined : source.slice(openIndex, closeIndex + 1);
};

const getConstArray = (source: string, name: string) => {
  const match = new RegExp(`const\\s+${name}\\s*=\\s*\\[`, "s").exec(source);
  if (!match) return undefined;
  const openIndex = source.indexOf("[", match.index);
  const closeIndex = scanBalanced(source, openIndex, "[");
  return closeIndex === -1 ? undefined : source.slice(openIndex + 1, closeIndex);
};

const getConstObject = (source: string, name: string) => {
  const match = new RegExp(`const\\s+${name}[\\s\\S]*?=\\s*\\{`, "s").exec(source);
  if (!match) return undefined;
  const openIndex = source.indexOf("{", match.index);
  const closeIndex = scanBalanced(source, openIndex, "{");
  return closeIndex === -1 ? undefined : source.slice(openIndex + 1, closeIndex);
};

const splitObjectLiterals = (source: string) => {
  const objects: string[] = [];
  let index = 0;

  while (index < source.length) {
    const openIndex = source.indexOf("{", index);
    if (openIndex === -1) break;
    const closeIndex = scanBalanced(source, openIndex, "{");
    if (closeIndex === -1) break;
    const objectSource = source.slice(openIndex, closeIndex + 1);
    if (propertyPattern("id").test(objectSource)) objects.push(objectSource);
    index = closeIndex + 1;
  }

  return objects;
};

const getStringConstants = (source: string) => {
  const constants = new Map<string, string>();
  const matcher = /const\s+([A-Za-z0-9_]+)\s*=\s*(["'])/g;

  for (const match of source.matchAll(matcher)) {
    const value = readQuotedString(source, match.index + match[0].lastIndexOf(match[2]));
    if (value) constants.set(match[1], value.value);
  }

  return constants;
};

const parseKeyedObjectEntries = (source: string) => {
  const entries: Array<{ key: string; value: string }> = [];
  const matcher = /(?:"([^"]+)"|([A-Za-z0-9_-]+))\s*:\s*\{/g;

  for (const match of source.matchAll(matcher)) {
    const openIndex = source.indexOf("{", match.index);
    const closeIndex = scanBalanced(source, openIndex, "{");
    if (closeIndex === -1) continue;
    entries.push({
      key: match[1] ?? match[2],
      value: source.slice(openIndex, closeIndex + 1),
    });
  }

  return entries;
};

const parseStringMap = (source: string) => {
  const values = new Map<string, string>();
  const matcher = /(?:"([^"]+)"|([A-Za-z0-9_-]+))\s*:\s*(["'])/g;

  for (const match of source.matchAll(matcher)) {
    const value = readQuotedString(source, match.index + match[0].lastIndexOf(match[3]));
    if (value) values.set(match[1] ?? match[2], value.value);
  }

  return values;
};

const parseTripEstimates = (source: string, constants: Map<string, string>) => {
  const tripSource = getConstObject(source, "tripEstimates");
  const estimates = new Map<string, TravelSpot["trip"]>();
  if (!tripSource) return estimates;

  for (const { key, value } of parseKeyedObjectEntries(tripSource)) {
    const noteRaw = getRawProperty(value, "note") ?? "";
    const literalNote = getStringProperty(value, "note");
    estimates.set(key, {
      days: getNumberProperty(value, "days") ?? 0,
      costUsd: getNumberProperty(value, "costUsd") ?? 0,
      note: literalNote ?? constants.get(noteRaw) ?? noteRaw,
    });
  }

  return estimates;
};

const getCountries = (source: string) => {
  const valueIndex = getPropertyIndex(source, "countries");
  if (valueIndex === -1) return [];
  const openIndex = source.indexOf("[", valueIndex);
  const closeIndex = scanBalanced(source, openIndex, "[");
  if (openIndex === -1 || closeIndex === -1) return [];
  return [...source.slice(openIndex, closeIndex).matchAll(/["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
};

const getScores = (source: string) => {
  const scores = getObjectProperty(source, "scores") ?? "";
  return {
    globallyUnique: getNumberProperty(scores, "globallyUnique") ?? 0,
    laymenInterest: getNumberProperty(scores, "laymenInterest") ?? 0,
    easeOfAccess: getNumberProperty(scores, "easeOfAccess") ?? 0,
    lowTouristCrowds: getNumberProperty(scores, "lowTouristCrowds") ?? 0,
  };
};

const getMap = (source: string): TravelSpot["map"] => {
  const map = getObjectProperty(source, "map") ?? "";
  const location = getObjectProperty(map, "location") ?? "";
  const placeId = getStringProperty(map, "placeId");
  const query = getStringProperty(map, "query");
  const mapName = getStringProperty(map, "name") ?? getStringProperty(source, "name") ?? "";
  const googleMapsUrl =
    getStringProperty(map, "googleMapsUrl") ??
    (() => {
      const raw = getRawProperty(map, "googleMapsUrl") ?? "";
      const match = raw.match(/mapsSearchUrl\(\s*(["'])(.*?)\1(?:\s*,\s*(["'])(.*?)\3)?/s);
      return match ? mapsSearchUrl(match[2], match[4]) : mapsSearchUrl(query ?? mapName, placeId);
    })();

  return {
    name: mapName,
    formattedAddress: getStringProperty(map, "formattedAddress"),
    placeId,
    rating: getNumberProperty(map, "rating"),
    reviewCount: getNumberProperty(map, "reviewCount"),
    query,
    location: {
      lat: getNumberProperty(location, "lat") ?? 0,
      lng: getNumberProperty(location, "lng") ?? 0,
    },
    googleMapsUrl,
  };
};

const parseSpot = (
  source: string,
  constants: Map<string, string>,
  tripEstimates: Map<string, TravelSpot["trip"]>,
  wikiUrls: Map<string, string>,
): TravelSpot | undefined => {
  const id = getStringProperty(source, "id");
  if (!id) return undefined;

  const trip = getObjectProperty(source, "trip");
  const noteRaw = trip ? (getRawProperty(trip, "note") ?? "") : "";
  const sourceInfo = getObjectProperty(source, "source");

  return {
    id,
    name: getStringProperty(source, "name") ?? id,
    countries: getCountries(source),
    area: getStringProperty(source, "area") ?? "",
    kind: getStringProperty(source, "kind") ?? "",
    access: getStringProperty(source, "access") ?? "",
    scores: getScores(source),
    uniqueness: getStringProperty(source, "uniqueness") ?? "",
    why: getStringProperty(source, "why") ?? "",
    realityCheck: getStringProperty(source, "realityCheck") ?? "",
    wikiUrl: getStringProperty(source, "wikiUrl") ?? wikiUrls.get(id),
    source: sourceInfo
      ? {
          label: getStringProperty(sourceInfo, "label") ?? "Source",
          url: getStringProperty(sourceInfo, "url") ?? "",
        }
      : undefined,
    map: getMap(source),
    trip: trip
      ? {
          days: getNumberProperty(trip, "days") ?? 0,
          costUsd: getNumberProperty(trip, "costUsd") ?? 0,
          note: getStringProperty(trip, "note") ?? constants.get(noteRaw) ?? noteRaw,
        }
      : (tripEstimates.get(id) ?? { days: 0, costUsd: 0, note: "" }),
  };
};

export const extractTravelSpotsFromSource = (source: string) => {
  const constants = getStringConstants(source);
  const tripEstimates = parseTripEstimates(source, constants);
  const wikiUrls = parseStringMap(getConstObject(source, "wikiUrls") ?? "");
  const ids = new Set<string>();
  const spots: TravelSpot[] = [];

  for (const arrayName of ["spots", "importedSpots", "existingSpots"]) {
    const arraySource = getConstArray(source, arrayName);
    if (!arraySource) continue;

    for (const objectSource of splitObjectLiterals(arraySource)) {
      const spot = parseSpot(objectSource, constants, tripEstimates, wikiUrls);
      if (!spot || ids.has(spot.id)) continue;
      ids.add(spot.id);
      spots.push(spot);
    }
  }

  return spots;
};
