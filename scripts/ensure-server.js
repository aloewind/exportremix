// Quick script to check if server is running and start it if needed
// Run this before clicking the browser tab in Cursor
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;
const PROJECT_DIR = __dirname.replace(/\\scripts$/, '').replace(/\/scripts$/, '');

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

async function ensureServerRunning() {
  const isRunning = await checkServer();
  
  if (!isRunning) {
    console.log('Server not running. Starting server...');
    const isWindows = process.platform === 'win32';
    const packageManager = fs.existsSync(path.join(PROJECT_DIR, 'pnpm-lock.yaml')) ? 'pnpm' : 'npm';
    
    const serverProcess = spawn(packageManager, ['run', 'dev'], {
      cwd: PROJECT_DIR,
      shell: isWindows,
      stdio: 'ignore',
      detached: true
    });
    
    // Unref so parent process can exit
    serverProcess.unref();
    
    // Wait for server to start
    console.log('Waiting for server to start...');
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (await checkServer()) {
        console.log(`✓ Server is running at ${URL}`);
        console.log('You can now click the Browser tab in Cursor!');
        return true;
      }
      process.stdout.write('.');
    }
    console.log('\nServer may still be starting. Please wait a moment and try clicking the Browser tab.');
  } else {
    console.log(`✓ Server is already running at ${URL}`);
    console.log('You can now click the Browser tab in Cursor!');
  }
  
  return true;
}

ensureServerRunning().catch(console.error);

