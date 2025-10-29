-- Add organization/team support for multi-user role management
-- This allows Enterprise customers to manage their team members

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free',
  UNIQUE(owner_id)
);

-- Add organization_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Organization owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid());

-- Function to create organization when user subscribes to Enterprise
CREATE OR REPLACE FUNCTION public.create_organization_for_enterprise_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is being set to admin role and doesn't have an organization
  IF NEW.role = 'admin' AND NEW.organization_id IS NULL THEN
    -- Check if user has Enterprise subscription
    IF EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE user_id = NEW.id AND tier = 'enterprise' AND status = 'active'
    ) THEN
      -- Create organization for this user
      INSERT INTO public.organizations (name, owner_id)
      VALUES (
        COALESCE(NEW.company, NEW.email || '''s Organization'),
        NEW.id
      )
      ON CONFLICT (owner_id) DO NOTHING
      RETURNING id INTO NEW.organization_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create organization
DROP TRIGGER IF EXISTS create_org_on_admin_role ON public.profiles;
CREATE TRIGGER create_org_on_admin_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role = 'admin' AND OLD.role != 'admin')
  EXECUTE FUNCTION public.create_organization_for_enterprise_user();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
-- Removed GRANT USAGE ON SEQUENCE organizations_id_seq - sequence doesn't exist because table uses UUID with gen_random_uuid()

COMMENT ON TABLE public.organizations IS 'Organizations for Enterprise customers to manage their teams';
COMMENT ON COLUMN public.profiles.organization_id IS 'Links user to their organization for team-based role management';
