module.exports = {
  apps: [{
    name: 'seo-writer',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/seo-writer',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};

