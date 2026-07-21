CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  display TEXT NOT NULL,
  query TEXT,
  gl TEXT DEFAULT 'us',
  mean_rating REAL,
  scanned_at INTEGER,
  credits_last_scan INTEGER
);

CREATE TABLE IF NOT EXISTS properties (
  token TEXT PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  lat REAL,
  lng REAL,
  hotel_class INTEGER,
  brand_tier INTEGER DEFAULT 0,
  rating REAL,
  reviews INTEGER,
  low_star_share REAL,
  worst_category TEXT,
  worst_category_neg REAL,
  ta_rating REAL,
  ta_reviews INTEGER,
  ta_rank INTEGER,
  ta_total INTEGER,
  whitelist TEXT,
  facts_json TEXT,
  amenities_json TEXT,
  breakdown_json TEXT,
  histogram_json TEXT,
  raw_json TEXT,
  score REAL,
  subscores_json TEXT,
  gates_json TEXT,
  scoring_version INTEGER NOT NULL DEFAULT 0,
  provider TEXT NOT NULL DEFAULT 'searchapi',
  enriched_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_props_city_score ON properties(city_id, score DESC);

CREATE TABLE IF NOT EXISTS price_cache (
  token TEXT NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  nightly_usd REAL,
  total_usd REAL,
  source TEXT,
  fetched_at INTEGER,
  PRIMARY KEY (token, check_in, check_out)
);
