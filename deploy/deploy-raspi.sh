#!/bin/bash
# =============================================================
# Deploy Script for Raspberry Pi
# Dashboard Energy - Grid Monitor
# =============================================================
# Jalankan script ini di Raspberry Pi setelah clone repo
# Usage: chmod +x deploy/deploy-raspi.sh && ./deploy/deploy-raspi.sh
# =============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
err()  { echo -e "${RED}[✗] $1${NC}"; }

# ── 1. System update & dependencies ──────────────────────────
log "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

log "Installing Node.js 20 LTS via NodeSource..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    warn "Node.js already installed: $(node -v)"
fi

log "Installing build tools & PostgreSQL..."
sudo apt-get install -y build-essential git nginx postgresql postgresql-contrib

# ── 2. PostgreSQL setup ──────────────────────────────────────
log "Setting up PostgreSQL..."
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Buat user & database jika belum ada
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='dashboard'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER dashboard WITH PASSWORD 'dashboard_energy_2026';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='dashboard_energy'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE dashboard_energy OWNER dashboard;"

log "PostgreSQL ready."

# ── 3. Install PM2 globally ──────────────────────────────────
if ! command -v pm2 &>/dev/null; then
    log "Installing PM2..."
    sudo npm install -g pm2
    pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | sudo bash
else
    warn "PM2 already installed."
fi

# ── 4. Project setup ─────────────────────────────────────────
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

log "Installing dependencies..."
npm install

# ── 5. Environment file ──────────────────────────────────────
if [ ! -f apps/api/.env ]; then
    log "Creating .env for API..."
    cp deploy/.env.production apps/api/.env
    warn "EDIT apps/api/.env — ganti JWT_SECRET dan sesuaikan password DB!"
fi

if [ ! -f apps/grid-monitor/.env ]; then
    RASPI_IP=$(hostname -I | awk '{print $1}')
    log "Creating .env for grid-monitor..."
    cat > apps/grid-monitor/.env <<EOF
VITE_API_URL=http://${RASPI_IP}:3001
VITE_SOCKET_URL=http://${RASPI_IP}:3001
EOF
fi

# ── 6. Build API ─────────────────────────────────────────────
log "Building API..."
cd apps/api
npx drizzle-kit migrate
npm run build
cd "$PROJECT_DIR"

# ── 7. Build Frontend ────────────────────────────────────────
log "Building frontend..."
cd apps/grid-monitor
npm run build
cd "$PROJECT_DIR"

# ── 8. Nginx config ──────────────────────────────────────────
log "Configuring Nginx..."
RASPI_IP=$(hostname -I | awk '{print $1}')

sudo tee /etc/nginx/sites-available/dashboard-energy > /dev/null <<NGINX
server {
    listen 80;
    server_name ${RASPI_IP} localhost _;

    # Frontend (Vite build output)
    root ${PROJECT_DIR}/apps/grid-monitor/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # WebSocket proxy (Socket.IO)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/dashboard-energy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
sudo systemctl enable nginx

# ── 9. Start with PM2 ────────────────────────────────────────
log "Starting API with PM2..."
cd "$PROJECT_DIR"
pm2 start deploy/ecosystem.config.js
pm2 save

# ── 10. Done ──────────────────────────────────────────────────
echo ""
log "=========================================="
log " Deploy selesai!"
log "=========================================="
log " Frontend : http://${RASPI_IP}"
log " API      : http://${RASPI_IP}:3001"
log ""
log " PM2 commands:"
log "   pm2 status        — lihat status"
log "   pm2 logs          — lihat log"
log "   pm2 restart all   — restart semua"
log "   pm2 monit         — monitoring"
log "=========================================="
