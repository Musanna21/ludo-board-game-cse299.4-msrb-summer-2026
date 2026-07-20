const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');

const router = express.Router();

function dbAvailable() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

router.post('/register', async (req, res) => {
  try {
    if (!dbAvailable()) {
      return res.status(503).json({ error: 'Accounts are unavailable: no database configured. Try Guest play instead.' });
    }
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
      return res.status(400).json({ error: 'Username and a password of at least 6 characters are required' });
    }
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'Username is already taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    const token = signToken({ id: user._id.toString(), username: user.username, guest: false });
    res.json({ token, user: { id: user._id, username: user.username, stats: user.stats } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    if (!dbAvailable()) {
      return res.status(503).json({ error: 'Accounts are unavailable: no database configured. Try Guest play instead.' });
    }
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid username or password' });

    const token = signToken({ id: user._id.toString(), username: user.username, guest: false });
    res.json({ token, user: { id: user._id, username: user.username, stats: user.stats } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

// Guest accounts need no database - they get a temporary id and a short-lived token.
router.post('/guest', (req, res) => {
  const { displayName } = req.body;
  const name = (displayName || '').trim().slice(0, 20) || `Guest${Math.floor(Math.random() * 10000)}`;
  const guestId = uuidv4();
  const token = signToken({ id: guestId, username: name, guest: true });
  res.json({ token, user: { id: guestId, username: name, guest: true } });
});

module.exports = router;
