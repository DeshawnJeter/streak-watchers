const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const courses = db.prepare('SELECT * FROM courses ORDER BY learners DESC').all();
  res.json(courses);
});

router.get('/:id', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

router.post('/:id/enroll', requireAuth, (req, res) => {
  const courseId = parseInt(req.params.id);
  const userId = req.user.id;

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  db.prepare(
    'INSERT OR IGNORE INTO user_courses (user_id, course_id) VALUES (?, ?)'
  ).run(userId, courseId);

  res.json({ message: 'Enrolled successfully', course });
});

router.get('/user/enrolled', requireAuth, (req, res) => {
  const enrolled = db.prepare(`
    SELECT c.*, uc.enrolled_at FROM courses c
    JOIN user_courses uc ON c.id = uc.course_id
    WHERE uc.user_id = ?
    ORDER BY uc.enrolled_at DESC
  `).all(req.user.id);
  res.json(enrolled);
});

module.exports = router;
