import { CABIN_TO_TRAVEL_CLASS, maxStopsToSerpApiStops } from "./cabin";
import { classifySeat, extractLegroom } from "./classifier";
import { airportLabel } from "./locations";
import type {
  Cabin,
  FlightProvider,
  ItineraryOption,
  LegSearch,
  Segment,
} from "./types";

type SerpAirport = { name?: string; id?: string; time?: string };
type SerpFlight = {
  departure_airport?: SerpAirport;
  arrival_airport?: SerpAirport;
  duration?: number;
  airplane?: string;
  airline?: string;
  flight_number?: string;
  travel_class?: string;
  legroom?: string;
  extensions?: string[];
};
type SerpLayover = { duration?: number; name?: string; id?: string };
type SerpItinerary = {
  flights?: SerpFlight[];
  layovers?: SerpLayover[];
  total_duration?: number;
  price?: number;
  type?: string;
  booking_token?: string;
};
type SerpApiResponse = {
  search_metadata?: { google_flights_url?: string; status?: string };
  search_parameters?: Record<string, unknown>;
  best_flights?: SerpItinerary[];
  other_flights?: SerpItinerary[];
  error?: string;
};

const TRAVEL_CLASS_TO_CABIN: Record<string, Cabin> = {
  economy: "economy",
  "premium economy": "premium_economy",
  "business class": "business",
  business: "business",
  "first class": "first",
  first: "first",
};

export type SerpApiFetch = (url: string) => Promise<Response>;

export type SerpApiProviderOptions = {
  apiKey: string;
  fetchImpl?: SerpApiFetch;
  baseUrl?: string;
  /** Called when an itinerary is dropped for missing price. */
  onDebug?: (message: string) => void;
};

function mapTravelClass(raw?: string): Cabin | undefined {
  if (!raw) return undefined;
  return TRAVEL_CLASS_TO_CABIN[raw.toLowerCase()];
}

function parseSegment(raw: SerpFlight): Segment | null {
  const dep = raw.departure_airport?.id;
  const arr = raw.arrival_airport?.id;
  if (!dep || !arr || !raw.airline || !raw.flight_number) return null;

  const amenities = Array.isArray(raw.extensions) ? [...raw.extensions] : [];
  const legroom =
    extractLegroom(amenities) ??
    (raw.legroom ? `${raw.legroom} legroom` : undefined);

  return {
    carrier: raw.airline,
    flightNumber: raw.flight_number,
    aircraft: raw.airplane,
    departureAirport: dep,
    arrivalAirport: arr,
    departureTime: raw.departure_airport?.time ?? "",
    arrivalTime: raw.arrival_airport?.time ?? "",
    durationMinutes: typeof raw.duration === "number" ? raw.duration : 0,
    cabin: mapTravelClass(raw.travel_class),
    amenities,
    seatClassification: classifySeat(amenities),
    legroom,
  };
}

function itineraryId(segments: Segment[], price: number): string {
  const key = segments
    .map(
      (s) =>
        `${s.flightNumber}|${s.departureAirport}|${s.arrivalAirport}|${s.departureTime}`,
    )
    .join(">");
  return `${key}|${price}`;
}

function departureDateFromSegments(segments: Segment[], fallback: string): string {
  const time = segments[0]?.departureTime;
  if (time && /^\d{4}-\d{2}-\d{2}/.test(time)) {
    return time.slice(0, 10);
  }
  return fallback;
}

export function parseSerpApiResponse(
  data: unknown,
  context: {
    currency: string;
    departureDate: string;
    googleFlightsUrl?: string;
    onDebug?: (message: string) => void;
  },
): ItineraryOption[] {
  const response = data as SerpApiResponse;
  const buckets = [
    ...(response.best_flights ?? []),
    ...(response.other_flights ?? []),
  ];

  const options: ItineraryOption[] = [];
  const seen = new Set<string>();

  for (const raw of buckets) {
    if (typeof raw.price !== "number" || !Number.isFinite(raw.price)) {
      context.onDebug?.("drop itinerary: missing price");
      continue;
    }

    const segments: Segment[] = [];
    for (const flight of raw.flights ?? []) {
      const segment = parseSegment(flight);
      if (!segment) {
        context.onDebug?.("drop itinerary: unparseable segment");
        segments.length = 0;
        break;
      }
      segments.push(segment);
    }
    if (segments.length === 0) continue;

    const id = itineraryId(segments, raw.price);
    if (seen.has(id)) continue;
    seen.add(id);

    const dest = segments[segments.length - 1]!.arrivalAirport;
    const departureDate = departureDateFromSegments(
      segments,
      context.departureDate,
    );

    options.push({
      id,
      segments,
      layovers: (raw.layovers ?? []).map((l) => ({
        airport: l.id ?? "",
        durationMinutes: typeof l.duration === "number" ? l.duration : 0,
      })),
      totalDurationMinutes:
        typeof raw.total_duration === "number"
          ? raw.total_duration
          : segments.reduce((sum, s) => sum + s.durationMinutes, 0),
      price: raw.price,
      currency: context.currency,
      provider: "serpapi",
      googleFlightsUrl:
        context.googleFlightsUrl ??
        response.search_metadata?.google_flights_url,
      departureDate,
      destinationAirport: dest,
      destinationLabel: airportLabel(dest),
      unverified: false,
      raw,
    });
  }

  return options;
}

/** Deduplicate identical itineraries (same segments + price) across batches. */
export function dedupeItineraries(options: ItineraryOption[]): ItineraryOption[] {
  const seen = new Set<string>();
  const out: ItineraryOption[] = [];
  for (const option of options) {
    const key = itineraryId(option.segments, option.price);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(option);
  }
  return out;
}

export function buildSerpApiUrl(
  params: {
    departureId: string;
    arrivalId: string;
    outboundDate: string;
    cabin: Cabin;
    maxStops: 1 | 2;
    currency: string;
    gl: string;
    hl: string;
    deepSearch?: boolean;
    apiKey: string;
  },
  baseUrl = "https://serpapi.com/search.json",
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set("type", "2");
  url.searchParams.set("departure_id", params.departureId);
  url.searchParams.set("arrival_id", params.arrivalId);
  url.searchParams.set("outbound_date", params.outboundDate);
  url.searchParams.set(
    "travel_class",
    String(CABIN_TO_TRAVEL_CLASS[params.cabin]),
  );
  url.searchParams.set("stops", String(maxStopsToSerpApiStops(params.maxStops)));
  url.searchParams.set("currency", params.currency);
  url.searchParams.set("gl", params.gl);
  url.searchParams.set("hl", params.hl);
  url.searchParams.set("adults", "1");
  if (params.deepSearch) url.searchParams.set("deep_search", "true");
  url.searchParams.set("api_key", params.apiKey);
  return url.toString();
}

/** Normalized cache key from request params (excludes api_key). */
export function serpApiCacheKey(params: {
  departureId: string;
  arrivalId: string;
  outboundDate: string;
  cabin: Cabin;
  maxStops: 1 | 2;
  currency: string;
  gl: string;
  hl: string;
  deepSearch?: boolean;
}): string {
  return [
    "gf",
    params.departureId,
    params.arrivalId,
    params.outboundDate,
    params.cabin,
    String(params.maxStops),
    params.currency,
    params.gl,
    params.hl,
    params.deepSearch ? "deep" : "std",
  ].join("|");
}

export class SerpApiProvider implements FlightProvider {
  private readonly apiKey: string;
  private readonly fetchImpl: SerpApiFetch;
  private readonly baseUrl: string;
  private readonly onDebug?: (message: string) => void;

  constructor(options: SerpApiProviderOptions) {
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = options.baseUrl ?? "https://serpapi.com/search.json";
    this.onDebug = options.onDebug;
  }

  async search(spec: LegSearch): Promise<ItineraryOption[]> {
    // Single-airport convenience path; planner uses searchStep for batches.
    return this.searchStep({
      originBatch: [spec.origin],
      destBatch: [spec.dest],
      date: spec.dateRange.start,
      cabin: spec.cabin,
      maxStops: spec.maxStops,
      currency: spec.currency,
      gl: spec.gl,
      hl: spec.hl,
      deepSearch: spec.deepSearch,
    });
  }

  async searchStep(step: {
    originBatch: string[];
    destBatch: string[];
    date: string;
    cabin: Cabin;
    maxStops: 1 | 2;
    currency: string;
    gl: string;
    hl: string;
    deepSearch?: boolean;
  }): Promise<{ options: ItineraryOption[]; raw: unknown }> {
    const url = buildSerpApiUrl(
      {
        departureId: step.originBatch.join(","),
        arrivalId: step.destBatch.join(","),
        outboundDate: step.date,
        cabin: step.cabin,
        maxStops: step.maxStops,
        currency: step.currency,
        gl: step.gl,
        hl: step.hl,
        deepSearch: step.deepSearch,
        apiKey: this.apiKey,
      },
      this.baseUrl,
    );

    const raw = await this.fetchWithRetry(url);
    const options = parseSerpApiResponse(raw, {
      currency: step.currency,
      departureDate: step.date,
      onDebug: this.onDebug,
    });
    return { options, raw };
  }

  private async fetchWithRetry(url: string, attempts = 2): Promise<unknown> {
    let lastError: Error | undefined;
    for (let i = 0; i < attempts; i++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 25_000);
        const response = await this.fetchImpl(url);
        clearTimeout(timer);

        if (response.status === 429 || response.status >= 500) {
          lastError = new Error(`SerpApi HTTP ${response.status}`);
          if (i < attempts - 1) {
            await sleep(500 * (i + 1));
            continue;
          }
          throw lastError;
        }

        if (!response.ok) {
          throw new Error(`SerpApi HTTP ${response.status}`);
        }

        const data = (await response.json()) as SerpApiResponse;
        if (data.error) {
          throw new Error(data.error);
        }
        return data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (i < attempts - 1) {
          await sleep(500 * (i + 1));
          continue;
        }
      }
    }
    throw lastError ?? new Error("SerpApi fetch failed");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
