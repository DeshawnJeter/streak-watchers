const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Get all skills for a course (with lesson progress for the user)
router.get('/skills/:courseId', requireAuth, (req, res) => {
  const userId = req.user.id;
  const courseId = parseInt(req.params.courseId);

  const skills = db.prepare('SELECT * FROM skills WHERE course_id = ? ORDER BY order_num').all(courseId);

  const result = skills.map(skill => {
    const lessons = db.prepare('SELECT * FROM lessons WHERE skill_id = ? ORDER BY order_num').all(skill.id);
    const lessonsWithProgress = lessons.map(lesson => {
      const progress = db.prepare(
        'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?'
      ).get(userId, lesson.id);
      return { ...lesson, completed: progress?.completed === 1, xp_earned: progress?.xp_earned || 0 };
    });
    const completedCount = lessonsWithProgress.filter(l => l.completed).length;
    return { ...skill, lessons: lessonsWithProgress, completed_lessons: completedCount };
  });

  res.json(result);
});

// Get exercises for a lesson
router.get('/lesson/:lessonId', requireAuth, (req, res) => {
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  const exercises = db.prepare('SELECT * FROM exercises WHERE lesson_id = ? ORDER BY id').all(lesson.id);
  const parsed = exercises.map(e => ({
    ...e,
    options: e.options ? JSON.parse(e.options) : null,
  }));

  const progress = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?'
  ).get(req.user.id, lesson.id);

  res.json({ lesson, exercises: parsed, already_completed: progress?.completed === 1 });
});

// Complete a lesson
router.post('/lesson/:lessonId/complete', requireAuth, (req, res) => {
  const userId = req.user.id;
  const lessonId = parseInt(req.params.lessonId);
  const { xp_earned, hearts_lost } = req.body;

  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  const existing = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId);
  const isFirstTime = !existing || !existing.completed;

  db.prepare(`
    INSERT INTO user_progress (user_id, lesson_id, completed, xp_earned, completed_at)
    VALUES (?, ?, 1, ?, datetime('now'))
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      completed = 1,
      xp_earned = MAX(xp_earned, excluded.xp_earned),
      completed_at = excluded.completed_at
  `).run(userId, lessonId, xp_earned || 50);

  // Update user XP, hearts, streak, daily XP
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const xpGain = isFirstTime ? (xp_earned || 50) : Math.floor((xp_earned || 50) * 0.5);
  const newXP = user.xp + xpGain;
  const newHearts = Math.max(0, user.hearts - (hearts_lost || 0));

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let streak = user.streak;
  if (user.last_activity === yesterday) streak += 1;
  else if (user.last_activity !== today) streak = 1;

  // Daily XP: reset if new day, then add
  const currentDailyXp = user.daily_xp_reset === today ? (user.daily_xp || 0) : 0;
  const newDailyXp = Math.min(currentDailyXp + xpGain, user.daily_xp_goal || 50);

  db.prepare('UPDATE users SET xp = ?, hearts = ?, streak = ?, last_activity = ?, daily_xp = ?, daily_xp_reset = ? WHERE id = ?')
    .run(newXP, newHearts, streak, today, newDailyXp, today, userId);

  // Update weekly XP
  const weekNum = getWeekNumber();
  db.prepare(`
    INSERT INTO weekly_xp (user_id, week, xp) VALUES (?, ?, ?)
    ON CONFLICT(user_id, week) DO UPDATE SET xp = xp + excluded.xp
  `).run(userId, weekNum, xpGain);

  const updatedUser = db.prepare(
    'SELECT id, username, xp, gems, hearts, streak, daily_xp, daily_xp_goal FROM users WHERE id = ?'
  ).get(userId);

  res.json({ xp_gained: xpGain, first_time: isFirstTime, user: updatedUser });
});

// Get stories for a course
router.get('/stories/:courseId', requireAuth, (req, res) => {
  const stories = db.prepare('SELECT * FROM stories WHERE course_id = ? ORDER BY difficulty, id').all(req.params.courseId);
  res.json(stories);
});

// Complete a story
router.post('/story/:storyId/complete', requireAuth, (req, res) => {
  const userId = req.user.id;
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.storyId);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  db.prepare('UPDATE users SET xp = xp + ?, gems = gems + 5 WHERE id = ?').run(story.xp_reward, userId);
  const weekNum = getWeekNumber();
  db.prepare(`
    INSERT INTO weekly_xp (user_id, week, xp) VALUES (?, ?, ?)
    ON CONFLICT(user_id, week) DO UPDATE SET xp = xp + excluded.xp
  `).run(userId, weekNum, story.xp_reward);

  const user = db.prepare('SELECT id, username, xp, gems, hearts, streak FROM users WHERE id = ?').get(userId);
  res.json({ xp_gained: story.xp_reward, gems_gained: 5, user });
});

function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - yearStart) / 86400000 - 3 + (yearStart.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

module.exports = router;
