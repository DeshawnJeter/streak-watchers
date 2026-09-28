const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/profile', requireAuth, (req, res) => {
  const user = db.prepare(
    'SELECT id, username, email, xp, gems, hearts, streak, avatar, last_activity, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });

  const enrolled = db.prepare(`
    SELECT c.name, c.flag, c.language_code FROM courses c
    JOIN user_courses uc ON c.id = uc.course_id
    WHERE uc.user_id = ?
  `).all(req.user.id);

  const totalLessons = db.prepare(
    'SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = 1'
  ).get(req.user.id);

  res.json({ ...user, courses: enrolled, lessons_completed: totalLessons.count });
});

router.patch('/profile', requireAuth, (req, res) => {
  const { username, avatar } = req.body;
  if (username) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user.id);
    if (existing) return res.status(409).json({ error: 'Username taken' });
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, req.user.id);
  }
  if (avatar) {
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, req.user.id);
  }
  const user = db.prepare(
    'SELECT id, username, email, xp, gems, hearts, streak, avatar FROM users WHERE id = ?'
  ).get(req.user.id);
  res.json(user);
});

// Refill hearts with gems
router.post('/hearts/refill', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (user.hearts >= 5) return res.status(400).json({ error: 'Hearts already full' });
  if (user.gems < 350) return res.status(400).json({ error: 'Not enough gems' });

  db.prepare('UPDATE users SET hearts = 5, gems = gems - 350 WHERE id = ?').run(req.user.id);
  const updated = db.prepare('SELECT id, username, xp, gems, hearts, streak FROM users WHERE id = ?').get(req.user.id);
  res.json(updated);
});

// Buy shop item
router.post('/shop/buy/:itemId', requireAuth, (req, res) => {
  const userId = req.user.id;
  const item = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (user.gems < item.cost_gems) return res.status(400).json({ error: 'Not enough gems' });

  db.prepare('UPDATE users SET gems = gems - ? WHERE id = ?').run(item.cost_gems, userId);

  // Apply item effect
  if (item.type === 'hearts') {
    db.prepare('UPDATE users SET hearts = MIN(5, hearts + 5) WHERE id = ?').run(userId);
  } else if (item.type === 'xp_boost') {
    // XP boosts tracked in user_items, applied client-side for simplicity
    db.prepare(`
      INSERT INTO user_items (user_id, item_id, quantity) VALUES (?, ?, 1)
      ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + 1
    `).run(userId, item.id);
  } else {
    db.prepare(`
      INSERT INTO user_items (user_id, item_id, quantity) VALUES (?, ?, 1)
      ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + 1
    `).run(userId, item.id);
  }

  const updated = db.prepare('SELECT id, username, xp, gems, hearts, streak FROM users WHERE id = ?').get(userId);
  res.json({ message: `${item.name} purchased!`, user: updated });
});

// Get shop items
router.get('/shop', (req, res) => {
  const items = db.prepare('SELECT * FROM shop_items ORDER BY category, cost_gems').all();
  res.json(items);
});

// Get user's inventory
router.get('/inventory', requireAuth, (req, res) => {
  const items = db.prepare(`
    SELECT si.*, ui.quantity, ui.purchased_at FROM shop_items si
    JOIN user_items ui ON si.id = ui.item_id
    WHERE ui.user_id = ?
  `).all(req.user.id);
  res.json(items);
});

module.exports = router;
