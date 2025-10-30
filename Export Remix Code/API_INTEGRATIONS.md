# Real-Time Data Integrations

ExportRemix now supports real-time data integrations from public export APIs to enhance AI predictions and manifest remixing.

## Overview

The Real-Time Data Integrations feature allows users to enable/disable live data feeds from:
- **CBP API** (U.S. Customs and Border Protection) - Tariff rates and customs data
- **WTO API** (World Trade Organization) - Trade policy alerts and surges
- **ITC API** (U.S. International Trade Commission) - Trade statistics and tariff data

## Features

### 1. API Toggle Panel
Located in the main dashboard, users can enable/disable each API integration with a simple toggle switch.

**Features:**
- Real-time sync using Supabase Realtime
- Visual indicators showing "Live Data" or "Mock Data" status
- Instant updates across all dashboard components
- Disclaimer about data being estimates from public sources

### 2. Database Schema

New `user_settings` table:
\`\`\`sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_cbp_enabled BOOLEAN DEFAULT false,
  api_wto_enabled BOOLEAN DEFAULT false,
  api_itc_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
\`\`\`

### 3. API Integration

**Endpoints:**
- `GET /api/user-settings` - Fetch user's API settings
- `POST /api/user-settings` - Update API settings

**Integration Points:**
- `/api/ai/analyze` - AI predictions now incorporate real-time trade data
- `/api/ai/remix` - Manifest remixing uses live tariff rates and policy alerts

### 4. Data Refresh

- **Auto-refresh:** Every 30 seconds for prediction alerts
- **Manual refresh:** Available via refresh button in settings panel
- **Fallback:** Automatically uses mock data if APIs are disabled or fail

## Setup Instructions

### 1. Run Database Migration

Execute the SQL script in your Supabase SQL Editor:
\`\`\`bash
scripts/20-add-user-settings.sql
\`\`\`

This will:
- Create the `user_settings` table
- Set up RLS policies
- Create default settings for existing users
- Enable real-time subscriptions

### 2. Enable APIs in Dashboard

1. Navigate to the dashboard
2. Scroll to "Real-Time Data Integrations" section
3. Toggle on the APIs you want to enable:
   - CBP API for tariff data
   - WTO API for policy alerts
   - ITC API for trade statistics

### 3. Verify Integration

After enabling APIs:
- Check that badges show "Live Data" status
- AI predictions should reference specific tariff rates
- Manifest remixing should incorporate policy alerts
- Data sources are displayed in API responses

## API Data Structure

### CBP Data (Tariff Information)
\`\`\`typescript
{
  htsCode: string        // Harmonized Tariff Schedule code
  description: string    // Product description
  rate: number          // Tariff rate percentage
  effectiveDate: string // When rate became effective
  source: string        // "CBP (Live)" or "CBP (Mock)"
}
\`\`\`

### WTO Data (Trade Alerts)
\`\`\`typescript
{
  type: "surge" | "delay" | "policy_change"
  severity: "low" | "medium" | "high"
  message: string
  affectedCountries: string[]
  timestamp: string
  source: string        // "WTO (Live)" or "WTO (Mock)"
}
\`\`\`

### ITC Data (Trade Statistics)
\`\`\`typescript
{
  htsCode: string
  description: string
  rate: number
  effectiveDate: string
  source: string        // "ITC (Live)" or "ITC (Mock)"
}
\`\`\`

## Mock Data Fallback

When APIs are disabled or fail, the system automatically uses realistic mock data:
- Mock tariff rates based on common HTS codes
- Mock policy alerts for typical trade scenarios
- Mock trade statistics for major product categories

This ensures the app remains functional even without live API access.

## Disclaimers

**Important:** All data from these integrations are estimates from public sources and should not be considered:
- Legal advice
- Financial advice
- Official customs rulings
- Binding tariff classifications

Always verify with official customs authorities before making business decisions.

## Technical Implementation

### Components
- `components/dashboard/api-integrations-panel.tsx` - Main settings panel
- `lib/api-integrations.ts` - API integration utilities
- `app/api/user-settings/route.ts` - Settings API endpoint

### Real-time Sync
Uses Supabase Realtime to sync settings changes across:
- Multiple browser tabs
- Multiple devices
- Team members (for Enterprise tier)

### Error Handling
- Graceful fallback to mock data on API failures
- User-friendly error messages
- Automatic retry logic
- Console logging for debugging

## Future Enhancements

Planned features:
- Custom API endpoints for Enterprise users
- Historical data analysis
- Predictive modeling based on trends
- Export data to CSV/JSON
- API usage analytics
- Rate limiting and caching

## Support

For issues or questions:
1. Check the console for error messages
2. Verify database migration was successful
3. Ensure RLS policies are properly configured
4. Contact support at vercel.com/help
