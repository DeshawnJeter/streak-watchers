import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import GachaRankBanner from '../components/GachaRankBanner';
import CharacterAvatar from '../components/CharacterAvatar';
import MiniPlayerBanner, { getBannerColors } from '../components/MiniPlayerBanner';

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

// ── Feature 3: League Urgency Meter ──────────────────────────────────────────
// Players within striking distance of the promotion zone (top 10) see
// escalating urgency cues: color heats up, row bounces, XP gap label pulses.
// This triggers the goal-gradient acceleration effect near a reachable threshold.
const PROMOTION_RANK = 10;

function getUrgencyLevel(rank, xpToAdvance) {
  if (rank <= PROMOTION_RANK) return 'promoted';
  if (xpToAdvance <= 50)  return 'fire';
  if (xpToAdvance <= 150) return 'amber';
  if (xpToAdvance <= 350) return 'teal';
  return 'gray';
}

const URGENCY_COLORS = {
  promoted: '#58CC02',
  fire:     '#FF4B4B',
  amber:    '#FF9600',
  teal:     '#1CB0F6',
  gray:     '#AFAFAF',
};

function UrgencyMeter({ entry, promotionXp }) {
  const xpToAdvance = Math.max(0, promotionXp - (entry.xp || 0));
  const level = getUrgencyLevel(entry.rank, xpToAdvance);
  const color = URGENCY_COLORS[level];

  if (level === 'promoted') {
    return (
      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#D7FFB8', color: '#2B730A' }}>
        🏆 TOP 10
      </span>
    );
  }

  // Proximity bar: fill based on how close to the promotion threshold
  // Max gap we consider is 500 XP (beyond that = gray, no bar shown)
  if (level === 'gray') return null;

  const proximityPct = Math.min(100, Math.max(5, 100 - (xpToAdvance / 500) * 100));

  return (
    <div className="flex flex-col items-end gap-0.5 min-w-[80px]">
      {/* Bar */}
      <div className="w-full h-[5px] bg-[#E5E5E5] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${proximityPct}%`,
            backgroundColor: color,
            transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>
      {/* Label */}
      <span
        className={`text-[10px] font-extrabold ${level === 'fire' ? 'animate-xpFireGlow' : ''}`}
        style={{ color }}
      >
        {level === 'fire' ? `🔥 ${xpToAdvance} XP` : `${xpToAdvance} XP`}
      </span>
    </div>
  );
}

function LeagueTierCarousel({ currentLeague }) {
  const activeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const el = activeRef.current;
      const container = containerRef.current;
      const offset = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [currentLeague]);

  return (
    <div ref={containerRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-4" style={{ scrollbarWidth: 'none' }}>
      {LEAGUES.map(l => {
        const isActive = l.name === currentLeague.name;
        return (
          <div
            key={l.name}
            ref={isActive ? activeRef : null}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 transition-all ${
              isActive
                ? 'border-[#FFC800] bg-[#FFF3B3] scale-110'
                : 'border-[#E5E5E5] bg-white opacity-60'
            }`}
          >
            <span className="text-2xl">{l.emoji}</span>
            <span className="text-[10px] font-extrabold text-[#3C3C3C] whitespace-nowrap">{l.name}</span>
          </div>
        );
      })}
    </div>
  );
}

function PlayerSummaryModal({ entry, onClose }) {
  if (!entry) return null;
  const colors = getBannerColors(entry.xp || 0);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#FFF', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 480 }}
      >
        {/* MiniPlayerBanner — avatar in electric ring + rank shield + 3 badge medal slots */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <MiniPlayerBanner
            avatar={entry.avatar}
            username={entry.username}
            rank={entry.rank}
            pinnedBadges={entry.pinned_achievements || []}
            primaryColor={colors.primary}
            secondaryColor={colors.secondary}
            xp={entry.xp || 0}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { emoji: '🔥', label: 'Streak', value: `${entry.streak || 0}d` },
            { emoji: '⚡', label: 'XP', value: (entry.xp || 0).toLocaleString() },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, border: '2px solid #E5E5E5', borderRadius: 14, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 2 }}>{s.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#3C3C3C' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#AFAFAF', fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 4, width: '100%', background: '#F7F7F7', border: 'none',
            borderRadius: 16, padding: 14, fontWeight: 800, fontSize: 15, color: '#3C3C3C', cursor: 'pointer',
          }}
        >CLOSE</button>
      </div>
    </div>
  );
}

function useCountdown() {
  const [daysLeft] = useState(() => {
    try {
      const stored = localStorage.getItem('duo-league-days');
      const parsed = stored ? JSON.parse(stored) : null;
      const now = Date.now();
      if (parsed && parsed.expires > now) return parsed.days;
      const days = Math.floor(Math.random() * 5) + 3;
      localStorage.setItem('duo-league-days', JSON.stringify({ days, expires: now + days * 86400000 }));
      return days;
    } catch { return 5; }
  });
  return daysLeft;
}

export default function Leaderboard() {
  const [tab, setTab] = useState('weekly');
  const [weekly, setWeekly] = useState({ leaderboard: [] });
  const [alltime, setAlltime] = useState({ leaderboard: [] });
  const [myPinnedBadges, setMyPinnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { user } = useAuth();
  const daysLeft = useCountdown();

  useEffect(() => {
    Promise.all([
      api.get('/leaderboard/weekly'),
      api.get('/leaderboard/alltime'),
      api.get('/achievements'),
    ]).then(([w, a, ach]) => {
      setWeekly(w.data);
      setAlltime(a.data);
      // Resolve the current user's pinned IDs into full achievement objects
      const catalog = ach.data.achievements;
      const pinnedIds = ach.data.pinned || [];
      setMyPinnedBadges(
        pinnedIds.map(id => catalog.find(a => a.id === id)).filter(Boolean)
      );
    }).finally(() => setLoading(false));
  }, []);

  const data = tab === 'weekly' ? weekly.leaderboard : alltime.leaderboard;
  const myLeague = getLeague(user?.xp || 0);

  // XP of the player at rank PROMOTION_RANK (the advancement threshold)
  const promotionEntry = data.find(e => e.rank === PROMOTION_RANK);
  const promotionXp = promotionEntry?.xp || 0;

  // Colors for GachaRankBanner based on current league
  const LEAGUE_COLORS = {
    Bronze:   { primary: '#CD7F32', secondary: '#8B4513' },
    Silver:   { primary: '#C0C0C0', secondary: '#808080' },
    Gold:     { primary: '#FFD700', secondary: '#FFA500' },
    Sapphire: { primary: '#0F52BA', secondary: '#1899D6' },
    Ruby:     { primary: '#FF4B4B', secondary: '#CC0000' },
    Emerald:  { primary: '#50C878', secondary: '#228B22' },
    Amethyst: { primary: '#CE82FF', secondary: '#8B00FF' },
    Pearl:    { primary: '#FFC800', secondary: '#FF9600' },
    Obsidian: { primary: '#4A4A4A', secondary: '#1C1C1C' },
    Diamond:  { primary: '#1CB0F6', secondary: '#0077C2' },
  };
  const leagueColors = LEAGUE_COLORS[myLeague.name] || LEAGUE_COLORS.Bronze;

  // Current user's rank in the displayed list
  const myEntry = data.find(e => e.is_me);
  const myRank = myEntry?.rank || '?';

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* ── GachaRankBanner: shows current user's league rank ── */}
      <div className="mb-6">
        <GachaRankBanner
          heroName={user?.username || 'Learner'}
          heroEmoji={user?.avatar || '🦉'}
          rankText={`RANK ${myRank}`}
          rewardXp={String(user?.xp || 0)}
          primaryColor={leagueColors.primary}
          secondaryColor={leagueColors.secondary}
          leftMedalEmoji={myLeague.emoji}
          rightMedalEmoji="⚡"
          pinnedBadges={myPinnedBadges}
        />
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="text-sm font-extrabold text-[#AFAFAF]">{myLeague.name} League</span>
          <span className="text-xs font-extrabold text-[#FF9600] bg-[#FFF3B3] px-2 py-1 rounded-full">
            ⏰ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
          </span>
        </div>
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
          {/* Top 3 podium — MiniPlayerBanner cards */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-8">
              {/* Order: 2nd (left), 1st (center/raised), 3rd (right) */}
              {[1, 0, 2].map(i => {
                const entry = top3[i];
                const pos = i + 1;
                const colors = getBannerColors(entry?.xp || 0);
                const podiumEmoji = PODIUM[pos]?.label;
                return (
                  <button
                    key={entry?.id || i}
                    onClick={() => setSelectedEntry(entry)}
                    className="focus:outline-none flex flex-col items-center gap-1"
                    style={{ transform: pos === 1 ? 'translateY(-16px)' : 'none', transition: 'transform 0.2s' }}
                  >
                    <MiniPlayerBanner
                      avatar={entry?.avatar}
                      username={entry?.username || ''}
                      rank={pos}
                      pinnedBadges={entry?.pinned_achievements || []}
                      primaryColor={colors.primary}
                      secondaryColor={colors.secondary}
                      xp={entry?.xp || 0}
                    />
                    <span className="text-xl mt-1">{podiumEmoji}</span>
                    <span className="text-xs font-black text-[#AFAFAF]">{(entry?.xp || 0).toLocaleString()} XP</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Feature 3: Rank rows with League Urgency Meter ── */}
          <div className="flex flex-col gap-2">
            {data.map((entry, idx) => {
              const xpToAdvance = Math.max(0, promotionXp - (entry.xp || 0));
              const urgencyLevel = getUrgencyLevel(entry.rank, xpToAdvance);
              const isFire = urgencyLevel === 'fire' && !entry.is_me;
              const isDemotion = idx >= 14; // bottom 5

              return (
                <div key={entry.id}>
                  {/* Promotion zone divider after rank 10 */}
                  {idx === 10 && data.length > 10 && (
                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-[#58CC02]" />
                      <span className="text-xs font-extrabold text-[#58CC02] bg-[#D7FFB8] px-3 py-1 rounded-full whitespace-nowrap">
                        🏆 Promotion Zone above
                      </span>
                      <div className="flex-1 h-px bg-[#58CC02]" />
                    </div>
                  )}
                  {/* Demotion zone divider after rank 15 */}
                  {idx === 15 && data.length > 15 && (
                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-[#FF4B4B]" />
                      <span className="text-xs font-extrabold text-[#FF4B4B] bg-[#FFDFE0] px-3 py-1 rounded-full whitespace-nowrap">
                        ⚠️ Demotion Zone below
                      </span>
                      <div className="flex-1 h-px bg-[#FF4B4B]" />
                    </div>
                  )}
                  <div
                    onClick={() => setSelectedEntry(entry)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer hover:opacity-90 ${
                      entry.is_me
                        ? 'border-[#1CB0F6] bg-[#DDF4FF]'
                        : isDemotion
                          ? 'border-dashed border-[#FF4B4B] bg-white'
                          : 'border-[#E5E5E5] bg-white'
                    } ${isFire ? 'animate-rowBounce animate-urgencyGlow' : ''}`}
                  >
                    <div className="w-8 text-center font-black text-lg text-[#AFAFAF] flex-shrink-0">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                    </div>
                    <CharacterAvatar avatar={entry.avatar} size={40} isMe={entry.is_me} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-extrabold truncate ${entry.is_me ? 'text-[#1CB0F6]' : 'text-[#3C3C3C]'}`}>
                        {entry.username}{entry.is_me ? ' (You)' : ''}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <p className="text-xs text-[#AFAFAF] font-bold">🔥 {entry.streak}d</p>
                        {(entry.pinned_achievements || []).map(a => (
                          <span
                            key={a.id}
                            title={a.name}
                            className="text-xs leading-none"
                            style={{
                              background: a.rarity === 'legendary' ? 'linear-gradient(135deg,#FFD700,#FF9600)'
                                        : a.rarity === 'epic'      ? 'linear-gradient(135deg,#CE82FF,#9932CC)'
                                        : a.rarity === 'rare'      ? 'linear-gradient(135deg,#1CB0F6,#0077C2)'
                                        :                            '#E5E5E5',
                              borderRadius: '50%',
                              width: 22, height: 22,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, flexShrink: 0,
                            }}
                          >
                            {a.emoji}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className="font-black text-[#3C3C3C] text-sm">{(entry.xp || 0).toLocaleString()} XP</p>
                      {!entry.is_me && (
                        <UrgencyMeter entry={entry} promotionXp={promotionXp} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedEntry && (
        <PlayerSummaryModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}
