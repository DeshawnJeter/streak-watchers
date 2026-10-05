import { useState } from 'react';
import AvatarSVG from './AvatarSVG';
import { BADGES, CHARACTERS, CHAR_AVATAR_CONFIGS, badgeProgress } from '../data/characters';
import { parseAvatarFull, buildAvatarJson, DEFAULT_SVG_CONFIG } from '../data/avatarUtils';

// ── Palette data ──────────────────────────────────────────────────────────────
const SKIN_TONES = [
  '#6E3D3A','#7D4A3F','#8C4A25','#97513F','#985C30',
  '#A46648','#B76E45','#C6775C','#E18E70','#E59D65',
  '#F2A07D','#FFB89D','#FFC6B7','#FFCBA3','#FFE2D6',
];
const HAIR_COLORS = [
  '#1A0A00','#3C2A1E','#5C3A1E','#8B5E3C','#C49A6C',
  '#E8C99A','#F5E6CA','#D4AF37','#CC4444','#4444CC',
  '#44AA44','#AA44AA',
];
const SHIRT_COLORS = ['#58CC02','#1CB0F6','#FF4B4B','#FFC800','#CE82FF','#FF9600','#3C3C3C','#FFFFFF'];
const BG_COLORS    = ['#DDF4FF','#D7FFB8','#FFF3B3','#FFDFE0','#F4DCFF','#FFE8CC','#E8E8E8','#1CB0F6'];

const HAIR_STYLES  = [{v:0,l:'Bald'},{v:1,l:'Short'},{v:2,l:'Long'},{v:3,l:'Afro'},{v:4,l:'Bun'},{v:5,l:'Side'}];
const EYE_STYLES   = [{v:0,l:'Dots'},{v:1,l:'Round'},{v:2,l:'Squint'}];
const MOUTH_STYLES = [{v:0,l:'Smile'},{v:1,l:'Grin'},{v:2,l:'Calm'}];
const FACE_DETAILS = [{v:0,l:'None'},{v:1,l:'Freckles'},{v:2,l:'Blush'}];
const HEADWEAR     = [{v:0,l:'None'},{v:1,l:'Cap'},{v:2,l:'Beanie'},{v:3,l:'Halo'}];

const TABS = [
  { id:'skin',     label:'Skin',      icon:'🎨' },
  { id:'hair',     label:'Hair',      icon:'💇' },
  { id:'face',     label:'Face',      icon:'👁️' },
  { id:'mouth',    label:'Mouth',     icon:'😄' },
  { id:'detail',   label:'Details',   icon:'✨' },
  { id:'head',     label:'Head',      icon:'🎩' },
  { id:'shirt',    label:'Shirt',     icon:'👕' },
  { id:'bg',       label:'BG',        icon:'🖼️' },
  { id:'presets',  label:'Characters',icon:'🎮' },
  { id:'badges',   label:'Badges',    icon:'🏅' },
];

// ── Color swatch ─────────────────────────────────────────────────────────────
function ColorSwatch({ color, active, shape = 'circle', onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40, height: 40,
        borderRadius: shape === 'circle' ? '50%' : 12,
        backgroundColor: color,
        border: color === '#FFFFFF' ? '2px solid #E5E5E5' : '2px solid transparent',
        outline: active ? `3px solid #1CB0F6` : 'none',
        outlineOffset: 2,
        transform: active ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.1s, outline 0.1s',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    />
  );
}

// ── Style chip ───────────────────────────────────────────────────────────────
function StyleChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-extrabold border-2 border-b-4 transition-all ${
        active
          ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]'
          : 'bg-white border-[#E5E5E5] text-[#3C3C3C] hover:bg-[#F7F7F7]'
      }`}
    >
      {label}
    </button>
  );
}

// ── exported helpers (used by AvatarDisplay and CharacterAvatar) ──────────────
export function parseAvatarConfig(avatar) {
  const { svgConfig } = parseAvatarFull(avatar);
  return svgConfig;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AvatarBuilder({ initial, streak = 0, lessons = 0, onSave, onClose }) {
  const { svgConfig: initSvg, earnedBadges: initBadges, equippedBadge: initEquipped } =
    parseAvatarFull(initial);

  const [config,        setConfig]        = useState({ ...DEFAULT_SVG_CONFIG, ...initSvg });
  const [earnedBadges,  setEarnedBadges]  = useState(initBadges);
  const [equippedBadge, setEquippedBadge] = useState(initEquipped);
  const [activeTab,     setActiveTab]     = useState('skin');

  const set = (key, val) => setConfig(c => ({ ...c, [key]: val }));

  const applyPreset = (charId) => {
    const preset = CHAR_AVATAR_CONFIGS[charId];
    if (preset) setConfig(c => ({ ...c, ...preset }));
  };

  const handleSave = () => {
    onSave(buildAvatarJson(config, { earnedBadges, equippedBadge }));
  };

  // Badge whose medal will show on the preview circle
  const previewBadge = equippedBadge ? BADGES.find(b => b.id === equippedBadge) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* ── Top nav ── exact Duolingo header ── */}
      <nav className="flex items-center justify-between px-4 py-3 border-b-2 border-[#E5E5E5] flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 text-[#AFAFAF] hover:text-[#3C3C3C] text-xl font-bold leading-none"
          aria-label="Close"
        >✕</button>
        <h2 className="text-base font-black text-[#3C3C3C] uppercase tracking-wider">Edit Avatar</h2>
        <button
          onClick={handleSave}
          className="text-[#1CB0F6] font-extrabold text-sm uppercase tracking-wider hover:text-[#0a9fdf]"
        >
          Done
        </button>
      </nav>

      {/* ── Preview ── */}
      <div
        className="flex-shrink-0 flex justify-center items-center py-6"
        style={{ background: config.bgColor + '55' }}
      >
        {/* Avatar circle with Duolingo exact styling */}
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <div style={{
            width: 148, height: 148,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #E5E5E5',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          }}>
            <AvatarSVG config={config} size={148} />
          </div>
          {/* Badge medal preview */}
          {previewBadge && (
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD700, #FF9600)',
              border: '3px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {previewBadge.icon}
            </div>
          )}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="flex overflow-x-auto border-b-2 border-[#E5E5E5] px-2 py-1 gap-1 flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#DDF4FF] text-[#1CB0F6]'
                : 'text-[#AFAFAF] hover:bg-[#F7F7F7]'
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto p-5">

        {activeTab === 'skin' && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-4">Skin tone</p>
            <div className="flex flex-wrap gap-3">
              {SKIN_TONES.map(t => (
                <ColorSwatch key={t} color={t} active={config.skinTone === t} onClick={() => set('skinTone', t)} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'hair' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Style</p>
              <div className="flex flex-wrap gap-2">
                {HAIR_STYLES.map(s => (
                  <StyleChip key={s.v} label={s.l} active={config.hairStyle === s.v} onClick={() => set('hairStyle', s.v)} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Color</p>
              <div className="flex flex-wrap gap-3">
                {HAIR_COLORS.map(c => (
                  <ColorSwatch key={c} color={c} active={config.hairColor === c} onClick={() => set('hairColor', c)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'face' && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Eye style</p>
            <div className="flex flex-wrap gap-2">
              {EYE_STYLES.map(s => (
                <StyleChip key={s.v} label={s.l} active={config.eyeStyle === s.v} onClick={() => set('eyeStyle', s.v)} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'mouth' && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Mouth style</p>
            <div className="flex flex-wrap gap-2">
              {MOUTH_STYLES.map(s => (
                <StyleChip key={s.v} label={s.l} active={config.mouthStyle === s.v} onClick={() => set('mouthStyle', s.v)} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'detail' && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Face details</p>
            <div className="flex flex-wrap gap-2">
              {FACE_DETAILS.map(s => (
                <StyleChip key={s.v} label={s.l} active={config.faceDetail === s.v} onClick={() => set('faceDetail', s.v)} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'head' && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Headwear</p>
            <div className="flex flex-wrap gap-2">
              {HEADWEAR.map(s => (
                <StyleChip key={s.v} label={s.l} active={config.headwear === s.v} onClick={() => set('headwear', s.v)} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'shirt' && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Shirt color</p>
            <div className="flex flex-wrap gap-3">
              {SHIRT_COLORS.map(c => (
                <ColorSwatch key={c} color={c} shape="square" active={config.shirtColor === c} onClick={() => set('shirtColor', c)} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'bg' && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Background color</p>
            <div className="flex flex-wrap gap-3">
              {BG_COLORS.map(c => (
                <ColorSwatch key={c} color={c} shape="square" active={config.bgColor === c} onClick={() => set('bgColor', c)} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'presets' && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-1">Character Presets</p>
            <p className="text-xs text-[#AFAFAF] mb-4">Apply a preset, then customize further in any tab.</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CHARACTERS).map(([charId, char]) => {
                const preset = CHAR_AVATAR_CONFIGS[charId];
                return (
                  <button
                    key={charId}
                    onClick={() => applyPreset(charId)}
                    className="flex items-center gap-3 p-3 rounded-2xl border-2 border-[#E5E5E5] hover:border-[#1CB0F6] hover:bg-[#F0FAFF] transition-all text-left"
                  >
                    <div style={{ borderRadius: '50%', overflow: 'hidden', border: '2px solid #E5E5E5', flexShrink: 0 }}>
                      <AvatarSVG config={preset} size={48} />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#3C3C3C]">{char.name}</div>
                      <div className="text-xs text-[#AFAFAF]">{char.game}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'badges' && (
          <>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-1">
              Badges — {earnedBadges.length}/{BADGES.length} earned
            </p>
            <p className="text-xs text-[#AFAFAF] mb-4">Tap an earned badge to equip it on your avatar.</p>
            <div className="flex flex-col gap-3">
              {BADGES.map(badge => {
                const isEarned  = earnedBadges.includes(badge.id);
                const isEquipped = equippedBadge === badge.id;
                const progress  = badgeProgress(badge, streak, lessons);
                const pct       = Math.min(100, (progress / badge.threshold) * 100);
                return (
                  <button
                    key={badge.id}
                    onClick={() => isEarned && setEquippedBadge(isEquipped ? null : badge.id)}
                    disabled={!isEarned}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isEquipped
                        ? 'border-[#FFD700] bg-[#FFFAEB]'
                        : isEarned
                          ? 'border-[#E5E5E5] hover:border-[#FFD700] hover:bg-[#FFFAEB] cursor-pointer'
                          : 'border-[#E5E5E5] opacity-60 cursor-default'
                    }`}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                      background: isEarned
                        ? 'linear-gradient(135deg, #FFD700, #FF9600)'
                        : '#E5E5E5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                    }}>
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm text-[#3C3C3C] flex items-center gap-2">
                        {badge.name}
                        {isEquipped && <span className="text-[10px] bg-[#FFD700] text-[#7A5000] px-2 py-0.5 rounded-full font-extrabold">EQUIPPED</span>}
                      </div>
                      <div className="text-xs text-[#AFAFAF] mt-0.5">{badge.desc}</div>
                      {!isEarned && (
                        <div className="mt-2">
                          <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                            <div className="h-full bg-[#58CC02] rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-[#AFAFAF] mt-1">{Math.round(progress)}/{badge.threshold}</p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
