-- Remove the old residency_status column
ALTER TABLE users DROP COLUMN IF EXISTS residency_status;

-- Add new identity fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS languages_spoken TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_field TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS community_affiliations TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS event_preferences TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS collaboration_style TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_values TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS digital_identity TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS physical_activity_level TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cultural_experiences TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_style TEXT;