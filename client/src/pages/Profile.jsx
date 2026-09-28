import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const AVATARS = ['🦉', '🐉', '🐺', '🦊', '🐸', '🐼', '🦁', '🐯', '🦋', '🐬', '🦄', '🐻'];

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
  const [showAvatars, setShowAvatars] = useState(false);

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

  const pickAvatar = async emoji => {
    await api.patch('/users/profile', { avatar: emoji });
    setUser(u => ({ ...u, avatar: emoji }));
    setProfile(p => ({ ...p, avatar: emoji }));
    setShowAvatars(false);
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  const joined = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const level = Math.floor(profile.xp / 1000) + 1;
  const levelXP = profile.xp % 1000;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Avatar + name */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowAvatars(v => !v)}
          className="text-[80px] leading-none hover:scale-110 transition-transform inline-block mb-3"
        >
          {profile.avatar || '🦉'}
        </button>

        {showAvatars && (
          <div className="animate-fadeIn border-2 border-[#E5E5E5] rounded-2xl p-4 mb-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Choose your avatar</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(e => (
                <button
                  key={e}
                  onClick={() => pickAvatar(e)}
                  className={`text-3xl p-2 rounded-xl transition-all hover:scale-110 ${profile.avatar === e ? 'bg-[#DDF4FF]' : 'hover:bg-[#F7F7F7]'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

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
      <div className="border-2 border-[#E5E5E5] rounded-2xl p-5 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Hearts</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-2xl ${i < profile.hearts ? '' : 'grayscale opacity-20'}`}>❤️</span>
            ))}
          </div>
        </div>
        {profile.hearts < 5 && (
          <Link to="/shop" className="btn-red py-2 px-4 text-sm">REFILL</Link>
        )}
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
