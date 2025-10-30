# Test Enterprise Access Setup

## Overview

The Test Enterprise Access feature allows the owner (aloewind@yahoo.com) to simulate Stripe test mode and unlock enterprise features for unlimited testing without actual payment.

## Features

- **Owner-Only Access**: Button only visible to aloewind@yahoo.com
- **One-Click Upgrade**: Instantly upgrade to enterprise tier
- **Revert Button**: Easily downgrade back to free tier
- **Comprehensive Logging**: Console logs track every step for debugging
- **Auto-Refresh**: Page refreshes automatically after tier change

## Database Fix

### Problem
The `subscriptions` table had a CHECK constraint that only allowed `('free', 'pro')` tiers, blocking enterprise upgrades.

### Solution
Run the SQL script to fix the constraint:

\`\`\`sql
-- scripts/23-fix-subscriptions-constraint.sql
\`\`\`

This script:
1. Drops the old constraint if it exists
2. Adds a new constraint: `CHECK (tier IN ('free', 'pro', 'enterprise'))`
3. Can be run safely multiple times

## How to Use

### Enable Enterprise Access

1. Log in as aloewind@yahoo.com
2. Look for the "Owner Test Mode" card in the dashboard
3. Click "Test Enterprise" button
4. Wait for success message
5. Page will auto-refresh with enterprise features unlocked

### Revert to Free Tier

1. Click "Revert to Free" button in the same card
2. Wait for success message
3. Page will auto-refresh with free tier restored

## API Endpoints

### POST /api/test-enterprise-access
- Upgrades user to enterprise tier
- Creates test subscription with 1-year validity
- Only accessible by owner email

### POST /api/revert-to-free
- Downgrades user to free tier
- Removes test subscription data
- Only accessible by owner email

## Debugging

All operations log to the browser console with `[v0]` prefix:

\`\`\`javascript
[v0] Starting Test Enterprise upgrade...
[v0] Response received. Status: 200
[v0] Response data: { success: true, ... }
[v0] ✅ SUCCESS: Enterprise access enabled
\`\`\`

Check console for detailed error messages if something fails.

## Security

- Button only renders for aloewind@yahoo.com
- API endpoints verify owner email server-side
- Uses Supabase service role key for admin operations
- Test subscriptions clearly marked with `test_` prefix

## Testing Checklist

- [ ] Run `scripts/23-fix-subscriptions-constraint.sql` in Supabase SQL Editor
- [ ] Log in as aloewind@yahoo.com
- [ ] Verify "Owner Test Mode" card appears
- [ ] Click "Test Enterprise" and verify upgrade
- [ ] Check console logs for success messages
- [ ] Verify enterprise features are unlocked
- [ ] Click "Revert to Free" and verify downgrade
- [ ] Verify free tier limits are restored

## Troubleshooting

### Button Not Visible
- Ensure you're logged in as aloewind@yahoo.com
- Check browser console for errors
- Verify email in user profile matches exactly

### Upgrade Fails
- Check console for detailed error message
- Verify SQL constraint fix was applied
- Check Supabase service role key is set
- Verify subscriptions table exists

### Page Doesn't Refresh
- Wait 2 seconds for auto-refresh
- Manually refresh if needed
- Check console for navigation errors
</markdown>
