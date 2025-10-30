# OpenAI Direct API Setup

ExportRemix now uses **direct OpenAI API calls** instead of Vercel AI Gateway.

## Configuration

### 1. Get Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** in your account settings
4. Click **Create new secret key**
5. Copy your API key (starts with `sk-`)

### 2. Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (e.g., `sk-...`)
   - **Environments**: Production, Preview, Development

### 3. Local Development

Create a `.env.local` file in your project root:

\`\`\`bash
OPENAI_API_KEY=sk-your-api-key-here
\`\`\`

## API Usage

The app uses the official OpenAI Node.js SDK with direct API calls:

- **Base URL**: `https://api.openai.com/v1`
- **Models Used**:
  - `gpt-4o` - For AI predictions and manifest remixing
  - `gpt-4o-mini` - For connection verification
- **No AI Gateway** - Direct communication with OpenAI

## Features Using OpenAI

1. **AI Predictions** (`/api/ai/analyze`)
   - Analyzes manifest data
   - Detects tariff surges and delays
   - Provides optimization recommendations

2. **Manifest Remixing** (`/api/ai/remix`)
   - Creative logistics strategies
   - Vibe-based recommendations
   - Custom prompt interpretation

3. **Connection Verification** (`/api/openai/verify`)
   - Tests API key validity
   - Checks OpenAI service status

## Cost Management

- Your $10 credit will be used directly from your OpenAI account
- Monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage)
- Set usage limits in your OpenAI account settings
- The app falls back to mock data if API calls fail

## Troubleshooting

### "No API key configured"
- Ensure `OPENAI_API_KEY` is set in environment variables
- Restart your development server after adding the key

### "API call failed"
- Check your OpenAI account has available credits
- Verify your API key is valid and not expired
- Check OpenAI service status at [status.openai.com](https://status.openai.com)

### Mock Data Fallback
- If OpenAI API fails, the app automatically uses mock data
- Check the response for `"usingMocks": true` to confirm
- No functionality is lost - all features work with mock data

## Migration from AI Gateway

✅ **Completed Changes:**
- Removed Vercel AI SDK (`ai` package) - now using official `openai` package
- Removed AI Gateway model strings (e.g., `"openai/gpt-4o"`)
- Direct API calls to `https://api.openai.com/v1`
- All existing features preserved
- Graceful fallback to mock data

## Build Verification

The app builds successfully with direct OpenAI integration:
- ✅ No AI Gateway configuration required
- ✅ No Vercel-specific setup needed
- ✅ Works with any OpenAI API key
- ✅ All features functional
