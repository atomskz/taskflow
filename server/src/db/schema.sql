-- TaskFlow database schema (SQLite).
-- Timestamps are stored as ISO-8601 strings; dates as 'YYYY-MM-DD'; times as 'HH:MM'.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'todo'
                  CHECK (status IN ('todo','in_progress','done','archived')),
  priority      TEXT NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('low','medium','high','critical')),
  due_date      TEXT,            -- 'YYYY-MM-DD' | NULL
  calendar_date TEXT,            -- 'YYYY-MM-DD' | NULL
  start_time    TEXT,            -- 'HH:MM' | NULL
  end_time      TEXT,            -- 'HH:MM' | NULL
  tags          TEXT NOT NULL DEFAULT '[]',  -- JSON array of strings
  completed_at  TEXT,            -- ISO timestamp | NULL
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user      ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due  ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_cal  ON tasks(user_id, calendar_date);
