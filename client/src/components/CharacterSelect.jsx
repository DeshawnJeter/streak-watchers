import { useState } from 'react';
import {
  CHARACTERS, SKINS, BADGES,
  getActiveSkin, badgeProgress, evaluateUnlocks, DEFAULT_CHAR_STATE,
} from '../data/characters';
import { getRarityColor } from './CharacterAvatar';

function rarityClass(rarity) {
  if (rarity === 'Legendary') return { color: '#FFD700', fontWeight: 800 };
  if (rarity === 'Epic')      return { color: '#CE82FF', fontWeight: 800 };
  if (rarity === 'Rare')      return { color: '#1CB0F6', fontWeight: 800 };
  return { color: '#AFAFAF', fontWeight: 700 };
}

function BadgeGrid({ charState, streak, lessons }) {
  const earned = charState.earnedBadges || [];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
      {BADGES.map(badge => {
        const isEarned = earned.includes(badge.id);
        const progress = badgeProgress(badge, streak, lessons);
        const pct = Math.min(100, (progress / badge.threshold) * 100);
        return (
          <div
            key={badge.id}
            style={{
              border: `2px solid ${isEarned ? '#FFD700' : '#E5E5E5'}`,
              borderRadius: 16,
              padding: '10px 12px',
              background: isEarned ? 'rgba(255,215,0,0.08)' : '#FAFAFA',
              opacity: isEarned ? 1 : 0.75,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 4 }}>{badge.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#3C3C3C', lineHeight: 1.2, marginBottom: 4 }}>
              {badge.name}
            </div>
            <div style={{ fontSize: 10, color: '#AFAFAF', marginBottom: isEarned ? 0 : 6 }}>
              {badge.desc}
            </div>
            {isEarned ? (
              <div style={{ fontSize: 10, fontWeight: 800, color: '#58CC02' }}>✓ Earned!</div>
            ) : (
              <div style={{ background: '#E5E5E5', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: '#58CC02', borderRadius: 4 }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BadgePicker({ charState, onEquip, onClose }) {
  const earned = (charState.earnedBadges || []).map(id => BADGES.find(b => b.id === id)).filter(Boolean);
  const equipped = charState.equippedBadge;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFF', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px',
          width: '100%', maxWidth: 480,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 17, color: '#3C3C3C', marginBottom: 4 }}>Choose Badge</div>
        <div style={{ fontSize: 12, color: '#AFAFAF', marginBottom: 16 }}>
          Equipped badge appears on your avatar in the leaderboard.
        </div>
        {earned.length === 0 ? (
          <p style={{ color: '#AFAFAF', fontSize: 13, textAlign: 'center', padding: 20 }}>
            Earn badges by completing streaks and lessons!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
            {equipped && (
              <button
                onClick={() => onEquip(null)}
                style={{
                  border: '2px dashed #E5E5E5', borderRadius: 12, padding: '10px 6px',
                  background: 'none', cursor: 'pointer', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>⊘</div>
                <div style={{ fontSize: 10, color: '#AFAFAF', fontWeight: 700 }}>None</div>
              </button>
            )}
            {earned.map(badge => {
              const isEquipped = badge.id === equipped;
              return (
                <button
                  key={badge.id}
                  onClick={() => onEquip(badge.id)}
                  style={{
                    border: `2px solid ${isEquipped ? '#FFD700' : '#E5E5E5'}`,
                    borderRadius: 12, padding: '10px 6px',
                    background: isEquipped ? 'rgba(255,215,0,0.1)' : 'none',
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{badge.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#3C3C3C', lineHeight: 1.2 }}>
                    {badge.name}
                  </div>
                  {isEquipped && (
                    <div style={{ fontSize: 9, color: '#FFD700', fontWeight: 800, marginTop: 2 }}>Equipped</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: 20, width: '100%', background: '#F7F7F7', border: 'none',
            borderRadius: 16, padding: '14px', fontWeight: 800, fontSize: 15,
            color: '#3C3C3C', cursor: 'pointer',
          }}
        >
          DONE
        </button>
      </div>
    </div>
  );
}

function SkinPanel({ charId, charState, onEquipSkin, onSetActive }) {
  const char = CHARACTERS[charId];
  const skins = SKINS[charId];
  const xp = charState._xp || 0;
  const equippedSkinId = charState.equippedSkins?.[charId] || skins[0].id;
  const isActiveChar = charId === charState.activeChar;
  const activeSkin = getActiveSkin(charId, charState);

  return (
    <div style={{
      border: `2px solid ${activeSkin.aura}`,
      borderRadius: 20,
      padding: 16,
      marginTop: 12,
      background: `${activeSkin.aura}08`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: `${activeSkin.aura}22`, border: `2px solid ${activeSkin.aura}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>
          {activeSkin.icon}
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16, color: '#3C3C3C' }}>{char.name}</div>
          <div style={{ fontSize: 12, color: '#AFAFAF' }}>{char.game}</div>
        </div>
      </div>

      {skins.map(skin => {
        const isUnlocked = (charState.unlockedSkins || []).includes(skin.id);
        const isEquipped = skin.id === equippedSkinId;
        const xpNeeded = Math.max(0, skin.reqXp - xp);
        const isNear = !isUnlocked && xpNeeded > 0 && xpNeeded <= 25;
        const rc = getRarityColor(skin.rarity);

        return (
          <div
            key={skin.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              border: `2px solid ${isEquipped ? skin.aura : '#E5E5E5'}`,
              borderRadius: 14, padding: '10px 12px', marginBottom: 8,
              background: isEquipped ? `${skin.aura}14` : '#FFF',
              opacity: isUnlocked ? 1 : 0.65,
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: `${skin.aura}22`, border: `2px solid ${skin.aura}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
            }}>
              {skin.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#3C3C3C' }}>{skin.name}</div>
              <span style={{ fontSize: 11, ...rarityClass(skin.rarity) }}>{skin.rarity}</span>
            </div>
            {isEquipped ? (
              <span style={{
                fontSize: 10, fontWeight: 800, color: skin.aura,
                background: `${skin.aura}22`, borderRadius: 8, padding: '3px 8px',
              }}>Equipped</span>
            ) : isUnlocked ? (
              <button
                onClick={() => onEquipSkin(charId, skin.id)}
                style={{
                  fontSize: 11, fontWeight: 800, color: '#1CB0F6',
                  border: '1.5px solid #1CB0F6', borderRadius: 8, padding: '3px 8px',
                  background: 'none', cursor: 'pointer',
                }}
              >Equip</button>
            ) : isNear ? (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#FF9600' }}>⚡ {xpNeeded} XP</span>
            ) : (
              <span style={{ fontSize: 10, color: '#AFAFAF' }}>🔒 {skin.reqXp} XP</span>
            )}
          </div>
        );
      })}

      <button
        onClick={() => onSetActive(charId)}
        disabled={isActiveChar}
        style={{
          marginTop: 4, width: '100%', borderRadius: 14,
          padding: '12px', fontWeight: 800, fontSize: 14, cursor: isActiveChar ? 'default' : 'pointer',
          border: 'none',
          background: isActiveChar ? '#D7FFB8' : '#58CC02',
          color: isActiveChar ? '#2B730A' : '#FFF',
        }}
      >
        {isActiveChar ? '✓ Currently Playing As' : `Play As ${char.name}`}
      </button>
    </div>
  );
}

export default function CharacterSelect({ charState, xp, streak, lessons, onSave, onClose }) {
  const [state, setState] = useState(() => ({
    ...DEFAULT_CHAR_STATE,
    ...(charState || {}),
    _xp: xp || 0,
  }));
  const [selectedChar, setSelectedChar] = useState(state.activeChar);
  const [showBadgePicker, setShowBadgePicker] = useState(false);

  const activeSkin = getActiveSkin(state.activeChar, state);
  const equippedBadge = BADGES.find(b => b.id === state.equippedBadge);

  const handleEquipSkin = (charId, skinId) => {
    if (!(state.unlockedSkins || []).includes(skinId)) return;
    setState(s => ({
      ...s,
      equippedSkins: { ...s.equippedSkins, [charId]: skinId },
    }));
  };

  const handleSetActive = (charId) => {
    setState(s => ({ ...s, activeChar: charId }));
  };

  const handleEquipBadge = (badgeId) => {
    setState(s => ({ ...s, equippedBadge: badgeId }));
    setShowBadgePicker(false);
  };

  const handleSave = () => {
    const { _xp, ...saveState } = state;
    const updated = { ...saveState, type: 'character' };
    const unlockResult = evaluateUnlocks({ ...updated }, xp || 0, streak || 0, lessons || 0, []);
    if (unlockResult.newSkins.length > 0 || unlockResult.newBadges.length > 0) {
      updated.unlockedSkins = [...new Set([...(updated.unlockedSkins || []), ...unlockResult.newSkins.map(s => s.id)])];
      updated.earnedBadges = [...new Set([...(updated.earnedBadges || []), ...unlockResult.newBadges.map(b => b.id)])];
    }
    onSave(JSON.stringify(updated));
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', fontSize: 22,
            cursor: 'pointer', color: '#AFAFAF', padding: 4,
          }}
        >←</button>
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, color: '#3C3C3C' }}>Choose Your Avatar</div>
          <div style={{ fontSize: 12, color: '#AFAFAF' }}>Unlock new looks by earning XP.</div>
        </div>
      </div>

      {/* Active character banner */}
      <div style={{
        border: `2px solid ${activeSkin.aura}`,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        background: `${activeSkin.aura}0D`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button
          onClick={() => setShowBadgePicker(true)}
          title={equippedBadge ? `Badge: ${equippedBadge.name}. Tap to change.` : 'Choose badge'}
          style={{
            position: 'relative', width: 64, height: 64, borderRadius: '50%',
            background: `${activeSkin.aura}22`, border: `2.5px solid ${activeSkin.aura}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, cursor: 'pointer', flexShrink: 0,
          }}
        >
          {activeSkin.icon}
          {equippedBadge && (
            <div style={{
              position: 'absolute', bottom: -6, right: -6,
              width: 22, height: 22, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD700, #FF9600)',
              border: '1.5px solid #FFF', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            }}>
              {equippedBadge.icon}
            </div>
          )}
          {!equippedBadge && (
            <div style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 18, height: 18, borderRadius: '50%',
              background: '#E5E5E5', border: '1.5px solid #FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10,
            }}>🏅</div>
          )}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: '#3C3C3C' }}>
            {CHARACTERS[state.activeChar]?.name}
          </div>
          <div style={{ fontSize: 13, color: activeSkin.aura, fontWeight: 700 }}>
            {activeSkin.name}
          </div>
          <div style={{ fontSize: 12, color: '#AFAFAF' }}>
            {CHARACTERS[state.activeChar]?.game}
          </div>
          {equippedBadge && (
            <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 800, marginTop: 3 }}>
              {equippedBadge.icon} {equippedBadge.name}
            </div>
          )}
        </div>
        <span style={{
          background: '#D7FFB8', color: '#2B730A', fontWeight: 800,
          fontSize: 11, padding: '4px 10px', borderRadius: 20,
        }}>Active</span>
      </div>

      {/* Badges section */}
      <div style={{ fontWeight: 900, fontSize: 13, color: '#AFAFAF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
        Badges ({(state.earnedBadges || []).length}/{BADGES.length})
      </div>
      <div style={{ marginBottom: 20 }}>
        <BadgeGrid charState={state} streak={streak || 0} lessons={lessons || 0} />
      </div>

      {/* Character roster */}
      <div style={{ fontWeight: 900, fontSize: 13, color: '#AFAFAF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
        All Characters
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10, marginBottom: 16 }}>
        {Object.keys(CHARACTERS).map(charId => {
          const char = CHARACTERS[charId];
          const skin = getActiveSkin(charId, state);
          const isActive = charId === state.activeChar;
          const isSelected = charId === selectedChar;
          return (
            <button
              key={charId}
              onClick={() => setSelectedChar(isSelected ? null : charId)}
              style={{
                position: 'relative', border: `2px solid ${isSelected ? skin.aura : '#E5E5E5'}`,
                borderRadius: 16, padding: '10px 6px', background: isSelected ? `${skin.aura}14` : '#FAFAFA',
                cursor: 'pointer', textAlign: 'center',
                boxShadow: isSelected ? `0 0 0 2px ${skin.aura}44` : 'none',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                  borderRadius: '50%', background: '#58CC02', border: '1.5px solid #FFF',
                }} />
              )}
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: `${skin.aura}22`, border: `2px solid ${skin.aura}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, margin: '0 auto 6px',
              }}>
                {skin.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#3C3C3C', lineHeight: 1.2 }}>{char.name}</div>
              <div style={{ fontSize: 9, color: '#AFAFAF' }}>{skin.rarity}</div>
            </button>
          );
        })}
      </div>

      {/* Skin panel for selected character */}
      {selectedChar && (
        <SkinPanel
          charId={selectedChar}
          charState={state}
          onEquipSkin={handleEquipSkin}
          onSetActive={handleSetActive}
        />
      )}

      {/* Save button */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px', background: '#FFF', borderTop: '2px solid #E5E5E5', zIndex: 10 }}>
        <button
          onClick={handleSave}
          style={{
            width: '100%', maxWidth: 480, margin: '0 auto', display: 'block',
            background: '#58CC02', color: '#FFF', border: 'none',
            borderRadius: 16, padding: '14px', fontWeight: 900,
            fontSize: 15, cursor: 'pointer',
          }}
        >
          SAVE AVATAR
        </button>
      </div>

      {showBadgePicker && (
        <BadgePicker
          charState={state}
          onEquip={handleEquipBadge}
          onClose={() => setShowBadgePicker(false)}
        />
      )}
    </div>
  );
}
