// Script to ensure dev server is running, then open browser positioned to the right
// This ensures the server is ALWAYS running when browser opens
const http = require('http');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;
const PROJECT_DIR = __dirname.replace(/\\scripts$/, '').replace(/\/scripts$/, '');

// Check if port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(false));
      server.close();
    });
    server.on('error', () => resolve(true));
  });
}

// Check if server is responding
function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(URL, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
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

// Start the dev server
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting dev server...');
    const isWindows = process.platform === 'win32';
    const packageManager = fs.existsSync(path.join(PROJECT_DIR, 'pnpm-lock.yaml')) ? 'pnpm' : 'npm';
    
    const serverProcess = spawn(packageManager, ['run', 'dev'], {
      cwd: PROJECT_DIR,
      shell: isWindows,
      stdio: 'ignore'
    });

    // Wait for server to be ready
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds
    
    const checkInterval = setInterval(async () => {
      attempts++;
      const isReady = await checkServer();
      
      if (isReady) {
        clearInterval(checkInterval);
        console.log('Server is ready!');
        resolve(serverProcess);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        serverProcess.kill();
        reject(new Error('Server failed to start within 60 seconds'));
      }
    }, 1000);
  });
}

// Open browser positioned to the right
function openBrowser() {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    const psScript = `
      $url = "${URL}"
      
      # Open browser
      $process = Start-Process $url -PassThru
      Start-Sleep -Milliseconds 2000
      
      Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        using System.Windows.Forms;
        public class Win32 {
          [DllImport("user32.dll")]
          public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);
          [DllImport("user32.dll")]
          public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
          [DllImport("user32.dll")]
          public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);
          [DllImport("user32.dll")]
          public static extern bool IsWindowVisible(IntPtr hWnd);
          public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
        }
"@
      
      $screenWidth = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea.Width
      $screenHeight = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea.Height
      $windowWidth = [math]::Floor($screenWidth / 2)
      $windowHeight = $screenHeight
      $xPos = $screenWidth / 2
      $yPos = 0
      
      # Find browser window by process ID
      $targetPid = $process.Id
      $hwnd = [IntPtr]::Zero
      
      [Win32]::EnumWindows({
        param($hWnd, $lParam)
        if ([Win32]::IsWindowVisible($hWnd)) {
          $pid = 0
          [Win32]::GetWindowThreadProcessId($hWnd, [ref]$pid)
          if ($pid -eq $targetPid) {
            $script:hwnd = $hWnd
            return $false
          }
        }
        return $true
      }, [IntPtr]::Zero)
      
      if ($hwnd -ne [IntPtr]::Zero) {
        [Win32]::MoveWindow($hwnd, $xPos, $yPos, $windowWidth, $windowHeight, $true)
        Write-Host "Browser positioned to the right"
      } else {
        # Fallback: find most recent browser window
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
      }
    `;
    
    const tempScript = path.join(__dirname, 'ensure-server-temp.ps1');
    fs.writeFileSync(tempScript, psScript);
    
    exec(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`, (error) => {
      try {
        fs.unlinkSync(tempScript);
      } catch (e) {}
      
      if (error) {
        console.log(`Server ready at ${URL}`);
        console.log(`Please open ${URL} in your browser`);
      }
    });
  } else {
    // Mac/Linux fallback
    const command = process.platform === 'darwin' ? `open ${URL}` : `xdg-open ${URL}`;
    exec(command);
  }
}

async function main() {
  try {
    // Check if server is already running
    const serverReady = await checkServer();
    
    if (!serverReady) {
      // Check if port is in use (server might be starting)
      const portInUse = await isPortInUse(PORT);
      
      if (!portInUse) {
        // Start the server
        await startServer();
      } else {
        // Port is in use but server not responding - wait a bit
        console.log('Waiting for server to be ready...');
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (await checkServer()) {
            break;
          }
        }
      }
    }
    
    // Open browser
    openBrowser();
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log(`Please ensure the server is running: npm run dev`);
    console.log(`Then open ${URL} in your browser`);
  }
}

main();

