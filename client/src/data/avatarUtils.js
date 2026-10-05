// Single source of truth for avatar JSON → { svgConfig, earnedBadges, equippedBadge }
// Handles every storage format this codebase has ever written.

import { CHAR_AVATAR_CONFIGS } from './characters';

export const DEFAULT_SVG_CONFIG = {
  skinTone:  '#E18E70',
  hairStyle: 1,
  hairColor: '#3C2A1E',
  eyeStyle:  0,
  mouthStyle:0,
  shirtColor:'#58CC02',
  bgColor:   '#DDF4FF',
  headwear:  0,
  faceDetail:0,
};

export function parseAvatarFull(avatar) {
  if (!avatar || typeof avatar !== 'string') {
    return { svgConfig: { ...DEFAULT_SVG_CONFIG }, earnedBadges: [], equippedBadge: null };
  }

  if (avatar.startsWith('{')) {
    try {
      const parsed = JSON.parse(avatar);

      // Format A: type:"character" — map the activeChar to an SVG preset
      if (parsed.type === 'character') {
        const charId = parsed.activeChar || 'mario';
        const preset = CHAR_AVATAR_CONFIGS[charId] || {};
        return {
          svgConfig:    { ...DEFAULT_SVG_CONFIG, ...preset },
          earnedBadges: parsed.earnedBadges  || [],
          equippedBadge:parsed.equippedBadge || null,
        };
      }

      // Format B: pure SVG config (skinTone key present)
      if (parsed.skinTone !== undefined) {
        const { earnedBadges = [], equippedBadge = null, ...svgFields } = parsed;
        return {
          svgConfig:    { ...DEFAULT_SVG_CONFIG, ...svgFields },
          earnedBadges,
          equippedBadge,
        };
      }
    } catch { /* fall through */ }
  }

  // Legacy: plain emoji string — use default SVG avatar
  return { svgConfig: { ...DEFAULT_SVG_CONFIG }, earnedBadges: [], equippedBadge: null };
}

export function buildAvatarJson(svgConfig, { earnedBadges = [], equippedBadge = null } = {}) {
  return JSON.stringify({ ...svgConfig, earnedBadges, equippedBadge });
}
