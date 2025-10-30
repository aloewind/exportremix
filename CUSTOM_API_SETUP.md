# Custom API Integrations Setup Guide

## Overview

ExportRemix now supports custom API integrations, allowing you to connect your own data sources for enhanced predictions and remixing capabilities.

## Database Setup

Run this SQL script in your Supabase SQL Editor to create the required table:

\`\`\`sql
-- See scripts/22-create-user-api-integrations.sql
\`\`\`

## How It Works

1. **Add Your API**: In the dashboard, click "Add API" in the Custom API Integrations section
2. **Configure**: Enter your API name, endpoint URL, and API key
3. **Enable/Disable**: Toggle APIs on/off as needed
4. **Real-time Sync**: Changes sync instantly across all your devices
5. **Automatic Integration**: Enabled APIs are automatically queried during AI predictions and remixing

## API Requirements

Your custom API endpoint should:
- Accept GET requests
- Support Bearer token authentication
- Return JSON data
- Respond within 5 seconds

Example API response format:
\`\`\`json
{
  "tariff_rate": 12.5,
  "compliance_score": 85,
  "risk_level": "low",
  "timestamp": "2025-01-20T10:00:00Z"
}
\`\`\`

## Security

- API keys are stored encrypted in Supabase
- Keys are never exposed in the UI (masked with dots)
- Each user can only access their own integrations
- Row Level Security (RLS) policies protect your data

## Fallback Behavior

If your custom APIs are:
- Disabled: System uses mock data
- Unreachable: System continues with available data
- Slow (>5s): Request times out, uses fallback

## Disclaimer

Data from custom APIs is for estimates only. This is not legal or financial advice. You are responsible for managing your API keys securely.

## Support

For issues with custom API integrations, check:
1. API endpoint is publicly accessible
2. API key is valid and has proper permissions
3. API returns JSON format
4. Response time is under 5 seconds
