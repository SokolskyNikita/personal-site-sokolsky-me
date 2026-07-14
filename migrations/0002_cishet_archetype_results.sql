CREATE TABLE IF NOT EXISTS cishet_archetype_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  quiz_version INTEGER NOT NULL,
  quiz TEXT NOT NULL CHECK (quiz IN ('cishet-male-archetypes', 'cishet-female-archetypes')),
  path TEXT NOT NULL,
  answers TEXT NOT NULL,
  matched_questions INTEGER NOT NULL,
  top_ids TEXT NOT NULL,
  top_names TEXT NOT NULL,
  top_fits TEXT NOT NULL,
  duration_ms INTEGER,
  country TEXT,
  continent TEXT,
  colo TEXT,
  timezone TEXT,
  device_category TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cishet_archetype_results_created_at
  ON cishet_archetype_results (created_at);

CREATE INDEX IF NOT EXISTS idx_cishet_archetype_results_quiz
  ON cishet_archetype_results (quiz, created_at);

CREATE INDEX IF NOT EXISTS idx_cishet_archetype_results_country
  ON cishet_archetype_results (country);
