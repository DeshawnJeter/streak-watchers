const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/achievements — full catalog with earned + pinned state for current user
router.get('/', requireAuth, (req, res) => {
  const userId = req.user.id;
  const catalog = db.prepare('SELECT * FROM achievements ORDER BY rarity DESC, id').all();
  const earned = db.prepare(
    'SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = ?'
  ).all(userId);

  const user = db.prepare('SELECT pinned_achievements FROM users WHERE id = ?').get(userId);
  let pinned = [];
  try { pinned = JSON.parse(user?.pinned_achievements || '[]'); } catch (_) {}

  const earnedIds = new Set(earned.map(e => e.achievement_id));
  const earnedMap = Object.fromEntries(earned.map(e => [e.achievement_id, e.earned_at]));

  const result = catalog.map(a => ({
    ...a,
    earned: earnedIds.has(a.id),
    earned_at: earnedMap[a.id] || null,
    pinned: pinned.includes(a.id),
  }));

  res.json({ achievements: result, pinned });
});

// PATCH /api/achievements/pins — update pinned achievements (max 3)
router.patch('/pins', requireAuth, (req, res) => {
  const userId = req.user.id;
  const { pins } = req.body;

  if (!Array.isArray(pins)) return res.status(400).json({ error: 'pins must be an array' });
  if (pins.length > 3) return res.status(400).json({ error: 'Maximum 3 pinned achievements' });

  // Validate all pinned ids are earned achievements
  const earned = db.prepare(
    'SELECT achievement_id FROM user_achievements WHERE user_id = ?'
  ).all(userId).map(r => r.achievement_id);
  const earnedSet = new Set(earned);

  const validPins = pins.filter(id => earnedSet.has(id));
  const pinsJson = JSON.stringify(validPins);

  db.prepare('UPDATE users SET pinned_achievements = ? WHERE id = ?').run(pinsJson, userId);
  res.json({ pinned: validPins });
});

// POST /api/achievements/:id/award — internal: award an achievement to the current user
router.post('/:id/award', requireAuth, (req, res) => {
  const userId = req.user.id;
  const achievementId = parseInt(req.params.id);

  const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId);
  if (!achievement) return res.status(404).json({ error: 'Achievement not found' });

  try {
    db.prepare(
      'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)'
    ).run(userId, achievementId);

    // Grant XP reward
    if (achievement.xp_reward > 0) {
      db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(achievement.xp_reward, userId);
    }

    res.json({ awarded: true, achievement });
  } catch (_) {
    // Already earned (unique constraint)
    res.json({ awarded: false, already_earned: true });
  }
});

module.exports = router;
