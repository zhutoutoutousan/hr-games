module.exports = {
  apps: [{
    name: 'people-sync',
    script: './scripts/sync-people.js',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/people-sync-error.log',
    out_file: './logs/people-sync-out.log',
    time: true,
  }]
}; 