import mostReviewedP1 from "../../../../fixtures/hotels/ba-most-reviewed-p1.json";
import mostReviewedP2 from "../../../../fixtures/hotels/ba-most-reviewed-p2.json";
import highestRatingP1 from "../../../../fixtures/hotels/ba-highest-rating-p1.json";
import propertyFourSeasons from "../../../../fixtures/hotels/property-fourseasons.json";
import tripadvisorFourSeasons from "../../../../fixtures/hotels/tripadvisor-fourseasons.json";
import type {
  GetPropertyQuery,
  HotelDataProvider,
  HotelListPage,
  HotelPropertyPage,
  ListPropertiesQuery,
  SearchApiListProperty,
  SearchApiPropertyDetails,
  TripadvisorSearchResult,
} from "./types";

type ListFixture = {
  search_metadata?: { id?: string; request_url?: string };
  pagination?: {
    records_from?: number;
    records_to?: number;
    next_page_token?: string;
  };
  properties?: SearchApiListProperty[];
};

type PropertyFixture = {
  search_metadata?: { id?: string; request_url?: string };
  property?: SearchApiPropertyDetails;
};

function toListPage(data: ListFixture): HotelListPage {
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

/**
 * Replays committed fixtures. No filesystem — safe for Workers + Vitest.
 */
export class FixtureProvider implements HotelDataProvider {
  readonly creditsUsed = 0;

  async listProperties(
    query: ListPropertiesQuery,
    pageToken?: string,
  ): Promise<HotelListPage> {
    const sort = query.sortBy ?? "most_reviewed";
    if (sort === "highest_rating") {
      if (pageToken) {
        return {
          properties: [],
          pagination: {},
          raw: { properties: [], pagination: {} },
        };
      }
      const page = toListPage(highestRatingP1 as ListFixture);
      return {
        ...page,
        pagination: { ...page.pagination, nextPageToken: undefined },
      };
    }
    if (sort === "most_reviewed") {
      if (!pageToken) {
        return toListPage(mostReviewedP1 as ListFixture);
      }
      if (pageToken === "CBI=") {
        return toListPage(mostReviewedP2 as ListFixture);
      }
      return {
        properties: [],
        pagination: {},
        raw: { properties: [], pagination: {} },
      };
    }
    return toListPage(mostReviewedP1 as ListFixture);
  }

  async getProperty(query: GetPropertyQuery): Promise<HotelPropertyPage> {
    const data = propertyFourSeasons as PropertyFixture;
    const property = data.property;
    if (!property?.property_token) {
      throw new Error("fixture_property_missing");
    }
    return {
      property: {
        ...property,
        property_token: query.propertyToken || property.property_token,
      },
      requestUrl: data.search_metadata?.request_url,
      searchId: data.search_metadata?.id,
      raw: data,
    };
  }

  async searchTripadvisor(_q: string): Promise<TripadvisorSearchResult> {
    const data = tripadvisorFourSeasons as unknown as {
      place_results?: TripadvisorSearchResult["places"];
      search_metadata?: { id?: string };
    };
    return {
      places: data.place_results ?? [],
      searchId: data.search_metadata?.id,
      raw: data,
    };
  }
}
