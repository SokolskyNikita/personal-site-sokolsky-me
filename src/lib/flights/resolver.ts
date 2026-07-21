import {
  ANYWHERE_LOCATION_ID,
  CONTINENT_GROUP_ORDER,
  LOCATION_REGISTRY,
  type ContinentGroup,
} from "./locations";
import type { CityGroupSide, LocationRef } from "./types";

const IATA_RE = /^[A-Z]{3}$/;

export function isRawIata(ref: string): boolean {
  return IATA_RE.test(ref);
}

export function normalizeLocationRef(ref: string): string {
  const trimmed = ref.trim();
  if (IATA_RE.test(trimmed.toUpperCase()) && trimmed.length === 3) {
    return trimmed.toUpperCase();
  }
  return trimmed;
}

export class LocationResolveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocationResolveError";
  }
}

/** True when both endpoints resolve to the Anywhere registry entry. */
export function isAnywhereToAnywhere(
  origin: LocationRef,
  dest: LocationRef,
): boolean {
  return (
    normalizeLocationRef(origin) === ANYWHERE_LOCATION_ID &&
    normalizeLocationRef(dest) === ANYWHERE_LOCATION_ID
  );
}

/**
 * Reject Anywhere→Anywhere before planning. One side may be Anywhere;
 * both sides may not.
 */
export function assertValidLocationPair(
  origin: LocationRef,
  dest: LocationRef,
): void {
  if (isAnywhereToAnywhere(origin, dest)) {
    throw new LocationResolveError(
      "Anywhere to Anywhere searches are not supported. Choose a specific origin or destination.",
    );
  }
}

/**
 * Resolve a LocationRef (registry id or raw IATA) to a deduped airport list.
 * Recursive for composed entries; cycle-safe.
 */
export function resolveLocation(ref: LocationRef): string[] {
  const normalized = normalizeLocationRef(ref);
  const seen = new Set<string>();
  const airports: string[] = [];
  const visiting = new Set<string>();

  function walk(id: string): void {
    if (visiting.has(id)) {
      throw new LocationResolveError(`Cycle detected while resolving "${id}"`);
    }
    visiting.add(id);

    const entry = LOCATION_REGISTRY[id];
    if (entry) {
      for (const code of entry.airports ?? []) {
        const upper = code.toUpperCase();
        if (!isRawIata(upper)) {
          throw new LocationResolveError(
            `Invalid airport code "${code}" in registry entry "${id}"`,
          );
        }
        if (!seen.has(upper)) {
          seen.add(upper);
          airports.push(upper);
        }
      }
      for (const child of entry.refs ?? []) {
        walk(child);
      }
      visiting.delete(id);
      return;
    }

    if (isRawIata(id)) {
      if (!seen.has(id)) {
        seen.add(id);
        airports.push(id);
      }
      visiting.delete(id);
      return;
    }

    visiting.delete(id);
    throw new LocationResolveError(`Unknown location ref "${id}"`);
  }

  walk(normalized);
  return airports;
}

export type RegistryOption = { id: string; label: string };

/** One dropdown section: pinned top options (`continent: null`) or an optgroup. */
export type RegistryOptionSection = {
  continent: ContinentGroup | null;
  options: RegistryOption[];
};

/**
 * Origin/destination dropdown sections: Anywhere first, then continent
 * optgroups with alphabetized options.
 */
export function listRegistryOptionSections(): RegistryOptionSection[] {
  const pinned: RegistryOption[] = [];
  const byContinent = new Map<ContinentGroup, RegistryOption[]>();

  for (const entry of Object.values(LOCATION_REGISTRY)) {
    const option = { id: entry.id, label: entry.label };
    if (entry.continent === null) {
      pinned.push(option);
      continue;
    }
    const list = byContinent.get(entry.continent) ?? [];
    list.push(option);
    byContinent.set(entry.continent, list);
  }

  pinned.sort((a, b) => a.label.localeCompare(b.label, "en"));

  const sections: RegistryOptionSection[] = [];
  if (pinned.length > 0) {
    sections.push({ continent: null, options: pinned });
  }
  for (const continent of CONTINENT_GROUP_ORDER) {
    const options = byContinent.get(continent);
    if (!options?.length) continue;
    options.sort((a, b) => a.label.localeCompare(b.label, "en"));
    sections.push({ continent, options });
  }
  return sections;
}

/** Flat registry options in dropdown order (Anywhere, then by continent). */
export function listRegistryOptions(): RegistryOption[] {
  return listRegistryOptionSections().flatMap((section) => section.options);
}

/** True for Anywhere or a multi-airport gateway / region registry entry. */
export function isAnywhereOrGateway(ref: LocationRef): boolean {
  const id = normalizeLocationRef(ref);
  if (id === ANYWHERE_LOCATION_ID) return true;
  const entry = LOCATION_REGISTRY[id];
  if (!entry) return false;
  return entry.type !== "city" && entry.type !== "airport";
}

/** True for a city registry entry or a raw single-airport IATA code. */
export function isSingleCityLocation(ref: LocationRef): boolean {
  const id = normalizeLocationRef(ref);
  if (isRawIata(id)) return true;
  return LOCATION_REGISTRY[id]?.type === "city";
}

/**
 * Default city-grouping side for results.
 * Prefer arrival cities when flying from a single city to gateways/Anywhere
 * (destinations vary); otherwise prefer departure cities.
 */
export function defaultCityGroupSide(
  origin: LocationRef,
  dest: LocationRef,
): CityGroupSide {
  if (isSingleCityLocation(origin) && isAnywhereOrGateway(dest)) {
    return "arrival";
  }
  return "departure";
}
