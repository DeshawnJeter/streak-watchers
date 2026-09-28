const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - yearStart) / 86400000 - 3 + (yearStart.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Weekly leaderboard
router.get('/weekly', requireAuth, (req, res) => {
  const week = getWeekNumber();
  const rows = db.prepare(`
    SELECT u.id, u.username, u.avatar, w.xp, u.streak
    FROM weekly_xp w
    JOIN users u ON w.user_id = u.id
    WHERE w.week = ?
    ORDER BY w.xp DESC
    LIMIT 50
  `).all(week);

  // Add rank and highlight current user
  const ranked = rows.map((row, i) => ({
    ...row,
    rank: i + 1,
    is_me: row.id === req.user.id,
  }));

  // If user not in top 50, find their rank
  const userInList = ranked.some(r => r.is_me);
  let myRank = null;
  if (!userInList) {
    const allRanks = db.prepare(`
      SELECT user_id, xp,
        RANK() OVER (ORDER BY xp DESC) as rank
      FROM weekly_xp WHERE week = ?
    `).all(week);
    myRank = allRanks.find(r => r.user_id === req.user.id);
  }

  res.json({ week, leaderboard: ranked, my_rank: myRank });
});

// All-time leaderboard
router.get('/alltime', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, username, avatar, xp, streak
    FROM users
    ORDER BY xp DESC
    LIMIT 50
  `).all();

  const ranked = rows.map((row, i) => ({
    ...row,
    rank: i + 1,
    is_me: row.id === req.user.id,
  }));

  res.json({ leaderboard: ranked });
});

module.exports = router;
