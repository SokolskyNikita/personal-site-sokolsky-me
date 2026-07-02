CREATE TABLE IF NOT EXISTS ai_compass_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  quiz_version INTEGER NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'ru')),
  path TEXT NOT NULL,
  answers TEXT NOT NULL CHECK (length(answers) = 30),
  answered_count INTEGER NOT NULL,
  archetype_index INTEGER NOT NULL,
  archetype_name TEXT NOT NULL,
  archetype_fit REAL NOT NULL,
  runner_indexes TEXT NOT NULL,
  runner_names TEXT NOT NULL,
  runner_fits TEXT NOT NULL,
  score_t REAL NOT NULL,
  score_v REAL NOT NULL,
  score_s REAL NOT NULL,
  score_i REAL NOT NULL,
  score_p REAL NOT NULL,
  duration_ms INTEGER,
  country TEXT,
  continent TEXT,
  colo TEXT,
  timezone TEXT,
  device_category TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_compass_results_created_at
  ON ai_compass_results (created_at);

CREATE INDEX IF NOT EXISTS idx_ai_compass_results_locale_archetype
  ON ai_compass_results (locale, archetype_index);

CREATE INDEX IF NOT EXISTS idx_ai_compass_results_country
  ON ai_compass_results (country);
