const mongoose = require('mongoose');

// Schema definitions for both permanent registered users and temporary guests
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GuestSchema = new mongoose.Schema({
  guestId: { type: String, required: true, unique: true },
  nickname: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Guest: mongoose.model('Guest', GuestSchema)
};