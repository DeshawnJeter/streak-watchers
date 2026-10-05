const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');

function getResetDate(type) {
  const d = new Date();
  if (type === 'weekly') {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
  }
  return d.toISOString().split('T')[0];
}

// GET /api/quests — return all quests with per-user progress
router.get('/', requireAuth, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];
  const weekStart = getResetDate('weekly');

  const quests = db.prepare('SELECT * FROM quests').all();

  const result = quests.map(q => {
    const resetDate = q.type === 'daily' ? today : weekStart;
    let prog = db.prepare(
      'SELECT progress, claimed_at, reset_date FROM user_quest_progress WHERE user_id = ? AND quest_id = ?'
    ).get(userId, q.id);

    // Reset if new period
    if (!prog || prog.reset_date !== resetDate) {
      db.prepare(`
        INSERT INTO user_quest_progress (user_id, quest_id, progress, claimed_at, reset_date)
        VALUES (?, ?, 0, NULL, ?)
        ON CONFLICT(user_id, quest_id) DO UPDATE SET progress=0, claimed_at=NULL, reset_date=?
      `).run(userId, q.id, resetDate, resetDate);
      prog = { progress: 0, claimed_at: null, reset_date: resetDate };
    }

    return {
      ...q,
      progress: prog.progress,
      claimed: !!prog.claimed_at,
      completed: prog.progress >= q.target,
    };
  });

  res.json({ daily: result.filter(q => q.type === 'daily'), weekly: result.filter(q => q.type === 'weekly') });
});

// POST /api/quests/:id/claim — claim a completed quest
router.post('/:id/claim', requireAuth, (req, res) => {
  const userId = req.user.id;
  const questId = parseInt(req.params.id);
  const today = new Date().toISOString().split('T')[0];

  const quest = db.prepare('SELECT * FROM quests WHERE id = ?').get(questId);
  if (!quest) return res.status(404).json({ error: 'Quest not found' });

  const resetDate = quest.type === 'daily' ? today : getResetDate('weekly');
  const prog = db.prepare(
    'SELECT progress, claimed_at, reset_date FROM user_quest_progress WHERE user_id = ? AND quest_id = ?'
  ).get(userId, questId);

  if (!prog || prog.reset_date !== resetDate) return res.status(400).json({ error: 'Quest not active' });
  if (prog.claimed_at) return res.status(400).json({ error: 'Already claimed' });
  if (prog.progress < quest.target) return res.status(400).json({ error: 'Quest not completed yet' });

  db.prepare(
    'UPDATE user_quest_progress SET claimed_at = ? WHERE user_id = ? AND quest_id = ?'
  ).run(new Date().toISOString(), userId, questId);

  db.prepare('UPDATE users SET xp = xp + ?, gems = gems + ? WHERE id = ?')
    .run(quest.xp_reward, Math.floor(quest.xp_reward / 10), userId);

  const user = db.prepare('SELECT xp, gems, hearts, streak, daily_xp, daily_xp_goal FROM users WHERE id = ?').get(userId);
  res.json({ xp_earned: quest.xp_reward, user });
});

// POST /api/quests/progress — increment progress for a metric (called internally after lesson completion)
router.post('/progress', requireAuth, (req, res) => {
  const userId = req.user.id;
  const { metric, amount = 1 } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const weekStart = getResetDate('weekly');

  const quests = db.prepare('SELECT * FROM quests WHERE metric = ?').all(metric);
  for (const q of quests) {
    const resetDate = q.type === 'daily' ? today : weekStart;
    db.prepare(`
      INSERT INTO user_quest_progress (user_id, quest_id, progress, claimed_at, reset_date)
      VALUES (?, ?, ?, NULL, ?)
      ON CONFLICT(user_id, quest_id) DO UPDATE SET
        progress = CASE WHEN reset_date = ? THEN MIN(progress + ?, target) ELSE ? END,
        claimed_at = CASE WHEN reset_date = ? THEN claimed_at ELSE NULL END,
        reset_date = ?
    `).run(userId, q.id, Math.min(amount, q.target), resetDate, resetDate, amount, amount, resetDate, resetDate);
  }

  res.json({ ok: true });
});

module.exports = router;
