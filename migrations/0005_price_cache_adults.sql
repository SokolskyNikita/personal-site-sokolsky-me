CREATE TABLE price_cache_v2 (
  token TEXT NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  adults INTEGER NOT NULL DEFAULT 2,
  nightly_usd REAL,
  total_usd REAL,
  source TEXT,
  fetched_at INTEGER,
  PRIMARY KEY (token, check_in, check_out, adults)
);

INSERT INTO price_cache_v2 (
  token, check_in, check_out, adults, nightly_usd, total_usd, source, fetched_at
)
SELECT
  token, check_in, check_out, 2, nightly_usd, total_usd, source, fetched_at
FROM price_cache;

DROP TABLE price_cache;
ALTER TABLE price_cache_v2 RENAME TO price_cache;
