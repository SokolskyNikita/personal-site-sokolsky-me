import { ANYWHERE_LOCATION_ID, LOCATION_REGISTRY } from "./locations";
import type { LocationRef } from "./types";

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

export function listRegistryOptions(): Array<{ id: string; label: string }> {
  return Object.values(LOCATION_REGISTRY)
    .sort((a, b) => {
      const aGroup = a.type === "city" ? 1 : 0;
      const bGroup = b.type === "city" ? 1 : 0;
      return aGroup - bGroup || a.label.localeCompare(b.label, "en");
    })
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
    }));
}
