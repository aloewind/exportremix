# Real-Time Trade Data Setup

ExportRemix uses **client-managed API keys** where each user configures their own API integrations through the dashboard. No environment variables are required.

## Data Sources

### 1. WTO API (World Trade Organization)
- **URL**: https://apiportal.wto.org/
- **Data**: Global trade statistics, tariff disputes, trade agreements
- **Setup**: 
  1. Visit https://apiportal.wto.org/
  2. Sign up for a free API key
  3. Add to Custom API Integrations in your dashboard

### 2. USITC DataWeb (US International Trade Commission)
- **URL**: https://www.usitc.gov/applications/dataweb/
- **Data**: Tariff rates, compliance scores, export growth
- **Setup**:
  1. Create account at https://www.usitc.gov/applications/dataweb/
  2. Request API credentials
  3. Add to Custom API Integrations in your dashboard

### 3. Port of LA Cargo Operations Dashboard
- **URL**: https://www.portoflosangeles.org/business/operations
- **Data**: Real-time container dwell times, port delays, inspection rates
- **Setup**: Public data, no API key required

## How to Configure (Client-Managed)

1. **Sign up** for ExportRemix
2. **Navigate** to Custom API Integrations in the dashboard
3. **Add** your API credentials:
   - API Name: "WTO API" or "USITC DataWeb"
   - API Endpoint: The API URL from the provider
   - API Key: Your personal API key
4. **Enable** the integration with the toggle
5. **View** real-time data in the Real-Time Data page

## No Environment Variables Required

ExportRemix does **not** require any predefined environment variables for API keys. All API management is done through the dashboard by each user individually.

## Fallback Behavior

If API keys are not configured or APIs are unavailable:
- The app automatically falls back to estimated data
- Data descriptions include "(estimated)" suffix
- All features continue to work normally
- No errors are shown to users

## Data Accuracy

- **With API Keys**: 100% accurate real-time data from official sources
- **Without API Keys**: Estimated data based on recent trends and public reports
- **Refresh Rate**: 30 seconds for all data sources
- **Disclaimer**: Always shown to users that data is from public sources

## Testing

1. Deploy to Vercel (no environment variables needed)
2. Sign up and log in to ExportRemix
3. Navigate to Custom API Integrations
4. Add your API credentials
5. Enable the integrations
6. Real-time data page will appear with live data
7. Check browser console for "[v0]" logs to verify API calls

## Cost

- WTO API: Free
- USITC DataWeb: Free (requires account)
- Port of LA: Free (public data)
- OpenAI API: Uses your existing API key and credits

## Support

For API access issues:
- WTO: https://apiportal.wto.org/support
- USITC: https://www.usitc.gov/contact
- Port of LA: https://www.portoflosangeles.org/contact
