module.exports = {
  apps: [{
    name: 'grab-bootcamp-be',
    script: 'dist/main.js',

    instances: 1,
    autorestart: true,
    watch: false,
    wait_ready: true,
    listen_timeout: 10000,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
