CREATE TABLE IF NOT EXISTS vault_visitors (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL CHECK (email LIKE '%@yale.edu'),
  created_at TEXT NOT NULL,
  session_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_download_at TEXT
);
CREATE INDEX IF NOT EXISTS vault_visitors_session ON vault_visitors(session_hash, expires_at);
CREATE INDEX IF NOT EXISTS vault_visitors_email ON vault_visitors(email);
