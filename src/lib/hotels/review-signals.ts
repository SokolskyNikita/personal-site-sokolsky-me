import type { Fact } from "./domain";

export const REVIEW_MODEL_VERSION = "topics-v1";

export type ReviewTopic =
  | "noise"
  | "cleanliness"
  | "bathroom"
  | "ac"
  | "heating"
  | "hotWater"
  | "waterPressure"
  | "mattress"
  | "datedness"
  | "maintenance"
  | "smell"
  | "pests"
  | "elevators"
  | "wifi";

export type ReviewInput = {
  id: string;
  text: string;
  rating: number | null;
  date: string | null;
  link?: string | null;
};

export type ReviewEvidence = {
  reviewId: string;
  excerpt: string;
  sentiment: "positive" | "negative";
  date: string | null;
  link: string | null;
};

export type ReviewTopicSignal = {
  positive: number;
  negative: number;
  sampleSize: number;
  recentNegative: number;
  confidence: number;
  evidence: ReviewEvidence[];
};

export type ReviewFeatureSet = {
  modelVersion: string;
  corpusHash: string;
  analyzedAt: string;
  reviewCount: number;
  topics: Record<ReviewTopic, ReviewTopicSignal>;
};

type TopicTerms = {
  subject: RegExp;
  positive: RegExp;
  negative: RegExp;
};

const POSITIVE =
  /\b(good|great|excellent|quiet|clean|comfortable|modern|new|strong|fast|reliable|worked|working|powerful|spacious|hot|warm|fresh)\b/i;
const NEGATIVE =
  /\b(bad|poor|awful|terrible|dirty|noisy|loud|broken|weak|slow|unreliable|didn'?t work|not working|dated|old|worn|smell(?:y|ed)?|cold|lukewarm|uncomfortable|hard|soft|thin)\b/i;

const TERMS: Record<ReviewTopic, TopicTerms> = {
  noise: {
    subject: /\b(noise|noisy|loud|quiet|soundproof|street sound|thin walls?)\b/i,
    positive: /\b(quiet|silent|soundproof|slept well)\b/i,
    negative: /\b(noisy|loud|thin walls?|street noise|could hear)\b/i,
  },
  cleanliness: {
    subject: /\b(clean|cleanliness|dirty|filthy|housekeeping)\b/i,
    positive: /\b(spotless|very clean|immaculate|clean)\b/i,
    negative: /\b(dirty|filthy|unclean|stain|dust|mold|mould)\b/i,
  },
  bathroom: {
    subject: /\b(bathroom|shower|toilet|tub|bath)\b/i,
    positive: POSITIVE,
    negative: NEGATIVE,
  },
  ac: {
    subject: /\b(a\/c|air con(?:ditioning)?|air-condition|climate control|ac unit)\b/i,
    positive: /\b(worked|working|powerful|cold|excellent|good|quiet)\b/i,
    negative: /\b(broken|weak|noisy|loud|didn'?t work|not working|warm|hot)\b/i,
  },
  heating: {
    subject: /\b(heating|heater|radiator|heat)\b/i,
    positive: POSITIVE,
    negative: NEGATIVE,
  },
  hotWater: {
    subject: /\b(hot water|water temperature|lukewarm|cold shower)\b/i,
    positive: /\b(plenty|consistent|always|good|hot)\b/i,
    negative: /\b(no hot water|lukewarm|cold|ran out|inconsistent)\b/i,
  },
  waterPressure: {
    subject: /\b(water pressure|shower pressure|pressure)\b/i,
    positive: /\b(strong|great|excellent|good)\b/i,
    negative: /\b(weak|low|poor|trickle)\b/i,
  },
  mattress: {
    subject: /\b(mattress|bed|pillow|sleep)\b/i,
    positive: /\b(comfortable|comfy|slept well|great bed|good bed)\b/i,
    negative: /\b(uncomfortable|hard|soft|lumpy|sagging|thin|bad bed)\b/i,
  },
  datedness: {
    subject: /\b(dated|outdated|modern|renovated|old|worn|tired)\b/i,
    positive: /\b(modern|renovated|new|updated|fresh)\b/i,
    negative: /\b(dated|outdated|old|worn|tired|needs renovation)\b/i,
  },
  maintenance: {
    subject: /\b(maintenance|broken|repair|upkeep|fixture|leak)\b/i,
    positive: /\b(well maintained|fixed quickly|good upkeep)\b/i,
    negative: /\b(broken|leak|poor maintenance|needs repair|not working)\b/i,
  },
  smell: {
    subject: /\b(smell|odor|odour|musty|smoky|sewage)\b/i,
    positive: /\b(fresh|no smell|pleasant)\b/i,
    negative: /\b(smell|odor|odour|musty|smoky|sewage|stink)\b/i,
  },
  pests: {
    subject: /\b(bed bugs?|cockroach|roach|insects?|mosquito|pests?)\b/i,
    positive: /\b(no (?:bugs|pests|insects))\b/i,
    negative: /\b(bed bugs?|cockroach|roach|pests?|infestation)\b/i,
  },
  elevators: {
    subject: /\b(elevator|lift)\b/i,
    positive: /\b(fast|working|modern|good|reliable)\b/i,
    negative: /\b(broken|slow|out of service|not working|tiny|old)\b/i,
  },
  wifi: {
    subject: /\b(wi-?fi|internet|connection)\b/i,
    positive: /\b(fast|strong|reliable|good|excellent|worked)\b/i,
    negative: /\b(slow|weak|unreliable|bad|poor|didn'?t work|not working)\b/i,
  },
};

export function corpusHash(reviews: ReviewInput[]): string {
  const canonical = [...reviews]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((r) => `${r.id}\u0000${r.date ?? ""}\u0000${r.rating ?? ""}\u0000${r.text}`)
    .join("\u0001");
  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i++) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function classifyReviews(
  reviews: ReviewInput[],
  now = new Date(),
): ReviewFeatureSet {
  const topics = {} as Record<ReviewTopic, ReviewTopicSignal>;
  for (const topic of Object.keys(TERMS) as ReviewTopic[]) {
    topics[topic] = {
      positive: 0,
      negative: 0,
      sampleSize: 0,
      recentNegative: 0,
      confidence: 0,
      evidence: [],
    };
  }

  for (const review of reviews) {
    const sentences = splitSentences(review.text);
    const recency = recencyWeight(review.date, now);
    for (const topic of Object.keys(TERMS) as ReviewTopic[]) {
      const terms = TERMS[topic];
      const hits = sentences.filter((sentence) => terms.subject.test(sentence));
      if (!hits.length) continue;
      let reviewPositive = false;
      let reviewNegative = false;
      for (const sentence of hits) {
        const sentiment = sentenceSentiment(sentence, terms, review.rating);
        if (sentiment === "positive") reviewPositive = true;
        if (sentiment === "negative") reviewNegative = true;
        if (
          sentiment &&
          topics[topic].evidence.length < 5
        ) {
          topics[topic].evidence.push({
            reviewId: review.id,
            excerpt: sentence.slice(0, 240),
            sentiment,
            date: review.date,
            link: review.link ?? null,
          });
        }
      }
      if (reviewPositive) topics[topic].positive += recency;
      if (reviewNegative) {
        topics[topic].negative += recency;
        if (recency >= Math.exp(-365 / 365)) {
          topics[topic].recentNegative += 1;
        }
      }
      topics[topic].sampleSize += 1;
    }
  }

  for (const signal of Object.values(topics)) {
    signal.positive = round(signal.positive);
    signal.negative = round(signal.negative);
    signal.confidence = round(
      Math.min(1, signal.sampleSize / 8) *
        Math.min(1, (signal.positive + signal.negative) / 3),
    );
  }

  return {
    modelVersion: REVIEW_MODEL_VERSION,
    corpusHash: corpusHash(reviews),
    analyzedAt: now.toISOString(),
    reviewCount: reviews.length,
    topics,
  };
}

export function inferredBooleanFact(
  signal: ReviewTopicSignal,
  source: string,
  observedAt: string,
): Fact<boolean> {
  const enough = signal.confidence >= 0.35 && signal.sampleSize >= 2;
  const positive = signal.positive >= 1.5;
  const negative = signal.negative >= 1.5;
  if (enough && positive && negative) {
    return {
      value: null,
      status: "conflicting",
      sources: [source],
      observedAt,
      modelVersion: REVIEW_MODEL_VERSION,
    };
  }
  if (enough && positive) {
    return {
      value: true,
      status: "inferred",
      sources: [source],
      observedAt,
      modelVersion: REVIEW_MODEL_VERSION,
    };
  }
  if (enough && negative) {
    return {
      value: false,
      status: "inferred",
      sources: [source],
      observedAt,
      modelVersion: REVIEW_MODEL_VERSION,
    };
  }
  return {
    value: null,
    status: "unknown",
    sources: [source],
    observedAt,
    modelVersion: REVIEW_MODEL_VERSION,
  };
}

function sentenceSentiment(
  sentence: string,
  terms: TopicTerms,
  rating: number | null,
): "positive" | "negative" | null {
  const positive = terms.positive.test(sentence);
  const negative = terms.negative.test(sentence);
  if (positive && negative) {
    if (/\b(no|without)\s+(?:any\s+)?(?:smell|odor|odour|bugs|pests|insects)\b/i.test(sentence)) {
      return "positive";
    }
    return "negative";
  }
  if (positive !== negative) return positive ? "positive" : "negative";
  if (rating != null && rating <= 2) return "negative";
  if (rating != null && rating >= 4) return "positive";
  return null;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function recencyWeight(date: string | null, now: Date): number {
  if (!date) return 0.5;
  const then = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(then)) return 0.5;
  const ageDays = Math.max(0, (now.getTime() - then) / 86_400_000);
  return Math.exp(-ageDays / 365);
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
