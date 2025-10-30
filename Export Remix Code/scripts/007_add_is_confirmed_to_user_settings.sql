-- Add is_confirmed column to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT false;

-- Set existing users as confirmed
UPDATE user_settings
SET is_confirmed = true
WHERE is_confirmed IS NULL;

-- Add comment
COMMENT ON COLUMN user_settings.is_confirmed IS 'Whether the user has confirmed their email address';
