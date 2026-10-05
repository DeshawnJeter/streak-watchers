import { useState } from 'react';
import CharacterAvatar from './CharacterAvatar';

const RARITY_GRADIENT = {
  legendary: 'radial-gradient(circle, #FFD700 0%, #FF8C00 100%)',
  epic:      'radial-gradient(circle, #CE82FF 0%, #7B00D4 100%)',
  rare:      'radial-gradient(circle, #1CB0F6 0%, #0055A5 100%)',
  common:    'radial-gradient(circle, #AFAFAF 0%, #6B6B6B 100%)',
};
const RARITY_BORDER = {
  legendary: '#FFD700',
  epic:      '#CE82FF',
  rare:      '#84D8FF',
  common:    '#C7C7C7',
};
const RARITY_LABEL_COLOR = {
  legendary: '#7A5000',
  epic:      '#5B0099',
  rare:      '#00489B',
  common:    '#4A4A4A',
};
// Default fallback slots when no pinned badges provided
const DEFAULTS = [
  { emoji: null, label: null }, // left — uses leftMedalEmoji
  { emoji: null, label: null }, // center — uses league emoji
  { emoji: null, label: null }, // right — uses rightMedalEmoji
];

function MedalSlot({ badge, fallbackEmoji, fallbackLabel, size = 48 }) {
  const hasBadge = !!badge;
  const bg      = hasBadge ? (RARITY_GRADIENT[badge.rarity] || RARITY_GRADIENT.common)
                           : 'radial-gradient(circle, #D500F9 0%, #4A148C 100%)';
  const border  = hasBadge ? (RARITY_BORDER[badge.rarity]   || '#FF80AB') : '#FF80AB';
  const emoji   = hasBadge ? badge.emoji   : fallbackEmoji;
  const label   = hasBadge ? badge.name.split(' ')[0] : fallbackLabel;
  const labelColor = hasBadge ? (RARITY_LABEL_COLOR[badge.rarity] || '#4A148C') : '#4A148C';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{
        position: 'relative',
        width: size, height: size,
        borderRadius: '50%',
        background: bg,
        border: `3px solid ${border}`,
        boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}>
        <span style={{ fontSize: size * 0.42 }}>{emoji}</span>
        {label && (
          <span style={{
            position: 'absolute',
            bottom: -9,
            backgroundColor: '#FFF',
            color: labelColor,
            fontSize: 9,
            fontWeight: 900,
            padding: '1px 5px',
            borderRadius: 8,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            border: `1px solid ${border}`,
            whiteSpace: 'nowrap',
            maxWidth: 56,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export default function GachaRankBanner({
  heroName = 'Learner',
  heroEmoji = '🦉',
  rankText = 'TOP 10',
  rewardXp = '1000',
  primaryColor = '#00F2FE',
  secondaryColor = '#4FACFE',
  leftMedalEmoji = '⚡',
  rightMedalEmoji = '🏆',
  centerMedalEmoji = '🎖️',
  pinnedBadges = [],  // [{id, name, emoji, rarity}] — up to 3
}) {
  const [isPulsing] = useState(true);

  const slots = [0, 1, 2].map(i => pinnedBadges[i] || null);

  return (
    <div style={styles.bannerContainer}>
      {/* Background */}
      <div style={{
        ...styles.backgroundCanvas,
        background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 70%, #090D16 100%)`,
      }}>
        <div style={styles.speedLinesOverlay} />
        <div style={styles.halftoneDotsOverlay} />
      </div>

      {/* Electric ring + hero avatar */}
      <div style={styles.ringWrapper}>
        <svg style={styles.lightningSvg} viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="85"
            fill="none" stroke="#FFFFFF" strokeWidth="6"
            style={{
              filter: `drop-shadow(0 0 12px ${primaryColor}) drop-shadow(0 0 24px #FFF)`,
              animation: isPulsing ? 'electricPulse 1.2s infinite alternate' : 'none',
            }}
          />
          <path
            d="M 20 100 L 35 85 L 30 105 L 50 90 M 180 100 L 165 115 L 170 95 L 150 110 M 100 20 L 115 35 L 95 30 L 110 50"
            stroke="#FFF" strokeWidth="3" fill="none"
          />
        </svg>
        <div style={styles.heroFrame}>
          <div style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))' }}>
            <CharacterAvatar avatar={heroEmoji} size={80} showBadge={false} />
          </div>
        </div>
      </div>

      {/* Rank shield — centered above medals */}
      <div style={styles.shieldRow}>
        <div style={styles.rankShield}>
          <div style={styles.rankShieldInner}>
            <span style={styles.rankingGroupText}>RANKING GROUPS</span>
            <span style={styles.rankMainText}>{rankText}</span>
          </div>
        </div>
      </div>

      {/* Three medal slots */}
      <div style={styles.medalsRow}>
        <MedalSlot badge={slots[0]} fallbackEmoji={leftMedalEmoji}   fallbackLabel={rewardXp} />
        <MedalSlot badge={slots[1]} fallbackEmoji={centerMedalEmoji} fallbackLabel={rewardXp} />
        <MedalSlot badge={slots[2]} fallbackEmoji={rightMedalEmoji}  fallbackLabel={rewardXp} />
      </div>
    </div>
  );
}

const styles = {
  bannerContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '360px',
    height: '240px',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'system-ui, sans-serif',
    margin: '0 auto',
  },
  backgroundCanvas: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
  },
  speedLinesOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.15) 0deg 10deg, transparent 10deg 20deg)',
    mixBlendMode: 'overlay',
  },
  halftoneDotsOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 2px, transparent 2px)',
    backgroundSize: '12px 12px',
    opacity: 0.6,
  },
  ringWrapper: {
    position: 'relative',
    width: '160px',
    height: '160px',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lightningSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  heroFrame: {
    position: 'relative',
    zIndex: 3,
    marginTop: '-8px',
  },
  shieldRow: {
    position: 'absolute',
    bottom: 56,
    left: 0, right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 4,
  },
  rankShield: {
    background: 'linear-gradient(180deg, #E0F7FA 0%, #00B0FF 50%, #0077C2 100%)',
    padding: '3px',
    borderRadius: '16px',
    boxShadow: '0 6px 14px rgba(0,0,0,0.4), inset 0 2px 4px #FFF',
    border: '2px solid #FFF',
  },
  rankShieldInner: {
    backgroundColor: '#0039CB',
    padding: '4px 14px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  rankingGroupText: {
    fontSize: '8px',
    fontWeight: '900',
    color: '#80D8FF',
    letterSpacing: '0.5px',
  },
  rankMainText: {
    fontSize: '15px',
    fontWeight: '900',
    color: '#FFF',
    fontStyle: 'italic',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  },
  medalsRow: {
    position: 'absolute',
    bottom: 10,
    left: 0, right: 0,
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingInline: 16,
    zIndex: 5,
  },
};
