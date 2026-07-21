import { CABIN_TO_TRAVEL_CLASS, maxStopsToSearchApiStops } from "./cabin";
import { classifySeat, extractLegroom } from "./classifier";
import { ROUND_TRIP_CANDIDATES_PER_STEP } from "./constants";
import { airportLabel } from "./locations";
import type {
  Cabin,
  FlightProvider,
  ItineraryOption,
  LegSearch,
  MaxStops,
  Segment,
} from "./types";

type SearchApiAirport = {
  name?: string;
  id?: string;
  date?: string;
  time?: string;
};

type SearchApiFlight = {
  departure_airport?: SearchApiAirport;
  arrival_airport?: SearchApiAirport;
  duration?: number;
  airplane?: string;
  airline?: string;
  flight_number?: string;
  travel_class?: string;
  legroom?: string;
  extensions?: string[];
};

type SearchApiLayover = { duration?: number; name?: string; id?: string };

type SearchApiItinerary = {
  flights?: SearchApiFlight[];
  layovers?: SearchApiLayover[];
  total_duration?: number;
  price?: number;
  type?: string;
  booking_token?: string;
  departure_token?: string;
};

type SearchApiResponse = {
  search_metadata?: {
    request_url?: string;
    status?: string;
  };
  search_parameters?: Record<string, unknown>;
  best_flights?: SearchApiItinerary[];
  other_flights?: SearchApiItinerary[];
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

export type SearchApiFetch = (
  url: string,
  init?: RequestInit,
) => Promise<Response>;

export type SearchApiProviderOptions = {
  apiKey: string;
  fetchImpl?: SearchApiFetch;
  baseUrl?: string;
  retryAttempts?: number;
  retryBaseDelayMs?: number;
  requestTimeoutMs?: number;
  /** Called when an itinerary is dropped for malformed provider data. */
  onDebug?: (message: string) => void;
};

export class SearchApiRequestError extends Error {
  constructor(
    message: string,
    readonly searchesUsed: number,
  ) {
    super(message);
    this.name = "SearchApiRequestError";
  }
}

function mapTravelClass(raw?: string): Cabin | undefined {
  if (!raw) return undefined;
  return TRAVEL_CLASS_TO_CABIN[raw.toLowerCase()];
}

function airportDateTime(airport?: SearchApiAirport): string {
  if (!airport?.time) return airport?.date ?? "";
  if (!airport.date || airport.time.startsWith(airport.date)) {
    return airport.time;
  }
  return `${airport.date} ${airport.time}`;
}

function parseSegment(raw: SearchApiFlight): Segment | null {
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
    departureTime: airportDateTime(raw.departure_airport),
    arrivalTime: airportDateTime(raw.arrival_airport),
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
      (segment) =>
        `${segment.flightNumber}|${segment.departureAirport}|${segment.arrivalAirport}|${segment.departureTime}`,
    )
    .join(">");
  return `${key}|${price}`;
}

function departureDateFromSegments(
  segments: Segment[],
  fallback: string,
): string {
  const time = segments[0]?.departureTime;
  if (time && /^\d{4}-\d{2}-\d{2}/.test(time)) return time.slice(0, 10);
  return fallback;
}

export function parseSearchApiResponse(
  data: unknown,
  context: {
    currency: string;
    departureDate: string;
    googleFlightsUrl?: string;
    onDebug?: (message: string) => void;
  },
): ItineraryOption[] {
  const response = data as SearchApiResponse;
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

    const dest = segments.at(-1)!.arrivalAirport;
    options.push({
      id,
      segments,
      layovers: (raw.layovers ?? []).map((layover) => ({
        airport: layover.id ?? "",
        durationMinutes:
          typeof layover.duration === "number" ? layover.duration : 0,
      })),
      totalDurationMinutes:
        typeof raw.total_duration === "number"
          ? raw.total_duration
          : segments.reduce(
              (sum, segment) => sum + segment.durationMinutes,
              0,
            ),
      price: raw.price,
      currency: context.currency,
      provider: "searchapi",
      googleFlightsUrl:
        context.googleFlightsUrl ?? response.search_metadata?.request_url,
      departureDate: departureDateFromSegments(
        segments,
        context.departureDate,
      ),
      destinationAirport: dest,
      destinationLabel: airportLabel(dest),
      departureToken: raw.departure_token,
      bookingToken: raw.booking_token,
      unverified: false,
      raw,
    });
  }

  return options;
}

/** Deduplicate identical itineraries across airport batches. */
export function dedupeItineraries(options: ItineraryOption[]): ItineraryOption[] {
  const seen = new Set<string>();
  const unique: ItineraryOption[] = [];
  for (const option of options) {
    const key = itineraryId(
      [...option.segments, ...(option.returnSegments ?? [])],
      option.price,
    );
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(option);
  }
  return unique;
}

function combineRoundTrip(
  outbound: ItineraryOption,
  inbound: ItineraryOption,
  returnDate: string,
): ItineraryOption {
  return {
    ...outbound,
    id: `${outbound.id}::${inbound.id}`,
    price: inbound.price,
    googleFlightsUrl: inbound.googleFlightsUrl ?? outbound.googleFlightsUrl,
    bookingToken: inbound.bookingToken,
    departureToken: undefined,
    returnSegments: inbound.segments,
    returnLayovers: inbound.layovers,
    returnDurationMinutes: inbound.totalDurationMinutes,
    returnDate: departureDateFromSegments(inbound.segments, returnDate),
    raw: {
      outbound: outbound.raw,
      return: inbound.raw,
    },
  };
}

export function buildSearchApiUrl(
  params: {
    departureId: string;
    arrivalId: string;
    outboundDate: string;
    cabin: Cabin;
    maxStops: MaxStops;
    currency: string;
    gl: string;
    hl: string;
    tripType?: "one_way" | "round_trip";
    returnDate?: string;
    departureToken?: string;
    apiKey: string;
  },
  baseUrl = "https://www.searchapi.io/api/v1/search",
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("engine", "google_flights");
  url.searchParams.set(
    "flight_type",
    params.tripType === "round_trip" ? "round_trip" : "one_way",
  );
  url.searchParams.set("departure_id", params.departureId);
  url.searchParams.set("arrival_id", params.arrivalId);
  url.searchParams.set("outbound_date", params.outboundDate);
  if (params.tripType === "round_trip" && params.returnDate) {
    url.searchParams.set("return_date", params.returnDate);
  }
  if (params.departureToken) {
    url.searchParams.set("departure_token", params.departureToken);
  }
  url.searchParams.set("travel_class", CABIN_TO_TRAVEL_CLASS[params.cabin]);
  url.searchParams.set("stops", maxStopsToSearchApiStops(params.maxStops));
  url.searchParams.set("currency", params.currency);
  url.searchParams.set("gl", params.gl);
  url.searchParams.set("hl", params.hl);
  url.searchParams.set("adults", "1");
  url.searchParams.set("api_key", params.apiKey);
  return url.toString();
}

/** Provider-versioned cache key. Excludes the API key and ignored legacy flags. */
export function searchApiCacheKey(params: {
  departureId: string;
  arrivalId: string;
  outboundDate: string;
  cabin: Cabin;
  maxStops: MaxStops;
  currency: string;
  gl: string;
  hl: string;
  tripType?: "one_way" | "round_trip";
  returnDate?: string;
  topN?: number;
}): string {
  return [
    "searchapi-v1",
    params.departureId,
    params.arrivalId,
    params.outboundDate,
    params.tripType ?? "one_way",
    params.returnDate ?? "-",
    params.cabin,
    String(params.maxStops),
    params.currency,
    params.gl,
    params.hl,
    params.tripType === "round_trip" ? String(params.topN ?? "-") : "-",
  ].join("|");
}

type SearchStep = {
  originBatch: string[];
  destBatch: string[];
  date: string;
  cabin: Cabin;
  maxStops: MaxStops;
  currency: string;
  gl: string;
  hl: string;
};

export class SearchApiProvider implements FlightProvider {
  private readonly apiKey: string;
  private readonly fetchImpl: SearchApiFetch;
  private readonly baseUrl: string;
  private readonly onDebug?: (message: string) => void;
  private readonly retryAttempts: number;
  private readonly retryBaseDelayMs: number;
  private readonly requestTimeoutMs: number;

  constructor(options: SearchApiProviderOptions) {
    this.apiKey = options.apiKey;
    this.fetchImpl =
      options.fetchImpl ?? ((url, init) => globalThis.fetch(url, init));
    this.baseUrl =
      options.baseUrl ?? "https://www.searchapi.io/api/v1/search";
    this.onDebug = options.onDebug;
    this.retryAttempts = Math.max(1, options.retryAttempts ?? 4);
    this.retryBaseDelayMs = Math.max(0, options.retryBaseDelayMs ?? 750);
    this.requestTimeoutMs = Math.max(1, options.requestTimeoutMs ?? 45_000);
  }

  async search(spec: LegSearch): Promise<ItineraryOption[]> {
    const { options } = await this.searchStep({
      originBatch: [spec.origin],
      destBatch: [spec.dest],
      date: spec.dateRange.start,
      cabin: spec.cabin,
      maxStops: spec.maxStops,
      currency: spec.currency,
      gl: spec.gl,
      hl: spec.hl,
    });
    return options;
  }

  async searchStep(step: SearchStep): Promise<{
    options: ItineraryOption[];
    raw: unknown;
    searchesUsed: number;
  }> {
    const url = buildSearchApiUrl(
      {
        departureId: step.originBatch.join(","),
        arrivalId: step.destBatch.join(","),
        outboundDate: step.date,
        cabin: step.cabin,
        maxStops: step.maxStops,
        currency: step.currency,
        gl: step.gl,
        hl: step.hl,
        apiKey: this.apiKey,
      },
      this.baseUrl,
    );
    const { raw, searchesUsed } = await this.fetchWithRetry(url);
    return {
      options: parseSearchApiResponse(raw, {
        currency: step.currency,
        departureDate: step.date,
        onDebug: this.onDebug,
      }),
      raw,
      searchesUsed,
    };
  }

  async searchRoundTripStep(
    step: SearchStep & {
      returnDate: string;
      topN: number;
    },
  ): Promise<{
    options: ItineraryOption[];
    raw: unknown;
    searchesUsed: number;
    partialFailures: number;
  }> {
    const baseParams = {
      departureId: step.originBatch.join(","),
      arrivalId: step.destBatch.join(","),
      outboundDate: step.date,
      returnDate: step.returnDate,
      tripType: "round_trip" as const,
      cabin: step.cabin,
      maxStops: step.maxStops,
      currency: step.currency,
      gl: step.gl,
      hl: step.hl,
      apiKey: this.apiKey,
    };
    const initial = await this.fetchWithRetry(
      buildSearchApiUrl(baseParams, this.baseUrl),
    );
    let searchesUsed = initial.searchesUsed;
    let partialFailures = 0;
    const candidates = parseSearchApiResponse(initial.raw, {
      currency: step.currency,
      departureDate: step.date,
      onDebug: this.onDebug,
    })
      .filter((option) => option.departureToken)
      .sort(
        (a, b) =>
          a.price - b.price ||
          a.totalDurationMinutes - b.totalDurationMinutes,
      )
      .slice(
        0,
        Math.min(
          ROUND_TRIP_CANDIDATES_PER_STEP,
          Math.max(1, step.topN),
        ),
      );

    const hydratedCandidates = await Promise.all(
      candidates.map(async (outbound) => {
        const returnUrl = buildSearchApiUrl(
          { ...baseParams, departureToken: outbound.departureToken },
          this.baseUrl,
        );
        try {
          const inboundResult = await this.fetchWithRetry(returnUrl);
          const inboundOptions = parseSearchApiResponse(inboundResult.raw, {
            currency: step.currency,
            departureDate: step.returnDate,
            onDebug: this.onDebug,
          });
          return {
            options: inboundOptions.map((inbound) =>
              combineRoundTrip(outbound, inbound, step.returnDate),
            ),
            searchesUsed: inboundResult.searchesUsed,
            failed: false,
          };
        } catch (error) {
          this.onDebug?.(
            `return-flight lookup failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          return {
            options: [] as ItineraryOption[],
            searchesUsed:
              error instanceof SearchApiRequestError ? error.searchesUsed : 0,
            failed: true,
          };
        }
      }),
    );

    const options: ItineraryOption[] = [];
    for (const result of hydratedCandidates) {
      options.push(...result.options);
      searchesUsed += result.searchesUsed;
      if (result.failed) partialFailures += 1;
    }

    return {
      options: dedupeItineraries(options),
      raw: { kind: "round_trip", options },
      searchesUsed,
      partialFailures,
    };
  }

  private async fetchWithRetry(
    url: string,
  ): Promise<{ raw: unknown; searchesUsed: number }> {
    let lastError: Error | undefined;
    let searchesUsed = 0;
    for (let index = 0; index < this.retryAttempts; index += 1) {
      const attempt = index + 1;
      try {
        searchesUsed += 1;
        const controller = new AbortController();
        const timer = setTimeout(
          () => controller.abort(),
          this.requestTimeoutMs,
        );
        let response: Response;
        try {
          response = await this.fetchImpl(url, { signal: controller.signal });
        } finally {
          clearTimeout(timer);
        }

        if (isRetryableStatus(response.status)) {
          throw new RetryableSearchApiError(
            `SearchAPI HTTP ${response.status}`,
          );
        }
        if (!response.ok) {
          throw new Error(`SearchAPI HTTP ${response.status}`);
        }

        const data = (await response.json()) as SearchApiResponse;
        if (data.error) {
          if (isNoResultsSearchApiMessage(data.error)) {
            return { raw: data, searchesUsed };
          }
          if (isRetryableSearchApiMessage(data.error)) {
            throw new RetryableSearchApiError(data.error);
          }
          throw new Error(data.error);
        }
        return { raw: data, searchesUsed };
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error(String(error));
        const canRetry =
          attempt < this.retryAttempts && isRetryableError(lastError);
        if (!canRetry) break;

        const delay = this.retryBaseDelayMs * 2 ** index;
        this.onDebug?.(
          `SearchAPI attempt ${attempt} failed; retrying in ${delay}ms: ${lastError.message}`,
        );
        await sleep(delay);
      }
    }

    throw new SearchApiRequestError(
      lastError?.message ?? "SearchAPI fetch failed",
      searchesUsed,
    );
  }
}

class RetryableSearchApiError extends Error {}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function isRetryableSearchApiMessage(message: string): boolean {
  return /timed? ?out|temporar|try again|unavailable/i.test(message);
}

function isNoResultsSearchApiMessage(message: string): boolean {
  return /hasn't returned any results/i.test(message);
}

function isRetryableError(error: Error): boolean {
  return (
    error instanceof RetryableSearchApiError ||
    error.name === "AbortError" ||
    error instanceof TypeError
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
