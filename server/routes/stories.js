const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');

// GET /api/stories/:courseId — list stories for a course
router.get('/:courseId', requireAuth, (req, res) => {
  const userId = req.user.id;
  const courseId = parseInt(req.params.courseId);

  const stories = db.prepare('SELECT * FROM stories WHERE course_id = ?').all(courseId);
  const completedIds = new Set(
    db.prepare('SELECT story_id FROM user_story_progress WHERE user_id = ?').all(userId).map(r => r.story_id)
  );

  const result = stories.map(s => {
    let panels = [];
    let checks = [];
    try { panels = JSON.parse(s.panels || '[]'); } catch (_) {}
    try { checks = JSON.parse(s.checks || '[]'); } catch (_) {}
    return { ...s, panels, checks, completed: completedIds.has(s.id) };
  });

  res.json(result);
});

// POST /api/stories/:id/complete — mark story complete and award XP
router.post('/:id/complete', requireAuth, (req, res) => {
  const userId = req.user.id;
  const storyId = parseInt(req.params.id);

  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(storyId);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  const alreadyDone = db.prepare(
    'SELECT 1 FROM user_story_progress WHERE user_id = ? AND story_id = ?'
  ).get(userId, storyId);

  const xpEarned = alreadyDone ? 0 : (story.xp_reward || 20);

  if (!alreadyDone) {
    db.prepare('INSERT INTO user_story_progress (user_id, story_id) VALUES (?, ?)').run(userId, storyId);
    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpEarned, userId);
  }

  const user = db.prepare('SELECT xp, gems, hearts, streak FROM users WHERE id = ?').get(userId);
  res.json({ xp_earned: xpEarned, user });
});

module.exports = router;
