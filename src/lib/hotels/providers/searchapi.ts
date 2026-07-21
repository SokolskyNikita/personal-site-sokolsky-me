import type {
  GetPropertyQuery,
  HotelDataProvider,
  HotelListPage,
  HotelPropertyPage,
  ListPropertiesQuery,
  SearchApiListProperty,
  SearchApiPropertyDetails,
} from "./types";

export type SearchApiFetch = (
  url: string,
  init?: RequestInit,
) => Promise<Response>;

export type SearchApiHotelProviderOptions = {
  apiKey: string;
  fetchImpl?: SearchApiFetch;
  baseUrl?: string;
  retryAttempts?: number;
  /** Hard refuse unless liveMode is true (SEARCHAPI_LIVE=1). */
  liveMode: boolean;
  onCall?: (info: {
    engine: string;
    ok: boolean;
    searchId?: string;
    error?: string;
  }) => void;
};

export class LiveModeDisabledError extends Error {
  constructor() {
    super("SEARCHAPI_LIVE is not enabled");
    this.name = "LiveModeDisabledError";
  }
}

export class SearchApiHotelProvider implements HotelDataProvider {
  private readonly apiKey: string;
  private readonly fetchImpl: SearchApiFetch;
  private readonly baseUrl: string;
  private readonly retryAttempts: number;
  private readonly liveMode: boolean;
  private readonly onCall?: SearchApiHotelProviderOptions["onCall"];
  creditsUsed = 0;

  constructor(options: SearchApiHotelProviderOptions) {
    this.apiKey = options.apiKey;
    this.fetchImpl =
      options.fetchImpl ?? ((url, init) => globalThis.fetch(url, init));
    this.baseUrl =
      options.baseUrl ?? "https://www.searchapi.io/api/v1/search";
    this.retryAttempts = Math.max(1, options.retryAttempts ?? 3);
    this.liveMode = options.liveMode;
    this.onCall = options.onCall;
  }

  async listProperties(
    query: ListPropertiesQuery,
    pageToken?: string,
  ): Promise<HotelListPage> {
    this.assertLive();
    const url = new URL(this.baseUrl);
    url.searchParams.set("engine", "google_hotels");
    if (query.bbox) {
      url.searchParams.set("bounding_box", query.bbox.join(","));
    } else if (query.q) {
      url.searchParams.set("q", query.q);
    }
    url.searchParams.set("check_in_date", query.checkIn);
    url.searchParams.set("check_out_date", query.checkOut);
    url.searchParams.set("adults", String(query.adults ?? 2));
    url.searchParams.set("gl", query.gl ?? "us");
    url.searchParams.set("hl", query.hl ?? "en");
    url.searchParams.set("currency", query.currency ?? "USD");
    url.searchParams.set("sort_by", query.sortBy ?? "most_reviewed");
    url.searchParams.set("property_type", query.propertyType ?? "hotel");
    if (pageToken) url.searchParams.set("next_page_token", pageToken);
    if (query.ratingMinCode != null) {
      url.searchParams.set("rating", String(query.ratingMinCode));
    }
    if (query.hotelClass) url.searchParams.set("hotel_class", query.hotelClass);
    if (query.priceMin != null) {
      url.searchParams.set("price_min", String(query.priceMin));
    }
    if (query.priceMax != null) {
      url.searchParams.set("price_max", String(query.priceMax));
    }
    if (query.amenities) url.searchParams.set("amenities", query.amenities);
    if (query.propertyTypes) {
      url.searchParams.set("property_types", query.propertyTypes);
    }
    if (query.freeCancellation) {
      url.searchParams.set("free_cancellation", "true");
    }

    const data = (await this.fetchJson(url, "google_hotels")) as {
      properties?: SearchApiListProperty[];
      pagination?: {
        records_from?: number;
        records_to?: number;
        next_page_token?: string;
      };
      search_metadata?: { id?: string; request_url?: string };
    };

    return {
      properties: data.properties ?? [],
      pagination: {
        recordsFrom: data.pagination?.records_from,
        recordsTo: data.pagination?.records_to,
        nextPageToken: data.pagination?.next_page_token,
      },
      requestUrl: data.search_metadata?.request_url,
      searchId: data.search_metadata?.id,
      raw: data,
    };
  }

  async getProperty(query: GetPropertyQuery): Promise<HotelPropertyPage> {
    this.assertLive();
    const url = new URL(this.baseUrl);
    url.searchParams.set("engine", "google_hotels_property");
    url.searchParams.set("property_token", query.propertyToken);
    url.searchParams.set("gl", query.gl ?? "us");
    // Omit hl — live API rejected hl=en (NOTES.md).
    url.searchParams.set("currency", query.currency ?? "USD");
    if (query.checkIn) url.searchParams.set("check_in_date", query.checkIn);
    if (query.checkOut) url.searchParams.set("check_out_date", query.checkOut);
    if (query.adults != null) {
      url.searchParams.set("adults", String(query.adults));
    }

    const data = (await this.fetchJson(url, "google_hotels_property")) as {
      property?: SearchApiPropertyDetails;
      search_metadata?: { id?: string; request_url?: string };
    };
    if (!data.property) throw new Error("property_missing");

    return {
      property: data.property,
      requestUrl: data.search_metadata?.request_url,
      searchId: data.search_metadata?.id,
      raw: data,
    };
  }

  private assertLive(): void {
    if (!this.liveMode) throw new LiveModeDisabledError();
  }

  private async fetchJson(url: URL, engine: string): Promise<unknown> {
    let lastError: string | undefined;
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const res = await this.fetchImpl(url.toString(), {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });
        const body = (await res.json()) as {
          error?: string;
          search_metadata?: { id?: string };
        };
        if (!res.ok || body.error) {
          lastError = body.error ?? `http_${res.status}`;
          this.onCall?.({
            engine,
            ok: false,
            searchId: body.search_metadata?.id,
            error: lastError,
          });
          if (res.status >= 500 || res.status === 429) continue;
          throw new Error(lastError);
        }
        this.creditsUsed += 1;
        this.onCall?.({
          engine,
          ok: true,
          searchId: body.search_metadata?.id,
        });
        console.log(
          JSON.stringify({
            type: "hotels_provider_call",
            engine,
            ok: true,
            searchId: body.search_metadata?.id,
            creditsUsed: this.creditsUsed,
          }),
        );
        return body;
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
      }
    }
    throw new Error(lastError ?? "searchapi_failed");
  }
}
