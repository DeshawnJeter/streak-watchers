import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
  { id: 1, flag: '🇪🇸', name: 'Spanish',  native: 'Español',   learners: '600M+' },
  { id: 2, flag: '🇫🇷', name: 'French',   native: 'Français',  learners: '110M+' },
  { id: 3, flag: '🇯🇵', name: 'Japanese', native: '日本語',     learners: '68M+' },
  { id: 4, flag: '🌐', name: 'Generic',  native: 'Practice',  learners: '50M+' },
];

const GOALS = [
  { xp: 10, label: 'Casual',   emoji: '🌿', sub: '10 XP per day' },
  { xp: 20, label: 'Regular',  emoji: '🎯', sub: '20 XP per day' },
  { xp: 30, label: 'Serious',  emoji: '🔥', sub: '30 XP per day' },
  { xp: 50, label: 'Intense',  emoji: '⚡', sub: '50 XP per day' },
];

const MOTIVATIONS = [
  { id: 'brain',  emoji: '🧠', label: 'Brain exercise' },
  { id: 'career', emoji: '💼', label: 'Career goals' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family' },
  { id: 'other',  emoji: '🌟', label: 'Other reasons' },
];

function StepDots({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current ? 'w-3 h-3 bg-[#58CC02]' : i === current ? 'w-4 h-4 bg-[#1CB0F6]' : 'w-3 h-3 bg-[#E5E5E5]'
          }`}
        />
      ))}
    </div>
  );
}

export default function Register() {
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(20);
  const [selectedMotivation, setSelectedMotivation] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, selectedGoal);
      navigate('/learn');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b-2 border-[#E5E5E5]">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl">🦉</span>
          <span className="text-[22px] font-black text-[#58CC02] tracking-tight">duolingo</span>
        </Link>
        <Link to="/login" className="text-sm font-extrabold text-[#1CB0F6] hover:underline">LOG IN</Link>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <StepDots current={step} total={4} />

          {/* Step 0 — Language selection */}
          {step === 0 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🦉</div>
                <h1 className="text-2xl font-black text-[#3C3C3C]">What do you want to learn?</h1>
              </div>
              <div className="flex flex-col gap-3">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-b-[4px] transition-all ${
                      selectedLang?.id === lang.id
                        ? 'border-[#58CC02] bg-[#D7FFB8]'
                        : 'border-[#E5E5E5] bg-white hover:bg-[#F7F7F7]'
                    }`}
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="font-extrabold text-[#3C3C3C]">{lang.name}</p>
                      <p className="text-xs text-[#AFAFAF] font-bold">{lang.learners} learners</p>
                    </div>
                    {selectedLang?.id === lang.id && <span className="text-[#58CC02] text-xl">✓</span>}
                  </button>
                ))}
              </div>
              <button
                onClick={() => selectedLang && setStep(1)}
                disabled={!selectedLang}
                className={`mt-6 w-full text-center ${selectedLang ? 'btn-green' : 'btn-gray'}`}
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* Step 1 — Daily goal */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <button onClick={() => setStep(0)} className="text-[#AFAFAF] font-bold mb-4">← Back</button>
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎯</div>
                <h1 className="text-2xl font-black text-[#3C3C3C]">Set your daily goal</h1>
                <p className="text-[#AFAFAF] font-bold mt-1 text-sm">We'll remind you to reach it every day</p>
              </div>
              <div className="flex flex-col gap-3">
                {GOALS.map(g => (
                  <button
                    key={g.xp}
                    onClick={() => setSelectedGoal(g.xp)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-b-[4px] transition-all ${
                      selectedGoal === g.xp
                        ? 'border-[#1CB0F6] bg-[#DDF4FF]'
                        : 'border-[#E5E5E5] bg-white hover:bg-[#F7F7F7]'
                    }`}
                  >
                    <span className="text-3xl">{g.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-extrabold text-[#3C3C3C]">{g.label}</p>
                      <p className="text-xs text-[#AFAFAF] font-bold">{g.sub}</p>
                    </div>
                    {selectedGoal === g.xp && <span className="text-[#1CB0F6] text-xl">✓</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn-blue mt-6 w-full text-center">CONTINUE</button>
            </div>
          )}

          {/* Step 2 — Motivation */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <button onClick={() => setStep(1)} className="text-[#AFAFAF] font-bold mb-4">← Back</button>
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">💭</div>
                <h1 className="text-2xl font-black text-[#3C3C3C]">Why are you learning?</h1>
                <p className="text-[#AFAFAF] font-bold mt-1 text-sm">This helps us personalize your experience</p>
              </div>
              <div className="flex flex-col gap-3">
                {MOTIVATIONS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMotivation(m.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-b-[4px] transition-all ${
                      selectedMotivation === m.id
                        ? 'border-[#FFC800] bg-[#FFF3B3]'
                        : 'border-[#E5E5E5] bg-white hover:bg-[#F7F7F7]'
                    }`}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <p className="flex-1 text-left font-extrabold text-[#3C3C3C]">{m.label}</p>
                    {selectedMotivation === m.id && <span className="text-[#FFC800] text-xl">✓</span>}
                  </button>
                ))}
              </div>
              <button
                onClick={() => selectedMotivation && setStep(3)}
                disabled={!selectedMotivation}
                className={`mt-6 w-full text-center ${selectedMotivation ? 'btn-green' : 'btn-gray'}`}
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* Step 3 — Account creation */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <button onClick={() => setStep(2)} className="text-[#AFAFAF] font-bold mb-4">← Back</button>
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🔑</div>
                <h1 className="text-2xl font-black text-[#3C3C3C]">Create your account</h1>
                <p className="text-[#AFAFAF] font-bold mt-1 text-sm">Save your progress forever</p>
              </div>

              {error && (
                <div className="bg-[#FFDFE0] border-2 border-[#FF4B4B] text-[#EA2B2B] rounded-2xl p-4 mb-4 text-sm font-bold text-center">
                  {error}
                </div>
              )}

              {/* Social placeholders */}
              <div className="flex flex-col gap-3 mb-5">
                <button disabled className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl border-2 border-b-[4px] border-[#E5E5E5] font-extrabold text-[#AFAFAF] text-sm cursor-not-allowed">
                  🔵 Continue with Google <span className="text-[10px] text-[#C7C7C7]">(coming soon)</span>
                </button>
                <button disabled className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl border-2 border-b-[4px] border-[#E5E5E5] font-extrabold text-[#AFAFAF] text-sm cursor-not-allowed">
                  🍎 Continue with Apple <span className="text-[10px] text-[#C7C7C7]">(coming soon)</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-[#E5E5E5]" />
                <span className="text-xs font-extrabold text-[#AFAFAF] uppercase">or</span>
                <div className="flex-1 h-px bg-[#E5E5E5]" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Username</label>
                  <input
                    type="text" required minLength={3}
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl px-4 py-3 font-bold text-[#3C3C3C] focus:outline-none focus:border-[#84D8FF] transition-colors"
                    placeholder="learner123"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Email address</label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl px-4 py-3 font-bold text-[#3C3C3C] focus:outline-none focus:border-[#84D8FF] transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Password</label>
                  <input
                    type="password" required minLength={6}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl px-4 py-3 font-bold text-[#3C3C3C] focus:outline-none focus:border-[#84D8FF] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-green mt-2 w-full text-center">
                  {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
                </button>
              </form>

              <p className="text-center text-sm text-[#AFAFAF] font-bold mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-[#1CB0F6] font-extrabold hover:underline">Log in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
