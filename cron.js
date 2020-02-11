const CronJob = require('cron').CronJob;
const bot = require('./app.js');

const job = new CronJob({
  cronTime: "*/45 * * * *",
  onTick: bot.rec(),
  start: true,
  timeZone: "America/Chicago"
});

job.start();