// pm2.config.js — alternativa ao Docker, direto na VPS com PM2
module.exports = {
  apps: [
    {
      name: 'tudo-junto',
      script: '.next/standalone/server.js',
      instances: 'max',          // usa todos os cores disponíveis
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
}
