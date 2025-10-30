# Manifest Flow Weaver - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- A Vercel account
- A Supabase account (already connected to this project)

### Step 1: Deploy to Vercel

Click the button below or push your code to GitHub and import to Vercel:

\`\`\`bash
# If using Vercel CLI
vercel deploy
\`\`\`

### Step 2: Configure Environment Variables

Your Supabase environment variables are already configured in this workspace:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

These will automatically be available in your Vercel deployment.

### Step 3: Set Up Google OAuth in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Enable Google Provider**
   - Go to Authentication → Providers
   - Find "Google" and click to configure
   - Toggle "Enable Sign in with Google"

3. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Add authorized redirect URIs:
     \`\`\`
     https://your-project-ref.supabase.co/auth/v1/callback
     \`\`\`
   - Copy the Client ID and Client Secret

4. **Configure in Supabase**
   - Paste Client ID and Client Secret in Supabase Google provider settings
   - Save changes

5. **Add Site URL**
   - In Supabase Dashboard → Authentication → URL Configuration
   - Set Site URL to your production URL: `https://your-app.vercel.app`
   - Add Redirect URLs:
     \`\`\`
     https://your-app.vercel.app/auth/callback
     http://localhost:3000/auth/callback (for local development)
     \`\`\`

### Step 4: Run Database Migrations

The app includes a SQL script to set up the database schema:

1. Go to Supabase Dashboard → SQL Editor
2. Run the script from `scripts/01-create-tables.sql`
3. Or use the v0 interface to run the script automatically

### Step 5: Test Your Deployment

1. Visit your deployed URL
2. Try signing up with email/password
3. Try signing in with Google
4. Upload a CSV file or use mock data
5. Test the AI predictions and remix features

## 🔧 Local Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
\`\`\`

## 📊 Features Checklist

- ✅ Email/Password Authentication
- ✅ Google OAuth Sign-in
- ✅ Protected Dashboard Routes
- ✅ User Profile with Name Display
- ✅ CSV/JSON File Upload
- ✅ Mock API Data Pull
- ✅ AI Predictions (Tariff Surge Alerts)
- ✅ Remix Prompt Interface (Text/Voice)
- ✅ Auto-refresh Dashboard (30s intervals)
- ✅ Export Results to CSV
- ✅ Mock Data with 76% Disruption Rate
- ✅ Yin-Yang Theme (Black/Red Balance)
- ✅ Responsive Design

## 🎨 Design Theme

The app uses a yin-yang inspired design:
- **Primary**: Deep black background (#000000)
- **Accent**: Vibrant red (#EF4444) for alerts and actions
- **Secondary**: Blue tones for data and information
- **Typography**: Clean, modern sans-serif

## 🔐 Security Notes

- All routes under `/dashboard` are protected by middleware
- Supabase handles authentication and session management
- API keys are stored securely in environment variables
- Row Level Security (RLS) should be enabled on Supabase tables

## 📝 Environment Variables Reference

\`\`\`env
# Supabase Configuration (Already configured in your workspace)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: OpenAI API (for future AI enhancements)
OPENAI_API_KEY=your-openai-key
\`\`\`

## 🆘 Troubleshooting

### Google OAuth Not Working
- Verify redirect URIs match exactly in Google Cloud Console
- Check that Google provider is enabled in Supabase
- Ensure Site URL is set correctly in Supabase

### Dashboard Not Loading
- Check that middleware.ts is properly configured
- Verify Supabase environment variables are set
- Check browser console for errors

### File Upload Issues
- Ensure file size is under 10MB
- Check that file format is CSV or JSON
- Verify browser supports File API

## 📞 Support

For issues or questions:
- Check the README.md for feature documentation
- Review Supabase logs in the dashboard
- Check Vercel deployment logs

---

Built with ❤️ using Next.js, Tailwind CSS, and Supabase
