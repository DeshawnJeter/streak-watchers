import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CharacterAvatar from './CharacterAvatar';

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('duo-theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-duo-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem('duo-theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  return [dark, () => setDark(d => !d)];
}

// SVG icons that match Duolingo's icon style
const Icons = {
  Learn: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  ),
  Leaderboard: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
      <path d="M7 18H3v-7h4m10 7h-4V5h4m-5 13H8V9h4v9z"/>
    </svg>
  ),
  Quests: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
      <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
    </svg>
  ),
  Profile: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  Achievements: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
    </svg>
  ),
  More: () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
    </svg>
  ),
};

const navItems = [
  { to: '/learn',         Icon: Icons.Learn,        label: 'LEARN' },
  { to: '/leaderboard',   Icon: Icons.Leaderboard,  label: 'LEADERBOARD' },
  { to: '/quests',        Icon: Icons.Quests,       label: 'QUESTS' },
  { to: '/achievements',  Icon: Icons.Achievements, label: 'ACHIEVEMENTS' },
  { to: '/profile',       Icon: Icons.Profile,      label: 'PROFILE' },
];

const mobileItems = navItems.slice(0, 5);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, toggleDark] = useDarkMode();

  return (
    <>
      {/* ── Desktop left sidebar ── */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[256px] border-r-2 border-[#E5E5E5] bg-white z-40 py-6 px-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-2 mb-8 cursor-pointer"
          onClick={() => navigate('/learn')}
        >
          <span className="text-[40px] leading-none">🦉</span>
          <span className="text-[26px] font-black text-[#58CC02] leading-none tracking-tight">duolingo</span>
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/learn'}>
              {({ isActive }) => (
                <div className={`nav-item ${isActive ? 'active' : ''}`}>
                  <Icon />
                  <span className="text-[15px] font-extrabold tracking-wider">{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* User + logout */}
        {user && (
          <div className="mt-auto pt-4 border-t-2 border-[#E5E5E5]">
            <div className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-[#F7F7F7] cursor-pointer"
                 onClick={() => navigate('/profile')}>
              <CharacterAvatar avatar={user.avatar} size={40} />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#3C3C3C] truncate">{user.username}</p>
                <p className="text-xs text-[#AFAFAF] font-bold">{(user.xp || 0).toLocaleString()} XP</p>
              </div>
            </div>
            <button
              onClick={toggleDark}
              className="w-full mt-1 flex items-center gap-3 px-3 py-2 text-sm text-[#AFAFAF] font-bold rounded-xl hover:bg-[#F7F7F7] transition-colors"
            >
              <span className="text-lg">{dark ? '☀️' : '🌙'}</span>
              <span>{dark ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full mt-1 text-left px-3 py-2 text-sm text-[#AFAFAF] font-bold rounded-xl hover:bg-[#FFF0F0] hover:text-[#FF4B4B] transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </nav>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b-2 border-[#E5E5E5] z-40 flex items-center justify-between px-4 py-3">
        <span className="text-[22px] font-black text-[#58CC02]">🦉 duolingo</span>
        {user && (
          <div className="flex items-center gap-3 text-sm font-extrabold">
            <span className="flex items-center gap-1 text-[#FF9600]">🔥 {user.streak || 0}</span>
            <span className="flex items-center gap-1 text-[#FFC800]">💎 {user.gems || 0}</span>
            <span className="flex items-center gap-1 text-[#FF4B4B]">❤️ {user.hearts || 0}</span>
            <button onClick={toggleDark} className="text-lg">{dark ? '☀️' : '🌙'}</button>
          </div>
        )}
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E5E5E5] z-40 flex">
        {mobileItems.map(({ to, Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/learn'} className="flex-1">
            {({ isActive }) => (
              <div className={`flex flex-col items-center py-3 gap-0.5 transition-colors ${isActive ? 'text-[#1CB0F6]' : 'text-[#AFAFAF]'}`}>
                <Icon />
                <span className="text-[10px] font-extrabold tracking-wider">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
