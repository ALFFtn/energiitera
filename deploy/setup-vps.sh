#!/bin/bash
# =============================================================
# Setup VPS — jalankan SEKALI di VPS baru
# Ubuntu 22.04 / Debian 12
# Usage: curl -fsSL <url>/deploy/setup-vps.sh | bash
# =============================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }

# ── 1. Install Docker Engine ──────────────────────────────────
log "Installing Docker Engine..."
if command -v docker &>/dev/null; then
    warn "Docker already installed: $(docker --version)"
else
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER"
    log "Docker installed. Re-login or run: newgrp docker"
fi

# ── 2. Verify Docker Compose plugin ──────────────────────────
if docker compose version &>/dev/null 2>&1; then
    log "Docker Compose available: $(docker compose version)"
else
    warn "Docker Compose plugin not found — installing..."
    sudo apt-get install -y docker-compose-plugin
fi

# ── 3. Clone repo ─────────────────────────────────────────────
REPO_URL="${REPO_URL:-https://github.com/YOUR_USER/YOUR_REPO.git}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/dashboard-energy}"

if [ -d "$DEPLOY_DIR/.git" ]; then
    warn "Repo already cloned at $DEPLOY_DIR"
else
    log "Cloning repo to $DEPLOY_DIR..."
    sudo git clone "$REPO_URL" "$DEPLOY_DIR"
    sudo chown -R "$USER:$USER" "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR"

# ── 4. Create .env from example ───────────────────────────────
if [ ! -f .env ]; then
    log "Creating .env from .env.example..."
    cp .env.example .env
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
    sed -i "s/YOUR_VPS_IP_HERE/$SERVER_IP/g" .env
    echo ""
    warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    warn " WAJIB: Edit .env dan ganti semua password!"
    warn " nano $DEPLOY_DIR/.env"
    warn "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    warn ".env already exists, skipping."
fi

log "Setup selesai!"
log "Langkah selanjutnya:"
log "  1. Edit .env: nano $DEPLOY_DIR/.env"
log "  2. Deploy:    cd $DEPLOY_DIR && ./deploy/deploy.sh"
