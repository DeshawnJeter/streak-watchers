import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import CharacterAvatar from '../components/CharacterAvatar';
import AvatarBuilder from '../components/AvatarBuilder';

const LEAGUES = [
  { name: 'Bronze',   emoji: '🥉', color: '#CD7F32', min: 0     },
  { name: 'Silver',   emoji: '🥈', color: '#C0C0C0', min: 100   },
  { name: 'Gold',     emoji: '🥇', color: '#FFD700', min: 250   },
  { name: 'Sapphire', emoji: '💎', color: '#0F52BA', min: 600   },
  { name: 'Ruby',     emoji: '💎', color: '#FF4B4B', min: 1500  },
  { name: 'Emerald',  emoji: '💚', color: '#50C878', min: 3000  },
  { name: 'Amethyst', emoji: '💜', color: '#CE82FF', min: 6000  },
  { name: 'Pearl',    emoji: '🌟', color: '#FFC800', min: 10000 },
  { name: 'Obsidian', emoji: '⬛', color: '#3C3C3C', min: 16000 },
  { name: 'Diamond',  emoji: '💠', color: '#1CB0F6', min: 30000 },
];

function getLeague(xp) {
  return [...LEAGUES].reverse().find(l => xp >= l.min) || LEAGUES[0];
}

function WeeklyXpChart({ dailyXp }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  // Build 7-bar dataset: today's bar has real data, others are mock
  const data = days.map((d, i) => {
    if (i === adjustedToday) return { day: d, xp: dailyXp || 0, isToday: true };
    // Generate plausible mock data
    const seed = (i * 7 + 13) % 37;
    return { day: d, xp: seed * 2, isToday: false };
  });

  const maxXp = Math.max(...data.map(d => d.xp), 1);

  return (
    <div className="border-2 border-[#E5E5E5] rounded-2xl p-5 mb-4">
      <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-4">Weekly XP</p>
      <div className="flex items-end justify-between gap-1 h-20">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.max(4, (d.xp / maxXp) * 60)}px`,
                  backgroundColor: d.isToday ? '#58CC02' : '#E5E5E5',
                }}
              />
            </div>
            <span className={`text-[10px] font-extrabold ${d.isToday ? 'text-[#58CC02]' : 'text-[#AFAFAF]'}`}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATS_CONFIG = [
  { key: 'streak',            label: 'Day Streak',    emoji: '🔥', color: '#FF9600' },
  { key: 'xp',                label: 'Total XP',      emoji: '⚡', color: '#FFC800' },
  { key: 'lessons_completed', label: 'Lessons',       emoji: '📚', color: '#58CC02' },
  { key: 'gems',              label: 'Gems',          emoji: '💎', color: '#1CB0F6' },
];

export default function Profile() {
  const { user, setUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCharSelect, setShowCharSelect] = useState(false);

  useEffect(() => {
    api.get('/users/profile').then(r => setProfile(r.data));
  }, []);

  const saveUsername = async () => {
    setSaving(true);
    setError('');
    try {
      const r = await api.patch('/users/profile', { username });
      setUser(u => ({ ...u, username: r.data.username }));
      setProfile(p => ({ ...p, username: r.data.username }));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveAvatar = async avatarJson => {
    await api.patch('/users/profile', { avatar: avatarJson });
    setUser(u => ({ ...u, avatar: avatarJson }));
    setProfile(p => ({ ...p, avatar: avatarJson }));
    setShowCharSelect(false);
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  if (showCharSelect) return (
    <AvatarBuilder
      initial={profile.avatar}
      streak={profile.streak || 0}
      lessons={profile.lessons_completed || 0}
      onSave={saveAvatar}
      onClose={() => setShowCharSelect(false)}
    />
  );

  const joined = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const level = Math.floor(profile.xp / 1000) + 1;
  const levelXP = profile.xp % 1000;
  const league = getLeague(profile.xp || 0);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Avatar + name */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowCharSelect(true)}
          className="inline-block mb-3 hover:scale-110 transition-transform"
          title="Edit avatar"
        >
          <CharacterAvatar avatar={profile.avatar} size={96} />
        </button>
        <p className="text-xs font-bold text-[#AFAFAF] mb-2 uppercase tracking-wider">Tap to edit avatar</p>

        {editing ? (
          <div className="flex flex-col items-center gap-3">
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl px-4 py-2 font-extrabold text-center text-[#3C3C3C] focus:outline-none focus:border-[#84D8FF] w-48"
            />
            {error && <p className="text-[#FF4B4B] text-sm font-bold">{error}</p>}
            <div className="flex gap-2">
              <button onClick={saveUsername} disabled={saving} className="btn-green py-2 px-6 text-sm">{saving ? '...' : 'SAVE'}</button>
              <button onClick={() => setEditing(false)} className="btn-white py-2 px-6 text-sm">CANCEL</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black text-[#3C3C3C]">{profile.username}</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold text-white"
                style={{ backgroundColor: league.color }}
              >
                {league.emoji} {league.name} League
              </span>
            </div>
            <p className="text-[#AFAFAF] font-bold text-sm mt-1">Joined {joined}</p>
            <button
              onClick={() => { setUsername(profile.username); setEditing(true); }}
              className="mt-2 text-sm text-[#1CB0F6] font-extrabold hover:underline uppercase tracking-wider"
            >
              EDIT PROFILE
            </button>
          </>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {STATS_CONFIG.map(s => (
          <div key={s.key} className="border-2 border-[#E5E5E5] rounded-2xl p-4 text-center">
            <p className="text-4xl mb-1">{s.emoji}</p>
            <p className="text-2xl font-black text-[#3C3C3C]">
              {(profile[s.key] || 0).toLocaleString()}
            </p>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly XP chart */}
      <WeeklyXpChart dailyXp={profile.daily_xp || 0} />

      {/* Level bar */}
      <div className="border-2 border-[#E5E5E5] rounded-2xl p-5 mb-4">
        <div className="flex justify-between items-center mb-3">
          <p className="font-extrabold text-[#3C3C3C]">Level {level}</p>
          <p className="text-sm font-bold text-[#AFAFAF]">{levelXP.toLocaleString()} / 1,000 XP</p>
        </div>
        <div className="w-full h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
          <div
            className={`h-full bg-[#CE82FF] rounded-full transition-all duration-700 ${(levelXP / 1000) * 100 >= 70 ? 'animate-nearGoal' : ''}`}
            style={{ width: `${(levelXP / 1000) * 100}%` }}
          />
        </div>
        <p className="text-xs text-[#AFAFAF] font-bold mt-2">
          {(1000 - levelXP).toLocaleString()} XP to Level {level + 1}
        </p>
      </div>

      {/* Hearts */}
      <div className="border-2 border-[#E5E5E5] rounded-2xl p-5 mb-4">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Hearts</p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-2xl ${i < profile.hearts ? '' : 'grayscale opacity-20'}`}>❤️</span>
          ))}
        </div>
      </div>

      {/* Languages */}
      {profile.courses?.length > 0 && (
        <div className="border-2 border-[#E5E5E5] rounded-2xl p-5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Languages</p>
          <div className="flex flex-wrap gap-2">
            {profile.courses.map(c => (
              <span key={c.language_code} className="flex items-center gap-2 bg-[#F7F7F7] rounded-2xl px-4 py-2 text-sm font-extrabold text-[#3C3C3C]">
                {c.flag} {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
