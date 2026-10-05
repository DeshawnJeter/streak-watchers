import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function QuestCard({ quest, onClaim }) {
  const [claiming, setClaiming] = useState(false);
  const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));

  const claim = async () => {
    setClaiming(true);
    try { await onClaim(quest.id); } finally { setClaiming(false); }
  };

  return (
    <div className={`border-2 border-b-[3px] rounded-2xl p-4 flex items-center gap-4 transition-all ${
      quest.claimed ? 'border-[#58CC02] bg-[#F0FFF0]' : 'border-[#E5E5E5] bg-white'
    }`}>
      <span className="text-3xl flex-shrink-0">{quest.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[#3C3C3C] text-sm">{quest.title}</p>
        <p className="text-xs text-[#AFAFAF] font-bold mb-2">{quest.description}</p>
        {quest.claimed ? (
          <p className="text-xs font-extrabold text-[#58CC02]">✓ Claimed</p>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#58CC02' : '#1CB0F6' }}
              />
            </div>
            <span className="text-[10px] font-extrabold text-[#AFAFAF] whitespace-nowrap">
              {quest.progress}/{quest.target}
            </span>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        <span className="text-xs font-extrabold text-[#FFC800]">+{quest.xp_reward} XP</span>
        {quest.completed && !quest.claimed && (
          <button
            onClick={claim}
            disabled={claiming}
            className="btn-green text-xs py-2 px-4"
          >
            {claiming ? '…' : 'CLAIM'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Quests() {
  const { refreshUser } = useAuth();
  const [tab, setTab] = useState('daily');
  const [quests, setQuests] = useState({ daily: [], weekly: [] });
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/quests').then(r => setQuests(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const claim = async id => {
    await api.post(`/quests/${id}/claim`);
    await refreshUser();
    load();
  };

  const shown = quests[tab] || [];
  const claimed = shown.filter(q => q.claimed).length;
  const total = shown.length;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[#3C3C3C] mb-1">Quests</h1>
      <p className="text-[#AFAFAF] font-bold mb-6">Complete quests to earn bonus XP</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[{ key: 'daily', label: 'DAILY' }, { key: 'weekly', label: 'WEEKLY' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 rounded-2xl font-extrabold text-sm tracking-wider transition-colors ${
              tab === t.key
                ? 'bg-[#FFC800] text-[#3C3C3C] border-b-[3px] border-[#E5B400]'
                : 'bg-[#F7F7F7] text-[#AFAFAF] border-b-[2px] border-[#E5E5E5] hover:bg-[#EAEAEA]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Progress summary */}
      <div className="flex items-center gap-3 mb-5 bg-[#F7F7F7] rounded-2xl px-4 py-3">
        <div className="flex-1 h-3 bg-[#E5E5E5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#58CC02] rounded-full transition-all duration-700"
            style={{ width: total ? `${(claimed / total) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-sm font-extrabold text-[#AFAFAF]">{claimed}/{total}</span>
      </div>

      <div className="flex flex-col gap-3">
        {shown.map(q => (
          <QuestCard key={q.id} quest={q} onClaim={claim} />
        ))}
      </div>

      {shown.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔮</div>
          <p className="font-extrabold text-[#AFAFAF]">No quests available</p>
        </div>
      )}
    </div>
  );
}
