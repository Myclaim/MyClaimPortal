const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { syncAllCompanies } = require('../services/syncService');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const runSync = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 20,
    });
    console.log('MongoDB Connected');

    console.log('Starting manual initial sync of companies...');
    await syncAllCompanies();
    console.log('Sync completed successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
};

runSync();
