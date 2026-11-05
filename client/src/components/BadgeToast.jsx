import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Confetti from './Confetti';
import { sounds } from '../utils/sounds';

// Wishlist #4: pop-up the moment a badge is earned, instead of making
// the user discover it later on the Achievements page.
export default function BadgeToast({ badges, onDone }) {
  const [index, setIndex] = useState(0);
  const badge = badges[index];

  useEffect(() => {
    if (badge) sounds.badge();
  }, [badge]);

  if (!badge) return null;

  const next = () => {
    if (index + 1 < badges.length) setIndex(i => i + 1);
    else onDone?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-toast-title"
    >
      <div key={badge.id} className="relative w-full max-w-xs bg-white rounded-3xl border-2 border-b-[6px] border-[#E5E5E5] p-6 text-center overflow-hidden animate-bounceIn">
        <Confetti />
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-3">Badge unlocked!</p>
        <div className="mx-auto mb-3 w-24 h-24 rounded-full bg-[#FFF3B3] border-4 border-[#FFC800] flex items-center justify-center text-5xl animate-badgeSpin">
          {badge.icon}
        </div>
        <h3 id="badge-toast-title" className="text-xl font-black text-[#3C3C3C]">{badge.name}</h3>
        <p className="text-sm font-bold text-[#AFAFAF] mb-5">{badge.desc}</p>
        <button onClick={next} className="btn-green w-full" autoFocus>
          {index + 1 < badges.length ? 'NEXT' : 'AWESOME'}
        </button>
        <Link to="/achievements" className="block mt-3 text-sm font-extrabold text-[#1CB0F6] hover:underline">
          View all achievements
        </Link>
      </div>
    </div>
  );
}
