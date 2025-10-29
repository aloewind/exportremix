# ExportRemix

An AI-powered export logistics platform that predicts tariff surges, remixes customs manifests, and harmonizes global trade data with sentiment-aware volatility coaching.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account with database already configured ([see Database Setup](#-database-setup))
- (Optional) OpenAI API key for AI features

### Installation Steps

1. **Clone or download the project**

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   bun install
   \`\`\`

3. **Configure Supabase** (if not already done)
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the database to be provisioned
   - Go to Project Settings > API to get your credentials

4. **Set up the database schema** (REQUIRED - one-time setup)
   
   ⚠️ **This must be done manually in Supabase SQL Editor before first use**
   
   - In your Supabase Dashboard, go to the SQL Editor
   - Click "New Query"
   - Copy the contents of `scripts/00-MASTER-INIT.sql`
   - Paste and click "Run"
   - Wait for success message
   
   See [Database Setup](#-database-setup) section below for details.

5. **Environment variables**

   The following environment variables are already configured in your v0 project:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `STRIPE_SECRET_KEY`
   - ✅ `STRIPE_PUBLISHABLE_KEY`
   - ✅ `OPENAI_API_KEY`

   For local development, create a `.env.local` file with these values.

6. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Features

### Core Features
- 🔐 **Secure Authentication** - Email/password and Google OAuth via Supabase
- 🛡️ **Policy Sentinel** - Auto-detect trade policy threats from WTO, CBP, USITC, EU feeds
- 📊 **AI Predictions** - Tariff surge detection (19% alerts), port delays, disruptions
- 🎭 **Sentiment-Aware Volatility Coach** - Emotional intelligence for trade decisions
- 📁 **Smart Manifest Remixing** - AI-powered customs document optimization
- 🔌 **API Integrations** - Connect to CBP, WTO, and logistics APIs
- 📈 **Real-time Dashboard** - Auto-refreshing alerts and insights
- 💳 **Stripe Billing** - Free, Pro, and Enterprise tiers
- 🔔 **In-App Notifications** - Real-time alerts with toast notifications

### Subscription Tiers
- **Free**: 10 AI requests/month, basic features
- **Pro** ($49/month): 100 requests/month, advanced analytics, priority support
- **Enterprise** ($299/month): Unlimited requests, full API access, dedicated support

## 📁 Project Structure

\`\`\`
exportremix/
├── app/
│   ├── page.tsx                    # SEO-optimized landing page
│   ├── features/                   # Features showcase
│   ├── solutions/                  # Issues & Solutions page
│   ├── about/                      # About page
│   ├── login/                      # Login page
│   ├── signup/                     # Signup page
│   ├── dashboard/                  # Main dashboard
│   │   ├── remix/                  # AI remix interface
│   │   └── billing/                # Billing management
│   ├── billing/success/            # Payment success page
│   ├── admin/                      # Admin panel (protected)
│   ├── actions/                    # Server actions
│   └── api/                        # API routes
├── components/
│   ├── auth/                       # Authentication components
│   ├── dashboard/                  # Dashboard components
│   ├── billing/                    # Billing components
│   ├── layout/                     # Layout components (nav, footer)
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── supabase/                   # Supabase client utilities
│   ├── stripe.ts                   # Stripe configuration
│   ├── subscription-tiers.ts       # Tier definitions
│   ├── error-handler.ts            # Centralized error handling
│   └── usage-tracker.ts            # Usage tracking
├── scripts/
│   └── 00-MASTER-INIT.sql        # Database initialization script
├── cypress/                        # E2E tests
└── DATABASE_SETUP.md               # Database setup guide
\`\`\`

## 🗄️ Database Setup

**IMPORTANT**: The database schema must be set up manually in Supabase before using the app. The app does NOT automatically run migrations or create tables.

### Manual Setup Steps

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor in the left sidebar

2. **Run the initialization script**
   - Open `scripts/00-MASTER-INIT.sql` from this project
   - Copy the entire contents
   - Paste into a new query in Supabase SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

3. **Verify setup**
   - You should see success messages for each table created
   - Test account created: `testenterprise@exportremix.com` / `TestEnterprise2024!`

### What the script creates

- **Tables**: profiles, subscriptions, manifests, predictions, policy_alerts, alerts, usage_tracking, changelog, blog_posts, ab_tests
- **RLS Policies**: Row-level security for all tables
- **Triggers**: Automatic profile/subscription creation on signup
- **Test Data**: Enterprise test account for development

### Database Schema

\`\`\`sql
-- Core tables (simplified view)
profiles (id, email, full_name, is_admin, theme_preference)
subscriptions (user_id, tier, status, stripe_subscription_id)
manifests (id, user_id, data, status, created_at)
predictions (id, user_id, surge_alerts, remix_suggestions)
alerts (id, user_id, message, type, created_at)
\`\`\`

For complete schema details, see `scripts/00-MASTER-INIT.sql`.

## 🧪 Testing

### E2E Tests with Cypress

\`\`\`bash
# Open Cypress UI
npm run cypress

# Run tests headlessly
npm run cypress:headless

# Run full E2E test suite
npm run test:e2e
\`\`\`

Test coverage includes:
- ✅ Home page SEO and content
- ✅ Authentication flow (signup/login)
- ✅ Dashboard features and navigation
- ✅ Manifest remixing
- ✅ Predictions and alerts
- ✅ Billing and usage tracking
- ✅ Admin panel

## 🚀 Deployment to Vercel

### Via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Environment variables are already configured in your v0 project
4. Deploy!

### Via Vercel CLI

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

## 🔧 Troubleshooting

### "Database error saving new user"
**Cause**: Database schema not initialized.
**Fix**: Run `scripts/00-MASTER-INIT.sql` in Supabase SQL Editor (see Database Setup section).

### "Row violates row-level security policy"
**Cause**: RLS policies not set up or incorrect.
**Fix**: Re-run `scripts/00-MASTER-INIT.sql`. It's safe to run multiple times (drops and recreates tables).

### "Table does not exist"
**Cause**: Database not initialized.
**Fix**: Run the initialization script in Supabase SQL Editor.

### "Tier check constraint violation"
**Cause**: Old database schema with incorrect tier constraints.
**Fix**: Run `scripts/00-MASTER-INIT.sql` which drops and recreates tables with correct constraints.

### Build errors with "server-only"
**Cause**: Client components importing server-only code.
**Fix**: Already fixed - subscription tiers are in a separate shared file (`lib/subscription-tiers.ts`).

### Stripe webhook errors
**Cause**: Webhook secret not configured.
**Fix**: Set `STRIPE_WEBHOOK_SECRET` in environment variables (Vars section in v0 sidebar).

## 🎨 Design System

- **Theme**: Yin-yang (black/red balance)
- **Colors**: Red primary (#ef4444), black backgrounds, white text
- **Typography**: Inter font family
- **Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4

## 📊 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI API (with mock fallbacks)
- **UI Components**: shadcn/ui + Radix UI
- **Testing**: Cypress
- **Deployment**: Vercel

## 🔒 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ User data isolated by authentication
- ✅ Secure cookie handling for sessions
- ✅ Protected API routes with auth checks
- ✅ Server-only code separation
- ✅ Environment variable validation
- ✅ Rate limiting on AI endpoints
- ✅ Stripe webhook signature verification

## 📝 Environment Variables

All environment variables are managed in the v0 project settings (Vars section in sidebar). For local development:

\`\`\`env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (REQUIRED for billing)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# OpenAI (OPTIONAL - falls back to mock data if not set)
OPENAI_API_KEY=your_openai_key

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## 🤝 Support

For issues or questions:
1. Check `DATABASE_SETUP.md` for database issues
2. Check this README's Troubleshooting section
3. Review the error message - it often includes helpful hints
4. Contact support at support@exportremix.com

## 📄 License

MIT

---

**Built with ❤️ using v0 by Vercel**
