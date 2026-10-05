const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'duolingo.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    gems INTEGER DEFAULT 500,
    hearts INTEGER DEFAULT 5,
    streak INTEGER DEFAULT 0,
    last_activity TEXT,
    avatar TEXT DEFAULT 'owl',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    language_code TEXT NOT NULL,
    flag TEXT NOT NULL,
    learners TEXT DEFAULT '0'
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 100,
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id INTEGER NOT NULL,
    order_num INTEGER NOT NULL,
    FOREIGN KEY (skill_id) REFERENCES skills(id)
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT,
    correct_answer TEXT NOT NULL,
    hint TEXT,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
  );

  CREATE TABLE IF NOT EXISTS user_courses (
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, course_id)
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    completed_at TEXT,
    PRIMARY KEY (user_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS weekly_xp (
    user_id INTEGER NOT NULL,
    week TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, week)
  );

  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT DEFAULT 'beginner',
    cover_emoji TEXT DEFAULT '📖',
    duration_minutes INTEGER DEFAULT 5,
    xp_reward INTEGER DEFAULT 20,
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    cost_gems INTEGER NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_items (
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    purchased_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    description TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    xp_reward INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
  );
`);

// Add quests tables
db.exec(`
  CREATE TABLE IF NOT EXISTS quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL DEFAULT 'daily',
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 10,
    target INTEGER DEFAULT 1,
    metric TEXT NOT NULL DEFAULT 'lessons_completed'
  );

  CREATE TABLE IF NOT EXISTS user_quest_progress (
    user_id INTEGER NOT NULL,
    quest_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    claimed_at TEXT,
    reset_date TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (user_id, quest_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quest_id) REFERENCES quests(id)
  );
`);

// Migrate existing users table to add new columns (safe: ignore if already exists)
const addCols = [
  "ALTER TABLE users ADD COLUMN daily_xp INTEGER DEFAULT 0",
  "ALTER TABLE users ADD COLUMN daily_xp_goal INTEGER DEFAULT 50",
  "ALTER TABLE users ADD COLUMN daily_xp_reset TEXT DEFAULT ''",
  "ALTER TABLE users ADD COLUMN pinned_achievements TEXT DEFAULT '[]'",
  "ALTER TABLE stories ADD COLUMN panels TEXT DEFAULT '[]'",
  "ALTER TABLE stories ADD COLUMN checks TEXT DEFAULT '[]'",
];
for (const sql of addCols) {
  try { db.exec(sql); } catch (_) {}
}

db.exec(`
  CREATE TABLE IF NOT EXISTS user_story_progress (
    user_id INTEGER NOT NULL,
    story_id INTEGER NOT NULL,
    completed_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, story_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (story_id) REFERENCES stories(id)
  )
`);

// Seed quests once
const questCount = db.prepare('SELECT COUNT(*) as c FROM quests').get();
if (questCount.c === 0) {
  const iq = db.prepare('INSERT INTO quests (type,icon,title,description,xp_reward,target,metric) VALUES (?,?,?,?,?,?,?)');
  const questSeed = db.transaction(() => {
    iq.run('daily','🎯','First Step','Complete 1 lesson today',10,1,'lessons_completed');
    iq.run('daily','⚡','XP Grind','Earn 20 XP today',15,20,'xp_earned');
    iq.run('daily','🔥','Streak Keeper','Maintain your streak',20,1,'streak_maintained');
    iq.run('daily','💎','Perfectionist','Complete a perfect lesson',25,1,'perfect_lesson');
    iq.run('daily','🚀','Triple Threat','Complete 3 lessons in one day',30,3,'lessons_completed');
    iq.run('weekly','📅','7-Day Warrior','Keep a 7-day streak',100,7,'streak_days');
    iq.run('weekly','💪','XP Hunter','Earn 200 XP this week',75,200,'xp_earned');
    iq.run('weekly','🏅','Lesson Master','Complete 10 lessons this week',80,10,'lessons_completed');
  });
  questSeed();
}

// Seed achievements catalog once
const achievementCount = db.prepare('SELECT COUNT(*) as c FROM achievements').get();
if (achievementCount.c === 0) {
  const insert = db.prepare(
    'INSERT INTO achievements (name, emoji, description, rarity, xp_reward) VALUES (?, ?, ?, ?, ?)'
  );
  const catalog = [
    ['Wild Streak',       '🔥', 'Keep a 7-day streak',                  'rare',      100],
    ['XP Earner',         '⚡', 'Earn 500 total XP',                    'common',     50],
    ['Perfectionist',     '💎', 'Complete a lesson with no mistakes',   'legendary',  75],
    ['Night Owl',         '🦉', 'Complete a lesson after 9pm',          'common',     30],
    ['Quick Learner',     '🚀', 'Complete 3 lessons in one day',        'epic',       80],
    ['Gem Collector',     '💰', 'Earn 1000 total gems',                 'rare',       60],
    ['Language Explorer', '🌍', 'Enroll in 3 different languages',      'epic',       90],
    ['Comeback Kid',      '💪', 'Return after a 3-day absence',         'common',     25],
    ['Sharpshooter',      '🎯', 'Get 5 lessons perfect in a row',       'legendary', 150],
    ['Early Bird',        '🌅', 'Complete a lesson before 8am',         'rare',       40],
    ['Halfway Hero',      '🏅', 'Complete 50% of any course',           'epic',      100],
    ['Champion',          '🏆', 'Finish your first course',             'legendary', 500],
  ];
  const seedAll = db.transaction(() => {
    for (const row of catalog) insert.run(...row);
  });
  seedAll();
}

// Seed story panels/checks if stories exist but have no panels
const storiesNeedingPanels = db.prepare("SELECT id FROM stories WHERE panels = '[]' OR panels IS NULL").all();
if (storiesNeedingPanels.length > 0) {
  const updateStory = db.prepare('UPDATE stories SET panels = ?, checks = ? WHERE id = ?');

  // Story panels by title keyword
  const panelsByStory = {
    'café': {
      panels: [
        { character: 'Maria', emoji: '👩', text: '¡Hola! ¿Qué deseas ordenar?' },
        { character: 'You', emoji: '🧑', text: 'Quiero un café con leche, por favor.' },
        { character: 'Maria', emoji: '👩', text: '¿Grande o pequeño?' },
        { character: 'You', emoji: '🧑', text: 'Grande, por favor. ¿Cuánto cuesta?' },
        { character: 'Maria', emoji: '👩', text: 'Tres euros cincuenta.' },
        { character: 'You', emoji: '🧑', text: 'Aquí tiene. ¡Gracias!' },
        { character: 'Maria', emoji: '👩', text: '¡De nada! ¡Que lo disfrute!' },
      ],
      checks: [
        { after_panel: 2, question: 'What did the customer order?', options: ['Tea', 'Coffee with milk', 'Orange juice', 'Water'], answer: 'Coffee with milk' },
        { after_panel: 5, question: 'How much did the coffee cost?', options: ['Two euros', 'Three euros fifty', 'Four euros', 'Free'], answer: 'Three euros fifty' },
      ],
    },
    'mercado': {
      panels: [
        { character: 'Vendor', emoji: '🧓', text: '¡Buenos días! ¿En qué le puedo ayudar?' },
        { character: 'You', emoji: '🧑', text: 'Buenos días. ¿Tiene manzanas?' },
        { character: 'Vendor', emoji: '🧓', text: 'Sí, están muy frescas hoy.' },
        { character: 'You', emoji: '🧑', text: 'Quiero un kilo, por favor.' },
        { character: 'Vendor', emoji: '🧓', text: 'Claro. Son dos euros el kilo.' },
        { character: 'You', emoji: '🧑', text: '¿Y los tomates?' },
        { character: 'Vendor', emoji: '🧓', text: 'Los tomates están a euro cincuenta.' },
        { character: 'You', emoji: '🧑', text: 'Perfecto. Llevo un kilo de cada uno.' },
      ],
      checks: [
        { after_panel: 3, question: 'What did the customer buy first?', options: ['Tomatoes', 'Oranges', 'Apples', 'Bananas'], answer: 'Apples' },
        { after_panel: 7, question: 'What was the price of apples per kilo?', options: ['One euro', 'One fifty', 'Two euros', 'Three euros'], answer: 'Two euros' },
      ],
    },
    'boulangerie': {
      panels: [
        { character: 'Boulanger', emoji: '👨‍🍳', text: 'Bonjour ! Que voulez-vous ?' },
        { character: 'You', emoji: '🧑', text: 'Bonjour ! Une baguette, s\'il vous plaît.' },
        { character: 'Boulanger', emoji: '👨‍🍳', text: 'Bien cuite ou normale ?' },
        { character: 'You', emoji: '🧑', text: 'Normale, merci.' },
        { character: 'Boulanger', emoji: '👨‍🍳', text: 'Et avec ça ?' },
        { character: 'You', emoji: '🧑', text: 'Un croissant aussi, s\'il vous plaît.' },
        { character: 'Boulanger', emoji: '👨‍🍳', text: 'Ça fait un euro quatre-vingts.' },
      ],
      checks: [
        { after_panel: 2, question: 'What did the customer buy first?', options: ['Croissant', 'Baguette', 'Pain au chocolat', 'Brioche'], answer: 'Baguette' },
        { after_panel: 5, question: 'How did the customer want their bread?', options: ['Well done', 'Normal', 'Soft', 'Crispy'], answer: 'Normal' },
      ],
    },
    'レスト': {
      panels: [
        { character: 'ウェイター', emoji: '🤵', text: 'いらっしゃいませ！何名様ですか？' },
        { character: 'You', emoji: '🧑', text: 'ふたりです。' },
        { character: 'ウェイター', emoji: '🤵', text: 'こちらへどうぞ。ご注文はお決まりですか？' },
        { character: 'You', emoji: '🧑', text: 'ラーメンをひとつください。' },
        { character: 'ウェイター', emoji: '🤵', text: 'からさはどうしますか？' },
        { character: 'You', emoji: '🧑', text: 'ふつうでいいです。' },
        { character: 'ウェイター', emoji: '🤵', text: 'かしこまりました。少々お待ちください。' },
      ],
      checks: [
        { after_panel: 2, question: 'How many people were dining?', options: ['One', 'Two', 'Three', 'Four'], answer: 'Two' },
        { after_panel: 5, question: 'What did they order?', options: ['Sushi', 'Ramen', 'Soba', 'Tempura'], answer: 'Ramen' },
      ],
    },
  };

  const seedTx = db.transaction(() => {
    for (const story of storiesNeedingPanels) {
      const s = db.prepare('SELECT title FROM stories WHERE id = ?').get(story.id);
      if (!s) continue;
      const titleLower = s.title.toLowerCase();
      let data = null;
      for (const [key, val] of Object.entries(panelsByStory)) {
        if (titleLower.includes(key)) { data = val; break; }
      }
      if (!data) {
        // Generic fallback panels
        data = {
          panels: [
            { character: 'Guide', emoji: '🦉', text: 'Welcome! Let\'s practice together.' },
            { character: 'You', emoji: '🧑', text: 'Great! I\'m ready to learn.' },
            { character: 'Guide', emoji: '🦉', text: 'Languages open doors to new worlds.' },
            { character: 'You', emoji: '🧑', text: 'That\'s so true. Where do we start?' },
            { character: 'Guide', emoji: '🦉', text: 'Start small — one word at a time.' },
          ],
          checks: [
            { after_panel: 3, question: 'What opens doors to new worlds?', options: ['Travel', 'Languages', 'Money', 'Education'], answer: 'Languages' },
          ],
        };
      }
      updateStory.run(JSON.stringify(data.panels), JSON.stringify(data.checks), story.id);
    }
  });
  seedTx();
}

module.exports = db;
