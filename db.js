const mongoose = require('mongoose');

// Connects to the local MongoDB database instance
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ludo_db');
    console.log('✅ MongoDB connected successfully (Member 2 Work).');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;