/**
 * lib/dir-browser.js — Filesystem directory browser
 *
 * Spec: docs/specs/directory-browser.md
 * Browse directories constrained to configured root paths.
 * Detects git repos, supports favorites.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const CONFIG_DIR = path.join(os.homedir(), '.config', 'ag-session-manager');
const FAVORITES_FILE = path.join(CONFIG_DIR, 'favorites.json');
const MAX_ENTRIES = 500;
const MAX_FAVORITES = 50;

// Dirs to skip listing contents of (but show existence)
const SKIP_CONTENTS = new Set(['node_modules', '.git', '__pycache__', '.venv', 'venv']);

class DirBrowser {
  /**
   * @param {string[]} roots - Allowed root directories
   */
  constructor(roots) {
    this.roots = roots.length > 0
      ? roots.map(r => path.resolve(r.replace(/^~/, os.homedir())))
      : [os.homedir()];
  }

  /**
   * Validate that a path is within allowed roots.
   * Resolves symlinks (spec challenge: symlink escape).
   * @param {string} targetPath
   * @returns {string} resolved absolute path
   * @throws if path is outside roots or doesn't exist
   */
  _validatePath(targetPath) {
    const resolved = path.resolve(targetPath);

    // Check if the LOGICAL path (before symlink resolution) is under a root
    const logicallyAllowed = this.roots.some(root => {
      try {
        return resolved.startsWith(root + path.sep) || resolved === root;
      } catch { return false; }
    });

    let realPath;
    try {
      realPath = fs.realpathSync(resolved);
    } catch {
      // Path doesn't exist
      if (logicallyAllowed) {
        throw Object.assign(new Error('Path does not exist'), { statusCode: 404 });
      }
      throw Object.assign(new Error('Path outside allowed roots'), { statusCode: 400 });
    }

    // Allow if EITHER the logical path OR the real path is under a root
    const reallyAllowed = this.roots.some(root => {
      try {
        const realRoot = fs.realpathSync(root);
        return realPath.startsWith(realRoot + path.sep) || realPath === realRoot;
      } catch { return false; }
    });

    if (!logicallyAllowed && !reallyAllowed) {
      throw Object.assign(new Error('Path outside allowed roots'), { statusCode: 400 });
    }

    // Return the resolved path (even if on another volume) so reads work
    return realPath;
  }

  /**
   * List directory contents.
   * @param {string} [dirPath] - Path to list (null for root listing)
   * @returns {object}
   */
  list(dirPath) {
    // No path = list roots
    if (!dirPath) {
      return {
        path: null,
        parent: null,
        entries: this.roots.map(root => {
          const stat = fs.statSync(root);
          return {
            name: root,
            type: 'dir',
            fullPath: root,
            isGitRepo: this._isGitRepo(root),
            ...(this._isGitRepo(root) ? this._gitInfo(root) : {}),
          };
        }),
        truncated: false,
      };
    }

    const validated = this._validatePath(dirPath);

    if (!fs.statSync(validated).isDirectory()) {
      throw Object.assign(new Error('Not a directory'), { statusCode: 400 });
    }

    // Compute parent
    const parentDir = path.dirname(validated);
    const isAtRoot = this.roots.some(root => {
      try {
        return fs.realpathSync(root) === validated;
      } catch { return false; }
    });
    const parent = isAtRoot ? null : parentDir;

    // Read entries
    let rawEntries;
    try {
      rawEntries = fs.readdirSync(validated);
    } catch (err) {
      throw Object.assign(new Error('Cannot read directory'), { statusCode: 403 });
    }

    const entries = [];
    let truncated = false;

    for (const name of rawEntries) {
      if (entries.length >= MAX_ENTRIES) {
        truncated = true;
        break;
      }

      const fullPath = path.join(validated, name);
      try {
        // Use statSync (follows symlinks) so symlinked dirs appear as dirs
        let stat;
        try {
          stat = fs.statSync(fullPath);
        } catch {
          // Broken symlink — fall back to lstat to still show the entry
          stat = fs.lstatSync(fullPath);
        }
        const isSymlink = fs.lstatSync(fullPath).isSymbolicLink();
        const isDir = stat.isDirectory();
        const isHidden = name.startsWith('.');
        const entry = {
          name,
          type: isDir ? 'dir' : 'file',
          fullPath,
          isHidden,
          ...(isSymlink ? { isSymlink: true } : {}),
          ...(!isDir ? { size: stat.size } : {}),
        };

        // Git repo detection (only for directories)
        if (isDir && !SKIP_CONTENTS.has(name)) {
          entry.isGitRepo = this._isGitRepo(fullPath);
          if (entry.isGitRepo) {
            Object.assign(entry, this._gitInfo(fullPath));
          }
        }

        entries.push(entry);
      } catch {
        // Permission denied or broken symlink, skip
      }
    }

    // Sort: dirs first, then files, alphabetical within each
    entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return { path: validated, parent, entries, truncated };
  }

  _isGitRepo(dirPath) {
    try {
      return fs.existsSync(path.join(dirPath, '.git'));
    } catch {
      return false;
    }
  }

  _gitInfo(dirPath) {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: dirPath,
        timeout: 3000,
        stdio: ['pipe', 'pipe', 'pipe'],
      }).toString().trim();

      let dirty = false;
      try {
        const status = execSync('git status --porcelain', {
          cwd: dirPath,
          timeout: 3000,
          stdio: ['pipe', 'pipe', 'pipe'],
        }).toString().trim();
        dirty = status.length > 0;
      } catch { /* */ }

      return { gitBranch: branch, gitDirty: dirty };
    } catch {
      return { gitBranch: 'unknown', gitDirty: false };
    }
  }

  // ── Favorites ──

  _loadFavorites() {
    try {
      if (fs.existsSync(FAVORITES_FILE)) {
        return JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf-8'));
      }
    } catch { /* */ }
    return [];
  }

  _saveFavorites(favs) {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favs, null, 2));
  }

  listFavorites() {
    return this._loadFavorites();
  }

  addFavorite(dirPath, label) {
    const resolved = this._validatePath(dirPath);
    const favs = this._loadFavorites();

    if (favs.length >= MAX_FAVORITES) {
      throw Object.assign(new Error('Maximum favorites reached'), { statusCode: 400 });
    }

    // Deduplicate
    if (favs.some(f => f.path === resolved)) {
      throw Object.assign(new Error('Already a favorite'), { statusCode: 409 });
    }

    favs.push({ path: resolved, label: label || path.basename(resolved) });
    this._saveFavorites(favs);
    return favs;
  }

  removeFavorite(index) {
    const favs = this._loadFavorites();
    if (index < 0 || index >= favs.length) {
      throw Object.assign(new Error('Invalid index'), { statusCode: 400 });
    }
    favs.splice(index, 1);
    this._saveFavorites(favs);
    return favs;
  }
}

module.exports = DirBrowser;
