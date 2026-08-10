#!/bin/bash
# =============================================================
# setup-vps.sh — Configura a VPS do zero (Ubuntu 22.04/24.04)
# Rode como root: bash setup-vps.sh
# =============================================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${BLUE}[→]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Tudo Junto — Setup VPS (Ubuntu)        ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Parâmetros ─────────────────────────────────────────────────
DOMAIN="${1:-seudominio.com}"
APP_USER="${2:-deploy}"
USE_DOCKER="${3:-false}"

log "Domínio: $DOMAIN"
log "Usuário: $APP_USER"
log "Docker:  $USE_DOCKER"
echo ""

# ── 1. Update sistema ──────────────────────────────────────────
log "Atualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git unzip nginx certbot python3-certbot-nginx ufw fail2ban
ok "Sistema atualizado"

# ── 2. Firewall ────────────────────────────────────────────────
log "Configurando firewall (UFW)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ok "Firewall configurado"

# ── 3. Usuário deploy ──────────────────────────────────────────
if ! id "$APP_USER" &>/dev/null; then
  log "Criando usuário $APP_USER..."
  adduser --disabled-password --gecos "" "$APP_USER"
  usermod -aG sudo "$APP_USER"
  # Permitir nginx reload sem senha
  echo "$APP_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx, /usr/bin/nginx" \
    >> /etc/sudoers.d/$APP_USER
fi
ok "Usuário $APP_USER pronto"

# ── 4. Node.js 22 ─────────────────────────────────────────────
log "Instalando Node.js 22..."
if ! command -v node &>/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
ok "Node.js $(node -v) instalado"

# ── 5. PM2 ────────────────────────────────────────────────────
if [ "$USE_DOCKER" != "true" ]; then
  log "Instalando PM2..."
  npm install -g pm2 --silent
  pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" || true
  ok "PM2 instalado"
fi

# ── 6. Docker (opcional) ───────────────────────────────────────
if [ "$USE_DOCKER" = "true" ]; then
  log "Instalando Docker..."
  if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker "$APP_USER"
    systemctl enable docker
    systemctl start docker
  fi
  
  if ! command -v docker-compose &>/dev/null; then
    curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
      -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
  fi
  ok "Docker $(docker -v) instalado"
fi

# ── 7. Diretório da app ────────────────────────────────────────
log "Criando diretório da aplicação..."
mkdir -p /var/www/tudo-junto
chown -R "$APP_USER:$APP_USER" /var/www/tudo-junto
ok "Diretório /var/www/tudo-junto pronto"

# ── 8. Nginx ──────────────────────────────────────────────────
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/tudo-junto << NGINX_CONF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://\$host\$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL — será preenchido pelo certbot
    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    gzip on; gzip_vary on; gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    client_max_body_size 10M;

    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /api/stripe/webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_request_buffering off;
    }

    location /api/chat {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_buffering off;
        chunked_transfer_encoding on;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}
NGINX_CONF

# Temp: serve HTTP enquanto certbot não rodou
cat > /etc/nginx/sites-available/tudo-junto-temp << TEMP_CONF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { proxy_pass http://localhost:3000; proxy_set_header Host \$host; }
}
TEMP_CONF

ln -sf /etc/nginx/sites-available/tudo-junto-temp /etc/nginx/sites-enabled/tudo-junto
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
ok "Nginx configurado"

# ── 9. SSL com Certbot ─────────────────────────────────────────
log "Obtendo certificado SSL para $DOMAIN..."
mkdir -p /var/www/certbot
certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos -m "admin@$DOMAIN" || \
  warn "SSL falhou — verifique se o domínio aponta para este IP"

# Ativa config HTTPS se SSL funcionou
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  ln -sf /etc/nginx/sites-available/tudo-junto /etc/nginx/sites-enabled/tudo-junto
  nginx -t && systemctl reload nginx
  ok "HTTPS ativo em https://$DOMAIN"
fi

# Auto-renew
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -
ok "Auto-renew SSL configurado"

# ── 10. Fail2ban ───────────────────────────────────────────────
log "Configurando Fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
ok "Fail2ban ativo"

# ── Resumo final ───────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           VPS configurada! 🎉            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "  Próximos passos:"
echo ""
echo "  1. Faça login como $APP_USER:"
echo "     su - $APP_USER"
echo ""
echo "  2. Clone o projeto:"
echo "     cd /var/www/tudo-junto"
echo "     git clone https://github.com/SEU_USUARIO/tudo-junto.git ."
echo ""
echo "  3. Configure as variáveis:"
echo "     cp .env.production.example .env.production"
echo "     nano .env.production"
echo ""
echo "  4. Rode o deploy:"
echo "     chmod +x deploy.sh && ./deploy.sh"
echo ""
echo "  App estará em: https://$DOMAIN"
echo ""
