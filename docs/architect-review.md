# Architect review: duolingo-clone (branch based on v5) (2026-11-07)
Legend: [C] confirmed by a test or command run; [U] unconfirmed. No key read or used. Not an AI agent; agent checks skipped.
**Base branch note:** the repo's default `main` has only 2 old commits (13 behind `v5`), so this branch starts from `v5` (commit c42d1fd), where your real work is. This differs from "start from the default branch"; tell me if you want it rebuilt on `main`.
Tests ran using your checkout's `node_modules` through a temporary link (removed afterwards); the database was a temp file.

## Baseline
- No tests, no CI. [C]

## Found and changed
1. **Forgeable login (fixed):** hardcoded fallback JWT secret removed (random per-run secret if unset). A test proves a token signed with the old constant is rejected. [C]
2. **Client-trusted XP (fixed):** lesson completion accepted any `xp_earned` / `hearts_lost`. Now whole numbers in range only. [C by tests; the "before" behavior is from code read]
3. **Tests:** `server/tests/api.test.js`, 7 tests on real routes and real SQLite in a temp DB: first vs repeat XP (35 then 17), absurd/negative/string values, hearts floor at 0, streak (+1 after yesterday, reset after a gap, unchanged same day), daily XP cap at goal, token required and forged token rejected, 404 on unknown lesson. 7 pass. `npm test`. [C]
4. **CI:** syntax check, tests, secret scan. Not run on GitHub. [U]

## Found, NOT changed
- **Story XP is farmable:** `POST /api/lessons/story/:id/complete` has no "already completed" record, so repeating it gives XP and 5 gems every time. Needs a new table. [C by code read]
- Demo-account hearts fix from your handoff is not in the code. [U]
- `cors()` is wide open and passwords have no length rule or rate limit on login. [U]
- Client pages not run or checked in a browser; no `innerHTML` found in `client/src`. [C grep]

## Not done
- Local seed script wipes tables when run: only ever run it with a throwaway `DB_PATH`.
- Your checkout had untracked `.DS_Store` only; nothing left out.
