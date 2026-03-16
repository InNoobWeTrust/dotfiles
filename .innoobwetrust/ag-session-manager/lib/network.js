/**
 * lib/network.js — Network interface detection and utilities
 *
 * Spec: docs/specs/network-security.md
 * Detects LAN and Tailscale interfaces. Provides bind address calculation.
 */

const os = require('os');
const net = require('net');

/**
 * Detect all network interfaces and classify them.
 * @returns {Array<{name: string, ip: string, type: 'loopback'|'lan'|'tailscale'}>}
 */
function detectInterfaces() {
  const interfaces = os.networkInterfaces();
  const result = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      // Skip IPv6 and internal-only (except loopback)
      if (addr.family !== 'IPv4') continue;

      let type = 'lan';
      if (addr.internal) {
        type = 'loopback';
      } else if (isTailscaleInterface(name, addr.address)) {
        type = 'tailscale';
      }

      result.push({ name, ip: addr.address, type });
    }
  }

  return result;
}

/**
 * Check if an interface is a Tailscale interface.
 * Detection by name pattern (tailscale0, utun*) or IP range (100.64.0.0/10).
 */
function isTailscaleInterface(name, ip) {
  // Name-based detection
  if (/^tailscale/i.test(name) || /^utun\d+$/i.test(name)) return true;

  // IP range detection: 100.64.0.0/10 (Tailscale CGNAT range)
  const parts = ip.split('.').map(Number);
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;

  return false;
}

/**
 * Get addresses the server should bind to.
 * @param {string} mode - 'auto' or comma-separated IPs
 * @returns {string[]} Array of IP addresses
 */
function getBindAddresses(mode = 'auto') {
  if (mode !== 'auto') {
    return mode.split(',').map(s => s.trim()).filter(Boolean);
  }

  const interfaces = detectInterfaces();
  // Always include loopback
  const addresses = ['127.0.0.1'];

  for (const iface of interfaces) {
    if (iface.type !== 'loopback' && !addresses.includes(iface.ip)) {
      addresses.push(iface.ip);
    }
  }

  return addresses;
}

/**
 * Check if a port is available on a given host.
 * @param {number} port
 * @param {string} host
 * @returns {Promise<boolean>}
 */
function isPortAvailable(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

/**
 * Find the next available port in a range.
 * @param {number} start
 * @param {number} end
 * @returns {Promise<number|null>}
 */
async function findAvailablePort(start, end) {
  for (let port = start; port <= end; port++) {
    if (await isPortAvailable(port)) return port;
  }
  return null;
}

/**
 * Get a human-readable summary of the server's network info.
 */
function getNetworkInfo() {
  const interfaces = detectInterfaces();
  return {
    interfaces,
    lan: interfaces.filter(i => i.type === 'lan').map(i => i.ip),
    tailscale: interfaces.filter(i => i.type === 'tailscale').map(i => i.ip),
    loopback: interfaces.filter(i => i.type === 'loopback').map(i => i.ip),
  };
}

module.exports = {
  detectInterfaces,
  getBindAddresses,
  isPortAvailable,
  findAvailablePort,
  getNetworkInfo,
};
