CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  display_name TEXT,
  locale TEXT NOT NULL DEFAULT 'hu',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  rotates_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  user_agent_hash TEXT,
  ip_hash TEXT
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS passkeys (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  device_type TEXT NOT NULL,
  backed_up INTEGER NOT NULL DEFAULT 0,
  transports_json TEXT NOT NULL DEFAULT '[]',
  name TEXT,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS passkeys_credential_id_unique ON passkeys(credential_id);
CREATE INDEX IF NOT EXISTS passkeys_user_idx ON passkeys(user_id);

CREATE TABLE IF NOT EXISTS step_progress (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  resonance_score INTEGER,
  intention TEXT,
  last_visited_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS step_progress_user_step_unique ON step_progress(user_id, step_number);
CREATE INDEX IF NOT EXISTS step_progress_user_status_idx ON step_progress(user_id, status);

CREATE TABLE IF NOT EXISTS practice_entries (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT,
  response TEXT NOT NULL,
  emotional_temperature INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS practice_entries_user_step_idx ON practice_entries(user_id, step_number);
CREATE INDEX IF NOT EXISTS practice_entries_created_idx ON practice_entries(created_at);

CREATE TABLE IF NOT EXISTS meeting_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  meeting_date TEXT NOT NULL,
  arrival_note TEXT,
  body_note TEXT,
  needs_note TEXT,
  daily_promise TEXT,
  affirmation_shown TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS meeting_sessions_user_date_unique ON meeting_sessions(user_id, meeting_date);

CREATE TABLE IF NOT EXISTS ai_runs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  model TEXT,
  input_excerpt TEXT,
  output_excerpt TEXT,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS ai_runs_created_idx ON ai_runs(created_at);
CREATE INDEX IF NOT EXISTS ai_runs_kind_idx ON ai_runs(kind);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  keys_json TEXT NOT NULL,
  locale TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_endpoint_unique ON push_subscriptions(endpoint);

