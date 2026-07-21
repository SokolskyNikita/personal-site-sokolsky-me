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

export type PriceCacheRow = {
  token: string;
  check_in: string;
  check_out: string;
  adults: number;
  nightly_usd: number | null;
  total_usd: number | null;
  source: string | null;
  fetched_at: number;
};

export type ReviewFeatureRow = {
  token: string;
  corpus_hash: string;
  model_version: string;
  provider: string;
  place_id: string | null;
  features_json: string;
  review_count: number;
  fetched_at: number;
};

export interface HotelsRepository {
  ensureCity(input: {
    slug: string;
    display: string;
    query: string;
    gl?: string;
  }): Promise<number>;
  getCityBySlug(slug: string): Promise<CityRow | null>;
  getCityById(id: number): Promise<CityRow | null>;
  updateCityScan(input: {
    cityId: number;
    meanRating: number;
    scannedAt: number;
    credits: number;
  }): Promise<void>;
  upsertScored(cityId: number, scored: ScoredProperty): Promise<void>;
  listByCityScore(cityId: number, limit?: number): Promise<PropertyRow[]>;
  listRawByCity(cityId: number): Promise<PropertyRow[]>;
  getPropertyByToken(token: string): Promise<PropertyRow | null>;
  upsertPrice(input: {
    token: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    nightlyUsd: number | null;
    totalUsd: number | null;
    source?: string;
    fetchedAt: number;
  }): Promise<void>;
  listPricesForTokens(
    tokens: string[],
    checkIn: string,
    checkOut: string,
    fresherThan: number,
    adults?: number,
  ): Promise<PriceCacheRow[]>;
  listPricesForWindows(
    tokens: string[],
    windows: { checkIn: string; checkOut: string }[],
    fresherThan: number,
    adults?: number,
  ): Promise<PriceCacheRow[]>;
  updateTaFields(input: {
    token: string;
    taRating: number | null;
    taReviews: number | null;
  }): Promise<void>;
  updateFacts(token: string, factsJson: string): Promise<void>;
  upsertReviewFeatures(input: ReviewFeatureRow): Promise<void>;
  getLatestReviewFeatures(
    token: string,
    modelVersion: string,
  ): Promise<ReviewFeatureRow | null>;
  listLatestReviewFeatures(
    tokens: string[],
    modelVersion: string,
  ): Promise<ReviewFeatureRow[]>;
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

    async getCityById(id) {
      return db
        .prepare("SELECT * FROM cities WHERE id = ?")
        .bind(id)
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
            ta_rating=COALESCE(excluded.ta_rating, properties.ta_rating),
            ta_reviews=COALESCE(excluded.ta_reviews, properties.ta_reviews),
            ta_rank=COALESCE(excluded.ta_rank, properties.ta_rank),
            ta_total=COALESCE(excluded.ta_total, properties.ta_total),
            whitelist=CASE
              WHEN excluded.whitelist = '[]' THEN properties.whitelist
              ELSE excluded.whitelist
            END,
            facts_json=CASE
              WHEN properties.facts_json LIKE '%"modelVersion":"topics-v1"%'
                THEN properties.facts_json
              ELSE excluded.facts_json
            END,
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
                  facts_json, score, subscores_json, gates_json, scoring_version, provider
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

    async getPropertyByToken(token) {
      return db
        .prepare(`SELECT * FROM properties WHERE token = ?`)
        .bind(token)
        .first<PropertyRow>();
    },

    async upsertPrice(input) {
      await db
        .prepare(
          `INSERT INTO price_cache (token, check_in, check_out, adults, nightly_usd, total_usd, source, fetched_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(token, check_in, check_out, adults) DO UPDATE SET
             nightly_usd=excluded.nightly_usd,
             total_usd=excluded.total_usd,
             source=excluded.source,
             fetched_at=excluded.fetched_at`,
        )
        .bind(
          input.token,
          input.checkIn,
          input.checkOut,
          input.adults ?? 2,
          input.nightlyUsd,
          input.totalUsd,
          input.source ?? "searchapi",
          input.fetchedAt,
        )
        .run();
    },

    async listPricesForTokens(
      tokens,
      checkIn,
      checkOut,
      fresherThan,
      adults = 2,
    ) {
      if (!tokens.length) return [];
      // D1 caps bound SQL variables; reserve four slots for date/adults/TTL.
      if (tokens.length > 80) {
        const out: PriceCacheRow[] = [];
        for (let i = 0; i < tokens.length; i += 80) {
          out.push(
            ...(await this.listPricesForTokens(
              tokens.slice(i, i + 80),
              checkIn,
              checkOut,
              fresherThan,
              adults,
            )),
          );
        }
        return out;
      }
      const placeholders = tokens.map(() => "?").join(",");
      const { results } = await db
        .prepare(
          `SELECT * FROM price_cache
           WHERE check_in = ? AND check_out = ? AND adults = ? AND fetched_at >= ?
             AND token IN (${placeholders})`,
        )
        .bind(checkIn, checkOut, adults, fresherThan, ...tokens)
        .all<PriceCacheRow>();
      return results;
    },

    async listPricesForWindows(tokens, windows, fresherThan, adults = 2) {
      if (!tokens.length || !windows.length) return [];
      const out: PriceCacheRow[] = [];
      for (const w of windows) {
        const rows = await this.listPricesForTokens(
          tokens,
          w.checkIn,
          w.checkOut,
          fresherThan,
          adults,
        );
        out.push(...rows);
      }
      return out;
    },

    async updateTaFields(input) {
      await db
        .prepare(
          `UPDATE properties SET ta_rating = ?, ta_reviews = ? WHERE token = ?`,
        )
        .bind(input.taRating, input.taReviews, input.token)
        .run();
    },

    async updateFacts(token, factsJson) {
      await db
        .prepare(`UPDATE properties SET facts_json = ? WHERE token = ?`)
        .bind(factsJson, token)
        .run();
    },

    async upsertReviewFeatures(input) {
      await db
        .prepare(
          `INSERT INTO review_features (
             token, corpus_hash, model_version, provider, place_id,
             features_json, review_count, fetched_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(token, corpus_hash, model_version) DO UPDATE SET
             provider=excluded.provider,
             place_id=excluded.place_id,
             features_json=excluded.features_json,
             review_count=excluded.review_count,
             fetched_at=excluded.fetched_at`,
        )
        .bind(
          input.token,
          input.corpus_hash,
          input.model_version,
          input.provider,
          input.place_id,
          input.features_json,
          input.review_count,
          input.fetched_at,
        )
        .run();
    },

    async getLatestReviewFeatures(token, modelVersion) {
      return db
        .prepare(
          `SELECT * FROM review_features
           WHERE token = ? AND model_version = ?
           ORDER BY fetched_at DESC LIMIT 1`,
        )
        .bind(token, modelVersion)
        .first<ReviewFeatureRow>();
    },

    async listLatestReviewFeatures(tokens, modelVersion) {
      if (!tokens.length) return [];
      // D1 caps bound SQL variables (~100). Query uses 2 fixed binds + tokens.
      const chunkSize = 90;
      if (tokens.length > chunkSize) {
        const out: ReviewFeatureRow[] = [];
        for (let i = 0; i < tokens.length; i += chunkSize) {
          out.push(
            ...(await this.listLatestReviewFeatures(
              tokens.slice(i, i + chunkSize),
              modelVersion,
            )),
          );
        }
        return out;
      }
      const placeholders = tokens.map(() => "?").join(",");
      const { results } = await db
        .prepare(
          `SELECT rf.* FROM review_features rf
           JOIN (
             SELECT token, MAX(fetched_at) AS fetched_at
             FROM review_features
             WHERE model_version = ? AND token IN (${placeholders})
             GROUP BY token
           ) latest
           ON latest.token = rf.token AND latest.fetched_at = rf.fetched_at
           WHERE rf.model_version = ?`,
        )
        .bind(modelVersion, ...tokens, modelVersion)
        .all<ReviewFeatureRow>();
      return results;
    },
  };
}

/** In-memory repo for FixtureProvider tests (no D1). */
export function createMemoryHotelsRepository(): HotelsRepository & {
  cities: Map<string, CityRow>;
  properties: Map<string, PropertyRow>;
  prices: PriceCacheRow[];
  reviewFeatures: ReviewFeatureRow[];
} {
  const cities = new Map<string, CityRow>();
  const properties = new Map<string, PropertyRow>();
  const prices: PriceCacheRow[] = [];
  const reviewFeatures: ReviewFeatureRow[] = [];
  let nextId = 1;

  const repo: HotelsRepository & {
    cities: Map<string, CityRow>;
    properties: Map<string, PropertyRow>;
    prices: PriceCacheRow[];
    reviewFeatures: ReviewFeatureRow[];
  } = {
    cities,
    properties,
    prices,
    reviewFeatures,
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
    async getCityById(id) {
      return [...cities.values()].find((city) => city.id === id) ?? null;
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
    async getPropertyByToken(token) {
      return properties.get(token) ?? null;
    },
    async upsertPrice(input) {
      const idx = prices.findIndex(
        (p) =>
          p.token === input.token &&
          p.check_in === input.checkIn &&
          p.check_out === input.checkOut &&
          p.adults === (input.adults ?? 2),
      );
      const row: PriceCacheRow = {
        token: input.token,
        check_in: input.checkIn,
        check_out: input.checkOut,
        adults: input.adults ?? 2,
        nightly_usd: input.nightlyUsd,
        total_usd: input.totalUsd,
        source: input.source ?? "searchapi",
        fetched_at: input.fetchedAt,
      };
      if (idx >= 0) prices[idx] = row;
      else prices.push(row);
    },
    async listPricesForTokens(
      tokens,
      checkIn,
      checkOut,
      fresherThan,
      adults = 2,
    ) {
      const set = new Set(tokens);
      return prices.filter(
        (p) =>
          set.has(p.token) &&
          p.check_in === checkIn &&
          p.check_out === checkOut &&
          p.adults === adults &&
          p.fetched_at >= fresherThan,
      );
    },
    async listPricesForWindows(tokens, windows, fresherThan, adults = 2) {
      const out: PriceCacheRow[] = [];
      for (const w of windows) {
        out.push(
          ...(await this.listPricesForTokens(
            tokens,
            w.checkIn,
            w.checkOut,
            fresherThan,
            adults,
          )),
        );
      }
      return out;
    },
    async updateTaFields(input) {
      const row = properties.get(input.token);
      if (!row) return;
      row.ta_rating = input.taRating;
      row.ta_reviews = input.taReviews;
    },
    async updateFacts(token, factsJson) {
      const row = properties.get(token);
      if (row) row.facts_json = factsJson;
    },
    async upsertReviewFeatures(input) {
      const i = reviewFeatures.findIndex(
        (r) =>
          r.token === input.token &&
          r.corpus_hash === input.corpus_hash &&
          r.model_version === input.model_version,
      );
      if (i >= 0) reviewFeatures[i] = input;
      else reviewFeatures.push(input);
    },
    async getLatestReviewFeatures(token, modelVersion) {
      return (
        reviewFeatures
          .filter(
            (r) => r.token === token && r.model_version === modelVersion,
          )
          .sort((a, b) => b.fetched_at - a.fetched_at)[0] ?? null
      );
    },
    async listLatestReviewFeatures(tokens, modelVersion) {
      const tokenSet = new Set(tokens);
      const out: ReviewFeatureRow[] = [];
      for (const token of tokenSet) {
        const row = await this.getLatestReviewFeatures(token, modelVersion);
        if (row) out.push(row);
      }
      return out;
    },
  };
  return repo;
}
