import { useAuth } from '../context/AuthContext';

// Wishlist #2: the right panel (with the Velocity XP Bar) is hidden below
// the xl breakpoint, so phone and tablet users never saw their daily goal.
// This compact strip brings it back on smaller screens.
export default function MobileXpStrip() {
  const { user } = useAuth();
  if (!user) return null;

  const goal = user.daily_xp_goal || 50;
  const xp = user.daily_xp || 0;
  const pct = Math.min(1, xp / goal);
  const color = pct >= 1 ? '#58CC02' : pct >= 0.85 ? '#FF4B4B' : pct >= 0.6 ? '#FF9600' : '#58CC02';
  const label = pct >= 1 ? 'Goal reached! 🎉' : pct >= 0.85 ? `Almost there! ${goal - xp} XP left` : 'Daily goal';

  return (
    <div className="xl:hidden px-4 pt-4">
      <div className="stat-card flex items-center gap-3 py-3">
        <span className={`text-2xl ${pct >= 0.85 && pct < 1 ? 'animate-flicker' : ''}`}>⚡</span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs font-extrabold mb-1">
            <span className="text-[#AFAFAF] uppercase tracking-widest truncate">{label}</span>
            <span style={{ color }}>{Math.min(xp, goal)}/{goal} XP</span>
          </div>
          <div className="h-3 bg-[#E5E5E5] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 progress-shine ${pct >= 0.85 && pct < 1 ? 'animate-xpFireGlow' : ''}`}
              style={{ width: `${Math.round(pct * 100)}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
