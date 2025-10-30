# ExportRemix Setup Guide

## Database Setup (Required for Signup)

The "Database error saving new user" error occurs when the database triggers haven't been set up yet. Follow these steps to fix it:

### Step 1: Run the Database Initialization Script

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `scripts/00-init-database.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see success messages like:
\`\`\`
✓ profiles table created
✓ subscriptions table created
✓ profile creation trigger created
✓ subscription creation trigger created
Database initialization complete! You can now sign up users.
\`\`\`

### Step 2: Verify the Setup

After running the script, test the signup flow:

1. Go to `/signup` on your app
2. Create a new account with:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123456
3. You should see "Account created!" message
4. Check your email for verification link

### Step 3: Test with Enterprise Account

You can also test with the pre-configured enterprise account:

- Email: `testenterprise@exportremix.com`
- Password: `UnlimitedTest123`

This account has unlimited access and admin privileges.

## What the Script Does

The initialization script:

1. **Creates the `profiles` table** - Stores user profile information
2. **Creates the `subscriptions` table** - Manages user subscription tiers (free/pro/enterprise)
3. **Sets up Row Level Security (RLS)** - Ensures users can only access their own data
4. **Creates database triggers** - Automatically creates profile and subscription records when a new user signs up
5. **Adds error handling** - Prevents signup failures from breaking the auth flow

## Troubleshooting

### "Database error saving new user"
- **Cause**: Database triggers not set up
- **Fix**: Run `scripts/00-init-database.sql` in Supabase SQL Editor

### "User already registered"
- **Cause**: Email already exists in the system
- **Fix**: Use a different email or sign in instead

### "Invalid email"
- **Cause**: Email format is incorrect
- **Fix**: Enter a valid email address

### "Password must be at least 6 characters"
- **Cause**: Password too short
- **Fix**: Use a password with 6+ characters

## Environment Variables

Make sure these are set in your Vercel project:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## Additional Scripts

After running the initialization script, you may want to run these optional scripts:

- `scripts/12-create-changelog-table.sql` - For changelog functionality
- `scripts/12-add-ab-testing.sql` - For A/B testing features
- `scripts/99-create-test-enterprise-user.sql` - Creates the test enterprise account

Run them in the same way through the Supabase SQL Editor.
