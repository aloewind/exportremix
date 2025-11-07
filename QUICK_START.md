# Quick Start Guide - ExportRemix Local Development

## Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

## Start the Development Server

### Option 1: Using npm
```bash
npm install
npm run dev
```

### Option 2: Using pnpm (recommended - project uses pnpm-lock.yaml)
```bash
pnpm install
pnpm dev
```

## Access the Application

1. **Main Dashboard**: http://localhost:3000/dashboard
2. **Back Office**: http://localhost:3000/dashboard/back-office
3. **Login**: http://localhost:3000/login (if not authenticated)

## Environment Variables Required

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing the Back Office

1. Navigate to: http://localhost:3000/dashboard/back-office
2. Upload a sample XML manifest:
```xml
<manifest>
  <item 
    description="Apples" 
    origin="US" 
    destination="EU" 
    quantity="100" 
    value="500"
    hsCode="080810"
  />
</manifest>
```

3. Test Features:
   - ✅ Upload XML → Auto-fills form
   - ✅ Suggest HS Code → Returns 6-10 digit codes
   - ✅ Estimate Duty → Returns 0-100% tariff rate
   - ✅ Test Compliance → Returns 0-100 score
   - ✅ Fix Errors → Generates corrected XML
   - ✅ Suggest Incoterms → Best term recommendation
   - ✅ Check Country Alerts → Regulations & restrictions

## Troubleshooting

If you see "npm not recognized":
1. Install Node.js from https://nodejs.org/
2. Restart your terminal
3. Verify: `node --version` and `npm --version`

If port 3000 is in use:
- The server will automatically use the next available port (3001, 3002, etc.)
- Check the terminal output for the actual port number

