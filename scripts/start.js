#!/usr/bin/env node
/**
 * AI Fire Evacuation Simulator - Unified Launcher
 * Concurrently boots up the Express Backend Server and Electron Desktop Frontend.
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const desktopDir = path.join(rootDir, 'desktop-app');

console.log('====================================================');
console.log(' AI Fire Evacuation Simulator - Full-Stack Launcher ');
console.log('====================================================');

let backendProc = null;
let desktopProc = null;
let isShuttingDown = false;

function cleanExit() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n[Launcher] Shutting down all processes cleanly...');

  if (desktopProc) {
    try { desktopProc.kill(); } catch (e) {}
    desktopProc = null;
  }
  if (backendProc) {
    try { backendProc.kill(); } catch (e) {}
    backendProc = null;
  }

  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);

// 1. Check if backend is already alive
function checkBackendHealth() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:5000/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startBackend() {
  const isRunning = await checkBackendHealth();
  if (isRunning) {
    console.log('[Backend] Server already running at http://127.0.0.1:5000');
    return true;
  }

  console.log('[1/2] Starting Node.js Backend Server (Port 5000)...');
  backendProc = spawn('node', ['server.js'], {
    cwd: backendDir,
    env: { ...process.env, PORT: '5000' },
    stdio: 'inherit',
    shell: true
  });

  backendProc.on('error', (err) => {
    console.error('[Backend ERROR]', err.message);
  });

  backendProc.on('exit', (code) => {
    if (!isShuttingDown && code !== 0) {
      console.log(`[Backend] Exited with code ${code}`);
    }
  });

  // Wait up to 5 seconds for health endpoint to respond
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const healthy = await checkBackendHealth();
    if (healthy) {
      console.log('[Backend] Server online & ready at http://127.0.0.1:5000');
      return true;
    }
  }

  console.log('[Backend] Server started (awaiting initialization).');
  return true;
}

async function startDesktop() {
  console.log('[2/2] Launching Electron Desktop Application...');
  desktopProc = spawn('npm', ['start'], {
    cwd: desktopDir,
    stdio: 'inherit',
    shell: true
  });

  desktopProc.on('error', (err) => {
    console.error('[Desktop ERROR]', err.message);
  });

  desktopProc.on('exit', (code) => {
    console.log(`[Desktop] Window closed (code ${code})`);
    cleanExit();
  });
}

async function run() {
  try {
    await startBackend();
    await startDesktop();
  } catch (err) {
    console.error('[Launcher Failed]', err);
    cleanExit();
  }
}

run();

