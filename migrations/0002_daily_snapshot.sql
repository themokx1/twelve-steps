ALTER TABLE meeting_sessions ADD COLUMN active_step INTEGER NOT NULL DEFAULT 1;
ALTER TABLE meeting_sessions ADD COLUMN notes_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE meeting_sessions ADD COLUMN completed_actions_json TEXT NOT NULL DEFAULT '[]';

