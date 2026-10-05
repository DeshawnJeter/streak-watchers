const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'duolingo_clone_secret_key_2024';

router.post('/register', async (req, res) => {
  const { username, email, password, dailyGoal } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) return res.status(409).json({ error: 'Email or username already taken' });

  const hashed = await bcrypt.hash(password, 10);
  const goalXp = [10, 20, 30, 50].includes(Number(dailyGoal)) ? Number(dailyGoal) : 20;
  const result = db.prepare(
    'INSERT INTO users (username, email, password, daily_xp_goal) VALUES (?, ?, ?, ?)'
  ).run(username, email, hashed, goalXp);

  const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '30d' });
  const user = db.prepare('SELECT id, username, email, xp, gems, hearts, streak, avatar, created_at, daily_xp_goal FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ token, user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let streak = user.streak;
  if (user.last_activity === yesterday) streak += 1;
  else if (user.last_activity !== today) streak = 1;

  db.prepare('UPDATE users SET last_activity = ?, streak = ? WHERE id = ?').run(today, streak, user.id);

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  const { password: _, ...safeUser } = { ...user, streak };
  res.json({ token, user: safeUser });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare(
    'SELECT id, username, email, xp, gems, hearts, streak, avatar, last_activity, created_at, daily_xp, daily_xp_goal, daily_xp_reset, pinned_achievements FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Reset daily_xp if it's a new day
  const today = new Date().toISOString().split('T')[0];
  if (user.daily_xp_reset !== today) {
    db.prepare('UPDATE users SET daily_xp = 0, daily_xp_reset = ? WHERE id = ?').run(today, req.user.id);
    user.daily_xp = 0;
    user.daily_xp_reset = today;
  }

  // Parse pinned_achievements JSON
  try { user.pinned_achievements = JSON.parse(user.pinned_achievements || '[]'); }
  catch (_) { user.pinned_achievements = []; }

  res.json(user);
});

module.exports = router;
