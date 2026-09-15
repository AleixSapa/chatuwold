-- ChatuWold SQLite seed
-- This file contains the initial users and shared approval state.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  accepted INTEGER NOT NULL DEFAULT 0 CHECK (accepted IN (0,1))
);

CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  unlocked INTEGER NOT NULL DEFAULT 0 CHECK (unlocked IN (0,1))
);

INSERT OR REPLACE INTO users (username, password, accepted) VALUES
  ('Aleix', '010914', 0),
  ('Mat', 'Barça', 0);

INSERT OR REPLACE INTO app_state (id, unlocked) VALUES (1, 0);
