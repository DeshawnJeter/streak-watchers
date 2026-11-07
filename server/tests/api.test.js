// API tests: real routes, real SQLite, but a throwaway database file (DB_PATH) and no network except localhost.
const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dbFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'duo-test-')), 'test.db');
process.env.DB_PATH = dbFile;
process.env.JWT_SECRET = 'test-only-secret';

const express = require('express');
const db = require('../db');
require('../seed'); // fills the throwaway DB

const app = express();
app.use(express.json());
app.use('/api/auth', require('../routes/auth'));
app.use('/api/lessons', require('../routes/lessons'));

let base, server, token, userId, lessonId;
const call = async (method, url, body, auth = token) => {
  const res = await fetch(base + url, {
    method,
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
};
const userRow = () => db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

test.before(async () => {
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  const r = await call('POST', '/api/auth/register', { username: 'tester', email: 't@example.com', password: 'pw12345' }, null);
  token = r.body.token; userId = r.body.user.id;
  lessonId = db.prepare('SELECT id FROM lessons ORDER BY id LIMIT 1').get().id;
});
test.after(() => { server.close(); fs.rmSync(path.dirname(dbFile), { recursive: true, force: true }); });

test('first completion gives the reported XP, a repeat gives half rounded down', async () => {
  const a = await call('POST', `/api/lessons/lesson/${lessonId}/complete`, { xp_earned: 35, hearts_lost: 0 });
  assert.deepEqual([a.body.xp_gained, a.body.first_time], [35, true]);
  const b = await call('POST', `/api/lessons/lesson/${lessonId}/complete`, { xp_earned: 35, hearts_lost: 0 });
  assert.deepEqual([b.body.xp_gained, b.body.first_time], [17, false]);
  assert.equal(userRow().xp, 52);
});

test('absurd, negative or non-numeric XP and hearts values are not accepted as sent', async () => {
  const before = userRow().xp;
  for (const bad of [999999, -500, '1000', 1.5, null]) {
    const r = await call('POST', `/api/lessons/lesson/${lessonId}/complete`, { xp_earned: bad, hearts_lost: -3 });
    assert.ok(r.body.xp_gained <= 100, `xp_earned=${JSON.stringify(bad)} gave ${r.body.xp_gained}`);
  }
  assert.ok(userRow().xp - before <= 5 * 100);
  assert.ok(userRow().hearts <= 5 && userRow().hearts >= 0);
});

test('hearts never go below zero', async () => {
  await call('POST', `/api/lessons/lesson/${lessonId}/complete`, { xp_earned: 10, hearts_lost: 5 });
  await call('POST', `/api/lessons/lesson/${lessonId}/complete`, { xp_earned: 10, hearts_lost: 5 });
  assert.equal(userRow().hearts, 0);
});

test('streak: yesterday continues it, an older gap restarts it at 1, same day keeps it', async () => {
  const iso = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString().split('T')[0];
  const run = async (last, streak) => {
    db.prepare('UPDATE users SET last_activity = ?, streak = ? WHERE id = ?').run(last, streak, userId);
    await call('POST', `/api/lessons/lesson/${lessonId}/complete`, { xp_earned: 10, hearts_lost: 0 });
    return userRow().streak;
  };
  assert.equal(await run(iso(-1), 4), 5);
  assert.equal(await run(iso(-3), 4), 1);
  assert.equal(await run(iso(0), 4), 4);
});

test('daily XP is capped at the goal', async () => {
  db.prepare('UPDATE users SET daily_xp = 0, daily_xp_reset = ?, daily_xp_goal = 20 WHERE id = ?').run(new Date().toISOString().split('T')[0], userId);
  await call('POST', `/api/lessons/lesson/${lessonId}/complete`, { xp_earned: 150, hearts_lost: 0 });
  assert.equal(userRow().daily_xp, 20);
});

test('endpoints need a valid token; a token signed with another secret is rejected', async () => {
  assert.equal((await call('POST', `/api/lessons/lesson/${lessonId}/complete`, {}, null)).status, 401);
  const jwt = require('jsonwebtoken');
  const forged = jwt.sign({ id: userId, username: 'tester' }, 'duolingo_clone_secret_key_2024');
  assert.equal((await call('POST', `/api/lessons/lesson/${lessonId}/complete`, {}, forged)).status, 401);
});

test('unknown lesson is a 404', async () => {
  assert.equal((await call('POST', '/api/lessons/lesson/999999/complete', {})).status, 404);
});
