import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const XP_PER_CORRECT = 10;

// ── Multiple Choice ──────────────────────────────────────────────────────────
function MultipleChoice({ exercise, checked, onSelect, selected }) {
  return (
    <div className="flex flex-col gap-3">
      {exercise.options.map(opt => {
        let cls = 'option-tile';
        if (checked) {
          if (opt === exercise.correct_answer) cls += ' correct';
          else if (opt === selected) cls += ' wrong';
        } else if (opt === selected) {
          cls += ' selected';
        }
        return (
          <button
            key={opt}
            className={cls}
            onClick={() => !checked && onSelect(opt)}
            disabled={checked}
          >
            <span className="text-base font-bold">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Fill in the Blank ────────────────────────────────────────────────────────
function FillBlank({ exercise, checked, onSelect, selected }) {
  const parts = exercise.question.split('___');
  const before = parts[0] || '';
  const after = parts[1] || '';

  return (
    <div className="flex flex-col gap-5">
      {/* Sentence with blank */}
      <div className="text-xl font-bold text-[#3C3C3C] leading-loose text-center">
        {before}
        <span
          className={`inline-block min-w-[100px] mx-2 px-3 py-1 rounded-xl border-b-2 text-center font-extrabold transition-colors ${
            !selected
              ? 'bg-white border-[#AFAFAF] text-[#AFAFAF]'
              : checked
                ? selected === exercise.correct_answer
                  ? 'bg-[#D7FFB8] border-[#58A700] text-[#2B730A]'
                  : 'bg-[#FFDFE0] border-[#EA2B2B] text-[#EA2B2B]'
                : 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]'
          }`}
        >
          {selected || '______'}
        </span>
        {after}
      </div>

      {/* Word chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {exercise.options.map(opt => (
          <button
            key={opt}
            onClick={() => !checked && onSelect(opt === selected ? null : opt)}
            disabled={checked}
            className={`word-tile text-base ${selected === opt && !checked ? 'border-[#1CB0F6] bg-[#DDF4FF]' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Word Bank (Translate) ────────────────────────────────────────────────────
function WordBank({ exercise, checked, onAnswer, answer, setAnswer }) {
  const words = exercise.options
    ? exercise.options
    : exercise.correct_answer.split(' ')
        .concat(['the', 'a', 'is', 'are', 'and', 'I', 'you', 'he', 'she'])
        .filter((w, i, arr) => arr.indexOf(w) === i)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(12, exercise.correct_answer.split(' ').length * 2));

  const available = words.filter(w => !answer.includes(w));

  const addWord = w => {
    if (checked) return;
    setAnswer(a => [...a, w]);
  };
  const removeWord = i => {
    if (checked) return;
    setAnswer(a => a.filter((_, idx) => idx !== i));
  };

  const isCorrect = checked
    ? answer.join(' ').toLowerCase().trim() === exercise.correct_answer.toLowerCase().trim()
    : null;

  return (
    <div className="flex flex-col gap-6">
      {exercise.hint && (
        <p className="text-sm text-[#AFAFAF] font-bold bg-[#F7F7F7] px-4 py-2 rounded-xl">
          💡 {exercise.hint}
        </p>
      )}

      {/* Answer area */}
      <div
        className={`min-h-[64px] border-b-2 border-t-0 border-x-0 border-[#E5E5E5] flex flex-wrap gap-2 items-start content-start p-3 rounded-2xl transition-colors ${
          checked
            ? isCorrect
              ? 'bg-[#D7FFB8] border-[#58A700]'
              : 'bg-[#FFDFE0] border-[#EA2B2B]'
            : 'bg-white border-[#E5E5E5]'
        }`}
        style={{ borderWidth: '2px' }}
      >
        {answer.length === 0 && (
          <span className="text-[#AFAFAF] font-bold text-sm self-center ml-1">Tap the words to build a sentence</span>
        )}
        {answer.map((w, i) => (
          <button
            key={i}
            onClick={() => removeWord(i)}
            disabled={checked}
            className="word-tile in-answer text-base"
          >
            {w}
          </button>
        ))}
      </div>

      {checked && !isCorrect && (
        <div className="text-sm font-bold text-[#EA2B2B]">
          Correct: <span className="font-extrabold">{exercise.correct_answer}</span>
        </div>
      )}

      {/* Word bank */}
      <div className="border-2 border-t-0 border-[#E5E5E5] rounded-b-2xl p-3 bg-[#F7F7F7] flex flex-wrap gap-2 justify-center min-h-[60px]">
        {available.map((w, i) => (
          <button
            key={i}
            onClick={() => addWord(w)}
            disabled={checked}
            className="word-tile text-base"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Lesson Page ─────────────────────────────────────────────────────────
export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [exercises, setExercises] = useState([]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState('loading');
  const [selected, setSelected] = useState(null);
  const [wordAnswer, setWordAnswer] = useState([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [heartsLost, setHeartsLost] = useState(0);
  const [localHearts, setLocalHearts] = useState(user?.hearts ?? 5);
  const [xpToast, setXpToast] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    api.get(`/lessons/lesson/${lessonId}`)
      .then(r => { setExercises(r.data.exercises); setPhase('lesson'); })
      .catch(() => navigate(-1));
  }, [lessonId]);

  const ex = exercises[current];
  const progress = exercises.length ? ((current) / exercises.length) * 100 : 0;

  const getAnswer = () => {
    if (!ex) return null;
    if (ex.type === 'translate') return wordAnswer.join(' ');
    return selected;
  };

  const hasAnswer = () => {
    if (!ex) return false;
    if (ex.type === 'translate') return wordAnswer.length > 0;
    return selected !== null;
  };

  const normalise = s => (s || '').toLowerCase().trim().replace(/[¿?¡!.,]/g, '').replace(/\s+/g, ' ');

  const checkAnswer = () => {
    if (!hasAnswer() || checked) return;
    const ans = getAnswer();
    const correct = normalise(ans) === normalise(ex.correct_answer);
    setChecked(true);
    setIsCorrect(correct);
    if (!correct) {
      setShakeKey(k => k + 1);
      const newHearts = Math.max(0, localHearts - 1);
      setLocalHearts(newHearts);
      setHeartsLost(h => h + 1);
    } else {
      setCorrect(c => c + 1);
      setXpToast(true);
      setTimeout(() => setXpToast(false), 1500);
    }
  };

  const advance = async () => {
    if (current + 1 >= exercises.length) {
      await finish();
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setWordAnswer([]);
      setChecked(false);
      setIsCorrect(null);
    }
  };

  const finish = async () => {
    const finalCorrect = isCorrect ? correct : correct; // already tallied
    const xp = correct * XP_PER_CORRECT;
    try {
      const r = await api.post(`/lessons/lesson/${lessonId}/complete`, {
        xp_earned: xp,
        hearts_lost: heartsLost,
      });
      setUser(u => ({ ...u, ...r.data.user }));
    } catch {}
    setPhase('result');
  };

  // ── Loading ──
  if (phase === 'loading') return (
    <div className="flex items-center justify-center h-screen bg-white">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  // ── Result screen ──
  if (phase === 'result') {
    const pct = exercises.length ? Math.round((correct / exercises.length) * 100) : 0;
    const xpEarned = correct * XP_PER_CORRECT;
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pb-8">
        <div className="max-w-sm w-full text-center animate-fadeIn">
          <div className="text-8xl mb-6">
            {pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 50 ? '😊' : '💪'}
          </div>
          <h1 className="text-4xl font-black text-[#3C3C3C] mb-2">
            {pct === 100 ? 'PERFECT!' : pct >= 80 ? 'GREAT JOB!' : pct >= 50 ? 'GOOD WORK!' : 'KEEP GOING!'}
          </h1>
          <p className="text-[#AFAFAF] font-bold mb-10 text-lg">{pct}% correct</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'TOTAL XP', value: `+${xpEarned}`, color: '#FFC800', emoji: '⚡' },
              { label: 'AMAZING', value: `${correct}/${exercises.length}`, color: '#58CC02', emoji: '✓' },
              { label: 'HEARTS', value: `−${heartsLost}`, color: '#FF4B4B', emoji: '❤️' },
            ].map(s => (
              <div key={s.label} className="border-2 border-[#E5E5E5] rounded-2xl p-4 text-center">
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.emoji}</p>
                <p className="text-2xl font-black text-[#3C3C3C]">{s.value}</p>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#AFAFAF] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <button onClick={() => navigate(-1)} className="btn-green w-full text-center">
            CONTINUE
          </button>
        </div>
      </div>
    );
  }

  if (!ex) return null;

  const promptLabel = ex.type === 'multiple_choice'
    ? 'Choose the correct translation'
    : ex.type === 'fill_blank'
      ? 'Fill in the blank'
      : 'Tap the pairs';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Top bar ── */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-2 border-b border-[#F7F7F7]">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[#AFAFAF] hover:text-[#3C3C3C] transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Hearts */}
          <div className="flex gap-0.5 flex-shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-lg ${i < localHearts ? '' : 'grayscale opacity-20'}`}>❤️</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── XP toast ── */}
      {xpToast && (
        <div className="fixed top-20 right-6 bg-[#FFC800] text-[#3C3C3C] font-extrabold px-5 py-2.5 rounded-2xl shadow-lg animate-pop z-50 tracking-wide">
          +{XP_PER_CORRECT} XP
        </div>
      )}

      {/* ── Exercise body ── */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">{promptLabel}</p>
          <h2
            key={`${shakeKey}-q`}
            className={`text-2xl font-black text-[#3C3C3C] ${!isCorrect && checked ? 'animate-shake' : ''}`}
          >
            {ex.question}
          </h2>
        </div>

        <div className="flex-1">
          {ex.type === 'multiple_choice' && (
            <MultipleChoice
              key={ex.id}
              exercise={ex}
              checked={checked}
              selected={selected}
              onSelect={setSelected}
            />
          )}
          {ex.type === 'fill_blank' && (
            <FillBlank
              key={ex.id}
              exercise={ex}
              checked={checked}
              selected={selected}
              onSelect={setSelected}
            />
          )}
          {ex.type === 'translate' && (
            <WordBank
              key={ex.id}
              exercise={ex}
              checked={checked}
              onAnswer={() => {}}
              answer={wordAnswer}
              setAnswer={setWordAnswer}
            />
          )}
        </div>
      </div>

      {/* ── Bottom feedback + CHECK button ── */}
      {checked ? (
        <div
          className={`animate-slideUp px-4 pt-6 pb-8 border-t-4 ${
            isCorrect ? 'bg-[#D7FFB8] border-[#58CC02]' : 'bg-[#FFDFE0] border-[#FF4B4B]'
          }`}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-start gap-4">
              <span className="text-3xl mt-0.5">{isCorrect ? '✅' : '❌'}</span>
              <div>
                <p className={`text-lg font-extrabold ${isCorrect ? 'text-[#2B730A]' : 'text-[#EA2B2B]'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                {!isCorrect && (
                  <p className="text-sm font-bold text-[#EA2B2B]">
                    Correct answer: <span className="font-extrabold">{ex.correct_answer}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={advance}
              className={isCorrect ? 'btn-green' : 'btn-red'}
            >
              CONTINUE
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-4 pb-8 border-t border-[#F7F7F7] bg-white">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={checkAnswer}
              disabled={!hasAnswer()}
              className={hasAnswer() ? 'btn-green w-full' : 'btn-gray w-full'}
            >
              CHECK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
