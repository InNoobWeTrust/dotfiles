#!/usr/bin/env bash
# start.sh — Antigravity Session Manager launcher
# Checks deps, installs if needed, starts the server.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "  🚀 Antigravity Session Manager"
echo "  ───────────────────────────────"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "  ❌ Node.js not found. Install Node.js ≥ 18 first."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "  ❌ Node.js ≥ 18 required (found v$(node -v))"
  exit 1
fi

echo "  ✅ Node.js $(node -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "  📦 Installing dependencies..."
  npm install --production
  echo ""
fi

# Copy .env if not exists
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "  📝 Created .env from .env.example (edit to configure)"
  fi
fi

# Start server
echo ""
exec node server.js
