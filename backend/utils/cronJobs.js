const cron = require('node-cron');
const { syncAllCompanies } = require('../services/syncService');

const initCronJobs = () => {
  // Schedule task to run at 9:30 AM every day
  cron.schedule('30 9 * * *', () => {
    console.log('Running scheduled task: syncAllCompanies');
    syncAllCompanies();
  });
  console.log('Cron jobs initialized.');
};

module.exports = initCronJobs;
