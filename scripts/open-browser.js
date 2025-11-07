// Script to wait for Next.js dev server to be ready, then open browser positioned to the right
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_ATTEMPTS = 30; // Try for 30 seconds
const RETRY_DELAY = 1000; // 1 second between attempts
const PORT = 3000;
const URL = `http://localhost:${PORT}`;

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(URL, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404); // 404 is OK, means server is running
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer() {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const isReady = await checkServer();
    if (isReady) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }
  return false;
}

async function openBrowser() {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const isLinux = process.platform === 'linux';

  if (isWindows) {
    // Use PowerShell to open browser and position it to the right side
    const psScript = `
      $url = "${URL}"
      Start-Process $url
      Start-Sleep -Milliseconds 1500
      
      Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        using System.Windows.Forms;
        public class Win32 {
          [DllImport("user32.dll")]
          public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);
          [DllImport("user32.dll")]
          public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        }
"@
      
      $screenWidth = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea.Width
      $screenHeight = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea.Height
      $windowWidth = [math]::Floor($screenWidth / 2)
      $windowHeight = $screenHeight
      $xPos = $screenWidth / 2
      $yPos = 0
      
      # Find the most recently opened browser window
      $browsers = @("chrome", "msedge", "firefox", "brave", "opera")
      foreach ($browser in $browsers) {
        $proc = Get-Process -Name $browser -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -ne ""} | Sort-Object StartTime -Descending | Select-Object -First 1
        if ($proc) {
          $hwnd = $proc.MainWindowHandle
          if ($hwnd -ne [IntPtr]::Zero) {
            [Win32]::MoveWindow($hwnd, $xPos, $yPos, $windowWidth, $windowHeight, $true)
            break
          }
        }
      }
    `;
    
    // Write PowerShell script to temp file to avoid escaping issues
    const tempScript = path.join(__dirname, 'open-browser-temp.ps1');
    fs.writeFileSync(tempScript, psScript);
    
    exec(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`, (error) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempScript);
      } catch (e) {}
      
      if (error) {
        console.log(`Server is ready at ${URL}`);
        console.log(`Please open ${URL} in your browser`);
      } else {
        console.log(`Browser opened at ${URL} (positioned to the right)`);
      }
    });
  } else if (isMac) {
    // On Mac, use AppleScript to position window
    const appleScript = `
      tell application "System Events"
        tell application "Safari" to activate
        delay 0.5
        tell application "Safari" to open location "${URL}"
        delay 1
        tell application "System Events"
          tell process "Safari"
            set frontmost to true
            set bounds of window 1 to {960, 0, 1920, 1080}
          end tell
        end tell
      end tell
    `;
    exec(`osascript -e '${appleScript}'`, (error) => {
      if (error) {
        // Fallback to simple open
        exec(`open ${URL}`);
      }
    });
  } else if (isLinux) {
    exec(`xdg-open ${URL}`);
  } else {
    console.log(`Server is ready at ${URL}`);
    console.log(`Please open ${URL} in your browser`);
  }
}

async function main() {
  console.log('Waiting for server to be ready...');
  const serverReady = await waitForServer();
  
  if (serverReady) {
    await openBrowser();
  } else {
    console.log(`Server did not become ready after ${MAX_ATTEMPTS} seconds`);
    console.log(`Please manually open ${URL} in your browser`);
  }
}

main();

