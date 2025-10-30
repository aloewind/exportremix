-- Ensure the owner has admin role and enterprise tier
-- This script can be run multiple times safely

-- Update the owner's profile to have admin role
UPDATE profiles
SET 
  role = 'admin',
  is_admin = true,
  is_owner = true,
  updated_at = NOW()
WHERE email = 'aloewind@yahoo.com';

-- Ensure the owner has enterprise tier in user_settings
INSERT INTO user_settings (user_id, tier, api_cbp_enabled, api_wto_enabled, api_itc_enabled, created_at, updated_at)
SELECT 
  id,
  'enterprise',
  true,
  true,
  true,
  NOW(),
  NOW()
FROM profiles
WHERE email = 'aloewind@yahoo.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  tier = 'enterprise',
  updated_at = NOW();

-- Verify the changes
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_admin,
  p.is_owner,
  us.tier
FROM profiles p
LEFT JOIN user_settings us ON us.user_id = p.id
WHERE p.email = 'aloewind@yahoo.com';
