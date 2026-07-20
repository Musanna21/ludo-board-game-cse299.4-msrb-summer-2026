const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn(
      '[db] MONGODB_URI is not set - user accounts and match history will not work. ' +
        'Guest play and live gameplay still work without a database.'
    );
    return null;
  }
  try {
    await mongoose.connect(uri);
    console.log('[db] Connected to MongoDB');
    return mongoose.connection;
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB:', err.message);
    console.warn('[db] Continuing without a database - guest play will still work.');
    return null;
  }
}

module.exports = connectDB;
