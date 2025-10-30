-- Create user_api_integrations table for custom API endpoints
CREATE TABLE IF NOT EXISTS user_api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_api_integrations_user_id ON user_api_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_integrations_enabled ON user_api_integrations(user_id, is_enabled);

-- Enable RLS
ALTER TABLE user_api_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own API integrations"
  ON user_api_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API integrations"
  ON user_api_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API integrations"
  ON user_api_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API integrations"
  ON user_api_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_api_integrations TO authenticated;
GRANT ALL ON user_api_integrations TO service_role;
