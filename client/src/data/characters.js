export const CHARACTERS = {
  mario:   { name: 'Mario',        game: 'Super Mario Bros.',   aura: '#FF2A2A' },
  pikachu: { name: 'Pikachu',      game: 'Pokémon',             aura: '#FFD700' },
  chief:   { name: 'Master Chief', game: 'Halo',                aura: '#93d333' },
  link:    { name: 'Link',         game: 'Legend of Zelda',     aura: '#49c0f8' },
  kratos:  { name: 'Kratos',       game: 'God of War',          aura: '#AFAFAF' },
  geralt:  { name: 'Geralt',       game: 'The Witcher',         aura: '#888888' },
  sonic:   { name: 'Sonic',        game: 'Sonic the Hedgehog',  aura: '#49c0f8' },
  lara:    { name: 'Lara Croft',   game: 'Tomb Raider',         aura: '#20B2AA' },
  steve:   { name: 'Steve',        game: 'Minecraft',           aura: '#00EEEE' },
  samus:   { name: 'Samus',        game: 'Metroid',             aura: '#FF8C00' },
};

export const SKINS = {
  mario: [
    { id: 'mario_classic',  name: 'Classic Mario',      rarity: 'Common',    reqXp: 0,   icon: '🍄', aura: '#FF2A2A' },
    { id: 'mario_fire',     name: 'Fire Mario',         rarity: 'Rare',      reqXp: 25,  icon: '🔥', aura: '#FFFFFF' },
  ],
  pikachu: [
    { id: 'pikachu_classic', name: 'Standard Pikachu',  rarity: 'Common',    reqXp: 0,   icon: '⚡', aura: '#FFD700' },
    { id: 'pikachu_shiny',   name: 'Shiny Pikachu',     rarity: 'Epic',      reqXp: 15,  icon: '✨', aura: '#FFA500' },
  ],
  chief: [
    { id: 'chief_mjolnir',  name: 'MJOLNIR Green',      rarity: 'Common',    reqXp: 0,   icon: '🛡️', aura: '#93d333' },
    { id: 'chief_cortana',  name: 'Cortana Overcharge', rarity: 'Epic',      reqXp: 20,  icon: '🤖', aura: '#00FFFF' },
  ],
  link: [
    { id: 'link_champion',  name: "Champion's Tunic",   rarity: 'Common',    reqXp: 0,   icon: '🗡️', aura: '#49c0f8' },
    { id: 'link_dark',      name: 'Dark Link',          rarity: 'Legendary', reqXp: 25,  icon: '👁️', aura: '#FF0000' },
  ],
  kratos: [
    { id: 'kratos_nordic',  name: 'Nordic Armor',       rarity: 'Common',    reqXp: 0,   icon: '🪓', aura: '#AFAFAF' },
    { id: 'kratos_rage',    name: 'Spartan Rage',       rarity: 'Legendary', reqXp: 30,  icon: '🔥', aura: '#FF2A2A' },
  ],
  geralt: [
    { id: 'geralt_wolven',  name: 'Wolven Gear',        rarity: 'Common',    reqXp: 0,   icon: '🐺', aura: '#888888' },
    { id: 'geralt_toxic',   name: 'Toxicity Mutated',   rarity: 'Rare',      reqXp: 30,  icon: '🧪', aura: '#00FF66' },
  ],
  sonic: [
    { id: 'sonic_blue',     name: 'Blue Blur',          rarity: 'Common',    reqXp: 0,   icon: '🦔', aura: '#49c0f8' },
    { id: 'sonic_super',    name: 'Super Sonic',        rarity: 'Legendary', reqXp: 50,  icon: '🌟', aura: '#FFD700' },
  ],
  lara: [
    { id: 'lara_survivor',  name: 'Survivor Gear',      rarity: 'Common',    reqXp: 0,   icon: '🏹', aura: '#20B2AA' },
    { id: 'lara_shadow',    name: 'Shadow Tactical',    rarity: 'Rare',      reqXp: 35,  icon: '🥷', aura: '#444444' },
  ],
  steve: [
    { id: 'steve_diamond',  name: 'Diamond Pickaxe',    rarity: 'Common',    reqXp: 0,   icon: '🧊', aura: '#00EEEE' },
    { id: 'steve_enchanted',name: 'Enchanted Armor',    rarity: 'Epic',      reqXp: 40,  icon: '💎', aura: '#ce82ff' },
  ],
  samus: [
    { id: 'samus_varia',    name: 'Varia Suit',         rarity: 'Common',    reqXp: 0,   icon: '🚀', aura: '#FF8C00' },
    { id: 'samus_gravity',  name: 'Gravity Suit',       rarity: 'Legendary', reqXp: 40,  icon: '🌌', aura: '#9932CC' },
  ],
};

export const BADGES = [
  { id: 'streak_7',    type: 'streak',      threshold: 7,   name: 'Week Warrior',     icon: '🔥', desc: 'Reach a 7-day streak' },
  { id: 'streak_30',   type: 'streak',      threshold: 30,  name: 'Monthly Master',   icon: '🏆', desc: 'Reach a 30-day streak' },
  { id: 'streak_100',  type: 'streak',      threshold: 100, name: 'Centurion',        icon: '💯', desc: 'Reach a 100-day streak' },
  { id: 'lessons_10',  type: 'lessons',     threshold: 10,  name: 'Getting Started',  icon: '📘', desc: 'Complete 10 lessons' },
  { id: 'lessons_50',  type: 'lessons',     threshold: 50,  name: 'Dedicated Learner',icon: '📚', desc: 'Complete 50 lessons' },
  { id: 'lessons_100', type: 'lessons',     threshold: 100, name: 'Lesson Legend',    icon: '🎓', desc: 'Complete 100 lessons' },
  { id: 'perfect_week',type: 'consistency', threshold: 7,   name: 'Perfect Week',     icon: '📅', desc: 'Complete a lesson every day for 7 days' },
];

// SVG avatar presets that make each character recognizable as a Duolingo cartoon
export const CHAR_AVATAR_CONFIGS = {
  mario:   { skinTone:'#E18E70', hairStyle:1, hairColor:'#3C2A1E', eyeStyle:1, mouthStyle:0, shirtColor:'#FF2A2A', bgColor:'#FFE8CC', headwear:1, faceDetail:0 },
  pikachu: { skinTone:'#F2A07D', hairStyle:3, hairColor:'#FFD700', eyeStyle:2, mouthStyle:0, shirtColor:'#FFD700', bgColor:'#FFF3B3', headwear:0, faceDetail:1 },
  chief:   { skinTone:'#A46648', hairStyle:0, hairColor:'#3C3C3C', eyeStyle:0, mouthStyle:2, shirtColor:'#4CAF50', bgColor:'#D7FFB8', headwear:2, faceDetail:0 },
  link:    { skinTone:'#E18E70', hairStyle:5, hairColor:'#E8C99A', eyeStyle:1, mouthStyle:0, shirtColor:'#58CC02', bgColor:'#DDF4FF', headwear:0, faceDetail:0 },
  kratos:  { skinTone:'#C6775C', hairStyle:0, hairColor:'#1A0A00', eyeStyle:0, mouthStyle:2, shirtColor:'#8B0000', bgColor:'#E8E8E8', headwear:0, faceDetail:0 },
  geralt:  { skinTone:'#FFB89D', hairStyle:2, hairColor:'#F5E6CA', eyeStyle:0, mouthStyle:2, shirtColor:'#888888', bgColor:'#E8E8E8', headwear:0, faceDetail:0 },
  sonic:   { skinTone:'#B76E45', hairStyle:3, hairColor:'#1CB0F6', eyeStyle:1, mouthStyle:1, shirtColor:'#1CB0F6', bgColor:'#DDF4FF', headwear:0, faceDetail:2 },
  lara:    { skinTone:'#E18E70', hairStyle:4, hairColor:'#5C3A1E', eyeStyle:1, mouthStyle:0, shirtColor:'#20B2AA', bgColor:'#DDF4FF', headwear:0, faceDetail:0 },
  steve:   { skinTone:'#C6775C', hairStyle:1, hairColor:'#5C3A1E', eyeStyle:0, mouthStyle:2, shirtColor:'#00EEEE', bgColor:'#E8E8E8', headwear:2, faceDetail:0 },
  samus:   { skinTone:'#E18E70', hairStyle:4, hairColor:'#D4AF37', eyeStyle:1, mouthStyle:0, shirtColor:'#FF8C00', bgColor:'#FFE8CC', headwear:0, faceDetail:0 },
};

export const DEFAULT_CHAR_STATE = {
  type: 'character',
  activeChar: 'mario',
  equippedSkins: {
    mario: 'mario_classic', pikachu: 'pikachu_classic', chief: 'chief_mjolnir',
    link: 'link_champion', kratos: 'kratos_nordic', geralt: 'geralt_wolven',
    sonic: 'sonic_blue', lara: 'lara_survivor', steve: 'steve_diamond', samus: 'samus_varia',
  },
  unlockedSkins: [
    'mario_classic', 'pikachu_classic', 'chief_mjolnir', 'link_champion',
    'kratos_nordic', 'geralt_wolven', 'sonic_blue', 'lara_survivor',
    'steve_diamond', 'samus_varia',
  ],
  earnedBadges: [],
  equippedBadge: null,
};

export function getActiveSkin(charId, charState) {
  const skinId = charState.equippedSkins?.[charId] || SKINS[charId][0].id;
  return SKINS[charId].find(s => s.id === skinId) || SKINS[charId][0];
}

export function parseCharState(avatar) {
  if (!avatar) return null;
  if (typeof avatar === 'string' && avatar.startsWith('{')) {
    try {
      const parsed = JSON.parse(avatar);
      if (parsed.type === 'character') return parsed;
    } catch { /* */ }
  }
  return null;
}

export function badgeProgress(badge, streak, lessonsCompleted, activityDates = []) {
  if (badge.type === 'streak')  return streak;
  if (badge.type === 'lessons') return lessonsCompleted;
  if (badge.type === 'consistency') {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toDateString());
    }
    return days.filter(d => activityDates.includes(d)).length;
  }
  return 0;
}

export function evaluateUnlocks(charState, xp, streak, lessonsCompleted, activityDates) {
  const newSkins = [];
  const newBadges = [];

  Object.keys(SKINS).forEach(charId => {
    SKINS[charId].forEach(skin => {
      if (!charState.unlockedSkins.includes(skin.id) && xp >= skin.reqXp) {
        charState.unlockedSkins.push(skin.id);
        newSkins.push(skin);
      }
    });
  });

  BADGES.forEach(badge => {
    if (charState.earnedBadges.includes(badge.id)) return;
    if (badgeProgress(badge, streak, lessonsCompleted, activityDates) >= badge.threshold) {
      charState.earnedBadges.push(badge.id);
      newBadges.push(badge);
    }
  });

  return { newSkins, newBadges };
}
