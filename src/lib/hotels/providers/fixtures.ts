import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  GetPropertyQuery,
  HotelDataProvider,
  HotelListPage,
  HotelPropertyPage,
  ListPropertiesQuery,
  SearchApiListProperty,
  SearchApiPropertyDetails,
} from "./types";

const FIXTURE_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../fixtures/hotels",
);

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

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURE_DIR, name), "utf8")) as T;
}

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
 * Replays committed fixtures. Ignores live network.
 * Maps sort_by + page token to fixture files for BA MVP.
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
      const page = toListPage(loadJson("ba-highest-rating-p1.json"));
      // Only one highest-rating fixture page — stop pagination.
      return { ...page, pagination: { ...page.pagination, nextPageToken: undefined } };
    }
    if (sort === "most_reviewed") {
      if (!pageToken) {
        return toListPage(loadJson("ba-most-reviewed-p1.json"));
      }
      // p1 next_page_token is CBI=; anything else → end of fixture corpus
      if (pageToken === "CBI=") {
        return toListPage(loadJson("ba-most-reviewed-p2.json"));
      }
      return {
        properties: [],
        pagination: {},
        raw: { properties: [], pagination: {} },
      };
    }
    // relevance / lowest_price → reuse most_reviewed p1
    return toListPage(loadJson("ba-most-reviewed-p1.json"));
  }

  async getProperty(query: GetPropertyQuery): Promise<HotelPropertyPage> {
    const data = loadJson<PropertyFixture>("property-fourseasons.json");
    const property = data.property;
    if (!property?.property_token) {
      throw new Error("fixture_property_missing");
    }
    // Return fixture regardless of token — only one full property fixture.
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
}
