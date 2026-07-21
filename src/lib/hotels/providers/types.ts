/**
 * Provider seam for hotel data. Implementations: SearchApiProvider, FixtureProvider.
 * Pipeline must depend only on this interface — never import searchapi.ts.
 *
 * Raw JSON is typed only for consumed fields; everything else stays on `raw`.
 * See NOTES.md for observed paths and ADRs.
 */

export type HotelSortBy =
  | "relevance"
  | "lowest_price"
  | "highest_rating"
  | "most_reviewed";

/** SearchAPI order: [min_lng, min_lat, max_lng, max_lat]. Mutually exclusive with `q`. */
export type BoundingBox = [number, number, number, number];

export type ListPropertiesQuery = {
  /** Free-text city / area query. Omit when `bbox` is set. */
  q?: string;
  bbox?: BoundingBox;
  checkIn: string;
  checkOut: string;
  adults?: number;
  sortBy?: HotelSortBy;
  /** Pass through documented filters when used; may be ignored by provider. */
  ratingMinCode?: 7 | 8 | 9;
  hotelClass?: string;
  priceMin?: number;
  priceMax?: number;
  amenities?: string;
  propertyTypes?: string;
  propertyType?: "hotel" | "vacation_rental";
  freeCancellation?: boolean;
  gl?: string;
  hl?: string;
  currency?: string;
};

export type GetPropertyQuery = {
  propertyToken: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  gl?: string;
  /** Omit for google_hotels_property — live API rejected hl=en (see NOTES). */
  hl?: string;
  currency?: string;
};

export type GpsCoordinates = {
  latitude: number;
  longitude: number;
};

export type MoneyAmount = {
  price?: string;
  extracted_price?: number;
  price_before_taxes?: string;
  extracted_price_before_taxes?: number;
};

export type ReviewsHistogram = {
  "1"?: number;
  "2"?: number;
  "3"?: number;
  "4"?: number;
  "5"?: number;
};

/** List uses `total`; property details uses `total_mentions`. */
export type ReviewsBreakdownItem = {
  name?: string;
  description?: string;
  total?: number;
  total_mentions?: number;
  positive?: number;
  neutral?: number;
  negative?: number;
};

/** Consumed shape of a google_hotels list property (plus opaque remainder). */
export type SearchApiListProperty = {
  property_token?: string;
  name?: string;
  type?: string;
  data_id?: string;
  city?: string;
  country?: string;
  link?: string;
  hotel_class?: string;
  extracted_hotel_class?: number;
  rating?: number;
  reviews?: number;
  gps_coordinates?: GpsCoordinates;
  amenities?: string[] | null;
  reviews_histogram?: ReviewsHistogram;
  reviews_breakdown?: ReviewsBreakdownItem[];
  price_per_night?: MoneyAmount;
  total_price?: MoneyAmount;
  check_in_time?: string;
  check_out_time?: string;
  raw?: unknown;
};

export type SearchApiOffer = {
  source?: string;
  has_free_cancellation?: boolean | null;
  free_cancellation_until?: string | null;
  price_per_night?: MoneyAmount;
  total_price?: MoneyAmount;
  link?: string;
  tracking_link?: string;
};

/** Consumed shape under google_hotels_property → `property`. */
export type SearchApiPropertyDetails = SearchApiListProperty & {
  address?: string;
  phone?: string;
  featured_offers?: SearchApiOffer[];
  all_offers?: SearchApiOffer[];
  price_insights?: unknown;
  review_results?: unknown;
};

export type HotelListPagination = {
  recordsFrom?: number;
  recordsTo?: number;
  nextPageToken?: string;
};

export type HotelListPage = {
  properties: SearchApiListProperty[];
  pagination: HotelListPagination;
  requestUrl?: string;
  searchId?: string;
  /** Full provider payload for storage / debugging — do not log wholesale. */
  raw: unknown;
};

export type HotelPropertyPage = {
  property: SearchApiPropertyDetails;
  requestUrl?: string;
  searchId?: string;
  raw: unknown;
};

export type ProviderCallLog = {
  engine: string;
  ok: boolean;
  creditsEstimated: number;
  searchId?: string;
  error?: string;
};

export interface HotelDataProvider {
  listProperties(
    query: ListPropertiesQuery,
    pageToken?: string,
  ): Promise<HotelListPage>;

  getProperty(query: GetPropertyQuery): Promise<HotelPropertyPage>;
}
