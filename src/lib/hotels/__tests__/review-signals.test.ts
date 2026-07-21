import { describe, expect, it } from "vitest";
import {
  classifyReviews,
  corpusHash,
  inferredBooleanFact,
  type ReviewInput,
} from "../review-signals";

const reviews: ReviewInput[] = [
  {
    id: "1",
    text: "The room was quiet and the air conditioning worked perfectly.",
    rating: 5,
    date: "2026-07-01",
  },
  {
    id: "2",
    text: "Excellent strong Wi-Fi. The bed was very comfortable.",
    rating: 5,
    date: "2026-06-15",
  },
  {
    id: "3",
    text: "The shower pressure was weak and there was no hot water.",
    rating: 2,
    date: "2026-06-01",
  },
  {
    id: "4",
    text: "Air conditioning was powerful and quiet.",
    rating: 5,
    date: "2026-05-20",
  },
];

describe("review topic classifier", () => {
  it("extracts positive and negative comfort topics deterministically", () => {
    const result = classifyReviews(reviews, new Date("2026-07-20T00:00:00Z"));
    expect(result.topics.ac.positive).toBeGreaterThan(1);
    expect(result.topics.noise.positive).toBeGreaterThan(0);
    expect(result.topics.waterPressure.negative).toBeGreaterThan(0);
    expect(result.topics.hotWater.negative).toBeGreaterThan(0);
    expect(result.topics.ac.evidence[0]?.excerpt).toContain("quiet");
  });

  it("hash is stable across input order", () => {
    expect(corpusHash(reviews)).toBe(corpusHash([...reviews].reverse()));
  });

  it("uses recency decay", () => {
    const current = classifyReviews(
      [
        {
          id: "new",
          text: "The Wi-Fi was slow.",
          rating: 2,
          date: "2026-07-19",
        },
        {
          id: "old",
          text: "The Wi-Fi was slow.",
          rating: 2,
          date: "2024-07-19",
        },
      ],
      new Date("2026-07-20T00:00:00Z"),
    );
    expect(current.topics.wifi.negative).toBeLessThan(2);
    expect(current.topics.wifi.negative).toBeGreaterThan(0.9);
  });

  it("derives inferred and conflicting facts only with evidence", () => {
    const positive = inferredBooleanFact(
      {
        positive: 3,
        negative: 0,
        sampleSize: 4,
        recentNegative: 0,
        confidence: 0.5,
        evidence: [],
      },
      "reviews",
      "2026-07-20T00:00:00Z",
    );
    expect(positive).toMatchObject({ status: "inferred", value: true });

    const conflicting = inferredBooleanFact(
      {
        positive: 3,
        negative: 2,
        sampleSize: 5,
        recentNegative: 1,
        confidence: 0.6,
        evidence: [],
      },
      "reviews",
      "2026-07-20T00:00:00Z",
    );
    expect(conflicting).toMatchObject({
      status: "conflicting",
      value: null,
    });
  });
});
