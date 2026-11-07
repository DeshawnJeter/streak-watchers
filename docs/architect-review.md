# Architect review: streak-watchers (branch based on v3) (2026-11-07)
Legend: [C] confirmed by a test or command run; [U] unconfirmed. No key read or used. Not an AI agent.
**Base branch note:** `main` holds only a README and `.gitignore`; the app (single `index.html`, 1,863 lines) lives on `v3`, so this branch starts from `v3` (3fa9ef8).
Scope: read-only review. No tests or CI were added: all logic sits inside one inline script with no module boundary, so a test would first need a refactor. [C by reading]

## Findings
- No server, no network calls, no keys; no key-shaped strings in the tree. [C grep]
- 18 `innerHTML` uses. Their inputs are hardcoded badge/skin/rival tables and numbers from `localStorage`. There is no text input anywhere in the page, so the only way to inject is editing your own browser storage (self-XSS). Low risk. [C by grep + read]
- Saved state is restored with `Object.assign(state, JSON.parse(...))` inside a `try`; bad JSON is survived, but wrong-typed fields (e.g. `streak: "x"`) are not validated. [U]
- Streak reset uses date-string gaps rounded to days (`gapDays >= 2` resets), which handles DST. [U, read only, not run]

## Recommended next steps (not done)
1. Move streak/XP/badge rules into a plain `.js` file so they can be tested (the same tests would then also protect `duolingo-clone`, which reuses this game's ideas).
2. Replace `innerHTML` with `textContent`/DOM building where the text is not fixed HTML.
3. Decide whether this repo or `duolingo-clone` is the one you keep working in; they overlap.

## Left out
- Your checkout had no uncommitted changes.
