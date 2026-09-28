import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

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

const PODIUM = {
  1: { bg: '#FFC800', size: 'h-16', label: '🥇' },
  2: { bg: '#C0C0C0', size: 'h-12', label: '🥈' },
  3: { bg: '#CD7F32', size: 'h-8',  label: '🥉' },
};

export default function Leaderboard() {
  const [tab, setTab] = useState('weekly');
  const [weekly, setWeekly] = useState({ leaderboard: [] });
  const [alltime, setAlltime] = useState({ leaderboard: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get('/leaderboard/weekly'),
      api.get('/leaderboard/alltime'),
    ]).then(([w, a]) => {
      setWeekly(w.data);
      setAlltime(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const data = tab === 'weekly' ? weekly.leaderboard : alltime.leaderboard;
  const myLeague = getLeague(user?.xp || 0);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-2" style={{ color: myLeague.color }}>{myLeague.emoji}</div>
        <h1 className="text-3xl font-black text-[#3C3C3C]">{myLeague.name} League</h1>
        <p className="text-[#AFAFAF] font-bold mt-1">Top 10 advance · Bottom 5 drop down</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'weekly', label: 'THIS WEEK' },
          { key: 'alltime', label: 'ALL TIME' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 rounded-2xl font-extrabold text-sm tracking-wider uppercase transition-colors ${
              tab === t.key
                ? 'bg-[#FFC800] text-[#3C3C3C] border-b-[3px] border-[#E5B400]'
                : 'bg-[#F7F7F7] text-[#AFAFAF] border-b-[3px] border-[#E5E5E5] hover:bg-[#EAEAEA]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏆</div>
          <p className="font-extrabold text-[#AFAFAF] text-lg">Complete a lesson to appear here!</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-8 h-36">
              {/* 2nd */}
              {[1, 0, 2].map(i => {
                const entry = top3[i];
                const pos = i + 1;
                const p = PODIUM[pos];
                return (
                  <div key={entry?.id || i} className="flex flex-col items-center gap-2 flex-1">
                    <div className="text-3xl">{entry?.avatar || '🦉'}</div>
                    <p className={`text-xs font-extrabold text-[#3C3C3C] truncate max-w-[80px] ${entry?.is_me ? 'text-[#1CB0F6]' : ''}`}>
                      {entry?.username}
                    </p>
                    <p className="text-sm font-black text-[#AFAFAF]">{(entry?.xp || 0).toLocaleString()} XP</p>
                    <div
                      className={`w-full ${p.size} rounded-t-xl flex items-start justify-center pt-2 text-2xl`}
                      style={{ backgroundColor: p.bg }}
                    >
                      {p.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rank rows */}
          <div className="flex flex-col gap-2">
            {data.map((entry, idx) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  entry.is_me
                    ? 'border-[#1CB0F6] bg-[#DDF4FF]'
                    : 'border-[#E5E5E5] bg-white'
                } ${idx === 9 ? 'border-dashed border-[#FF4B4B]' : ''}`}
              >
                <div className="w-8 text-center font-black text-lg text-[#AFAFAF]">
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                </div>
                <div className="w-10 h-10 rounded-full bg-[#DDF4FF] flex items-center justify-center text-xl">
                  {entry.avatar || '🦉'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-extrabold truncate ${entry.is_me ? 'text-[#1CB0F6]' : 'text-[#3C3C3C]'}`}>
                    {entry.username}{entry.is_me ? ' (You)' : ''}
                  </p>
                  <p className="text-xs text-[#AFAFAF] font-bold flex items-center gap-1">
                    🔥 {entry.streak} day streak
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#3C3C3C]">{(entry.xp || 0).toLocaleString()}</p>
                  <p className="text-xs text-[#AFAFAF] font-bold">XP</p>
                </div>
              </div>
            ))}
          </div>

          {/* Demotion zone label */}
          {data.length > 9 && (
            <p className="text-center text-xs text-[#FF4B4B] font-extrabold uppercase tracking-wider mt-2">
              ↑ Demotion zone
            </p>
          )}
        </>
      )}
    </div>
  );
}
