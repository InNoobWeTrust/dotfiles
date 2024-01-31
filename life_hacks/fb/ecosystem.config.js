module.exports = {
  apps: [
    {
      name: "fb_auto_pressing",
      script: "./run.sh",
      exec_mode: "fork",
      instances: 1,
      cron_restart: "48 */4 * * *", // Schedule job every 4 hours
      watch: ["run.sh", "fb_auto_pressing.ts", "fb_auto_pressing.js"], // Restart on changes to source code
      max_memory_restart: "10M", // In case of bug, try restarting
      restart_delay: 3000, // Delay between restarts
      autorestart: true, // Restart on failure
      stop_exit_codes: [0], // Don't restart if process exits with code 0
      exp_backoff_restart_delay: 300_000, // On pressing failure, wait 5 minutes before retry
      env: {
        CRON: "true",
        LOGLEVEL: "verbose",
      },
    },
  ],
};
