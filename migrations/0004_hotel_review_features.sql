CREATE TABLE IF NOT EXISTS review_features (
  token TEXT NOT NULL REFERENCES properties(token) ON DELETE CASCADE,
  corpus_hash TEXT NOT NULL,
  model_version TEXT NOT NULL,
  provider TEXT NOT NULL,
  place_id TEXT,
  features_json TEXT NOT NULL,
  review_count INTEGER NOT NULL,
  fetched_at INTEGER NOT NULL,
  PRIMARY KEY (token, corpus_hash, model_version)
);

CREATE INDEX IF NOT EXISTS idx_review_features_latest
  ON review_features(token, model_version, fetched_at DESC);
