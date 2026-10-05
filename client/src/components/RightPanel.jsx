import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Confetti from './Confetti';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ── Goal-Gradient Effect Feature 1: Velocity XP Bar ──────────────────────────
// As daily XP approaches the goal, the bar accelerates visually:
// color heats up (green → amber → fire red), animations intensify,
// and a confetti burst fires at 100% — triggering the goal-gradient
// acceleration response.
function useXpPhase(dailyXp, goalXp) {
  const pct = Math.min(1, (dailyXp || 0) / (goalXp || 50));
  if (pct >= 1)    return { phase: 'complete', pct: 1,   color: '#58CC02', label: 'Goal reached! 🎉' };
  if (pct >= 0.85) return { phase: 'fire',     pct,      color: '#FF4B4B', label: `Almost there! ${goalXp - dailyXp} XP left` };
  if (pct >= 0.60) return { phase: 'amber',    pct,      color: '#FF9600', label: 'Keep going!' };
  return                  { phase: 'normal',   pct,      color: '#58CC02', label: null };
}

export default function RightPanel() {
  const { user } = useAuth();
  const [showBurst, setShowBurst] = useState(false);
  const [prevPhase, setPrevPhase] = useState(null);

  if (!user) return null;

  const today = new Date().getDay();
  const goalXP = user.daily_xp_goal || 50;
  const todayXP = user.daily_xp || 0;
  const { phase, pct, color, label } = useXpPhase(todayXP, goalXP);

  // Trigger confetti burst when reaching complete phase for the first time
  useEffect(() => {
    setPrevPhase(prev => {
      if (phase === 'complete' && prev && prev !== 'complete') {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 1200);
      }
      return phase;
    });
  }, [phase]);

  const progressPct = Math.round(pct * 100);

  return (
    <aside className="hidden xl:flex flex-col fixed right-0 top-0 h-screen w-[368px] px-6 py-8 gap-4 overflow-y-auto">
      {/* Streak */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold text-[#AFAFAF] uppercase tracking-widest">Streak</span>
          <span className="text-2xl animate-flicker">🔥</span>
        </div>
        <p className="text-4xl font-black text-[#FF9600]">{user.streak || 0}
          <span className="text-base text-[#AFAFAF] font-bold ml-2">day streak</span>
        </p>
        {/* Week dots */}
        <div className="flex justify-between mt-3">
          {DAYS.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                i < today
                  ? 'bg-[#FF9600] text-white'
                  : i === today
                    ? 'bg-[#FFF3B3] text-[#FF9600] border-2 border-[#FF9600]'
                    : 'bg-[#F7F7F7] text-[#AFAFAF]'
              }`}>
                {i === today ? '🔥' : i < today ? '✓' : d}
              </div>
              <span className="text-[10px] font-bold text-[#AFAFAF]">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature 1: Velocity XP Bar ── */}
      <div className={`stat-card relative overflow-hidden ${phase === 'complete' ? 'animate-xpBurst' : ''}`}>
        {showBurst && <Confetti />}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-[#AFAFAF] uppercase tracking-widest">Daily goal</span>
          <span
            className="text-xs font-extrabold transition-colors duration-500"
            style={{ color: phase === 'normal' ? '#AFAFAF' : color }}
          >
            {goalXP} XP
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full h-4 bg-[#E5E5E5] rounded-full overflow-hidden mb-2 relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ${phase === 'fire' ? 'animate-xpFireGlow' : ''}`}
            style={{
              width: `${progressPct}%`,
              backgroundColor: color,
              // Spring easing: accelerates toward goal — the core Goal-Gradient visual
              transition: 'width 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.5s ease',
            }}
          />
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold" style={{ color: phase === 'normal' ? '#AFAFAF' : color }}>
            {todayXP}/{goalXP} XP today
          </p>
          {label && (
            <span
              className={`text-xs font-extrabold animate-fadeIn ${phase === 'fire' ? 'animate-xpFireGlow' : ''}`}
              style={{ color }}
            >
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Gems */}
      <div className="stat-card">
        <p className="text-xs font-extrabold text-[#AFAFAF] uppercase tracking-widest mb-1">Gems</p>
        <p className="text-3xl font-black text-[#1CB0F6]">💎 <span>{(user.gems || 0).toLocaleString()}</span></p>
      </div>

      {/* Hearts */}
      <div className="stat-card">
        <p className="text-xs font-extrabold text-[#AFAFAF] uppercase tracking-widest mb-3">Hearts</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-2xl transition-all ${i < (user.hearts || 0) ? '' : 'grayscale opacity-20'}`}>
                ❤️
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Total XP */}
      <div className="stat-card flex items-center gap-4">
        <span className="text-3xl">⚡</span>
        <div>
          <p className="text-xs font-extrabold text-[#AFAFAF] uppercase tracking-widest">Total XP</p>
          <p className="text-2xl font-black text-[#3C3C3C]">{(user.xp || 0).toLocaleString()}</p>
        </div>
      </div>
    </aside>
  );
}
