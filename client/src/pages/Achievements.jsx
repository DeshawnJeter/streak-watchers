import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const RARITY_COLORS = {
  legendary: { bg: '#FFF3B3', border: '#FFC800', text: '#7B5A00', badge: '✨ Legendary' },
  epic:      { bg: '#EDE0FF', border: '#CE82FF', text: '#6B00CC', badge: '💜 Epic' },
  rare:      { bg: '#DDF4FF', border: '#1CB0F6', text: '#0068A5', badge: '💙 Rare' },
  common:    { bg: '#F7F7F7', border: '#E5E5E5', text: '#AFAFAF', badge: 'Common' },
};

function BadgeTile({ achievement, isPinned, onTogglePin, canPin }) {
  const r = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
  const locked = !achievement.earned;

  return (
    <div
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-b-[3px] transition-all cursor-pointer hover:scale-105 active:scale-100 relative"
      style={{
        backgroundColor: locked ? '#F7F7F7' : r.bg,
        borderColor: locked ? '#E5E5E5' : r.border,
        opacity: locked ? 0.55 : 1,
      }}
      onClick={() => !locked && onTogglePin(achievement.id)}
      title={locked ? 'Complete this achievement to unlock' : isPinned ? 'Unpin' : canPin ? 'Pin to profile' : 'Max 3 pinned'}
    >
      {isPinned && (
        <div className="absolute top-1.5 right-1.5 text-xs">📌</div>
      )}
      <span className="text-3xl" style={{ filter: locked ? 'grayscale(1)' : 'none' }}>
        {achievement.emoji}
      </span>
      <p className="text-xs font-extrabold text-center leading-tight"
         style={{ color: locked ? '#AFAFAF' : '#3C3C3C' }}>
        {achievement.name}
      </p>
      <span className="text-[10px] font-bold" style={{ color: locked ? '#C7C7C7' : r.text }}>
        {locked ? '🔒 Locked' : r.badge}
      </span>
    </div>
  );
}

function PinnedSlot({ achievement, index, onUnpin }) {
  if (!achievement) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-[#E5E5E5] min-h-[110px]">
        <span className="text-2xl text-[#E5E5E5]">＋</span>
        <p className="text-xs font-bold text-[#AFAFAF]">Empty slot {index + 1}</p>
      </div>
    );
  }
  const r = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
  return (
    <div
      className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-b-[3px] cursor-pointer hover:opacity-80 transition-opacity relative animate-pop"
      style={{ backgroundColor: r.bg, borderColor: r.border }}
      onClick={() => onUnpin(achievement.id)}
      title="Click to unpin"
    >
      <div className="absolute top-2 right-2 text-xs opacity-50">✕</div>
      <span className="text-4xl">{achievement.emoji}</span>
      <p className="text-xs font-extrabold text-center" style={{ color: '#3C3C3C' }}>
        {achievement.name}
      </p>
      <span className="text-[10px] font-bold" style={{ color: r.text }}>{r.badge}</span>
    </div>
  );
}

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all'); // all | earned | locked

  useEffect(() => {
    api.get('/achievements')
      .then(r => {
        setAchievements(r.data.achievements);
        setPinned(r.data.pinned);
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePin = async (id) => {
    const isPinned = pinned.includes(id);
    let newPins;
    if (isPinned) {
      newPins = pinned.filter(p => p !== id);
    } else {
      if (pinned.length >= 3) return; // max 3
      newPins = [...pinned, id];
    }
    setPinned(newPins);
    setSaving(true);
    try {
      await api.patch('/achievements/pins', { pins: newPins });
    } catch (_) {
      setPinned(pinned); // revert on error
    } finally {
      setSaving(false);
    }
  };

  const pinnedAchievements = [0, 1, 2].map(i => {
    const id = pinned[i];
    return id ? achievements.find(a => a.id === id) || null : null;
  });

  const earned = achievements.filter(a => a.earned);
  const filteredAchievements = filter === 'earned'
    ? achievements.filter(a => a.earned)
    : filter === 'locked'
      ? achievements.filter(a => !a.earned)
      : achievements;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-black text-[#3C3C3C] mb-1">Achievements</h1>
      <p className="text-[#AFAFAF] font-bold mb-6">
        {earned.length}/{achievements.length} earned
      </p>

      {/* Pinned showcase */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-[#3C3C3C]">📌 Pinned Badges</h2>
          {saving && <span className="text-xs text-[#AFAFAF] font-bold animate-pulse">Saving…</span>}
        </div>
        <p className="text-xs text-[#AFAFAF] font-bold mb-3">
          Click any earned badge below to pin it here (max 3)
        </p>
        <div className="grid grid-cols-3 gap-3">
          {pinnedAchievements.map((a, i) => (
            <PinnedSlot
              key={i}
              achievement={a}
              index={i}
              onUnpin={togglePin}
            />
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all',    label: 'All' },
          { key: 'earned', label: `Earned (${earned.length})` },
          { key: 'locked', label: 'Locked' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-2xl text-sm font-extrabold transition-colors ${
              filter === f.key
                ? 'bg-[#FFC800] text-[#3C3C3C] border-b-[3px] border-[#E5B400]'
                : 'bg-[#F7F7F7] text-[#AFAFAF] border-b-[2px] border-[#E5E5E5] hover:bg-[#EAEAEA]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-3 gap-3">
        {filteredAchievements.map(a => (
          <BadgeTile
            key={a.id}
            achievement={a}
            isPinned={pinned.includes(a.id)}
            onTogglePin={togglePin}
            canPin={pinned.length < 3}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-16 text-[#AFAFAF]">
          <div className="text-5xl mb-3">🏅</div>
          <p className="font-extrabold">No achievements here yet</p>
        </div>
      )}
    </div>
  );
}
