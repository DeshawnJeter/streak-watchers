// Renders a Duolingo-style avatar circle.
// Accepts the raw avatar JSON string from the DB and renders:
//   • the SVG cartoon character (AvatarSVG)
//   • optional equipped-badge medal overlay (bottom-right corner)

import AvatarSVG from './AvatarSVG';
import { BADGES } from '../data/characters';
import { parseAvatarFull } from '../data/avatarUtils';

export default function CharacterAvatar({ avatar, size = 40, showBadge = true, className = '', isMe = false }) {
  const { svgConfig, equippedBadge: badgeId } = parseAvatarFull(avatar);
  const badge = showBadge && badgeId ? BADGES.find(b => b.id === badgeId) : null;

  const medalSize = Math.max(16, Math.round(size * 0.36));
  const offset    = Math.round(medalSize * 0.2);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexShrink: 0,
        width: size,
        height: size,
      }}
    >
      {/* ── Avatar circle ── exact Duolingo style ── */}
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: isMe ? '2.5px solid #1CB0F6' : '2px solid #E5E5E5',
        flexShrink: 0,
      }}>
        <AvatarSVG config={svgConfig} size={size} />
      </div>

      {/* ── Badge medal overlay ── */}
      {badge && (
        <div
          title={badge.name}
          aria-label={badge.name}
          style={{
            position: 'absolute',
            bottom: -offset,
            right: -offset,
            width: medalSize,
            height: medalSize,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700 0%, #FF9600 100%)',
            border: '2px solid #FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.round(medalSize * 0.58),
            lineHeight: 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          {badge.icon}
        </div>
      )}
    </div>
  );
}
