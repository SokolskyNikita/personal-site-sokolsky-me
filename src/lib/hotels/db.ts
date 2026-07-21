import { SCORING_VERSION } from "./config/weights";
import type { ScoredProperty } from "./domain";

/** Minimal D1 surface used by the repository. */
export type HotelsD1 = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
      first<T = Record<string, unknown>>(
        columnName?: string,
      ): Promise<T | null>;
    };
  };
  batch?(
    statements: {
      bind(...values: unknown[]): { run(): Promise<unknown> };
    }[],
  ): Promise<unknown>;
};

export type CityRow = {
  id: number;
  slug: string;
  display: string;
  query: string | null;
  gl: string | null;
  mean_rating: number | null;
  scanned_at: number | null;
  credits_last_scan: number | null;
};

export type PropertyRow = {
  token: string;
  city_id: number;
  name: string;
  lat: number | null;
  lng: number | null;
  hotel_class: number | null;
  brand_tier: number;
  rating: number | null;
  reviews: number | null;
  low_star_share: number | null;
  worst_category: string | null;
  worst_category_neg: number | null;
  ta_rating: number | null;
  ta_reviews: number | null;
  ta_rank: number | null;
  ta_total: number | null;
  whitelist: string | null;
  facts_json: string | null;
  amenities_json: string | null;
  breakdown_json: string | null;
  histogram_json: string | null;
  raw_json: string | null;
  score: number | null;
  subscores_json: string | null;
  gates_json: string | null;
  scoring_version: number;
  provider: string;
  enriched_at: number | null;
};

export interface HotelsRepository {
  ensureCity(input: {
    slug: string;
    display: string;
    query: string;
    gl?: string;
  }): Promise<number>;
  getCityBySlug(slug: string): Promise<CityRow | null>;
  updateCityScan(input: {
    cityId: number;
    meanRating: number;
    scannedAt: number;
    credits: number;
  }): Promise<void>;
  upsertScored(cityId: number, scored: ScoredProperty): Promise<void>;
  listByCityScore(cityId: number, limit?: number): Promise<PropertyRow[]>;
  listRawByCity(cityId: number): Promise<PropertyRow[]>;
}

export function createD1HotelsRepository(db: HotelsD1): HotelsRepository {
  return {
    async ensureCity(input) {
      const existing = await db
        .prepare("SELECT id FROM cities WHERE slug = ?")
        .bind(input.slug)
        .first<{ id: number }>();
      if (existing?.id != null) return existing.id;

      await db
        .prepare(
          `INSERT INTO cities (slug, display, query, gl) VALUES (?, ?, ?, ?)`,
        )
        .bind(input.slug, input.display, input.query, input.gl ?? "us")
        .run();

      const row = await db
        .prepare("SELECT id FROM cities WHERE slug = ?")
        .bind(input.slug)
        .first<{ id: number }>();
      if (!row) throw new Error("city_insert_failed");
      return row.id;
    },

    async getCityBySlug(slug) {
      return db
        .prepare("SELECT * FROM cities WHERE slug = ?")
        .bind(slug)
        .first<CityRow>();
    },

    async updateCityScan(input) {
      await db
        .prepare(
          `UPDATE cities SET mean_rating = ?, scanned_at = ?, credits_last_scan = ? WHERE id = ?`,
        )
        .bind(
          input.meanRating,
          input.scannedAt,
          input.credits,
          input.cityId,
        )
        .run();
    },

    async upsertScored(cityId, scored) {
      const p = scored.property;
      await db
        .prepare(
          `INSERT INTO properties (
            token, city_id, name, lat, lng, hotel_class, brand_tier,
            rating, reviews, low_star_share, worst_category, worst_category_neg,
            ta_rating, ta_reviews, ta_rank, ta_total, whitelist,
            facts_json, amenities_json, breakdown_json, histogram_json, raw_json,
            score, subscores_json, gates_json, scoring_version, provider, enriched_at
          ) VALUES (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
          )
          ON CONFLICT(token) DO UPDATE SET
            city_id=excluded.city_id, name=excluded.name, lat=excluded.lat, lng=excluded.lng,
            hotel_class=excluded.hotel_class, brand_tier=excluded.brand_tier,
            rating=excluded.rating, reviews=excluded.reviews,
            low_star_share=excluded.low_star_share,
            worst_category=excluded.worst_category,
            worst_category_neg=excluded.worst_category_neg,
            ta_rating=excluded.ta_rating, ta_reviews=excluded.ta_reviews,
            ta_rank=excluded.ta_rank, ta_total=excluded.ta_total,
            whitelist=excluded.whitelist, facts_json=excluded.facts_json,
            amenities_json=excluded.amenities_json,
            breakdown_json=excluded.breakdown_json,
            histogram_json=excluded.histogram_json, raw_json=excluded.raw_json,
            score=excluded.score, subscores_json=excluded.subscores_json,
            gates_json=excluded.gates_json, scoring_version=excluded.scoring_version,
            provider=excluded.provider, enriched_at=excluded.enriched_at`,
        )
        .bind(
          p.token,
          cityId,
          p.name,
          p.lat,
          p.lng,
          p.hotelClass,
          p.brandTier,
          p.rating,
          p.reviews,
          p.lowStarShare,
          p.worstCategory,
          p.worstCategoryNeg,
          p.taRating,
          p.taReviews,
          p.taRank,
          p.taTotal,
          JSON.stringify(p.whitelist),
          JSON.stringify(scored.facts),
          JSON.stringify(p.amenities),
          JSON.stringify(p.breakdown),
          JSON.stringify(p.histogram),
          JSON.stringify(p.raw),
          scored.score,
          JSON.stringify(scored.subscores),
          JSON.stringify(scored.gates),
          scored.scoringVersion || SCORING_VERSION,
          p.provider,
          null,
        )
        .run();
    },

    async listByCityScore(cityId, limit = 100) {
      // Omit raw_json — warm index must stay under ~500ms.
      const { results } = await db
        .prepare(
          `SELECT token, city_id, name, lat, lng, hotel_class, brand_tier,
                  rating, reviews, low_star_share, worst_category, worst_category_neg,
                  ta_rating, ta_reviews, ta_rank, ta_total, whitelist,
                  facts_json, amenities_json, breakdown_json, histogram_json,
                  score, subscores_json, gates_json, scoring_version, provider, enriched_at
           FROM properties
           WHERE city_id = ? AND (gates_json = '[]' OR gates_json IS NULL)
           ORDER BY score DESC LIMIT ?`,
        )
        .bind(cityId, limit)
        .all<PropertyRow>();
      return results;
    },

    async listRawByCity(cityId) {
      const { results } = await db
        .prepare(`SELECT * FROM properties WHERE city_id = ?`)
        .bind(cityId)
        .all<PropertyRow>();
      return results;
    },
  };
}

/** In-memory repo for FixtureProvider tests (no D1). */
export function createMemoryHotelsRepository(): HotelsRepository & {
  cities: Map<string, CityRow>;
  properties: Map<string, PropertyRow>;
} {
  const cities = new Map<string, CityRow>();
  const properties = new Map<string, PropertyRow>();
  let nextId = 1;

  const repo: HotelsRepository & {
    cities: Map<string, CityRow>;
    properties: Map<string, PropertyRow>;
  } = {
    cities,
    properties,
    async ensureCity(input) {
      const existing = cities.get(input.slug);
      if (existing) return existing.id;
      const row: CityRow = {
        id: nextId++,
        slug: input.slug,
        display: input.display,
        query: input.query,
        gl: input.gl ?? "us",
        mean_rating: null,
        scanned_at: null,
        credits_last_scan: null,
      };
      cities.set(input.slug, row);
      return row.id;
    },
    async getCityBySlug(slug) {
      return cities.get(slug) ?? null;
    },
    async updateCityScan(input) {
      for (const c of cities.values()) {
        if (c.id === input.cityId) {
          c.mean_rating = input.meanRating;
          c.scanned_at = input.scannedAt;
          c.credits_last_scan = input.credits;
        }
      }
    },
    async upsertScored(cityId, scored) {
      const p = scored.property;
      properties.set(p.token, {
        token: p.token,
        city_id: cityId,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        hotel_class: p.hotelClass,
        brand_tier: p.brandTier,
        rating: p.rating,
        reviews: p.reviews,
        low_star_share: p.lowStarShare,
        worst_category: p.worstCategory,
        worst_category_neg: p.worstCategoryNeg,
        ta_rating: p.taRating,
        ta_reviews: p.taReviews,
        ta_rank: p.taRank,
        ta_total: p.taTotal,
        whitelist: JSON.stringify(p.whitelist),
        facts_json: JSON.stringify(scored.facts),
        amenities_json: JSON.stringify(p.amenities),
        breakdown_json: JSON.stringify(p.breakdown),
        histogram_json: JSON.stringify(p.histogram),
        raw_json: JSON.stringify(p.raw),
        score: scored.score,
        subscores_json: JSON.stringify(scored.subscores),
        gates_json: JSON.stringify(scored.gates),
        scoring_version: scored.scoringVersion,
        provider: p.provider,
        enriched_at: null,
      });
    },
    async listByCityScore(cityId, limit = 100) {
      return [...properties.values()]
        .filter((p) => p.city_id === cityId && p.gates_json === "[]")
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, limit);
    },
    async listRawByCity(cityId) {
      return [...properties.values()].filter((p) => p.city_id === cityId);
    },
  };
  return repo;
}
