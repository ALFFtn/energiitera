#!/bin/bash
# =============================================================
# Frontend Deploy Script — Dashboard Energy (Grid Monitor)
# Cara kerja: SSH ke server → git pull → build di server → reload nginx
#
# Usage:
#   ./deploy/deploy-frontend.sh
#   ./deploy/deploy-frontend.sh --branch feat/xyz
# =============================================================
set -e

# ── KONFIGURASI ───────────────────────────────────────────────
SSH_USER="root"
SSH_HOST="72.61.140.143"
SSH_PORT="443"
REMOTE_PROJECT="/root/dashboard-energy"
GIT_BRANCH="main"
NGINX_RELOAD=true
# ─────────────────────────────────────────────────────────────

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
err()  { echo -e "${RED}[✗] $1${NC}"; exit 1; }
info() { echo -e "${CYAN}[→] $1${NC}"; }

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
warn "Masukkan password SSH saat diminta..."
echo ""

# Kirim perintah sebagai string argumen (bukan heredoc) agar stdin
# tetap ke terminal → password prompt dan host-key confirm bisa muncul.
# StrictHostKeyChecking=accept-new: auto-accept host baru tanpa tanya.
ssh -p "$SSH_PORT" \
    -o StrictHostKeyChecking=accept-new \
    -o ConnectTimeout=15 \
    "${SSH_USER}@${SSH_HOST}" "
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e \"\${GREEN}[✓] \$1\${NC}\"; }
warn() { echo -e \"\${YELLOW}[!] \$1\${NC}\"; }
info() { echo -e \"\${CYAN}[→] \$1\${NC}\"; }

cd $REMOTE_PROJECT || { echo '[✗] Folder $REMOTE_PROJECT tidak ditemukan!'; exit 1; }

info 'Pulling latest code...'
git fetch origin
git checkout $GIT_BRANCH
git pull origin $GIT_BRANCH
log 'Git pull selesai.'

CHANGED=\$(git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep 'grid-monitor/package.json' || true)
if [ -n \"\$CHANGED\" ]; then
    info 'package.json berubah, npm install...'
    cd apps/grid-monitor && npm install && cd $REMOTE_PROJECT
    log 'Dependencies updated.'
fi

info 'Building frontend...'
cd apps/grid-monitor
npm run build
cd $REMOTE_PROJECT
log 'Build selesai.'

if [ '$NGINX_RELOAD' = true ]; then
    info 'Reload nginx...'
    nginx -t && systemctl reload nginx
    log 'Nginx reloaded.'
fi

echo ''
log '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
log ' Frontend berhasil di-deploy!'
log ' URL: https://energiitera.com'
log ' Tekan Ctrl+Shift+R di browser untuk refresh.'
log '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
"
