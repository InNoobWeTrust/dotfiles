/**
 * lib/cdp-bridge.js — Chrome DevTools Protocol bridge for Antigravity sessions
 *
 * Spec: docs/specs/chat-interaction.md
 * Connects to Antigravity via CDP, captures DOM snapshots, sends commands.
 * Adapted from antigravity_phone_chat reference project.
 */

const WebSocket = require('ws');
const http = require('http');

class CDPBridge {
  /**
   * @param {number} port - CDP debug port
   */
  constructor(port) {
    this.port = port;
    this.ws = null;
    this.connected = false;
    this.pendingCalls = new Map();
    this.callId = 1;
    this._reconnectTimer = null;
    this._reconnectAttempts = 0;
    this._maxReconnectAttempts = 30;
    this.lastSnapshot = null;
    this.lastSnapshotHash = null;
    this.screencastRunning = false;
    this.onFrame = null; // callback: (base64Data) => void
  }

  /**
   * Discover the CDP WebSocket URL for the Antigravity page.
   * @returns {Promise<string|null>}
   */
  async discover() {
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${this.port}/json`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const targets = JSON.parse(data);
            const page = targets.find(t => t.type === 'page');
            resolve(page ? page.webSocketDebuggerUrl : null);
          } catch {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(3000, () => { req.destroy(); resolve(null); });
    });
  }

  /**
   * Connect to the CDP WebSocket.
   * @returns {Promise<boolean>}
   */
  async connect() {
    const wsUrl = await this.discover();
    if (!wsUrl) return false;

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => {
          this.connected = true;
          this._reconnectAttempts = 0;
          console.log(`[cdp] Connected to port ${this.port}`);
          // Enable DOM and Runtime domains
          this._send('Runtime.enable');
          this._send('DOM.enable');
          resolve(true);
        });

        this.ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.id && this.pendingCalls.has(msg.id)) {
              const { resolve: res, timer } = this.pendingCalls.get(msg.id);
              clearTimeout(timer);
              this.pendingCalls.delete(msg.id);
              res(msg.result || {});
            }
          } catch { /* ignore parse errors */ }
        });

        this.ws.on('close', () => {
          this.connected = false;
          console.log(`[cdp] Disconnected from port ${this.port}`);
          this._scheduleReconnect();
        });

        this.ws.on('error', (err) => {
          console.error(`[cdp] Error on port ${this.port}:`, err.message);
          this.connected = false;
        });
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Connect directly to a known CDP WebSocket URL (skip discovery).
   * @param {string} wsUrl - Full WebSocket URL from CDP /json
   * @returns {Promise<boolean>}
   */
  async connectToUrl(wsUrl) {
    if (!wsUrl) return false;

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => {
          this.connected = true;
          this._reconnectAttempts = 0;
          console.log(`[cdp] Connected to ${wsUrl.slice(0, 60)}...`);
          // Enable DOM, Runtime, and Page domains
          this._send('Runtime.enable');
          this._send('DOM.enable');
          this._send('Page.enable');
          resolve(true);
        });

        this.ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString());
            // Handle CDP method responses
            if (msg.id && this.pendingCalls.has(msg.id)) {
              const { resolve: res, timer } = this.pendingCalls.get(msg.id);
              clearTimeout(timer);
              this.pendingCalls.delete(msg.id);
              res(msg.result || {});
            }
            // Handle screencast frame events
            if (msg.method === 'Page.screencastFrame' && msg.params) {
              const { data: frameData, sessionId: frameSessionId } = msg.params;
              // ACK so CDP sends the next frame
              this._send('Page.screencastFrameAck', { sessionId: frameSessionId }).catch(() => {});
              if (this.onFrame) this.onFrame(frameData);
            }
          } catch { /* ignore parse errors */ }
        });

        this.ws.on('close', () => {
          this.connected = false;
          console.log(`[cdp] Disconnected from port ${this.port}`);
        });

        this.ws.on('error', (err) => {
          console.error(`[cdp] Error:`, err.message);
          this.connected = false;
        });

        // Timeout if connection takes too long
        setTimeout(() => {
          if (!this.connected) {
            try { this.ws.close(); } catch { /* */ }
            resolve(false);
          }
        }, 5000);
      } catch {
        resolve(false);
      }
    });
  }

  _scheduleReconnect() {
    if (this._reconnectAttempts >= this._maxReconnectAttempts) return;
    this._reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this._reconnectAttempts), 30000);
    this._reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  /**
   * Send a CDP command and wait for response.
   * @param {string} method
   * @param {object} [params]
   * @param {number} [timeout=30000]
   * @returns {Promise<object>}
   */
  _send(method, params = {}, timeout = 30000) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('CDP not connected'));
      }

      const id = this.callId++;
      const timer = setTimeout(() => {
        this.pendingCalls.delete(id);
        reject(new Error(`CDP call timeout: ${method}`));
      }, timeout);

      this.pendingCalls.set(id, { resolve, timer });

      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  /**
   * Start streaming screencast frames from the Antigravity window.
   * Frames are delivered via the `onFrame` callback.
   * @param {object} [opts]
   * @param {number} [opts.maxWidth=1280]
   * @param {number} [opts.maxHeight=960]
   * @param {number} [opts.quality=60]
   * @param {number} [opts.everyNthFrame=1] - 1 = every frame
   */
  async startScreencast(opts = {}) {
    if (!this.connected) return;
    if (this.screencastRunning) return;

    try {
      await this._send('Page.startScreencast', {
        format: 'jpeg',
        quality: opts.quality || 60,
        maxWidth: opts.maxWidth || 1280,
        maxHeight: opts.maxHeight || 960,
        everyNthFrame: opts.everyNthFrame || 1,
      });
      this.screencastRunning = true;
      console.log(`[cdp] Screencast started`);
    } catch (err) {
      console.error(`[cdp] Screencast start error:`, err.message);
    }
  }

  /**
   * Stop the screencast stream.
   */
  async stopScreencast() {
    if (!this.screencastRunning) return;
    try {
      await this._send('Page.stopScreencast');
      this.screencastRunning = false;
      console.log(`[cdp] Screencast stopped`);
    } catch (err) {
      console.error(`[cdp] Screencast stop error:`, err.message);
    }
  }

  /**
   * Extract structured chat messages from the Antigravity window.
   * Runs a script inside the browser context that identifies message turns,
   * extracts typed content blocks, and converts images to base64.
   * @returns {Promise<{messages: Array, isGenerating: boolean, hash: string}|null>}
   */
  async extractMessages() {
    if (!this.connected) return null;

    const EXTRACT_SCRIPT = `(async () => {
      // ── Find chat container ──
      const cascade = document.getElementById('conversation')
        || document.getElementById('chat')
        || document.getElementById('cascade');
      if (!cascade) {
        const childIds = Array.from(document.body.children).map(c => c.id).filter(Boolean);
        return { error: 'chat_container_not_found', debug: { availableIds: childIds } };
      }

      // ── Check if AI is currently generating ──
      const cancelBtn = document.querySelector('[data-tooltip-id="input-send-button-cancel-tooltip"]');
      const isGenerating = !!(cancelBtn && cancelBtn.offsetParent !== null);

      // ── Find the scrollable message area ──
      const scrollArea = cascade.querySelector('.overflow-y-auto, [data-scroll-area]') || cascade;

      // ── Discover message turns ──
      // Strategy: Look for top-level children of the scroll area that represent
      // alternating user/assistant turns. Antigravity typically structures this as
      // a series of div wrappers, each containing one turn.
      const messages = [];

      // Helper: classify a DOM element as user or assistant message
      function classifyRole(el) {
        // Check for explicit data attributes
        const role = el.getAttribute('data-message-role') || el.getAttribute('data-role');
        if (role) return role.toLowerCase().includes('user') ? 'user' : 'assistant';

        // Check for user-indicator patterns
        const text = el.textContent || '';
        const html = el.innerHTML || '';

        // User messages often have "You" label or user avatar patterns
        const hasUserLabel = el.querySelector('[class*="user"], [data-testid*="user"]');
        if (hasUserLabel) return 'user';

        // Check for contenteditable (input area — skip)
        if (el.querySelector('[contenteditable="true"]')) return 'skip';

        // Check class names for role hints
        const cls = el.className || '';
        if (typeof cls === 'string') {
          if (cls.includes('user') || cls.includes('human')) return 'user';
          if (cls.includes('assistant') || cls.includes('agent') || cls.includes('model') || cls.includes('ai')) return 'assistant';
        }

        return null; // unknown
      }

      // Helper: extract content blocks from a message element
      async function extractBlocks(el) {
        const blocks = [];

        // Walk through the element's content
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT, {
          acceptNode: (node) => {
            // Skip hidden elements
            if (node.offsetParent === null && node.tagName !== 'IMG') return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        });

        // Collect code blocks first (to exclude them from text extraction)
        const codeBlocks = new Set();
        el.querySelectorAll('pre').forEach(pre => {
          codeBlocks.add(pre);
          const codeEl = pre.querySelector('code') || pre;
          const content = (codeEl.textContent || '').trim();
          if (!content) return;

          // Try to detect language from class
          let language = '';
          const codeClasses = (codeEl.className || '').toString();
          const langMatch = codeClasses.match(/language-(\\w+)/);
          if (langMatch) language = langMatch[1];

          // Check for a language label in sibling/parent elements
          if (!language) {
            const header = pre.previousElementSibling;
            if (header) {
              const headerText = (header.textContent || '').trim().toLowerCase();
              if (headerText.length < 30) language = headerText;
            }
          }

          blocks.push({ type: 'code', language, content });
        });

        // Collect images
        const imgPromises = [];
        const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500KB cap per spec challenge
        el.querySelectorAll('img').forEach(img => {
          const src = img.getAttribute('src') || '';
          if (!src) return;

          // Already a data URI — check size
          if (src.startsWith('data:')) {
            if (src.length > MAX_IMAGE_SIZE_BYTES * 1.37) { // base64 overhead ≈ 1.37x
              blocks.push({ type: 'image', src: null, alt: 'Image too large', originalSrc: src.slice(0, 100) + '...' });
            } else {
              blocks.push({ type: 'image', src, alt: img.alt || '' });
            }
            return;
          }

          // Local paths need conversion to base64
          imgPromises.push((async () => {
            try {
              const res = await fetch(src);
              const blob = await res.blob();
              // Check size before encoding
              if (blob.size > MAX_IMAGE_SIZE_BYTES) {
                blocks.push({ type: 'image', src: null, alt: 'Image too large', originalSrc: src });
                return;
              }
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  blocks.push({ type: 'image', src: reader.result, alt: img.alt || '' });
                  resolve();
                };
                reader.onerror = () => resolve();
                reader.readAsDataURL(blob);
              });
            } catch {
              // Image couldn't be loaded — skip
            }
          })());
        });

        await Promise.all(imgPromises);

        // Extract remaining text/HTML content (excluding code blocks and images)
        // Clone the element, remove code blocks and images, then get the cleaned HTML
        const clone = el.cloneNode(true);

        // Remove code blocks from clone
        clone.querySelectorAll('pre').forEach(pre => pre.remove());

        // Remove images from clone (they're handled separately)
        clone.querySelectorAll('img').forEach(img => {
          // Keep alt text as placeholder
          const span = document.createElement('span');
          img.replaceWith(span);
        });

        // Remove any input/interaction areas
        clone.querySelectorAll('[contenteditable], textarea, input, button').forEach(el => el.remove());

        // Clean up: remove elements that are just containers for status bars
        clone.querySelectorAll('*').forEach(el => {
          const t = (el.textContent || '').toLowerCase();
          if (t.includes('review changes') || t.includes('files with changes') || t.includes('context found')) {
            if (el.children.length < 10) el.remove();
          }
        });

        const textHtml = clone.innerHTML.trim();
        if (textHtml && textHtml !== '<span></span>') {
          // Insert text block at the beginning (before code/images)
          blocks.unshift({ type: 'text', html: textHtml });
        }

        return blocks;
      }

      // ── Walk the scroll area's children to find message turns ──
      // Strategy 1: Direct children of scroll area as turns
      const children = Array.from(scrollArea.children).filter(child => {
        // Skip tiny/empty elements and navigation/toolbar elements
        const text = (child.textContent || '').trim();
        if (!text && !child.querySelector('img')) return false;
        if (child.tagName === 'STYLE' || child.tagName === 'SCRIPT') return false;
        // Skip interaction/input area
        if (child.querySelector('[contenteditable="true"]')) return false;
        return true;
      });

      // Try to classify each child
      let lastRole = null;
      for (const child of children) {
        let role = classifyRole(child);
        if (role === 'skip') continue;

        // If we can't classify, alternate based on position
        if (!role) {
          // Heuristic: if it has substantial content and follows a user message,
          // it's likely an assistant response (and vice versa)
          role = lastRole === 'user' ? 'assistant' : (lastRole === 'assistant' ? 'user' : 'assistant');
        }

        const blocks = await extractBlocks(child);
        if (blocks.length > 0) {
          messages.push({ role, blocks });
          lastRole = role;
        }
      }

      // If no messages found with Strategy 1, try looking deeper
      if (messages.length === 0) {
        // Strategy 2: Look for message-like containers
        const msgCandidates = scrollArea.querySelectorAll(
          '[data-message-role], [class*="message"], [class*="turn"], [class*="chat-entry"]'
        );
        for (const el of msgCandidates) {
          let role = classifyRole(el);
          if (!role || role === 'skip') {
            role = lastRole === 'user' ? 'assistant' : 'user';
          }
          const blocks = await extractBlocks(el);
          if (blocks.length > 0) {
            messages.push({ role, blocks });
            lastRole = role;
          }
        }
      }

      // ── Extraction failure detection ──
      const hasContent = !!(cascade.textContent || '').trim();
      const extractionFailed = messages.length === 0 && hasContent;

      return {
        messages,
        isGenerating,
        extractionFailed,
        debug: {
          containerId: cascade.id,
          scrollAreaClass: scrollArea.className?.toString().slice(0, 100),
          childCount: children.length,
          messageCount: messages.length,
        }
      };
    })()`;

    try {
      const result = await this._send('Runtime.evaluate', {
        expression: EXTRACT_SCRIPT,
        returnByValue: true,
        awaitPromise: true,
      });

      if (!result || !result.result || !result.result.value) return null;
      const val = result.result.value;
      if (val.error) {
        console.error(`[cdp] Extract error:`, val.error, val.debug);
        return null;
      }

      // Compute hash for change detection
      const msgDigest = JSON.stringify(val.messages.map(m =>
        m.blocks.map(b => b.type === 'image' ? b.alt : (b.html || b.content || '')).join('')
      ));
      const hash = require('crypto')
        .createHash('md5')
        .update(msgDigest)
        .digest('hex');

      if (val.debug && val.debug.messageCount === 0) {
        console.log(`[cdp] Extract debug:`, val.debug);
      }

      return {
        messages: val.messages,
        isGenerating: val.isGenerating,
        extractionFailed: val.extractionFailed || false,
        hash,
      };
    } catch (err) {
      console.error(`[cdp] Extract error:`, err.message);
      return null;
    }
  }

  /**
   * Capture a DOM snapshot of the Antigravity chat window.
   * Clones the chat DOM, strips the input area, fixes inline elements,
   * converts local images, and returns HTML+CSS for rendering.
   * Adapted from antigravity_phone_chat reference project.
   * @returns {Promise<{html: string, css: string, scrollInfo: object}|null>}
   */
  async captureSnapshot() {
    if (!this.connected) return null;

    const CAPTURE_SCRIPT = `(async () => {
      const cascade = document.getElementById('conversation') || document.getElementById('chat') || document.getElementById('cascade');
      if (!cascade) {
        const childIds = Array.from(document.body.children).map(c => c.id).filter(id => id).join(', ');
        return { error: 'chat container not found', debug: { availableIds: childIds } };
      }

      // Find the main scrollable container
      const scrollContainer = cascade.querySelector('.overflow-y-auto, [data-scroll-area]') || cascade;
      const scrollInfo = {
        scrollTop: scrollContainer.scrollTop,
        scrollHeight: scrollContainer.scrollHeight,
        clientHeight: scrollContainer.clientHeight,
        scrollPercent: scrollContainer.scrollTop / (scrollContainer.scrollHeight - scrollContainer.clientHeight) || 0
      };

      const clone = cascade.cloneNode(true);

      // Remove interaction/input area
      try {
        const selectors = [
          '.relative.flex.flex-col.gap-8',
          '.flex.grow.flex-col.justify-start.gap-8',
          'div[class*="interaction-area"]',
          '.p-1.bg-gray-500\\\\/10',
          '.outline-solid.justify-between',
          '[contenteditable="true"]'
        ];
        selectors.forEach(sel => {
          clone.querySelectorAll(sel).forEach(el => {
            try {
              if (sel === '[contenteditable="true"]') {
                const area = el.closest('.relative.flex.flex-col.gap-8') ||
                             el.closest('.flex.grow.flex-col.justify-start.gap-8') ||
                             el.closest('div[id^="interaction"]') ||
                             el.parentElement?.parentElement;
                if (area && area !== clone) area.remove();
                else el.remove();
              } else { el.remove(); }
            } catch(e) {}
          });
        });

        // Text-based cleanup for stray status bars
        clone.querySelectorAll('*').forEach(el => {
          try {
            const text = (el.innerText || '').toLowerCase();
            if (text.includes('review changes') || text.includes('files with changes') || text.includes('context found')) {
              if (el.children.length < 10 || el.querySelector('button') || el.classList?.contains('justify-between')) {
                el.remove();
              }
            }
          } catch(e) {}
        });
      } catch(e) {}

      // Convert local images to base64
      const images = clone.querySelectorAll('img');
      await Promise.all(Array.from(images).map(async (img) => {
        const rawSrc = img.getAttribute('src');
        if (rawSrc && (rawSrc.startsWith('/') || rawSrc.startsWith('vscode-file:')) && !rawSrc.startsWith('data:')) {
          try {
            const res = await fetch(rawSrc);
            const blob = await res.blob();
            await new Promise(r => {
              const reader = new FileReader();
              reader.onloadend = () => { img.src = reader.result; r(); };
              reader.onerror = () => r();
              reader.readAsDataURL(blob);
            });
          } catch(e) {}
        }
      }));

      // Fix inline file references: convert div inside inline parent to span
      try {
        const inlineTags = new Set(['SPAN', 'P', 'A', 'LABEL', 'EM', 'STRONG', 'CODE']);
        for (const div of Array.from(clone.querySelectorAll('div'))) {
          try {
            if (!div.parentNode) continue;
            const parent = div.parentElement;
            if (!parent) continue;
            const parentIsInline = inlineTags.has(parent.tagName) ||
              (parent.className && (parent.className.includes('inline-flex') || parent.className.includes('inline-block')));
            if (parentIsInline) {
              const span = document.createElement('span');
              while (div.firstChild) span.appendChild(div.firstChild);
              if (div.className) span.className = div.className;
              if (div.getAttribute('style')) span.setAttribute('style', div.getAttribute('style'));
              span.style.display = 'inline-flex';
              span.style.alignItems = 'center';
              span.style.verticalAlign = 'middle';
              div.replaceWith(span);
            }
          } catch(e) {}
        }
      } catch(e) {}

      const html = clone.outerHTML;

      const rules = [];
      for (const sheet of document.styleSheets) {
        try { for (const rule of sheet.cssRules) rules.push(rule.cssText); } catch(e) {}
      }
      const allCSS = rules.join('\\n');

      return { html, css: allCSS, scrollInfo };
    })()`;

    try {
      const result = await this._send('Runtime.evaluate', {
        expression: CAPTURE_SCRIPT,
        returnByValue: true,
        awaitPromise: true,
      });

      if (!result || !result.result || !result.result.value) return null;
      const val = result.result.value;
      if (val.error) {
        console.error(`[cdp] Snapshot error:`, val.error, val.debug);
        return null;
      }

      // Compute hash for change detection
      const hash = require('crypto')
        .createHash('md5')
        .update(val.html)
        .digest('hex');

      this.lastSnapshot = { ...val, hash };
      this.lastSnapshotHash = hash;
      return this.lastSnapshot;
    } catch (err) {
      console.error(`[cdp] Snapshot error:`, err.message);
      return null;
    }
  }

  /**
   * Sync scroll position from phone back to the desktop Antigravity window.
   * @param {number} scrollPercent - 0 to 1
   */
  async remoteScroll(scrollPercent) {
    if (!this.connected) return;

    try {
      await this._send('Runtime.evaluate', {
        expression: `(async () => {
          const scrollables = [...document.querySelectorAll(
            '#conversation [class*="scroll"], #chat [class*="scroll"], #cascade [class*="scroll"]'
          )].filter(el => el.scrollHeight > el.clientHeight);

          const chatArea = document.querySelector(
            '#conversation .overflow-y-auto, #chat .overflow-y-auto, #cascade .overflow-y-auto, ' +
            '#conversation [data-scroll-area], #chat [data-scroll-area], #cascade [data-scroll-area]'
          );
          if (chatArea) scrollables.unshift(chatArea);

          if (scrollables.length === 0) {
            const cascade = document.getElementById('conversation') || document.getElementById('chat') || document.getElementById('cascade');
            if (cascade && cascade.scrollHeight > cascade.clientHeight) scrollables.push(cascade);
          }

          if (scrollables.length === 0) return { error: 'no scrollable' };

          const target = scrollables[0];
          const maxScroll = target.scrollHeight - target.clientHeight;
          target.scrollTop = maxScroll * ${scrollPercent};
          return { success: true, scrolled: target.scrollTop };
        })()`,
        returnByValue: true,
        awaitPromise: true,
      });
    } catch (err) {
      console.error(`[cdp] Scroll error:`, err.message);
    }
  }

  /**
   * Send a message to the Antigravity chat input.
   * Uses document.execCommand (handled natively by ProseMirror) + click submit.
   * Adapted from antigravity_phone_chat reference project.
   */
  async sendMessage(message) {
    if (!this.connected) throw new Error('CDP not connected');

    const safeText = JSON.stringify(message);

    const result = await this._send('Runtime.evaluate', {
      expression: `(async () => {
        // Check if Antigravity is busy generating
        const cancel = document.querySelector('[data-tooltip-id="input-send-button-cancel-tooltip"]');
        if (cancel && cancel.offsetParent !== null) return { ok: false, reason: "busy" };

        // Find the contenteditable editor inside the chat container
        const editors = [...document.querySelectorAll(
          '#conversation [contenteditable="true"], #chat [contenteditable="true"], #cascade [contenteditable="true"]'
        )].filter(el => el.offsetParent !== null);
        const editor = editors.at(-1);
        if (!editor) return { ok: false, error: "editor_not_found" };

        const textToInsert = ${safeText};

        // Focus, select all, delete, then insert
        editor.focus();
        document.execCommand?.("selectAll", false, null);
        document.execCommand?.("delete", false, null);

        let inserted = false;
        try { inserted = !!document.execCommand?.("insertText", false, textToInsert); } catch {}
        if (!inserted) {
          editor.textContent = textToInsert;
          editor.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, inputType: "insertText", data: textToInsert }));
          editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: textToInsert }));
        }

        // Wait for UI to process
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        // Click the submit button (arrow-right icon)
        const submit = document.querySelector("svg.lucide-arrow-right")?.closest("button");
        if (submit && !submit.disabled) {
          submit.click();
          return { ok: true, method: "click_submit" };
        }

        // Fallback: trigger Enter key
        editor.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter", code: "Enter" }));
        editor.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "Enter", code: "Enter" }));

        return { ok: true, method: "enter_keypress" };
      })()`,
      returnByValue: true,
      awaitPromise: true,
    });

    const val = result?.result?.value;
    if (val && !val.ok) {
      throw new Error(val.reason || val.error || 'Send failed');
    }
  }

  /**
   * Stop the current AI generation.
   */
  async stopGeneration() {
    if (!this.connected) throw new Error('CDP not connected');

    await this._send('Runtime.evaluate', {
      expression: `
        (function() {
          const stopBtn = document.querySelector('[aria-label*="stop"]') ||
                          document.querySelector('[aria-label*="Stop"]') ||
                          document.querySelector('button[class*="stop"]');
          if (stopBtn) stopBtn.click();
        })()
      `,
    });
  }

  /**
   * Get current mode and model state.
   * @returns {Promise<{mode: string, model: string}>}
   */
  async getAppState() {
    if (!this.connected) return { mode: 'unknown', model: 'unknown' };

    try {
      const result = await this._send('Runtime.evaluate', {
        expression: `
          (function() {
            // Try to detect mode from UI
            const modeEl = document.querySelector('[class*="mode"]') ||
                           document.querySelector('[aria-label*="mode"]');
            const mode = modeEl ? modeEl.textContent.trim() : 'unknown';

            // Try to detect model
            const modelEl = document.querySelector('[class*="model-selector"]') ||
                            document.querySelector('[class*="model"]');
            const model = modelEl ? modelEl.textContent.trim() : 'unknown';

            return JSON.stringify({ mode, model });
          })()
        `,
        returnByValue: true,
      });

      if (result && result.result && result.result.value) {
        return JSON.parse(result.result.value);
      }
    } catch { /* */ }
    return { mode: 'unknown', model: 'unknown' };
  }

  /**
   * Set mode (fast or planning).
   */
  async setMode(mode) {
    if (!this.connected) throw new Error('CDP not connected');

    const target = mode.toLowerCase() === 'fast' ? 'Fast' : 'Planning';
    await this._send('Runtime.evaluate', {
      expression: `
        (function() {
          const buttons = document.querySelectorAll('button, [role="button"]');
          for (const btn of buttons) {
            if (btn.textContent.trim().toLowerCase().includes('${target.toLowerCase()}')) {
              btn.click();
              return 'clicked';
            }
          }
          return 'not_found';
        })()
      `,
      returnByValue: true,
    });
  }

  /**
   * Set model.
   */
  async setModel(model) {
    if (!this.connected) throw new Error('CDP not connected');

    await this._send('Runtime.evaluate', {
      expression: `
        (function() {
          const selectors = document.querySelectorAll('[class*="model"] option, [class*="model"] [role="option"]');
          for (const opt of selectors) {
            if (opt.textContent.trim().toLowerCase().includes('${model.toLowerCase()}')) {
              opt.click();
              return 'selected';
            }
          }
          return 'not_found';
        })()
      `,
      returnByValue: true,
    });
  }

  /**
   * Start a new chat.
   */
  async newChat() {
    if (!this.connected) throw new Error('CDP not connected');

    await this._send('Runtime.evaluate', {
      expression: `
        (function() {
          const btns = document.querySelectorAll('button, [role="button"]');
          for (const btn of btns) {
            if (btn.textContent.toLowerCase().includes('new') &&
                btn.textContent.toLowerCase().includes('chat')) {
              btn.click();
              return 'clicked';
            }
            if (btn.getAttribute('aria-label')?.toLowerCase().includes('new chat')) {
              btn.click();
              return 'clicked';
            }
          }
          return 'not_found';
        })()
      `,
      returnByValue: true,
    });
  }

  /**
   * Check if CDP has a chat open.
   * @returns {Promise<boolean>}
   */
  async hasChatOpen() {
    if (!this.connected) return false;

    try {
      const result = await this._send('Runtime.evaluate', {
        expression: `
          !!(document.querySelector('#conversation') ||
             document.querySelector('#cascade') ||
             document.querySelector('[class*="conversation"]'))
        `,
        returnByValue: true,
      });
      return !!(result && result.result && result.result.value);
    } catch {
      return false;
    }
  }

  /**
   * Close the Antigravity window via CDP.
   */
  async closeWindow() {
    if (!this.connected) return;
    try {
      await this._send('Runtime.evaluate', {
        expression: 'window.close()',
        returnByValue: true,
      }, 3000);
    } catch { /* window may close before response */ }
    this.disconnect();
  }

  /**
   * Close the CDP connection.
   */
  disconnect() {
    if (this._reconnectTimer) clearTimeout(this._reconnectTimer);
    this._maxReconnectAttempts = 0; // prevent reconnect
    if (this.ws) {
      try { this.ws.close(); } catch { /* */ }
    }
    this.connected = false;
    this.pendingCalls.forEach(({ timer }) => clearTimeout(timer));
    this.pendingCalls.clear();
  }
}

module.exports = CDPBridge;
