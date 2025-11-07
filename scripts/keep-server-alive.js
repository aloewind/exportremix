// Keep-alive script that ensures dev server stays running
// Run this once and it will keep the server running even if it crashes
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;
const PROJECT_DIR = __dirname.replace(/\\scripts$/, '').replace(/\/scripts$/, '');

let serverProcess = null;

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(URL, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startServer() {
  if (serverProcess) {
    console.log('Server process already exists');
    return;
  }

  console.log('Starting dev server...');
  const isWindows = process.platform === 'win32';
  const packageManager = fs.existsSync(path.join(PROJECT_DIR, 'pnpm-lock.yaml')) ? 'pnpm' : 'npm';
  
  serverProcess = spawn(packageManager, ['run', 'dev'], {
    cwd: PROJECT_DIR,
    shell: isWindows,
    stdio: 'inherit'
  });

  serverProcess.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    serverProcess = null;
    
    // Restart after a delay
    setTimeout(() => {
      console.log('Restarting server...');
      startServer();
    }, 2000);
  });

  serverProcess.on('error', (error) => {
    console.error('Server error:', error);
    serverProcess = null;
  });
}

// Check server health every 10 seconds
setInterval(async () => {
  const isRunning = await checkServer();
  if (!isRunning && !serverProcess) {
    console.log('Server not responding, starting...');
    startServer();
  }
}, 10000);

// Start server initially
startServer();

// Keep process alive
process.on('SIGINT', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

console.log('Dev server keep-alive is running. Press Ctrl+C to stop.');

