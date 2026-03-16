/**
 * lib/session-manager.js — Antigravity session lifecycle management
 *
 * Spec: docs/specs/session-management.md
 *
 * Architecture: Antigravity is a VS Code fork (Electron app). When you run
 * `antigravity <dir>`, the CLI launcher sends the folder to the already-running
 * Electron process via IPC and exits immediately. This means:
 *
 *   - We do NOT spawn separate Antigravity processes per session
 *   - We reuse the single existing Antigravity instance
 *   - Each window appears as a separate "page" target in CDP `/json`
 *   - `--remote-debugging-port` only works on the first launch
 *
 * The user must start Antigravity with `--remote-debugging-port=<port>` once
 * (or we detect an existing CDP port). After that, each session just opens a
 * new window via `antigravity <dir> --new-window`.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const http = require('http');

const CONFIG_DIR = path.join(os.homedir(), '.config', 'ag-session-manager');
const STATE_FILE = path.join(CONFIG_DIR, 'sessions.json');
const FAVORITES_FILE = path.join(CONFIG_DIR, 'favorites.json');

class SessionManager {
  /**
   * @param {object} opts
   * @param {string} [opts.antigravityBin] - Path to antigravity binary
   * @param {number} [opts.cdpPort=9000] - CDP debug port of the running Antigravity
   * @param {function} [opts.onStatusChange] - Callback for status changes
   */
  constructor(opts = {}) {
    this.antigravityBin = opts.antigravityBin || 'antigravity';
    this.cdpPort = opts.cdpPort || 9000;
    this.onStatusChange = opts.onStatusChange || (() => {});
    this.sessions = new Map();

    this._ensureConfigDir();
    this._loadState();
  }

  _ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  _loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        for (const session of data) {
          // Mark all loaded sessions as stopped since we can't verify windows
          session.status = 'stopped';
          session.pid = null;
          this.sessions.set(session.id, session);
        }
      }
    } catch {
      // State file corrupted or missing, start fresh
    }
  }

  _saveState() {
    try {
      const data = Array.from(this.sessions.values());
      fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('[session-manager] Failed to save state:', err.message);
    }
  }

  /**
   * Check if CDP is reachable on the configured port.
   * @returns {Promise<boolean>}
   */
  async isCDPAvailable() {
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${this.cdpPort}/json`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const targets = JSON.parse(data);
            resolve(Array.isArray(targets));
          } catch {
            resolve(false);
          }
        });
      });
      req.on('error', () => resolve(false));
      req.setTimeout(2000, () => { req.destroy(); resolve(false); });
    });
  }

  /**
   * Get the list of CDP page targets (each = one Antigravity window).
   * @returns {Promise<Array<{title: string, url: string, webSocketDebuggerUrl: string}>>}
   */
  async getCDPTargets() {
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${this.cdpPort}/json`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const targets = JSON.parse(data);
            resolve(targets.filter(t => t.type === 'page'));
          } catch {
            resolve([]);
          }
        });
      });
      req.on('error', () => resolve([]));
      req.setTimeout(3000, () => { req.destroy(); resolve([]); });
    });
  }

  /**
   * Create and launch a new Antigravity session.
   * Opens a new window in the existing Antigravity instance.
   * @param {string} dir - Absolute path to working directory
   * @returns {Promise<object>} session object
   */
  async create(dir) {
    // Validate directory exists
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      throw Object.assign(new Error('Directory does not exist'), { statusCode: 400 });
    }

    const resolvedDir = fs.realpathSync(dir);

    // Check if CDP is available (Antigravity must be running)
    const cdpReady = await this.isCDPAvailable();

    const id = crypto.randomUUID();
    const shortId = id.slice(0, 8);
    const now = new Date().toISOString();
    const session = {
      id,
      dir: resolvedDir,
      port: this.cdpPort,
      pid: null,
      status: 'starting',
      createdAt: now,
      lastActivity: now,
    };

    // Get existing targets before opening new window (to detect the new one)
    const targetsBefore = cdpReady ? await this.getCDPTargets() : [];
    const beforeIds = new Set(targetsBefore.map(t => t.id));

    // Open the directory in Antigravity
    const args = [resolvedDir, '--new-window', '--disable-workspace-trust'];
    if (!cdpReady) {
      // Antigravity not running — launch fresh with CDP enabled
      args.push(`--remote-debugging-port=${this.cdpPort}`);
      console.log(`[session-manager] No Antigravity detected, launching fresh with CDP on port ${this.cdpPort}`);
    }

    console.log(`[session-manager] Opening window: ${this.antigravityBin} ${args.join(' ')}`);

    try {
      const proc = spawn(this.antigravityBin, args, {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: resolvedDir,
      });

      session.pid = proc.pid;
      console.log(`[session-manager] Launcher PID=${proc.pid} (will exit immediately — by design)`);

      // Log any output for debugging
      if (proc.stdout) {
        proc.stdout.on('data', (data) => {
          const line = data.toString().trim();
          if (line) console.log(`[ag:${shortId}] ${line}`);
        });
      }
      if (proc.stderr) {
        proc.stderr.on('data', (data) => {
          const line = data.toString().trim();
          if (line) console.error(`[ag:${shortId}] ${line}`);
        });
      }

      // The launcher exits immediately — that's expected behavior.
      // The window is opened in the already-running Antigravity process.
      proc.on('exit', (code) => {
        console.log(`[session-manager] Launcher exited code=${code} (expected)`);
        // Don't change session status here — the launcher exiting is normal
      });

      proc.on('error', (err) => {
        console.error(`[session-manager] Launcher error:`, err.message);
        const s = this.sessions.get(id);
        if (s) {
          s.status = 'error';
          this._saveState();
          this.onStatusChange(s);
        }
      });

      proc.unref();
    } catch (err) {
      session.status = 'error';
      this.sessions.set(id, session);
      this._saveState();
      throw Object.assign(
        new Error(`Failed to launch Antigravity: ${err.message}`),
        { statusCode: 500 }
      );
    }

    this.sessions.set(id, session);
    this._saveState();
    return { ...session, _beforeIds: [...beforeIds] };
  }

  /**
   * List all sessions.
   * @returns {object[]}
   */
  list() {
    const now = Date.now();
    return Array.from(this.sessions.values()).map(s => ({
      ...s,
      uptime: s.status === 'running' || s.status === 'starting'
        ? Math.floor((now - new Date(s.createdAt).getTime()) / 1000)
        : 0,
    }));
  }

  /**
   * Get a session by ID.
   * @param {string} id
   * @returns {object|null}
   */
  get(id) {
    const s = this.sessions.get(id);
    if (!s) return null;
    return {
      ...s,
      uptime: s.status === 'running' || s.status === 'starting'
        ? Math.floor((Date.now() - new Date(s.createdAt).getTime()) / 1000)
        : 0,
    };
  }

  /**
   * Stop and remove a session.
   * Since sessions are windows in a shared Antigravity process,
   * stopping = closing the window via CDP (not killing a process).
   * @param {string} id
   * @returns {object}
   */
  async stop(id) {
    const session = this.sessions.get(id);
    if (!session) {
      throw Object.assign(new Error('Session not found'), { statusCode: 404 });
    }

    // Session stopping is handled by closing the CDP page via the bridge
    // (done in server.js). Here we just update the state.
    session.status = 'stopped';
    session.pid = null;
    this._saveState();
    this.onStatusChange(session);
    return { id: session.id, status: 'stopped' };
  }

  /**
   * Remove a session from the list entirely.
   * @param {string} id
   */
  remove(id) {
    this.sessions.delete(id);
    this._saveState();
  }

  /**
   * Update session status (called by CDP bridge on connection).
   */
  updateStatus(id, status) {
    const session = this.sessions.get(id);
    if (session) {
      session.status = status;
      session.lastActivity = new Date().toISOString();
      this._saveState();
      this.onStatusChange(session);
    }
  }

  /**
   * Clean shutdown: stop all running sessions.
   */
  async shutdownAll() {
    // In the shared-process model, we don't kill Antigravity.
    // Just mark sessions as stopped.
    for (const session of this.sessions.values()) {
      if (session.status === 'running' || session.status === 'starting') {
        session.status = 'stopped';
        session.pid = null;
      }
    }
    this._saveState();
  }
}

module.exports = SessionManager;
