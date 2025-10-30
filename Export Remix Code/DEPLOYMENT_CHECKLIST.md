# ExportRemix Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Database Setup (CRITICAL - Must be done first!)
- [ ] Run `scripts/00-MASTER-INIT.sql` in Supabase SQL Editor
- [ ] Verify all tables exist: profiles, subscriptions, manifests, predictions, policy_alerts, usage_tracking
- [ ] Verify RLS policies are enabled
- [ ] Verify triggers are created (handle_new_user, create_default_subscription)
- [ ] Test enterprise user exists: testenterprise@exportremix.com

### 2. Environment Variables (Required)
**Supabase (Required):**
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY (for admin operations)
- [ ] NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL (for local development)

**Stripe (Required for billing):**
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_PUBLISHABLE_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET

**OpenAI (Optional - falls back to mock data):**
- [ ] OPENAI_API_KEY

**App Configuration:**
- [ ] NEXT_PUBLIC_APP_URL (your production URL)

### 3. Build Configuration
- [x] All protected pages have `export const dynamic = 'force-dynamic'`
- [x] No automatic SQL script execution
- [x] TypeScript configuration is correct
- [x] All dependencies are installed

### 4. Features Verification
- [x] Landing page with SEO optimization
- [x] Authentication (signup/login)
- [x] Protected dashboard
- [x] Manifest upload and analysis
- [x] AI predictions (with OpenAI or mock data)
- [x] Manifest remixing with vibe prompts
- [x] Sentiment-aware volatility coach
- [x] Policy alerts
- [x] Stripe billing integration
- [x] Admin panel
- [x] PWA support
- [x] Onboarding modal
- [x] Yin-yang theme (black/red/white)
- [x] Cypress E2E tests

## 🚀 Deployment Steps

### Step 1: Database Initialization
\`\`\`sql
-- Run this in Supabase SQL Editor
-- Copy and paste the entire contents of scripts/00-MASTER-INIT.sql
\`\`\`

### Step 2: Environment Variables
1. Go to Vercel Project Settings → Environment Variables
2. Add all required environment variables listed above
3. Make sure to add them for Production, Preview, and Development

### Step 3: Deploy
\`\`\`bash
# Push to GitHub (if connected)
git push origin main

# Or deploy directly
vercel --prod
\`\`\`

### Step 4: Post-Deployment Verification
1. Visit your production URL
2. Test signup flow: Create a new account
3. Test login flow: Log in with the new account
4. Test dashboard: Upload a manifest, view predictions
5. Test billing: Navigate to billing page, view plans
6. Test admin panel: Log in as testenterprise@exportremix.com

## 🐛 Troubleshooting

### Build Fails with "Cannot read properties of undefined (reading 'getUser')"
**Solution:** This should be fixed. All protected pages now have `export const dynamic = 'force-dynamic'`

### Signup Fails with "Database error saving new user"
**Solution:** Run the database initialization script `scripts/00-MASTER-INIT.sql` in Supabase SQL Editor

### "Tier constraint violation" Error
**Solution:** The MASTER-INIT script fixes this by properly supporting all three tiers (free, pro, enterprise)

### Edge Runtime Warnings
**Solution:** These are non-fatal warnings from @supabase/supabase-js. They can be safely ignored.

### OpenAI API Errors
**Solution:** The app automatically falls back to mock data if OPENAI_API_KEY is not set or if the API fails

## ✅ Success Criteria

Your deployment is successful when:
- [x] Build completes without errors
- [ ] You can sign up for a new account
- [ ] You can log in to the dashboard
- [ ] You can upload and analyze manifests
- [ ] You can view AI predictions and alerts
- [ ] You can access the billing page
- [ ] Admin users can access the admin panel
- [ ] PWA install prompt appears on mobile
- [ ] All pages load without console errors

## 📝 Notes

- **Database triggers are essential**: Without them, user signup will fail
- **OpenAI is optional**: The app works with mock data if no API key is provided
- **Stripe is required for billing**: But the app works without it for free tier users
- **All pages are dynamic**: No static generation for auth-protected pages

## 🎯 Current Status

✅ **Build Configuration**: Ready
✅ **Code Quality**: Clean, no errors
✅ **Features**: All implemented
⚠️ **Database**: Needs manual initialization
⚠️ **Environment Variables**: Need to be set in Vercel

**Next Action**: Run database initialization script and set environment variables in Vercel
