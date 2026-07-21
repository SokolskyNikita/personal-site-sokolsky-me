import type { HotelsRepository, PropertyRow } from "./db";
import type { PropertyFacts } from "./domain";
import type { HotelDataProvider } from "./providers/types";
import tripadvisorOverrides from "./config/tripadvisor-overrides.json";
import {
  classifyReviews,
  inferredBooleanFact,
  REVIEW_MODEL_VERSION,
  type ReviewFeatureSet,
  type ReviewInput,
} from "./review-signals";
import { matchTripadvisor, normalizeTitle, type TaMatch } from "./ta";
import { mapListProperty } from "./mapper";
import type { SearchApiListProperty } from "./providers/types";
import { scoreProperty } from "./scoring";
import { CITY_MEAN_FALLBACK } from "./constants";

export const REVIEW_CACHE_TTL_DAYS = 30;

type TripadvisorOverride = {
  citySlug: string;
  hotelName: string;
  placeId: string;
  title: string;
};

export type ReviewAnalysisResult = {
  features: ReviewFeatureSet;
  placeId: string | null;
  cacheHit: boolean;
  creditsUsed: number;
};

export async function getCachedReviewAnalysis(
  db: HotelsRepository,
  token: string,
): Promise<ReviewAnalysisResult | null> {
  const row = await db.getLatestReviewFeatures(token, REVIEW_MODEL_VERSION);
  if (!row) return null;
  const features = JSON.parse(row.features_json) as ReviewFeatureSet;
  return {
    features,
    placeId: row.place_id,
    cacheHit: true,
    creditsUsed: 0,
  };
}

export async function analyzeHotelReviews(input: {
  property: PropertyRow;
  cityDisplay: string;
  citySlug: string;
  cityId: number;
  cityMeanRating: number | null;
  provider: HotelDataProvider;
  db: HotelsRepository;
  force?: boolean;
  now?: Date;
}): Promise<ReviewAnalysisResult> {
  const now = input.now ?? new Date();
  const cached = await getCachedReviewAnalysis(input.db, input.property.token);
  const fresh =
    cached &&
    Date.parse(cached.features.analyzedAt) >=
      now.getTime() - REVIEW_CACHE_TTL_DAYS * 86_400_000;
  if (fresh && !input.force) return cached;

  if (
    !input.provider.searchTripadvisor ||
    !input.provider.getTripadvisorReviews
  ) {
    throw new Error("review_provider_unavailable");
  }

  let creditsUsed = 0;
  const override = (tripadvisorOverrides as TripadvisorOverride[]).find(
    (candidate) =>
      candidate.citySlug === input.citySlug &&
      normalizeTitle(candidate.hotelName) ===
        normalizeTitle(input.property.name),
  );
  let match: TaMatch | null = override
    ? {
        rating: null,
        reviews: null,
        placeId: override.placeId,
        title: override.title,
        confidence: "exact",
      }
    : null;
  const coreName = normalizeTitle(input.property.name);
  const searchQueries = [
    `${input.property.name} ${input.cityDisplay}`,
    `${coreName} ${input.cityDisplay}`,
    coreName,
  ].filter(
    (query, index, queries) =>
      query.trim().length > 0 && queries.indexOf(query) === index,
  );
  if (!match) {
    for (const query of searchQueries) {
      const search = await input.provider.searchTripadvisor(query);
      creditsUsed += 1;
      match = matchTripadvisor(
        input.property.name,
        input.cityDisplay,
        search.places,
      );
      if (match?.placeId) break;
    }
  }
  if (!match?.placeId) throw new Error("tripadvisor_match_not_found");

  const page = await input.provider.getTripadvisorReviews(match.placeId, 1);
  creditsUsed += 1;
  const reviews: ReviewInput[] = page.reviews.map((r) => ({
    id: r.id,
    text: [r.title, r.text].filter(Boolean).join(". "),
    rating: r.rating ?? null,
    date: r.date ?? r.travel_date ?? null,
    link: r.link ?? null,
  }));
  if (!reviews.length) throw new Error("reviews_not_found");

  const features = classifyReviews(reviews, now);
  const existing = input.property.facts_json
    ? (JSON.parse(input.property.facts_json) as PropertyFacts)
    : null;
  if (existing) {
    const source = `tripadvisor_reviews:${match.placeId}`;
    mergeInferredFact(
      existing,
      "hasAC",
      inferredBooleanFact(
        features.topics.ac,
        source,
        features.analyzedAt,
      ),
    );
    mergeInferredFact(
      existing,
      "hasElevator",
      inferredBooleanFact(
        features.topics.elevators,
        source,
        features.analyzedAt,
      ),
    );
    mergeInferredFact(
      existing,
      "hasWifi",
      inferredBooleanFact(
        features.topics.wifi,
        source,
        features.analyzedAt,
      ),
    );
    await input.db.updateFacts(input.property.token, JSON.stringify(existing));
  }

  const fetchedAt = Math.floor(now.getTime() / 1000);
  await input.db.upsertReviewFeatures({
    token: input.property.token,
    corpus_hash: features.corpusHash,
    model_version: features.modelVersion,
    provider: "tripadvisor_reviews",
    place_id: match.placeId,
    features_json: JSON.stringify(features),
    review_count: features.reviewCount,
    fetched_at: fetchedAt,
  });
  await input.db.updateTaFields({
    token: input.property.token,
    taRating: match.rating,
    taReviews: match.reviews,
  });
  if (input.property.raw_json) {
    const mapped = mapListProperty(
      JSON.parse(input.property.raw_json) as SearchApiListProperty,
      {
        citySlug: input.citySlug,
        cityDisplay: input.cityDisplay,
        provider: input.property.provider,
        ta: {
          rating: match.rating,
          reviews: match.reviews,
          rank: input.property.ta_rank,
          total: input.property.ta_total,
        },
        whitelist: input.property.whitelist
          ? JSON.parse(input.property.whitelist)
          : [],
      },
    );
    if (mapped) {
      await input.db.upsertScored(
        input.cityId,
        scoreProperty(
          mapped,
          {
            citySlug: input.citySlug,
            cityMeanRating:
              input.cityMeanRating ?? CITY_MEAN_FALLBACK,
            checkIn: "",
            checkOut: "",
            adults: 2,
            evidenceStrictness: "confirmed_or_unknown",
          },
          existing ?? undefined,
        ),
      );
    }
  }

  return {
    features,
    placeId: match.placeId,
    cacheHit: false,
    creditsUsed,
  };
}

function mergeInferredFact<K extends keyof PropertyFacts>(
  facts: PropertyFacts,
  key: K,
  inferred: PropertyFacts[K],
): void {
  if (facts[key].status === "confirmed") return;
  facts[key] = inferred;
}
