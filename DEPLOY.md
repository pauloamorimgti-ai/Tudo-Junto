# Guia de Deploy — Tudo Junto

## Rotas de deploy disponíveis

| Opção | Quando usar |
|---|---|
| **PM2 direto** | VPS simples, mais leve, recomendado para começar |
| **Docker** | Quando quiser isolar ambiente ou escalar |
| **Vercel** | Mais fácil de tudo, mas pago para uso intenso |

---

## Opção A — PM2 na VPS (recomendado para começar)

### 1. Preparar a VPS

VPS mínima recomendada: **2 vCPU, 2GB RAM** (DigitalOcean, Hostinger, Hetzner, Kamatera)

```bash
# Na sua máquina local, conecte à VPS
ssh root@IP_DA_VPS

# Rode o setup automático (Ubuntu 22.04/24.04)
curl -fsSL https://raw.githubusercontent.com/SEU_USUARIO/tudo-junto/main/infra/setup-vps.sh | bash -s seudominio.com deploy false
```

O script instala: Node.js 22, PM2, Nginx, Certbot (SSL), Fail2ban, UFW.

### 2. Configurar o projeto

```bash
# Entre como usuário deploy
su - deploy

# Clone o repositório
cd /var/www/tudo-junto
git clone https://github.com/SEU_USUARIO/tudo-junto.git .

# Configure variáveis de ambiente
cp .env.production.example .env.production
nano .env.production
# ↑ Preencha TODAS as chaves reais
```

### 3. Executar schema no Supabase

Acesse **supabase.com → seu projeto → SQL Editor** e cole todo o conteúdo de `supabase/schema.sql`.

### 4. Primeiro deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

### 5. Verificar

```bash
pm2 status                          # app rodando?
curl http://localhost:3000/api/health  # health check
pm2 logs tudo-junto                 # logs em tempo real
```

---

## Opção B — Docker na VPS

### 1. Setup com Docker

```bash
bash infra/setup-vps.sh seudominio.com deploy true
```

### 2. Deploy

```bash
# Edite deploy.sh e mude USE_DOCKER=true
nano deploy.sh

./deploy.sh
```

### 3. Verificar

```bash
docker-compose ps
docker-compose logs -f
curl http://localhost:3000/api/health
```

---

## Opção C — Vercel (mais simples)

```bash
npm i -g vercel
vercel --prod
```

Configure todas as variáveis em **Vercel Dashboard → Project → Settings → Environment Variables**.

**Atenção:** Para o Stripe webhook na Vercel, use a URL `https://seuapp.vercel.app/api/stripe/webhook`.

---

## CI/CD com GitHub Actions

1. Adicione os secrets no GitHub (**Settings → Secrets → Actions**):
   - `VPS_HOST` — IP da VPS
   - `VPS_USER` — `deploy`
   - `VPS_SSH_KEY` — chave SSH privada (`cat ~/.ssh/id_rsa`)
   - `VPS_PORT` — `22`

2. Cada push na branch `main` faz deploy automático.

---

## Configurar Stripe Webhook na produção

1. No Stripe Dashboard → **Webhooks → Add endpoint**
2. URL: `https://seudominio.com/api/stripe/webhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copie o **Signing secret** → `.env.production` → `STRIPE_WEBHOOK_SECRET`

---

## Comandos úteis no dia a dia

```bash
# Ver logs
pm2 logs tudo-junto

# Reiniciar
pm2 restart tudo-junto

# Status detalhado
pm2 monit

# Deploy manual
cd /var/www/tudo-junto && ./deploy.sh

# Renovar SSL manualmente
sudo certbot renew

# Ver uso de recursos
htop
```

---

## Checklist pré-lançamento

- [ ] `.env.production` preenchido com chaves reais
- [ ] Schema SQL executado no Supabase
- [ ] DNS do domínio apontando para o IP da VPS (aguardar propagação)
- [ ] SSL funcionando (`https://seudominio.com`)
- [ ] Health check respondendo (`/api/health`)
- [ ] Pelo menos 1 modelo de IA funcionando (teste no chat)
- [ ] Supabase Auth configurado (Email ativo em Authentication → Providers)
- [ ] Stripe webhook registrado (se for usar pagamentos)
- [ ] PM2 salvo para reiniciar no boot (`pm2 save`)

---

## Solução de problemas comuns

**App não inicia:**
```bash
pm2 logs tudo-junto --err
# Verifique se .env.production existe e está correto
```

**Streaming não funciona pelo Nginx:**
```bash
# Verifique se proxy_buffering off está no bloco /api/chat do nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

**Erro de CORS com Supabase:**
```bash
# No Supabase → Authentication → URL Configuration
# Adicione: https://seudominio.com
```

**Modelo não aparece:**
```bash
# A chave da API está no .env.production?
# O valor tem mais de 10 caracteres e não é placeholder?
# Reinicie o app após mudar variáveis: pm2 restart tudo-junto
```
