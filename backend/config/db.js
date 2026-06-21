const mongoose = require('mongoose');

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
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
