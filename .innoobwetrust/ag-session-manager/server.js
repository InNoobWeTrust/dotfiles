/**
 * server.js — Antigravity Session Manager main server
 *
 * Specs: docs/specs/network-security.md, session-management.md,
 *        chat-interaction.md, directory-browser.md
 *
 * Express + WebSocket server that manages Antigravity sessions,
 * provides CDP-proxied chat mirroring, and serves a mobile SPA.
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const WebSocket = require('ws');

const { getBindAddresses, getNetworkInfo } = require('./lib/network');
const SessionManager = require('./lib/session-manager');
const CDPBridge = require('./lib/cdp-bridge');
const DirBrowser = require('./lib/dir-browser');

// ── Configuration ──

const PORT = parseInt(process.env.PORT, 10) || 3000;
const BIND_MODE = process.env.BIND_INTERFACES || 'auto';
const BROWSE_ROOTS = (process.env.BROWSE_ROOTS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(s => s
    .replace(/^\$HOME\b|\$\{HOME\}/g, os.homedir())
    .replace(/^\$USER\b|\$\{USER\}/g, os.userInfo().username)
  );
const ANTIGRAVITY_BIN = process.env.ANTIGRAVITY_BIN || '';
const CDP_PORT_START = parseInt(process.env.CDP_PORT_START, 10) || 9000;

const CONFIG_DIR = path.join(os.homedir(), '.config', 'ag-session-manager');
const LOCKFILE = path.join(CONFIG_DIR, 'server.pid');
const TOKEN_FILE = path.join(CONFIG_DIR, 'auth_token');
const CERTS_DIR = path.join(__dirname, 'certs');

// ── Auth Token (auto-generated if not configured) ──

function resolveAuthToken() {
  // 1. Env var takes priority
  if (process.env.AUTH_TOKEN) return process.env.AUTH_TOKEN;

  // 2. Persisted token file
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (fs.existsSync(TOKEN_FILE)) {
    const stored = fs.readFileSync(TOKEN_FILE, 'utf-8').trim();
    if (stored) return stored;
  }

  // 3. Generate new token
  const token = crypto.randomBytes(24).toString('base64url');
  fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
  return token;
}

const AUTH_TOKEN = resolveAuthToken();

// ── Lockfile (TRD Rev 2) ──

function checkLockfile() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (fs.existsSync(LOCKFILE)) {
    try {
      const pid = parseInt(fs.readFileSync(LOCKFILE, 'utf-8').trim(), 10);
      try {
        process.kill(pid, 0); // Check if alive
        console.error(`Server already running (PID: ${pid}). Exiting.`);
        process.exit(1);
      } catch {
        // Stale lockfile, remove it
        fs.unlinkSync(LOCKFILE);
      }
    } catch {
      fs.unlinkSync(LOCKFILE);
    }
  }

  fs.writeFileSync(LOCKFILE, String(process.pid));
}

function cleanLockfile() {
  try { fs.unlinkSync(LOCKFILE); } catch { /* */ }
}

// ── Auth Middleware (always enforced) ──

function authMiddleware(req, res, next) {
  // Static files and auth-check endpoint don't need auth (so login page loads)
  if (!req.path.startsWith('/api/') && req.path !== '/health') return next();
  if (req.path === '/api/auth/check') return next();

  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');

  if (!token) return res.status(401).json({ error: 'Authorization required' });

  // Constant-time comparison (spec: network-security)
  const a = Buffer.from(token);
  const b = Buffer.from(AUTH_TOKEN);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
}

// ── Initialize Services ──

const sessionManager = new SessionManager({
  antigravityBin: ANTIGRAVITY_BIN || undefined,
  cdpPort: CDP_PORT_START,
  onStatusChange: (session) => broadcastWS({ type: 'session_update', session }),
});

const dirBrowser = new DirBrowser(BROWSE_ROOTS);

// CDP bridges per session
const cdpBridges = new Map();

// ── Express App ──

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes: Auth ──

app.post('/api/auth/check', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) return res.json({ valid: false });

  const a = Buffer.from(token);
  const b = Buffer.from(AUTH_TOKEN);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
  res.json({ valid });
});

// ── API Routes: Health ──

app.get('/health', (req, res) => {
  const info = getNetworkInfo();
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    sessions: sessionManager.list().length,
    network: { lan: info.lan, tailscale: info.tailscale },
  });
});

app.get('/api/network', (req, res) => {
  const info = getNetworkInfo();
  const bound = getBindAddresses(BIND_MODE);
  res.json({ interfaces: info.interfaces, bound });
});

// ── API Routes: Sessions ──

app.get('/api/sessions', (req, res) => {
  const sessions = sessionManager.list().map(s => ({
    ...s,
    cdpConnected: cdpBridges.has(s.id) && cdpBridges.get(s.id).connected,
  }));
  res.json({ sessions });
});

app.post('/api/sessions', async (req, res) => {
  try {
    let { dir } = req.body;

    // Playground mode: no dir = create a temp playground directory
    if (!dir) {
      const id = crypto.randomBytes(4).toString('hex');
      dir = path.join(os.tmpdir(), `ag-playground-${id}`);
      fs.mkdirSync(dir, { recursive: true });
    }

    const result = await sessionManager.create(dir);
    const beforeIds = result._beforeIds || [];
    delete result._beforeIds;

    // Start CDP connection: wait for new page target to appear
    setTimeout(() => connectCDP(result.id, beforeIds), 3000);

    res.status(201).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/sessions/:id', (req, res) => {
  const session = sessionManager.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.cdpConnected = cdpBridges.has(session.id) && cdpBridges.get(session.id).connected;
  res.json(session);
});

app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const bridge = cdpBridges.get(req.params.id);
    if (bridge) {
      // Close the Antigravity window via CDP, then disconnect
      await bridge.closeWindow();
      cdpBridges.delete(req.params.id);
    }

    const result = await sessionManager.stop(req.params.id);

    // If purge=true, also remove from session list entirely
    if (req.query.purge === 'true') {
      sessionManager.remove(req.params.id);
    }

    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// ── API Routes: Chat Interaction ──

app.get('/api/sessions/:id/snapshot', async (req, res) => {
  const bridge = cdpBridges.get(req.params.id);
  if (!bridge || !bridge.connected) {
    return res.status(503).json({ error: 'CDP not connected' });
  }

  const snapshot = await bridge.captureSnapshot();
  if (!snapshot) return res.status(503).json({ error: 'Could not capture snapshot' });

  res.json(snapshot);
});

app.get('/api/sessions/:id/messages', async (req, res) => {
  const bridge = cdpBridges.get(req.params.id);
  if (!bridge || !bridge.connected) {
    return res.status(503).json({ error: 'CDP not connected' });
  }

  const data = await bridge.extractMessages();
  if (!data) return res.status(503).json({ error: 'Could not extract messages' });

  res.json(data);
});

app.post('/api/sessions/:id/scroll', async (req, res) => {
  const bridge = cdpBridges.get(req.params.id);
  if (!bridge || !bridge.connected) {
    return res.status(503).json({ error: 'CDP not connected' });
  }

  const { scrollPercent } = req.body;
  if (scrollPercent !== undefined) {
    await bridge.remoteScroll(scrollPercent);
  }
  res.json({ ok: true });
});

app.post('/api/sessions/:id/send', async (req, res) => {
  try {
    const bridge = cdpBridges.get(req.params.id);
    if (!bridge || !bridge.connected) {
      return res.status(503).json({ error: 'CDP not connected' });
    }
    await bridge.sendMessage(req.body.message || '');
    res.json({ status: 'sent' });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

// Debug: eval JS on session page (temporary, for DOM inspection)
app.post('/api/sessions/:id/eval', async (req, res) => {
  try {
    const bridge = cdpBridges.get(req.params.id);
    if (!bridge || !bridge.connected) {
      return res.status(503).json({ error: 'CDP not connected' });
    }
    const result = await bridge._send('Runtime.evaluate', {
      expression: req.body.expression || '""',
      returnByValue: true,
    });
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.post('/api/sessions/:id/stop-gen', async (req, res) => {
  try {
    const bridge = cdpBridges.get(req.params.id);
    if (!bridge || !bridge.connected) {
      return res.status(503).json({ error: 'CDP not connected' });
    }
    await bridge.stopGeneration();
    res.json({ status: 'stopped' });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.get('/api/sessions/:id/state', async (req, res) => {
  const bridge = cdpBridges.get(req.params.id);
  if (!bridge || !bridge.connected) {
    return res.json({ mode: 'unknown', model: 'unknown' });
  }
  const state = await bridge.getAppState();
  res.json(state);
});

app.post('/api/sessions/:id/set-mode', async (req, res) => {
  try {
    const bridge = cdpBridges.get(req.params.id);
    if (!bridge || !bridge.connected) {
      return res.status(503).json({ error: 'CDP not connected' });
    }
    await bridge.setMode(req.body.mode || 'fast');
    res.json({ status: 'set' });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.post('/api/sessions/:id/set-model', async (req, res) => {
  try {
    const bridge = cdpBridges.get(req.params.id);
    if (!bridge || !bridge.connected) {
      return res.status(503).json({ error: 'CDP not connected' });
    }
    await bridge.setModel(req.body.model || '');
    res.json({ status: 'set' });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.post('/api/sessions/:id/new-chat', async (req, res) => {
  try {
    const bridge = cdpBridges.get(req.params.id);
    if (!bridge || !bridge.connected) {
      return res.status(503).json({ error: 'CDP not connected' });
    }
    await bridge.newChat();
    res.json({ status: 'created' });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

// ── API Routes: Directory Browser ──

app.get('/api/dirs', (req, res) => {
  try {
    const result = dirBrowser.list(req.query.path || null);
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/dirs/favorites', (req, res) => {
  res.json(dirBrowser.listFavorites());
});

app.post('/api/dirs/favorites', (req, res) => {
  try {
    const result = dirBrowser.addFavorite(req.body.path, req.body.label);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.delete('/api/dirs/favorites/:index', (req, res) => {
  try {
    const result = dirBrowser.removeFavorite(parseInt(req.params.index, 10));
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// ── SPA Fallback ──

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── WebSocket ──

let wss;
const wsClients = new Set();

function broadcastWS(data) {
  const msg = JSON.stringify(data);
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

/**
 * Connect a CDP bridge to a session by finding the page target
 * that matches this session's directory.
 *
 * In Antigravity, each window's page target title = the folder basename.
 * Example: dir "/tmp/ag-playground-abc123" → target title "ag-playground-abc123"
 *
 * @param {string} sessionId
 * @param {string[]} beforeIds - CDP page target IDs that existed before the window was opened
 */
async function connectCDP(sessionId, beforeIds) {
  const shortId = sessionId.slice(0, 8);
  const beforeSet = new Set(beforeIds);
  const session = sessionManager.get(sessionId);
  if (!session) return;

  // The basename of the session directory should appear in the target title
  const dirBasename = path.basename(session.dir);
  const cdpPort = session.port;
  const maxRetries = 30;

  console.log(`[cdp:${shortId}] Looking for page target matching "${dirBasename}"`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Session may have been stopped while we retry
    const current = sessionManager.get(sessionId);
    if (!current || current.status === 'stopped') {
      console.log(`[cdp:${shortId}] Session stopped, aborting connection`);
      return;
    }

    const targets = await sessionManager.getCDPTargets();

    // Strategy 1: Find target whose title matches the directory basename
    let match = targets.find(t =>
      t.title === dirBasename ||
      t.title.includes(dirBasename) ||
      t.title.endsWith(` — ${dirBasename}`)
    );

    // Strategy 2 (fallback): If no title match after a few attempts,
    // try new targets not in beforeIds (but skip workbench shell pages)
    if (!match && attempt > 5) {
      match = targets.find(t =>
        !beforeSet.has(t.id) &&
        !t.title.startsWith('vscode-file://') &&
        t.title !== 'Launchpad'
      );
    }

    if (match) {
      console.log(`[cdp:${shortId}] Found page target: "${match.title}" (attempt ${attempt})`);

      const bridge = new CDPBridge(cdpPort);
      cdpBridges.set(sessionId, bridge);

      const connected = await bridge.connectToUrl(match.webSocketDebuggerUrl);
      if (connected) {
        sessionManager.updateStatus(sessionId, 'running');
        console.log(`[cdp:${shortId}] Connected!`);
        return;
      }
    }

    // Wait with backoff: 2s, 3s, 4s, ... capped at 8s
    const delay = Math.min(2000 + attempt * 1000, 8000);
    if (attempt % 5 === 0) {
      const titles = targets.map(t => t.title.slice(0, 40));
      console.log(`[cdp:${shortId}] Attempt ${attempt}, visible targets: [${titles.join(', ')}]`);
    }
    await new Promise(r => setTimeout(r, delay));
  }

  console.error(`[cdp:${shortId}] Failed to find page target for "${dirBasename}" after ${maxRetries} attempts`);
  sessionManager.updateStatus(sessionId, 'error');
}

// ── Server Startup ──

async function start() {
  checkLockfile();

  // Create HTTP or HTTPS server
  let server;
  const certPath = path.join(CERTS_DIR, 'server.cert');
  const keyPath = path.join(CERTS_DIR, 'server.key');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const opts = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
    server = https.createServer(opts, app);
    console.log('🔒 HTTPS enabled');
  } else {
    server = http.createServer(app);
    console.log('⚠️  Running in HTTP mode (no certificates found in ./certs/)');
  }

  // WebSocket server — screencast frame streaming
  wss = new WebSocket.Server({ server });

  // Track which WS clients are subscribed to which session
  const wsSubscriptions = new Map(); // ws → sessionId

  wss.on('connection', (ws) => {
    wsClients.add(ws);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === 'subscribe' && msg.sessionId) {
          // Unsubscribe from previous session
          const prevId = wsSubscriptions.get(ws);
          if (prevId) wsSubscriptions.delete(ws);

          wsSubscriptions.set(ws, msg.sessionId);
          const bridge = cdpBridges.get(msg.sessionId);

          if (bridge && bridge.connected) {
            // Wire frame callback to forward to all subscribed WS clients
            if (!bridge.onFrame) {
              bridge.onFrame = (frameData) => {
                const payload = JSON.stringify({ type: 'frame', data: frameData });
                for (const [client, sid] of wsSubscriptions) {
                  if (sid === msg.sessionId && client.readyState === WebSocket.OPEN) {
                    client.send(payload);
                  }
                }
              };
            }
            bridge.startScreencast({ quality: 60, maxWidth: 1280, maxHeight: 960 });
          }
        }

        if (msg.type === 'unsubscribe') {
          const sid = wsSubscriptions.get(ws);
          wsSubscriptions.delete(ws);
          // Stop screencast if no more subscribers
          if (sid) {
            const stillSubscribed = [...wsSubscriptions.values()].some(s => s === sid);
            if (!stillSubscribed) {
              const bridge = cdpBridges.get(sid);
              if (bridge) {
                bridge.stopScreencast();
                bridge.onFrame = null;
              }
            }
          }
        }
      } catch { /* ignore */ }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
      const sid = wsSubscriptions.get(ws);
      wsSubscriptions.delete(ws);
      // Stop screencast if no more subscribers
      if (sid) {
        const stillSubscribed = [...wsSubscriptions.values()].some(s => s === sid);
        if (!stillSubscribed) {
          const bridge = cdpBridges.get(sid);
          if (bridge) {
            bridge.stopScreencast();
            bridge.onFrame = null;
          }
        }
      }
    });
  });

  // Bind to all interfaces — security relies on network-level isolation
  // (LAN/Tailscale), not on bind-level restriction. Node.js only supports
  // a single listen() call per server.
  const protocol = server instanceof https.Server ? 'https' : 'http';
  const info = getNetworkInfo();

  await new Promise((resolve, reject) => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`  📡 Listening on port ${PORT}`);

      // Display all accessible addresses
      for (const addr of ['127.0.0.1', ...info.lan, ...info.tailscale]) {
        console.log(`     ${protocol}://${addr}:${PORT}`);
      }
      resolve();
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`  ❌ Port ${PORT} already in use`);
        cleanLockfile();
        process.exit(1);
      }
      reject(err);
    });
  });

  // QR code for LAN/Tailscale addresses
  try {
    const qrcode = require('qrcode-terminal');
    const displayAddr = info.lan[0] || info.tailscale[0] || '127.0.0.1';
    const url = `${protocol}://${displayAddr}:${PORT}`;
    console.log(`\n  🔗 Connect your phone: ${url}\n`);
    qrcode.generate(url, { small: true });
  } catch { /* qrcode-terminal not installed */ }

  // Reconnect CDP for recovered sessions
  for (const session of sessionManager.list()) {
    if (session.status === 'running' || session.status === 'starting') {
      connectCDP(session.id, session.port);
    }
  }

  console.log(`\n  🔑 Auth token: ${AUTH_TOKEN}`);
  console.log(`     Persisted: ${TOKEN_FILE}`);
  console.log(`\n  ✅ Antigravity Session Manager ready\n`);
}

// ── Graceful Shutdown ──

async function shutdown() {
  console.log('\n  🛑 Shutting down...');

  // Close WebSocket clients
  for (const client of wsClients) {
    try { client.close(); } catch { /* */ }
  }

  // Disconnect all CDP bridges
  for (const [, bridge] of cdpBridges) {
    bridge.disconnect();
  }

  cleanLockfile();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  console.error('Fatal:', err);
  cleanLockfile();
  process.exit(1);
});
