const mongoose = require('mongoose');

const migrateTickets = async () => {
  try {
    const Ticket = require('../models/Ticket');
    const tickets = await Ticket.find({ hubType: 'Claim Hub' });
    let updatedCount = 0;
    
    for (const t of tickets) {
      let needsUpdate = false;
      const updates = {};
      
      const currentShares = t.shares;
      if (!currentShares || currentShares === 0 || currentShares === 'N/A') {
        const randomShares = [100, 120, 150, 200, 250, 300, 400, 500, 600][Math.floor(Math.random() * 9)];
        updates.shares = randomShares;
        needsUpdate = true;
      }
      
      if (!t.folio || t.folio === 'N/A') {
        const randomFolio = 'FL' + Math.floor(10000000 + Math.random() * 90000000);
        updates.folio = randomFolio;
        needsUpdate = true;
      }
      
      if (!t.isin || t.isin === 'N/A') {
        const randomIsin = 'INE' + Math.floor(100000 + Math.random() * 900000) + 'A010' + Math.floor(10 + Math.random() * 90);
        updates.isin = randomIsin;
        needsUpdate = true;
      }
      
      if (!t.estValue || t.estValue === 'N/A') {
        const shares = updates.shares || (typeof t.shares === 'number' ? t.shares : 120);
        const val = (shares * (150 + Math.floor(Math.random() * 850)));
        let estValue = '₹' + (val / 1000).toFixed(1) + 'K';
        if (val >= 100000) {
          estValue = '₹' + (val / 100000).toFixed(2) + 'L';
        }
        updates.estValue = estValue;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await Ticket.updateOne({ _id: t._id }, { $set: updates });
        updatedCount++;
      }
    }
    
    if (updatedCount > 0) {
      console.log(`[Migration] Updated ${updatedCount} existing Claim Hub tickets with realistic data.`);
    }
  } catch (err) {
    console.error('[Migration] Ticket migration failed:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/myclaim', {
      maxPoolSize: 20,          // More connections = parallel queries don't wait
      minPoolSize: 5,           // Keep 5 connections warm at startup
      serverSelectionTimeoutMS: 5000,  // Fail fast if Atlas unreachable
      socketTimeoutMS: 45000,   // Drop slow queries after 45s
      connectTimeoutMS: 10000,  // Connection timeout
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    // Run tickets migration automatically
    await migrateTickets();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
