import type { HotelsRepository, PropertyRow } from "./db";
import type { PropertyFacts } from "./domain";
import type { HotelDataProvider } from "./providers/types";
import {
  classifyReviews,
  inferredBooleanFact,
  REVIEW_MODEL_VERSION,
  type ReviewFeatureSet,
  type ReviewInput,
} from "./review-signals";
import { matchTripadvisor } from "./ta";

export const REVIEW_CACHE_TTL_DAYS = 30;

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
  const search = await input.provider.searchTripadvisor(
    `${input.property.name} ${input.cityDisplay}`,
  );
  creditsUsed += 1;
  const match = matchTripadvisor(
    input.property.name,
    input.cityDisplay,
    search.places,
  );
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
