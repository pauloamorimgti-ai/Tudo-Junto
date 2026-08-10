#!/bin/bash
# =============================================================
# deploy.sh — Script de deploy automático na VPS
# Uso: ./deploy.sh
# =============================================================

set -e  # para tudo se der erro

# ── Cores ──────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}[→]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Config ─────────────────────────────────────────────────────
APP_DIR="/var/www/tudo-junto"
REPO_URL="https://github.com/SEU_USUARIO/tudo-junto.git"  # ← altere
BRANCH="main"
USE_DOCKER=false   # true = Docker, false = PM2 direto

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     Tudo Junto — Deploy Script       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Verificações ───────────────────────────────────────────────
log "Verificando dependências..."
command -v node >/dev/null 2>&1 || err "Node.js não instalado"
command -v npm >/dev/null 2>&1  || err "npm não instalado"
command -v git >/dev/null 2>&1  || err "git não instalado"

if [ "$USE_DOCKER" = true ]; then
  command -v docker >/dev/null 2>&1         || err "Docker não instalado"
  command -v docker-compose >/dev/null 2>&1 || err "docker-compose não instalado"
else
  command -v pm2 >/dev/null 2>&1 || err "PM2 não instalado. Rode: npm i -g pm2"
fi
ok "Dependências ok"

# ── Criar diretório se não existir ─────────────────────────────
if [ ! -d "$APP_DIR" ]; then
  log "Criando diretório $APP_DIR..."
  mkdir -p "$APP_DIR"
fi

cd "$APP_DIR"

# ── Git pull ou clone ──────────────────────────────────────────
if [ -d ".git" ]; then
  log "Atualizando código via git pull..."
  git fetch origin
  git reset --hard "origin/$BRANCH"
  git pull origin "$BRANCH"
else
  log "Clonando repositório..."
  git clone -b "$BRANCH" "$REPO_URL" .
fi
ok "Código atualizado"

# ── Verificar .env.production ──────────────────────────────────
if [ ! -f ".env.production" ]; then
  warn ".env.production não encontrado!"
  warn "Copie .env.production.example para .env.production e preencha as chaves"
  err "Abortando — configure o .env.production primeiro"
fi
ok ".env.production encontrado"

# ── Deploy ─────────────────────────────────────────────────────
if [ "$USE_DOCKER" = true ]; then
  log "Build e deploy com Docker..."
  
  # Load env vars for build args
  export $(grep -v '^#' .env.production | xargs)
  
  docker-compose down --remove-orphans
  docker-compose build --no-cache
  docker-compose up -d
  
  log "Aguardando health check..."
  sleep 10
  
  if docker-compose ps | grep -q "Up"; then
    ok "Container rodando"
  else
    err "Container falhou. Veja: docker-compose logs"
  fi

else
  log "Instalando dependências..."
  npm ci --frozen-lockfile

  log "Buildando aplicação..."
  cp .env.production .env.local  # Next.js lê .env.local
  npm run build

  log "Criando diretório de logs..."
  mkdir -p logs

  log "Iniciando/reiniciando com PM2..."
  if pm2 list | grep -q "tudo-junto"; then
    pm2 reload pm2.config.js --update-env
    ok "PM2 recarregado"
  else
    pm2 start pm2.config.js
    pm2 save
    ok "PM2 iniciado"
  fi
fi

# ── Nginx reload ───────────────────────────────────────────────
if command -v nginx >/dev/null 2>&1; then
  log "Recarregando Nginx..."
  sudo nginx -t && sudo systemctl reload nginx
  ok "Nginx recarregado"
fi

# ── Limpeza ────────────────────────────────────────────────────
log "Limpando builds antigos do Docker..."
docker image prune -f 2>/dev/null || true

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Deploy concluído! 🚀          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

if [ "$USE_DOCKER" = true ]; then
  echo "  Container: docker-compose logs -f"
else
  echo "  Logs:      pm2 logs tudo-junto"
  echo "  Status:    pm2 status"
fi
echo "  Health:    curl http://localhost:3000/api/health"
echo ""
