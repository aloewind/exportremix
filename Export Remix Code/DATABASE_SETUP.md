# ExportRemix Database Setup Guide

## ⚠️ CRITICAL: Run This First

Before using the app, you **MUST** run the database initialization script to set up all required tables, triggers, and security policies.

## Step 1: Run the Master Initialization Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the **ENTIRE** contents of `scripts/00-MASTER-INIT.sql`
6. Paste it into the SQL Editor
7. Click "Run" (or press Cmd/Ctrl + Enter)

**Expected Output:**
\`\`\`
============================================
DATABASE INITIALIZATION COMPLETE
============================================
✓ profiles table created
✓ subscriptions table created (with enterprise tier support)
✓ usage_tracking table created
✓ Triggers created for automatic profile/subscription creation
✓ Test enterprise user created

Test Account:
  Email: testenterprise@exportremix.com
  Password: UnlimitedTest123
  Tier: Enterprise (unlimited access)

You can now sign up new users!
============================================
\`\`\`

## Step 2: Verify the Setup

Run this verification query in the SQL Editor:

\`\`\`sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'subscriptions', 'usage_tracking')
ORDER BY table_name;
\`\`\`

You should see all 3 tables listed.

## Step 3: Verify Triggers

Run this query to check if the automatic triggers are working:

\`\`\`sql
-- Check if triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'on_auth_user_created_subscription');
\`\`\`

You should see 2 triggers.

## Common Issues & Solutions

### Issue: "Database error saving new user"
**Cause:** The initialization script hasn't been run yet.
**Solution:** Run `scripts/00-MASTER-INIT.sql` in Supabase SQL Editor.

### Issue: "new row violates check constraint subscriptions_tier_check"
**Cause:** Old database schema doesn't include 'enterprise' tier.
**Solution:** Run `scripts/00-MASTER-INIT.sql` which drops and recreates tables with correct constraints.

### Issue: "Row violates row-level security policy"
**Cause:** RLS policies aren't set up correctly.
**Solution:** Re-run the master initialization script. It will drop and recreate all policies.

### Issue: "Table does not exist"
**Cause:** The database hasn't been initialized.
**Solution:** Run the master initialization script.

## What the Script Does

The master initialization script:
1. ✅ **Drops existing tables** (if any) to ensure clean state
2. ✅ **Creates all required tables:**
   - `profiles` - User profile information
   - `subscriptions` - Subscription tiers (free, pro, enterprise)
   - `usage_tracking` - Track API usage per user
3. ✅ **Sets up Row Level Security (RLS)** policies for data protection
4. ✅ **Creates database triggers** that automatically:
   - Create a profile when a user signs up
   - Create a free subscription for new users
5. ✅ **Creates test enterprise user** with unlimited access

## Test Enterprise Account

After running the script, you can log in with:
- **Email:** testenterprise@exportremix.com
- **Password:** UnlimitedTest123

This account has:
- ✅ Enterprise tier access
- ✅ Unlimited usage (no monthly limits)
- ✅ Admin privileges
- ✅ All features unlocked
- ✅ Never expires (100 year subscription)

## Why Use the Master Script?

The `00-MASTER-INIT.sql` script is designed to:
- **Fix all constraint errors** by ensuring tier values match across all tables
- **Clean slate approach** - drops and recreates everything correctly
- **Single source of truth** - one script to rule them all
- **Idempotent** - safe to run multiple times

## Need Help?

If you encounter any errors:
1. Check the error message in the SQL Editor
2. Make sure you copied the ENTIRE script (it's long!)
3. Try running it again (it's safe to run multiple times)
4. Check that you're using the correct Supabase project
5. Verify your Supabase project has the necessary permissions

## After Setup

Once the database is initialized:
1. ✅ Users can sign up normally at `/signup`
2. ✅ New users automatically get a free tier subscription
3. ✅ Test enterprise account is ready for testing
4. ✅ All features will work without database errors
