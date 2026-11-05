import { useEffect, useState } from 'react';
import { sounds } from '../utils/sounds';

// Wishlist #3: a short first-time walkthrough that explains the features
// that make this clone different, since new users won't have us there to
// explain them live like we did in the presentation.
const STEPS = [
  {
    icon: '🦉',
    title: 'Welcome!',
    body: 'This is a Duolingo-style app built around the Goal-Gradient Effect: the closer you get to a goal, the more motivated you feel. Here’s a 20-second tour.',
  },
  {
    icon: '⚡',
    title: 'Velocity XP Bar',
    body: 'Your daily XP bar heats up from green to amber to fire as you get close to your goal, then bursts into confetti when you hit it.',
  },
  {
    icon: '🛤️',
    title: 'Shrinking Lesson Path',
    body: 'As you finish lessons, the path ahead gets shorter and zooms toward the finish line, so you can see how close you are.',
  },
  {
    icon: '🏁',
    title: 'League Urgency Meter',
    body: 'On the leaderboard, a meter shows how close you are to the promotion zone. Get within 50 XP and your row catches fire.',
  },
  {
    icon: '🏆',
    title: 'Badges',
    body: 'Earn badges for streaks and lessons. You’ll get a pop-up the moment you unlock one, and you can pin your favorites to your profile.',
  },
];

const KEY = 'duo-intro-seen';

export function hasSeenIntro() {
  try { return localStorage.getItem(KEY) === '1'; } catch { return true; }
}

export function resetIntro() {
  try { localStorage.removeItem(KEY); } catch {}
  window.dispatchEvent(new Event('duo-intro-replay'));
}

export default function IntroTour() {
  const [open, setOpen] = useState(() => !hasSeenIntro());
  const [step, setStep] = useState(0);

  useEffect(() => {
    const replay = () => { setStep(0); setOpen(true); };
    window.addEventListener('duo-intro-replay', replay);
    return () => window.removeEventListener('duo-intro-replay', replay);
  }, []);

  if (!open) return null;

  const close = () => {
    try { localStorage.setItem(KEY, '1'); } catch {}
    setOpen(false);
  };
  const next = () => {
    sounds.tap();
    if (step + 1 < STEPS.length) setStep(s => s + 1);
    else close();
  };

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:px-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border-2 border-b-[6px] border-[#E5E5E5] p-6 pb-8 sm:pb-6 text-center">
        <div key={step} className="animate-fadeIn">
          <div className="text-6xl mb-3">{s.icon}</div>
          <h2 id="intro-title" className="text-2xl font-black text-[#3C3C3C] mb-2">{s.title}</h2>
          <p className="text-[#777777] font-bold leading-relaxed mb-6">{s.body}</p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-[#58CC02]' : 'w-2.5 bg-[#E5E5E5]'
              }`}
            />
          ))}
        </div>

        <button onClick={next} className="btn-green w-full" autoFocus>
          {last ? "LET'S GO" : 'NEXT'}
        </button>
        {!last && (
          <button onClick={close} className="mt-3 text-sm font-extrabold text-[#AFAFAF] hover:text-[#3C3C3C] uppercase tracking-wide">
            Skip tour
          </button>
        )}
      </div>
    </div>
  );
}
