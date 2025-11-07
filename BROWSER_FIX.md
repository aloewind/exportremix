# 🚀 Quick Fix: Browser Tab Not Opening Correctly

## The Problem
When you click the Browser tab in Cursor, you see "About Blank" or "Site cannot be reached" because the dev server isn't running.

## ✅ The Solution

### Option 1: Quick Start (Recommended)
**Before clicking the Browser tab**, run this command in Cursor's terminal:

```bash
npm run dev:ensure
```

This will:
- Check if the server is running
- Start it if it's not running
- Wait until it's ready

**Then click the Browser tab** - it will open correctly positioned to the right!

### Option 2: Keep Server Running Always
Run this once and it will keep the server running:

```bash
npm run dev:keep-alive
```

This script:
- Starts the server automatically
- Restarts it if it crashes
- Keeps checking every 10 seconds

### Option 3: Use the Batch File
Double-click `ensure-server.bat` - it will ensure the server is running before you click the browser tab.

## 🎯 How It Works Now

1. **Run `npm run dev:ensure`** (or double-click `ensure-server.bat`)
2. **Wait for the message**: "✓ Server is running at http://localhost:3000"
3. **Click the Browser tab** in Cursor
4. **Browser opens** positioned to the right side of your screen!

## 📝 Available Commands

- `npm run dev` - Start dev server normally
- `npm run dev:ensure` - Check and start server if needed (use this!)
- `npm run dev:keep-alive` - Keep server running automatically
- `npm run dev:open` - Start server and open browser (external)

## 🔧 Troubleshooting

**If you still see "About Blank":**
1. Make sure you ran `npm run dev:ensure` first
2. Wait a few seconds for the server to fully start
3. Check the terminal for any error messages

**If the browser doesn't position correctly:**
- The browser should automatically position to the right
- If not, manually drag it or use Windows Snap (Win + Right Arrow)

## 💡 Pro Tip

Create a keyboard shortcut in Cursor:
1. Go to Settings > Keyboard Shortcuts
2. Search for "Run Task"
3. Assign a shortcut to "Ensure Dev Server Running"
4. Press the shortcut before clicking Browser tab!

