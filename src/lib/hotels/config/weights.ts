/** Bump on any formula / weight change so rescore can stamp rows. */
export const SCORING_VERSION = 1;

export const WEIGHTS = {
  qualityMax: 55,
  qualityFloorRating: 3.9,
  qualitySpan: 1.1,
  consistencyMax: 15,
  consistencyLowStarShareRef: 0.12,
  plantMax: 18,
  plantNegFloor: 0.08,
  plantNegSpan: 0.22,
  plantMinMentions: 20,
  brandBonusByTier: [0, 4, 8, 12] as const,
  taHighRating: 4.3,
  taLowRating: 3.9,
  taMinReviews: 100,
  taHighBonus: 6,
  taTopDecileBonus: 4,
  taLowPenalty: -8,
  whitelistBonus: 8,
  classNudge: 2,
  classNudgeMin: 5,
} as const;

export const GATE_DEFAULTS = {
  minReviews: 200,
  minRating: 4.0,
  excludedTypes: ["hostel", "capsule"] as const,
} as const;
