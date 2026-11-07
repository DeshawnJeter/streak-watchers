const crypto = require('crypto');

// Never ship a guessable fallback: if JWT_SECRET is not set, use a random per-process secret
// (tokens stop working after a restart, which is fine for local development).
let secret = process.env.JWT_SECRET;
if (!secret) {
  secret = crypto.randomBytes(32).toString('hex');
  console.warn('JWT_SECRET is not set: using a random secret for this run. Set JWT_SECRET to keep logins across restarts.');
}

module.exports = { JWT_SECRET: secret };
