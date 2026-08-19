export type TravelSpotScores = {
  globallyUnique: number;
  laymenInterest: number;
  easeOfAccess: number;
  lowTouristCrowds: number;
};

export type TravelScoreKey = keyof TravelSpotScores;

/** Raw scores stay 0-10. Laymen interest and ease of access count double. */
export const SCORE_WEIGHTS = {
  globallyUnique: 1,
  laymenInterest: 2,
  easeOfAccess: 2,
  lowTouristCrowds: 1,
} as const satisfies Record<TravelScoreKey, number>;

export const SCORE_MAX = {
  globallyUnique: 10,
  laymenInterest: 20,
  easeOfAccess: 20,
  lowTouristCrowds: 10,
} as const satisfies Record<TravelScoreKey, number>;

export const SCORE_TOTAL_MAX = 60;

export const weightedScore = (scores: TravelSpotScores, key: TravelScoreKey) =>
  scores[key] * SCORE_WEIGHTS[key];

export const scoreTotal = (scores: TravelSpotScores) =>
  weightedScore(scores, "globallyUnique") +
  weightedScore(scores, "laymenInterest") +
  weightedScore(scores, "easeOfAccess") +
  weightedScore(scores, "lowTouristCrowds");
