import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function RightPanel() {
  const { user } = useAuth();
  if (!user) return null;

  const today = new Date().getDay();
  const goalXP = 10;
  const todayXP = Math.min(user.xp % 100, goalXP); // crude daily proxy
  const progressPct = Math.min(100, (todayXP / goalXP) * 100);

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

      {/* Daily goal */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-[#AFAFAF] uppercase tracking-widest">Daily goal</span>
          <span className="text-xs font-bold text-[#AFAFAF]">{goalXP} XP</span>
        </div>
        <div className="w-full h-4 bg-[#E5E5E5] rounded-full overflow-hidden mb-2">
          <div
            className={`h-full bg-[#58CC02] rounded-full transition-all duration-700 ${progressPct >= 70 ? 'animate-nearGoal' : ''}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-sm font-bold text-[#AFAFAF]">{todayXP}/{goalXP} XP today</p>
      </div>

      {/* Gems */}
      <div className="stat-card flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold text-[#AFAFAF] uppercase tracking-widest mb-1">Gems</p>
          <p className="text-3xl font-black text-[#1CB0F6]">💎 <span>{(user.gems || 0).toLocaleString()}</span></p>
        </div>
        <Link to="/shop" className="text-xs font-extrabold text-[#1CB0F6] hover:underline uppercase tracking-wider">
          SHOP →
        </Link>
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
          {(user.hearts || 0) < 5 && (
            <Link to="/shop" className="text-xs font-extrabold text-[#FF4B4B] hover:underline uppercase">
              REFILL
            </Link>
          )}
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
