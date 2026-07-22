#!/bin/bash
# =============================================================
# Deploy / Update Script
# Jalankan dari root project di VPS
# Usage: ./deploy/deploy.sh [--first-run]
# =============================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
err()  { echo -e "${RED}[✗] $1${NC}"; exit 1; }

FIRST_RUN=false
[[ "$1" == "--first-run" ]] && FIRST_RUN=true

# ── Validasi .env ─────────────────────────────────────────────
[ ! -f .env ] && err ".env tidak ditemukan! Buat dari .env.example dulu."
grep -q "YOUR_VPS_IP_HERE\|ganti_ini" .env && err ".env masih berisi nilai default! Edit dulu: nano .env"

# ── Pull latest code ──────────────────────────────────────────
log "Pulling latest code..."
git pull origin main

# ── Build & Start containers ──────────────────────────────────
log "Building Docker images..."
docker compose build --no-cache

log "Starting services..."
docker compose up -d

# Tunggu API siap
log "Waiting for API to be healthy..."
for i in $(seq 1 30); do
    if docker compose exec -T api wget -qO- http://127.0.0.1:3001/health 2>/dev/null | grep -q '"status":"ok"'; then
        log "API is healthy."
        break
    fi
    [ "$i" -eq 30 ] && err "API tidak mau start setelah 60 detik. Cek log: docker compose logs api"
    sleep 2
done

# ── First-run: migrate + seed ─────────────────────────────────
if [ "$FIRST_RUN" = true ]; then
    log "Running database migration & seed (first run)..."
    docker compose --profile tools run --rm migrate
    log "Database seeded."
fi

# ── Done ──────────────────────────────────────────────────────
SERVER_IP=$(grep SERVER_IP .env | cut -d= -f2)
echo ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log " Deploy selesai!"
log " Dashboard : http://${SERVER_IP}"
log " API Health: http://${SERVER_IP}/health"
log ""
log " Commands:"
log "   docker compose logs -f          # lihat log"
log "   docker compose ps               # status container"
log "   docker compose restart api      # restart API"
log "   docker compose down             # matikan semua"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
