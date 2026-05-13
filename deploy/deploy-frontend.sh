#!/bin/bash
# =============================================================
# Frontend Deploy Script — Dashboard Energy (Grid Monitor)
# Cara kerja: SSH ke server → git pull → build di server → reload nginx
#
# Usage:
#   ./deploy/deploy-frontend.sh
#   ./deploy/deploy-frontend.sh --branch feat/xyz   (deploy branch tertentu)
# =============================================================
set -e

# ── KONFIGURASI ───────────────────────────────────────────────
SSH_USER="root"
SSH_HOST="72.61.140.143"
SSH_PORT="22"
REMOTE_PROJECT="/root/dashboard-energy"               # root repo di server
GIT_BRANCH="main"
NGINX_RELOAD=true
# ─────────────────────────────────────────────────────────────

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
err()  { echo -e "${RED}[✗] $1${NC}"; exit 1; }
info() { echo -e "${CYAN}[→] $1${NC}"; }

# Override branch dari argumen
for arg in "$@"; do
    case $arg in
        --branch=*) GIT_BRANCH="${arg#*=}" ;;
        --branch)   shift; GIT_BRANCH="$1" ;;
    esac
done

command -v ssh &>/dev/null || err "ssh tidak ditemukan."

echo ""
echo -e "${CYAN}┌─────────────────────────────────────────────┐"
echo -e "│   Frontend Deploy — Dashboard Energy        │"
echo -e "│   Server : ${SSH_USER}@${SSH_HOST}                  │"
echo -e "│   Branch : ${GIT_BRANCH}                            │"
echo -e "└─────────────────────────────────────────────┘${NC}"
echo ""
warn "Akan minta password SSH untuk ${SSH_USER}@${SSH_HOST}"
echo ""

# Jalankan semua perintah di server dalam satu sesi SSH
ssh -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" bash <<REMOTE
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "\${GREEN}[✓] \$1\${NC}"; }
warn() { echo -e "\${YELLOW}[!] \$1\${NC}"; }
err()  { echo -e "\${RED}[✗] \$1\${NC}"; exit 1; }
info() { echo -e "\${CYAN}[→] \$1\${NC}"; }

cd "$REMOTE_PROJECT" || err "Folder $REMOTE_PROJECT tidak ditemukan di server."

# ── 1. Git pull ───────────────────────────────────────────────
info "Fetching latest code (branch: $GIT_BRANCH)..."
git fetch origin
git checkout "$GIT_BRANCH"
git pull origin "$GIT_BRANCH"
log "Git pull selesai."

# ── 2. Install dependencies (hanya jika package.json berubah) ──
CHANGED_PKGJSON=\$(git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep "package.json" || true)
if [ -n "\$CHANGED_PKGJSON" ]; then
    info "package.json berubah, install dependencies..."
    npm install --workspace=apps/grid-monitor
    log "Dependencies updated."
else
    info "package.json tidak berubah, skip npm install."
fi

# ── 3. Build frontend ─────────────────────────────────────────
info "Building frontend..."
cd apps/grid-monitor
npm run build
cd "$REMOTE_PROJECT"
log "Build selesai → $REMOTE_PROJECT/apps/grid-monitor/dist"

# ── 4. Reload nginx ───────────────────────────────────────────
if [ "$NGINX_RELOAD" = true ]; then
    info "Reload nginx..."
    nginx -t && systemctl reload nginx
    log "Nginx reloaded."
fi

echo ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log " Frontend berhasil di-deploy!"
log " URL: https://energiitera.com"
log ""
log " Jika tampilan belum berubah di browser:"
log "   Tekan Ctrl+Shift+R untuk hard-refresh"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
REMOTE
