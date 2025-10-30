# ExportRemix - Manual Database Setup Guide

## Overview

ExportRemix assumes your Supabase database is **pre-configured** with all required tables and Row Level Security (RLS) policies. This guide provides the complete schema for manual setup.

## Important Notes

- **No automatic migrations**: The app does not execute SQL scripts automatically
- **No configuration prompts**: All database setup must be done manually in Supabase SQL Editor
- **Pre-deployment requirement**: Set up the database before deploying the app

## Required Tables

### 1. Users Table (extends auth.users)

\`\`\`sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_access" ON public.users
  FOR ALL USING (auth.uid() = id);
\`\`\`

### 2. Manifests Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS public.manifests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE public.manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_access" ON public.manifests
  FOR ALL USING (auth.uid() = user_id);
\`\`\`

### 3. Predictions Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  surge_alerts TEXT,
  remix_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_access" ON public.predictions
  FOR ALL USING (auth.uid() = user_id);
\`\`\`

### 4. Alerts Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_access" ON public.alerts
  FOR ALL USING (auth.uid() = user_id);
\`\`\`

### 5. User API Integrations Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS public.user_api_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE public.user_api_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_access" ON public.user_api_integrations
  FOR ALL USING (auth.uid() = user_id);
\`\`\`

### 6. Subscriptions Table

\`\`\`sql
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- RLS Policy
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_access" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);
\`\`\`

## Setup Instructions

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Execute Schema**
   - Copy and paste each table creation script above
   - Run them in order (users first, then others)
   - Verify all tables are created successfully

3. **Verify RLS Policies**
   - Check that all tables have RLS enabled
   - Verify policies are active

4. **Test Connection**
   - Deploy your app
   - Sign up for a new account
   - Verify data is being saved correctly

## Troubleshooting

### Table Already Exists
If you see "table already exists" errors, your database is already set up. Skip that table.

### RLS Policy Errors
If RLS policies fail, check if they already exist. You can drop and recreate them if needed.

### Foreign Key Errors
Ensure the `users` table is created before other tables that reference it.

## No Automatic Migrations

This app **does not** execute SQL scripts automatically. All database setup must be done manually through the Supabase SQL Editor before deploying the application.
