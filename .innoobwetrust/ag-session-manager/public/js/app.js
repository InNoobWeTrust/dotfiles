/**
 * app.js — Antigravity Session Manager client SPA
 *
 * Hash-based routing, WebSocket for real-time updates,
 * snapshot polling, directory browser, session controls.
 */

(function () {
  'use strict';

  // ── State ──
  let currentView = 'dashboard';
  let activeSessionId = null;
  let snapshotTimer = null;
  let lastSnapshotHash = null;
  let ws = null;

  // ── DOM refs ──
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const views = {
    dashboard: $('#view-dashboard'),
    new: $('#view-new'),
    session: $('#view-session'),
    settings: $('#view-settings'),
  };

  // ── API helpers ──

  const AUTH_TOKEN = localStorage.getItem('ag_token') || '';

  function headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    if (AUTH_TOKEN) h['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    return h;
  }

  async function api(url, opts = {}) {
    try {
      const res = await fetch(url, { ...opts, headers: headers(opts.headers) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      console.error(`API ${url}:`, err);
      throw err;
    }
  }

  // ── WebSocket ──

  function connectWS() {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${proto}//${location.host}`);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'session_update') {
          if (currentView === 'dashboard') loadDashboard();
        }
      } catch { /* */ }
    };

    ws.onclose = () => {
      setTimeout(connectWS, 3000);
    };

    ws.onerror = () => { /* retry handled by onclose */ };
  }

  // ── Router ──

  function navigate(view, params = {}) {
    currentView = view;

    // Update views
    Object.values(views).forEach((v) => v.classList.remove('active'));
    if (views[view]) views[view].classList.add('active');

    // Update header
    const btnBack = $('#btn-back');
    const btnNew = $('#btn-new');
    const title = $('#header-title');

    switch (view) {
      case 'dashboard':
        title.textContent = 'Sessions';
        btnBack.classList.add('hidden');
        btnNew.classList.remove('hidden');
        loadDashboard();
        stopMessagePolling();
        break;

      case 'new':
        title.textContent = 'New Session';
        btnBack.classList.remove('hidden');
        btnNew.classList.add('hidden');
        loadNewSession();
        stopMessagePolling();
        break;

      case 'session':
        title.textContent = 'Session';
        btnBack.classList.remove('hidden');
        btnNew.classList.add('hidden');
        activeSessionId = params.id;
        loadSessionView(params.id);
        break;

      case 'settings':
        title.textContent = 'Settings';
        btnBack.classList.remove('hidden');
        btnNew.classList.remove('hidden');
        loadSettings();
        stopMessagePolling();
        break;
    }

    // Update hash
    const hash = view === 'session' ? `#session/${params.id}` : `#${view}`;
    if (location.hash !== hash) history.pushState(null, '', hash);
  }

  // ── Dashboard ──

  async function loadDashboard() {
    const container = $('#sessions-list');
    const empty = $('#empty-state');

    try {
      const data = await api('/api/sessions');
      const sessions = data.sessions || [];

      if (sessions.length === 0) {
        container.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
      }

      container.classList.remove('hidden');
      empty.classList.add('hidden');

      container.innerHTML = sessions.map((s) => `
        <div class="session-card" data-id="${s.id}" onclick="window._openSession('${s.id}')">
          <div class="card-header">
            <span class="card-dir">${basename(s.dir)}</span>
            <span class="badge ${s.status}">${statusDot(s.status)} ${s.status}</span>
          </div>
          <div class="card-meta">
            <span>${s.dir}</span>
          </div>
          <div class="card-meta">
            <span>Port ${s.port}</span>
            ${s.uptime ? `<span>⏱ ${formatUptime(s.uptime)}</span>` : ''}
            <span>${s.cdpConnected ? '🟢 CDP' : '⚪ CDP'}</span>
          </div>
          <div class="card-actions">
            ${s.status !== 'stopped'
              ? `<button class="btn-sm danger" onclick="event.stopPropagation(); window._stopSession('${s.id}')">Close</button>`
              : `<button class="btn-sm danger" onclick="event.stopPropagation(); window._deleteSession('${s.id}')">🗑 Delete</button>`}
          </div>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<p style="color:var(--danger)">Failed to load: ${err.message}</p>`;
    }
  }

  // ── New Session ──

  let currentBrowsePath = null;
  let selectedDir = null;

  async function loadNewSession() {
    selectedDir = null;
    updateSelectedBar();
    await loadFavorites();
    await loadDirectory(null);
  }

  async function loadFavorites() {
    const container = $('#favorites-list');
    try {
      const favs = await api('/api/dirs/favorites');
      if (favs.length === 0) {
        container.innerHTML = '<span class="fav-chip" onclick="window._nav(\'new\')"><span class="fav-icon">📂</span> No favorites</span>';
        return;
      }
      container.innerHTML = favs.map((f, i) => `
        <button class="fav-chip" onclick="window._selectDir('${f.path.replace(/'/g, "\\'")}')">
          <span class="fav-icon">⭐</span> ${f.label || basename(f.path)}
        </button>
      `).join('');
    } catch {
      container.innerHTML = '';
    }
  }

  async function loadDirectory(dirPath) {
    currentBrowsePath = dirPath;
    const container = $('#dir-list');
    const breadcrumbs = $('#breadcrumbs');

    try {
      const data = await api(`/api/dirs${dirPath ? `?path=${encodeURIComponent(dirPath)}` : ''}`);

      // Breadcrumbs
      if (data.path) {
        const parts = data.path.split('/').filter(Boolean);
        let accumulated = '';
        breadcrumbs.innerHTML = parts.map((p, i) => {
          accumulated += '/' + p;
          const path = accumulated;
          const sep = i < parts.length - 1 ? '<span class="breadcrumb-sep">/</span>' : '';
          return `<span class="breadcrumb-item" onclick="window._browse('${path.replace(/'/g, "\\'")}')">${p}</span>${sep}`;
        }).join('');
      } else {
        breadcrumbs.innerHTML = '<span class="breadcrumb-item">Roots</span>';
      }

      // Entries
      const entries = data.entries || [];
      container.innerHTML = entries.map((e) => {
        const icon = e.type === 'dir' ? '📁' : fileIcon(e.name);
        const gitBadge = e.isGitRepo
          ? `<span class="git-badge ${e.gitDirty ? 'dirty' : ''}">${e.gitBranch || 'git'}${e.gitDirty ? ' •' : ''}</span>`
          : '';
        const meta = e.type === 'file' ? formatSize(e.size) : '';
        const fullPath = e.fullPath || (data.path ? data.path + '/' + e.name : e.name);

        const action = e.type === 'dir'
          ? `onclick="window._browse('${fullPath.replace(/'/g, "\\'")}')" ondblclick="window._selectDir('${fullPath.replace(/'/g, "\\'")}')"`
          : '';

        return `
          <div class="dir-entry ${e.type} ${e.isHidden ? 'hidden-file' : ''}" ${action}>
            <div class="entry-icon">${icon}</div>
            <div class="entry-info">
              <div class="entry-name">${e.name} ${gitBadge}</div>
              <div class="entry-meta">${meta}</div>
            </div>
            ${e.type === 'dir' ? `<button class="btn-sm" onclick="event.stopPropagation(); window._selectDir('${fullPath.replace(/'/g, "\\'")}')" style="flex-shrink:0">Select</button>` : ''}
          </div>
        `;
      }).join('');

      if (data.truncated) {
        container.innerHTML += '<p style="text-align:center; color:var(--text-muted); padding:12px">Results truncated (500 max)</p>';
      }
    } catch (err) {
      container.innerHTML = `<p style="color:var(--danger); padding:16px">Error: ${err.message}</p>`;
    }
  }

  function updateSelectedBar() {
    const bar = $('#selected-dir-bar');
    const pathEl = $('#selected-dir-path');
    if (selectedDir) {
      bar.classList.remove('hidden');
      pathEl.textContent = selectedDir;
    } else {
      bar.classList.add('hidden');
    }
  }

  async function launchSession(dir) {
    const btn = dir ? $('#btn-launch') : $('#btn-playground');
    const origText = btn.textContent;
    btn.textContent = 'Launching...';
    btn.disabled = true;

    try {
      const body = dir ? { dir } : {};
      const session = await api('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      navigate('session', { id: session.id });
    } catch (err) {
      alert('Launch failed: ' + err.message);
    } finally {
      btn.textContent = origText;
      btn.disabled = false;
    }
  }

  // ── Session View ──

  async function loadSessionView(id) {
    const dirEl = $('#session-dir');
    const badgeEl = $('#session-state-badge');
    const loading = $('#chat-loading');
    const msgContainer = $('#chat-messages');

    loading.classList.remove('hidden');
    msgContainer.innerHTML = '';
    lastSnapshotHash = null;

    try {
      const session = await api(`/api/sessions/${id}`);
      dirEl.textContent = session.dir;
      badgeEl.textContent = session.status;
      badgeEl.className = `badge ${session.status}`;

      if (session.cdpConnected) {
        startMessagePolling(id);
      } else {
        loading.querySelector('p').textContent = 'Waiting for CDP connection...';
        const checkInterval = setInterval(async () => {
          try {
            const s = await api(`/api/sessions/${id}`);
            if (s.cdpConnected) {
              clearInterval(checkInterval);
              startMessagePolling(id);
            }
          } catch { /* */ }
        }, 2000);
      }

      loadModeState(id);
    } catch (err) {
      loading.querySelector('p').textContent = `Error: ${err.message}`;
    }
  }

  async function loadModeState(id) {
    try {
      const state = await api(`/api/sessions/${id}/state`);
      $$('.mode-chip[data-mode]').forEach((chip) => {
        chip.classList.toggle('active',
          chip.dataset.mode === state.mode?.toLowerCase());
      });
    } catch { /* */ }
  }

  // ── SVG Icons ──
  const ICON_COPY = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  let userScrollLockUntil = 0;
  const SCROLL_LOCK_DURATION = 3000;

  // ── Native Message Rendering ──

  function renderMessages(data) {
    const container = $('#chat-messages');
    const frag = document.createDocumentFragment();

    for (const msg of data.messages) {
      const msgEl = document.createElement('div');
      msgEl.className = `chat-msg ${msg.role}`;

      const roleLabel = document.createElement('div');
      roleLabel.className = 'msg-role';
      roleLabel.textContent = msg.role === 'user' ? 'You' : 'Assistant';
      msgEl.appendChild(roleLabel);

      const body = document.createElement('div');
      body.className = 'msg-body';

      for (const block of msg.blocks) {
        switch (block.type) {
          case 'text': {
            const textDiv = document.createElement('div');
            textDiv.innerHTML = block.html;
            textDiv.querySelectorAll('script').forEach(s => s.remove());
            body.appendChild(textDiv);
            break;
          }
          case 'code':
            body.appendChild(createCodeBlock(block.language, block.content));
            break;
          case 'image':
            body.appendChild(createImageBlock(block.src, block.alt, block.originalSrc));
            break;
        }
      }

      msgEl.appendChild(body);
      frag.appendChild(msgEl);
    }

    // Extraction failure message
    if (data.extractionFailed) {
      const failEl = document.createElement('div');
      failEl.className = 'chat-extraction-failed';
      failEl.innerHTML = '<span class="fail-icon">⚠️</span> Unable to parse chat — the Antigravity DOM structure may have changed.';
      frag.appendChild(failEl);
    }

    // Generating indicator
    if (data.isGenerating) {
      const genEl = document.createElement('div');
      genEl.className = 'chat-generating';
      genEl.innerHTML = '<div class="generating-dots"><span></span><span></span><span></span></div> Thinking...';
      frag.appendChild(genEl);
    }

    // Capture scroll state
    const scrollPos = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const isNearBottom = scrollHeight - scrollPos - clientHeight < 120;
    const isUserLocked = Date.now() < userScrollLockUntil;

    container.innerHTML = '';
    container.appendChild(frag);

    // Smart scroll
    if (isUserLocked) {
      const pct = scrollHeight > 0 ? scrollPos / scrollHeight : 0;
      container.scrollTop = container.scrollHeight * pct;
    } else if (isNearBottom || scrollPos === 0) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    } else {
      container.scrollTop = scrollPos;
    }
  }

  function createCodeBlock(language, content) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-code-block';

    const header = document.createElement('div');
    header.className = 'code-header';

    const langSpan = document.createElement('span');
    langSpan.className = 'code-lang';
    langSpan.textContent = language || 'code';
    header.appendChild(langSpan);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy-btn';
    copyBtn.innerHTML = ICON_COPY + ' Copy';
    copyBtn.onclick = async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(content);
        copyBtn.innerHTML = ICON_CHECK + ' Copied';
        setTimeout(() => { copyBtn.innerHTML = ICON_COPY + ' Copy'; }, 2000);
      } catch { /* */ }
    };
    header.appendChild(copyBtn);
    wrapper.appendChild(header);

    const pre = document.createElement('pre');
    pre.className = 'code-pre';
    const code = document.createElement('code');
    code.textContent = content;
    pre.appendChild(code);
    wrapper.appendChild(pre);

    return wrapper;
  }

  function createImageBlock(src, alt, originalSrc) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-image';

    // Oversized image placeholder (src is null when image exceeds 500KB cap)
    if (!src) {
      wrapper.className += ' chat-image-placeholder';
      const notice = document.createElement('div');
      notice.className = 'image-placeholder-notice';
      notice.innerHTML = `<span class="placeholder-icon">🖼️</span> ${alt || 'Image too large'}`;
      wrapper.appendChild(notice);
      return wrapper;
    }

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || 'Image';
    img.loading = 'lazy';

    img.onclick = () => {
      const lb = document.createElement('div');
      lb.className = 'image-lightbox';
      const lbImg = document.createElement('img');
      lbImg.src = src;
      lbImg.alt = alt || 'Image';
      lb.appendChild(lbImg);
      lb.onclick = () => lb.remove();
      document.body.appendChild(lb);
    };

    wrapper.appendChild(img);
    return wrapper;
  }

  // ── Message Polling ──

  function startMessagePolling(id) {
    stopMessagePolling();
    const loading = $('#chat-loading');
    const container = $('#chat-messages');

    container.onscroll = () => {
      userScrollLockUntil = Date.now() + SCROLL_LOCK_DURATION;
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll > 0) {
        const scrollPercent = container.scrollTop / maxScroll;
        api(`/api/sessions/${id}/scroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scrollPercent }),
        }).catch(() => {});
      }
    };

    async function poll() {
      if (currentView !== 'session' || activeSessionId !== id) return;
      try {
        const data = await api(`/api/sessions/${id}/messages`);
        if (data.hash !== lastSnapshotHash) {
          lastSnapshotHash = data.hash;
          renderMessages(data);
          loading.classList.add('hidden');
        }
      } catch {
        // CDP might not be ready yet
      }
      snapshotTimer = setTimeout(poll, 1000);
    }

    poll();
  }

  function stopMessagePolling() {
    if (snapshotTimer) {
      clearTimeout(snapshotTimer);
      snapshotTimer = null;
    }
  }

  async function sendMessage() {
    const input = $('#msg-input');
    const msg = input.value.trim();
    if (!msg || !activeSessionId) return;

    input.value = '';
    input.style.height = 'auto'; // reset height
    input.blur(); // close keyboard on mobile

    try {
      await api(`/api/sessions/${activeSessionId}/send`, {
        method: 'POST',
        body: JSON.stringify({ message: msg }),
      });
    } catch (err) {
      alert('Send failed: ' + err.message);
    }
  }

  // ── Settings ──

  async function loadSettings() {
    try {
      const health = await api('/health');
      $('#server-info').innerHTML = `
        <div class="info-row"><span class="label">Status</span><span class="value">${health.status}</span></div>
        <div class="info-row"><span class="label">Uptime</span><span class="value">${formatUptime(Math.floor(health.uptime))}</span></div>
        <div class="info-row"><span class="label">Sessions</span><span class="value">${health.sessions}</span></div>
      `;

      const net = await api('/api/network');
      $('#network-info').innerHTML = (net.interfaces || []).map((i) => `
        <div class="info-row">
          <span class="label">${i.name} (${i.type})</span>
          <span class="value">${i.ip}</span>
        </div>
      `).join('') || '<p class="muted">No interfaces detected</p>';
    } catch (err) {
      $('#server-info').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
    }
  }

  // ── Helpers ──

  function basename(p) { return p.split('/').filter(Boolean).pop() || p; }

  function statusDot(s) {
    const dots = { running: '🟢', starting: '🟡', stopped: '⚪', error: '🔴' };
    return dots[s] || '⚪';
  }

  function formatUptime(secs) {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m`;
    return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  }

  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function fileIcon(name) {
    const ext = name.split('.').pop()?.toLowerCase();
    const icons = {
      js: '📜', ts: '📘', py: '🐍', rs: '🦀', go: '🐹',
      md: '📝', json: '📋', yaml: '⚙', yml: '⚙', toml: '⚙',
      html: '🌐', css: '🎨', svg: '🖼', png: '🖼', jpg: '🖼',
    };
    return icons[ext] || '📄';
  }

  // ── Global callbacks (used in inline onclick) ──

  window._openSession = (id) => navigate('session', { id });
  window._stopSession = async (id) => {
    if (!confirm('Close this session window?')) return;
    try {
      await api(`/api/sessions/${id}`, { method: 'DELETE' });
      loadDashboard();
    } catch (err) {
      alert('Close failed: ' + err.message);
    }
  };
  window._deleteSession = async (id) => {
    if (!confirm('Delete this session permanently?')) return;
    try {
      await api(`/api/sessions/${id}?purge=true`, { method: 'DELETE' });
      loadDashboard();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };
  window._nav = (view) => navigate(view);
  window._browse = (path) => loadDirectory(path);
  window._selectDir = (path) => {
    selectedDir = path;
    updateSelectedBar();
  };

  // ── Event bindings ──

  $('#btn-new').onclick = () => navigate('new');
  $('#btn-new-empty').onclick = () => navigate('new');
  $('#btn-playground').onclick = () => launchSession(null);
  $('#btn-settings').onclick = () => navigate('settings');
  $('#btn-back').onclick = () => navigate('dashboard');
  $('#btn-launch').onclick = () => launchSession(selectedDir);
  $('#btn-send').onclick = sendMessage;

  // Textarea: Enter sends, Shift+Enter for newline
  const msgInput = $('#msg-input');
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  // Auto-resize textarea
  msgInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });

  // Quick action pills
  $$('.action-chip[data-action]').forEach(chip => {
    chip.onclick = () => {
      msgInput.value = chip.dataset.action;
      msgInput.style.height = 'auto';
      msgInput.style.height = msgInput.scrollHeight + 'px';
      msgInput.focus();
    };
  });

  $('#btn-stop').onclick = async () => {
    if (!activeSessionId) return;
    try {
      await api(`/api/sessions/${activeSessionId}/stop-gen`, { method: 'POST' });
    } catch { /* */ }
  };
  $('#btn-new-chat').onclick = async () => {
    if (!activeSessionId) return;
    try {
      await api(`/api/sessions/${activeSessionId}/new-chat`, { method: 'POST' });
    } catch { /* */ }
  };

  // Mode chips
  $$('.mode-chip[data-mode]').forEach((chip) => {
    chip.onclick = async () => {
      if (!activeSessionId) return;
      try {
        await api(`/api/sessions/${activeSessionId}/set-mode`, {
          method: 'POST',
          body: JSON.stringify({ mode: chip.dataset.mode }),
        });
        $$('.mode-chip[data-mode]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      } catch { /* */ }
    };
  });

  // Hash routing
  window.onhashchange = () => {
    const hash = location.hash.replace('#', '') || 'dashboard';
    const parts = hash.split('/');
    if (parts[0] === 'session' && parts[1]) {
      navigate('session', { id: parts[1] });
    } else {
      navigate(parts[0]);
    }
  };

  // ── Auth / Login ──

  async function checkAuth() {
    if (!AUTH_TOKEN) return false;
    try {
      const res = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AUTH_TOKEN}` },
      });
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  }

  function showLogin() {
    $('#login-overlay').classList.remove('hidden');
    $('#app-header').classList.add('hidden');
    $('#app-main').classList.add('hidden');
  }

  function hideLogin() {
    $('#login-overlay').classList.add('hidden');
    $('#app-header').classList.remove('hidden');
    $('#app-main').classList.remove('hidden');
  }

  async function handleLogin() {
    const input = $('#login-token');
    const error = $('#login-error');
    const token = input.value.trim();
    if (!token) return;

    error.classList.add('hidden');

    try {
      const res = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem('ag_token', token);
        // Reload the AUTH_TOKEN in memory — reassigning the const via workaround
        location.reload();
      } else {
        error.classList.remove('hidden');
        input.select();
      }
    } catch {
      error.textContent = 'Connection failed';
      error.classList.remove('hidden');
    }
  }

  $('#btn-login').onclick = handleLogin;
  $('#login-token').onkeydown = (e) => { if (e.key === 'Enter') handleLogin(); };

  // ── Init ──

  async function init() {
    const authed = await checkAuth();
    if (!authed) {
      showLogin();
      return;
    }

    hideLogin();
    connectWS();
    const initHash = location.hash.replace('#', '') || 'dashboard';
    const initParts = initHash.split('/');
    if (initParts[0] === 'session' && initParts[1]) {
      navigate('session', { id: initParts[1] });
    } else {
      navigate(initParts[0] || 'dashboard');
    }
  }

  init();
})();
