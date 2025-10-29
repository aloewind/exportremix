-- Add vibe_preference column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS vibe_preference TEXT DEFAULT 'balanced';

-- Add check constraint to ensure valid vibe values
ALTER TABLE user_settings
ADD CONSTRAINT valid_vibe_preference 
CHECK (vibe_preference IN ('balanced', 'nordic_calm', 'zen_harmony', 'dynamic_flow', 'minimalist_clarity', 'bold_energy'));

-- Update existing rows to have default vibe
UPDATE user_settings 
SET vibe_preference = 'balanced' 
WHERE vibe_preference IS NULL;
