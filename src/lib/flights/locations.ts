export type LocationType =
  | "airport"
  | "city"
  | "country"
  | "region"
  | "continent";

export type LocationEntry = {
  id: string;
  type: LocationType;
  label: string;
  /** Direct IATA codes owned by this entry. */
  airports?: string[];
  /** Other registry ids to compose recursively. */
  refs?: string[];
};

/**
 * Composable location registry. "usa" appears only here as registry data.
 * Resolution is recursive with cycle detection (see LocationResolver).
 */
export const LOCATION_REGISTRY: Record<string, LocationEntry> = {
  EZE: {
    id: "EZE",
    type: "airport",
    label: "Buenos Aires (EZE)",
    airports: ["EZE"],
  },
  "usa-gateways": {
    id: "usa-gateways",
    type: "country",
    label: "USA gateways",
    airports: [
      "JFK",
      "EWR",
      "BOS",
      "IAD",
      "PHL",
      "CLT",
      "ATL",
      "MIA",
      "ORD",
      "DTW",
      "DFW",
      "IAH",
      "DEN",
      "LAX",
      "SFO",
      "SEA",
    ],
  },
  // Generality-proof sample entries (invariant 9)
  france: {
    id: "france",
    type: "country",
    label: "France",
    airports: ["CDG", "ORY"],
  },
  germany: {
    id: "germany",
    type: "country",
    label: "Germany",
    airports: ["FRA", "MUC"],
  },
  "western-europe-sample": {
    id: "western-europe-sample",
    type: "region",
    label: "Western Europe (sample)",
    refs: ["france", "germany"],
    airports: ["LHR"],
  },
  "south-america-sample": {
    id: "south-america-sample",
    type: "region",
    label: "South America (sample)",
    airports: ["EZE", "GRU", "SCL"],
  },
};

/** Display labels for common gateway airports (used in result rows). */
export const AIRPORT_CITY_LABELS: Record<string, string> = {
  JFK: "New York",
  EWR: "Newark",
  BOS: "Boston",
  IAD: "Washington",
  PHL: "Philadelphia",
  CLT: "Charlotte",
  ATL: "Atlanta",
  MIA: "Miami",
  ORD: "Chicago",
  DTW: "Detroit",
  DFW: "Dallas",
  IAH: "Houston",
  DEN: "Denver",
  LAX: "Los Angeles",
  SFO: "San Francisco",
  SEA: "Seattle",
  EZE: "Buenos Aires",
  CDG: "Paris",
  ORY: "Paris",
  FRA: "Frankfurt",
  MUC: "Munich",
  LHR: "London",
  GRU: "São Paulo",
  SCL: "Santiago",
};

export function airportLabel(code: string): string {
  const city = AIRPORT_CITY_LABELS[code];
  return city ? `${city} (${code})` : code;
}
