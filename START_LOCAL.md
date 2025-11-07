# Starting Local Development Server

## Quick Start

1. **Open a new Command Prompt or PowerShell window** (not the one Cursor is using)

2. **Navigate to the project folder:**
   ```cmd
   cd "C:\Users\Home\Downloads\Export Remix Code"
   ```

3. **Run the start script:**
   ```cmd
   start-server.bat
   ```

   OR manually:
   ```cmd
   npm install
   npm run dev
   ```

4. **Wait for the server to start** - you should see:
   ```
   ✓ Ready in X seconds
   ○ Local: http://localhost:3000
   ```

5. **Open your browser** to http://localhost:3000

## Troubleshooting

### If Node.js is not found:
- Install Node.js from https://nodejs.org/ (LTS version recommended)
- Restart your terminal after installation

### If port 3000 is already in use:
- The server will automatically use the next available port (3001, 3002, etc.)
- Check the terminal output for the actual port number

### If you see Supabase errors:
- The app will work with placeholder values, but some features may be limited
- To enable full functionality, add your Supabase credentials to `.env.local`

## Real-time Editing

Once the server is running:
- Edit any file in the project
- Save the file
- The browser will automatically refresh with your changes
- No need to restart the server!

