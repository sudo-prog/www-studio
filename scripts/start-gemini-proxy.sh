#!/usr/bin/env bash
# ┌─────────────────────────────────────────────────────────────────┐
# │  start-gemini-proxy.sh                                          │
# │  Starts the gemini-web2api Python proxy on localhost:8081       │
# └─────────────────────────────────────────────────────────────────┘
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GEMINI_DIR="$PROJECT_ROOT/lib/integrations/gemini-web2api"
PORT="${GEMINI_WEB2API_PORT:-8081}"
CONFIG_FILE="$GEMINI_DIR/config.json"

# ── Colours ────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[gemini-proxy]${NC} $*"; }
ok()    { echo -e "${GREEN}[gemini-proxy]${NC} $*"; }
warn()  { echo -e "${YELLOW}[gemini-proxy]${NC} $*"; }
err()   { echo -e "${RED}[gemini-proxy]${NC} $*"; }

# ── Check Python ───────────────────────────────────────────────────
if command -v python3 &>/dev/null; then
  PYTHON=python3
elif command -v python &>/dev/null; then
  PYTHON=python
else
  err "Python 3 is required but not found. Install it and retry."
  exit 1
fi

PYTHON_VERSION=$($PYTHON --version 2>&1 | awk '{print $2}')
info "Using Python: $PYTHON ($PYTHON_VERSION)"

# ── Check httpx dependency ─────────────────────────────────────────
if ! $PYTHON -c "import httpx" 2>/dev/null; then
  warn "httpx is not installed. Installing from requirements.txt..."
  if [ -f "$GEMINI_DIR/requirements.txt" ]; then
    $PYTHON -m pip install -r "$GEMINI_DIR/requirements.txt" --quiet
    ok "Dependencies installed."
  else
    $PYTHON -m pip install httpx --quiet
    ok "httpx installed."
  fi
fi

# ── Create default config if missing ───────────────────────────────
if [ ! -f "$CONFIG_FILE" ]; then
  info "No config.json found — creating default configuration."
  cp "$GEMINI_DIR/config.example.json" "$CONFIG_FILE"
  warn "Created $CONFIG_FILE — review and customise it if needed."
fi

# ── Start the proxy ────────────────────────────────────────────────
ok "Starting gemini-web2api proxy on port $PORT..."
info "Config: $CONFIG_FILE"
info "API:    http://localhost:$PORT/v1"
echo ""

cd "$GEMINI_DIR"
exec $PYTHON gemini_web2api.py --port "$PORT" --config "$CONFIG_FILE"
