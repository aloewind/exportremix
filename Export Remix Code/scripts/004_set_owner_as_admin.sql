-- Set the owner (aloewind@yahoo.com) as admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'aloewind@yahoo.com';

-- Also update any existing enterprise users to have admin role by default
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT user_id 
  FROM user_settings 
  WHERE tier = 'enterprise'
)
AND role = 'user';
