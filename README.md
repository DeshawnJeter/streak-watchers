# Streak Watchers

A full-featured language learning app inspired by Duolingo — built from scratch with React on the front end and Node.js on the back end.

---

## What It Is

Streak Watchers lets users pick a language, complete bite-sized lessons, earn XP, and track their progress over time. It includes the core loop you'd expect from a language app — lessons, streaks, a leaderboard, and rewards — plus some unique features like a customizable avatar, achievement badges, and an animated rank banner.

---

## Features

### Learning
- **Lessons** — Multiple choice, fill-in-the-blank, and word-bank (translate) question types
- **XP System** — Earn 10 XP per correct answer; daily and total XP tracked separately
- **Hearts** — Lose a heart for each wrong answer; limited mistakes per session
- **Level Progress** — Every 1,000 XP advances you to the next level

### Engagement
- **Daily XP Goal** — A color-coded progress bar in the sidebar that heats up as you get closer to your goal, and fires confetti when you hit it
- **Streaks** — Daily streak tracked and displayed; character badges unlock at streak milestones (7, 30, 100 days)
- **Quests** — Daily and weekly quests with progress bars; claim completed ones for bonus XP
- **Achievements** — 12 earnable badges organized by rarity (common, rare, epic, legendary); pin up to 3 to show on the leaderboard

### Social / Competition
- **Leaderboard** — Weekly and all-time views with league tiers (Bronze through Diamond)
- **League Urgency Meter** — Players near the promotion zone see a color-coded progress bar showing exactly how much XP they need to advance
- **Pinned Badges** — Achievements you've pinned appear as colored circles on your leaderboard row and inside your rank banner
- **GachaRankBanner** — An animated rank card with 3 medal slots that display your pinned achievement badges with rarity-specific gradients
- **Player Cards** — Tap any player to see their stats and pinned badges in a popup

### Customization
- **Avatar Builder** — 10-tab customization: skin tone, hair, eyes, mouth, face details, headwear, shirt, background, character presets, and badges
- **Character Badges** — 7 badge types earned by hitting streak and lesson milestones; equip one to display on your avatar
- **Dark Mode** — Toggle between light and dark themes from the sidebar

### Onboarding
- **4-Step Wizard** — New users pick a language, set a daily XP goal, choose their motivation, then create their account

### Stories
- **Dialogue Reader** — Story panels presented as a conversation, with mid-story comprehension questions and XP awarded on completion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Front end | React 18, Vite, Tailwind CSS v3, React Router v6 |
| Back end | Node.js, Express |
| Database | SQLite via better-sqlite3 |
| Auth | JWT (JSON Web Tokens) with bcrypt password hashing |

---

## Project Structure

```
streak-watchers/
├── client/               # React front end
│   ├── src/
│   │   ├── components/   # Reusable UI pieces (Avatar, Navbar, Banner, etc.)
│   │   ├── pages/        # Full page views (Lesson, Leaderboard, Profile, etc.)
│   │   ├── data/         # Avatar configs, badge definitions, utility functions
│   │   ├── context/      # Auth state shared across the app
│   │   └── styles/       # CSS design tokens
├── server/               # Express back end
│   ├── routes/           # API endpoints (auth, lessons, leaderboard, etc.)
│   ├── db.js             # Database setup, table creation, and seed data
│   └── index.js          # Server entry point
```

---

## Getting Started

### Requirements

- Node.js v18 or higher
- npm v8 or higher

### Install

```bash
git clone https://github.com/DeshawnJeter/streak-watchers.git
cd streak-watchers
npm run install:all
```

### Run in development

```bash
npm run dev
```

This starts both the front end and back end at the same time:
- **Front end:** http://localhost:3000
- **Back end:** http://localhost:3001

### Demo account

```
Email:    demo@demo.com
Password: demo123
```

The demo account has all achievements unlocked, all character badges earned, and 3 pinned badges ready to view on the leaderboard.

---

## API Overview

| Method | Endpoint | What it does |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in and receive a token |
| `GET` | `/api/leaderboard/weekly` | This week's top players |
| `GET` | `/api/leaderboard/alltime` | All-time top players |
| `GET` | `/api/achievements` | Your earned badges and pinned state |
| `PATCH` | `/api/achievements/pins` | Update which badges are pinned (max 3) |
| `GET` | `/api/quests` | Your daily and weekly quests with progress |
| `POST` | `/api/quests/:id/claim` | Claim a completed quest for XP |
| `GET` | `/api/lessons/lesson/:id` | Load a lesson's questions |
| `POST` | `/api/lessons/lesson/:id/complete` | Submit results and earn XP |
| `GET` | `/api/stories/:courseId` | Stories for a language course |
| `PATCH` | `/api/users/profile` | Update username or avatar |

---

## Branch History

| Branch | What changed |
|---|---|
| `main` | Initial clone with core lessons, auth, and basic layout |
| `v5` | Avatar builder, achievements + pinned badges, quests, stories, onboarding wizard, leaderboard upgrades, dark mode |

---

## License

Built for learning purposes. Not affiliated with Duolingo.
