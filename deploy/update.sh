#!/bin/bash
# =============================================================
# Update Script for Raspberry Pi
# Jalankan setelah push ke GitHub untuk update deployment
# Usage: ./deploy/update.sh
# =============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
err()  { echo -e "${RED}[✗] $1${NC}"; }

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

log "Pulling latest code from GitHub..."
git pull origin main

log "Installing dependencies..."
npm install

log "Building frontend..."
cd apps/grid-monitor
npm run build
cd "$PROJECT_DIR"

log "Building API..."
cd apps/api
npm run build
cd "$PROJECT_DIR"

log "Running database migrations..."
cd apps/api
npx drizzle-kit migrate
cd "$PROJECT_DIR"

log "Restarting PM2 services..."
pm2 restart all

log "Restarting Nginx..."
sudo systemctl restart nginx

echo ""
log "=========================================="
log " Update selesai!"
log "=========================================="
log " Cek status: pm2 status"
log " Cek logs:   pm2 logs"
log "=========================================="
