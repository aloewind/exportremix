-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Add check constraint for valid roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'manager'));

-- Migrate existing is_admin users to admin role
UPDATE profiles SET role = 'admin' WHERE is_admin = true;

-- Set owner to admin role
UPDATE profiles SET role = 'admin' WHERE is_owner = true;

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add comment
COMMENT ON COLUMN profiles.role IS 'User role: user (default), admin (full access), manager (API management)';
