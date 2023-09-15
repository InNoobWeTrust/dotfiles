module.exports = {
  apps: [{
    name: 'fb_auto_pressing',
    script: 'deno',
    args: 'run -A fb_auto_pressing.ts',
    instances: 1,
    exec_mode: 'fork',
    autorestart: false,
    //stop_exit_codes: [0],
    exp_backoff_restart_delay: 300_000, // Check every 5 minutes
    env: {
      CRON: 'true',
      LOGLEVEL: 'verbose',
    }
  }],
};
