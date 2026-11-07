# 0001 Don't trust client-reported XP; no default JWT secret

Date: 2026-11-07. Status: accepted (local branch, not merged).

## Context
- `POST /api/lessons/lesson/:id/complete` took `xp_earned` and `hearts_lost` from the request body as-is. Anyone could send
  `xp_earned: 999999` (leaderboard cheat) or a negative number. `0` was also silently turned into 50.
- `JWT_SECRET` fell back to a constant in the source (`duolingo_clone_secret_key_2024`). Anyone reading the repo could forge a login token when the env var was unset.

## Decision
- Accept only whole numbers: XP 0 to 200 (default 50 if invalid), hearts lost 0 to 5 (default 0). Server-side recomputing XP from answers would be better but needs the client to send answers: not done.
- New `server/config.js`: use `JWT_SECRET` if set; otherwise a random per-run secret and a console warning.
- `DB_PATH` env var lets tests use a throwaway database.

## Consequences
- Local dev logins now reset on every server restart unless `JWT_SECRET` is set (put it in `.env`, which is git-ignored).
- A cheater can still claim up to 200 XP per lesson per call.
