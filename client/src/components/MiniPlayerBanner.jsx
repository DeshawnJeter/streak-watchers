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

function MedalSlot({ badge, size = 32 }) {
  if (!badge) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%',
        background: 'radial-gradient(circle, #555 0%, #222 100%)',
        border: '2px solid #444', opacity: 0.4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} />
    );
  }
  const bg         = RARITY_GRADIENT[badge.rarity]  || RARITY_GRADIENT.common;
  const border     = RARITY_BORDER[badge.rarity]    || '#C7C7C7';
  const labelColor = RARITY_LABEL_COLOR[badge.rarity] || '#4A4A4A';
  const label      = badge.name.split(' ')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        position: 'relative',
        width: size, height: size,
        borderRadius: '50%',
        background: bg,
        border: `2px solid ${border}`,
        boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size * 0.44 }}>{badge.emoji}</span>
        <span style={{
          position: 'absolute',
          bottom: -8,
          backgroundColor: '#FFF',
          color: labelColor,
          fontSize: 7,
          fontWeight: 900,
          padding: '1px 4px',
          borderRadius: 6,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          border: `1px solid ${border}`,
          whiteSpace: 'nowrap',
          maxWidth: 44,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}

const LEAGUE_COLORS = {
  Bronze:   { primary: '#CD7F32', secondary: '#8B4513' },
  Silver:   { primary: '#C0C0C0', secondary: '#808080' },
  Gold:     { primary: '#FFD700', secondary: '#FFA500' },
  Sapphire: { primary: '#0F52BA', secondary: '#1899D6' },
  Ruby:     { primary: '#FF4B4B', secondary: '#CC0000' },
  Emerald:  { primary: '#50C878', secondary: '#228B22' },
  Amethyst: { primary: '#CE82FF', secondary: '#8B00FF' },
  Pearl:    { primary: '#FFC800', secondary: '#FF9600' },
  Obsidian: { primary: '#4A4A4A', secondary: '#1C1C1C' },
  Diamond:  { primary: '#1CB0F6', secondary: '#0077C2' },
};

const LEAGUES = [
  { name: 'Bronze',   min: 0     },
  { name: 'Silver',   min: 100   },
  { name: 'Gold',     min: 250   },
  { name: 'Sapphire', min: 600   },
  { name: 'Ruby',     min: 1500  },
  { name: 'Emerald',  min: 3000  },
  { name: 'Amethyst', min: 6000  },
  { name: 'Pearl',    min: 10000 },
  { name: 'Obsidian', min: 16000 },
  { name: 'Diamond',  min: 30000 },
];

export function getBannerColors(xp = 0) {
  const league = [...LEAGUES].reverse().find(l => xp >= l.min) || LEAGUES[0];
  return LEAGUE_COLORS[league.name] || LEAGUE_COLORS.Bronze;
}

export default function MiniPlayerBanner({
  avatar,
  username = 'Player',
  rank = '?',
  pinnedBadges = [],
  primaryColor,
  secondaryColor,
  xp = 0,
}) {
  const [isPulsing] = useState(true);
  const colors = primaryColor
    ? { primary: primaryColor, secondary: secondaryColor }
    : getBannerColors(xp);

  const slots = [0, 1, 2].map(i => pinnedBadges[i] || null);

  return (
    <div style={{
      position: 'relative',
      width: '150px',
      height: '170px',
      borderRadius: '18px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      flexShrink: 0,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Background gradient + overlays */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.secondary} 70%, #090D16 100%)`,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.12) 0deg 10deg, transparent 10deg 20deg)',
          mixBlendMode: 'overlay',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 2px, transparent 2px)',
          backgroundSize: '10px 10px',
          opacity: 0.5,
        }} />
      </div>

      {/* Avatar in electric ring */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 110,
        height: 110,
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2 }} viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="85"
            fill="none" stroke="#FFFFFF" strokeWidth="5"
            style={{
              filter: `drop-shadow(0 0 10px ${colors.primary}) drop-shadow(0 0 20px #FFF)`,
              animation: isPulsing ? 'electricPulse 1.2s infinite alternate' : 'none',
            }}
          />
          <path
            d="M 20 100 L 32 88 L 28 104 L 46 92 M 180 100 L 168 112 L 172 96 L 154 108"
            stroke="#FFF" strokeWidth="2.5" fill="none"
          />
        </svg>
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
            <CharacterAvatar avatar={avatar} size={60} showBadge={false} />
          </div>
        </div>
      </div>

      {/* Rank shield */}
      <div style={{
        position: 'absolute',
        bottom: 48,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 4,
      }}>
        <div style={{
          background: 'linear-gradient(180deg, #E0F7FA 0%, #00B0FF 50%, #0077C2 100%)',
          padding: '2px',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
          border: '1.5px solid #FFF',
        }}>
          <div style={{
            backgroundColor: '#0039CB',
            padding: '2px 10px',
            borderRadius: '9px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 7, fontWeight: 900, color: '#80D8FF', letterSpacing: '0.5px' }}>
              #{rank}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 900, color: '#FFF', fontStyle: 'italic',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {username}
            </span>
          </div>
        </div>
      </div>

      {/* Three medal slots */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'flex-start',
        paddingInline: 10,
        zIndex: 5,
      }}>
        {slots.map((badge, i) => (
          <MedalSlot key={i} badge={badge} size={32} />
        ))}
      </div>
    </div>
  );
}
