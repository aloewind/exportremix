-- Add tier column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';

-- Create index for faster tier lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_tier ON user_settings(tier);

-- Update existing rows to have 'free' tier if null
UPDATE user_settings 
SET tier = 'free' 
WHERE tier IS NULL;
