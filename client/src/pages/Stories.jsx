import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const DIFFICULTY_COLORS = {
  beginner:     { bg: '#D7FFB8', text: '#2B730A', border: '#58CC02' },
  intermediate: { bg: '#FFF3B3', text: '#7B5A00', border: '#FFC800' },
  advanced:     { bg: '#FFDFE0', text: '#EA2B2B', border: '#FF4B4B' },
};

// ── Story card on index ──────────────────────────────────────────────────────
function StoryCard({ story, onClick }) {
  const d = DIFFICULTY_COLORS[story.difficulty] || DIFFICULTY_COLORS.beginner;
  return (
    <button
      onClick={onClick}
      className="card p-5 text-left hover:shadow-md transition-all duration-150 group w-full"
    >
      <div className="text-4xl mb-3">{story.cover_emoji}</div>
      <h3 className="font-black text-[#3C3C3C] mb-1 group-hover:text-[#1CB0F6] transition-colors">{story.title}</h3>
      <p className="text-sm text-[#AFAFAF] mb-3 line-clamp-2">{story.description}</p>
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-extrabold px-2 py-1 rounded-full"
          style={{ backgroundColor: d.bg, color: d.text }}
        >
          {story.difficulty}
        </span>
        <span className="text-xs text-[#AFAFAF] font-bold">
          ~{story.duration_minutes}min · +{story.xp_reward}XP
        </span>
      </div>
    </button>
  );
}

// ── Comprehension check (multiple choice inline) ─────────────────────────────
function ComprehensionCheck({ check, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const isCorrect = selected === check.answer;

  const submit = () => {
    if (!selected || checked) return;
    setChecked(true);
    setTimeout(() => onAnswer(isCorrect), 1200);
  };

  return (
    <div className="my-6 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl p-5">
      <p className="text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Quick check</p>
      <p className="font-extrabold text-[#3C3C3C] mb-4">{check.question}</p>
      <div className="flex flex-col gap-2">
        {check.options.map(opt => {
          let cls = 'option-tile text-sm';
          if (checked) {
            if (opt === check.answer) cls += ' correct';
            else if (opt === selected) cls += ' wrong';
          } else if (opt === selected) {
            cls += ' selected';
          }
          return (
            <button key={opt} className={cls} onClick={() => !checked && setSelected(opt)} disabled={checked}>
              {opt}
            </button>
          );
        })}
      </div>
      {!checked && (
        <button
          onClick={submit}
          disabled={!selected}
          className={`mt-4 w-full ${selected ? 'btn-blue' : 'btn-gray'}`}
        >
          CHECK
        </button>
      )}
      {checked && (
        <p className={`mt-3 text-sm font-extrabold ${isCorrect ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
          {isCorrect ? '✅ Correct!' : `❌ Correct answer: ${check.answer}`}
        </p>
      )}
    </div>
  );
}

// ── Full-screen story reader ─────────────────────────────────────────────────
function StoryReader({ story, onClose, onComplete }) {
  const [panelIndex, setPanelIndex] = useState(0);
  const [checksDone, setChecksDone] = useState(new Set());
  const [completed, setCompleted] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const panels = story.panels || [];
  const checks = story.checks || [];
  const visiblePanels = panels.slice(0, panelIndex + 1);

  // Find any check that triggers after the current panel and hasn't been done
  const pendingCheck = checks.find(
    c => c.after_panel <= panelIndex && !checksDone.has(c.after_panel)
  );

  const advance = () => {
    if (panelIndex + 1 < panels.length) {
      setPanelIndex(i => i + 1);
    } else {
      // All panels shown
    }
  };

  const handleCheckDone = (afterPanel) => {
    setChecksDone(prev => new Set([...prev, afterPanel]));
  };

  const finish = async () => {
    setFinishing(true);
    try {
      await onComplete(story.id);
    } catch {}
    setCompleted(true);
    setFinishing(false);
  };

  const allDone = panelIndex >= panels.length - 1 && !pendingCheck;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col animate-pop"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#E5E5E5] flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{story.cover_emoji}</span>
            <div>
              <p className="font-extrabold text-[#3C3C3C] text-sm">{story.title}</p>
              <p className="text-xs text-[#AFAFAF] font-bold">+{story.xp_reward} XP</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#AFAFAF] hover:text-[#3C3C3C] font-bold text-xl">✕</button>
        </div>

        {/* Dialogue panels */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {completed ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4 animate-bounceIn">🎉</div>
              <h2 className="text-2xl font-black text-[#3C3C3C] mb-2">Story complete!</h2>
              <div className="bg-[#D7FFB8] border-2 border-[#58CC02] rounded-2xl px-6 py-3 mb-6">
                <p className="text-lg font-extrabold text-[#2B730A]">+{story.xp_reward} XP earned!</p>
              </div>
              <button onClick={onClose} className="btn-green">CONTINUE</button>
            </div>
          ) : (
            <>
              {visiblePanels.map((panel, i) => {
                const isRight = i % 2 === 1;
                return (
                  <div key={i} className={`flex items-end gap-3 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-9 h-9 rounded-full bg-[#DDF4FF] flex items-center justify-center text-xl flex-shrink-0">
                      {panel.emoji || '🧑'}
                    </div>
                    <div className={`max-w-[75%] ${isRight ? 'items-end' : 'items-start'} flex flex-col`}>
                      <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${isRight ? 'text-right text-[#1CB0F6]' : 'text-[#AFAFAF]'}`}>
                        {panel.character}
                      </p>
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm font-bold leading-relaxed ${
                          isRight
                            ? 'bg-[#1CB0F6] text-white rounded-br-sm'
                            : 'bg-[#F7F7F7] text-[#3C3C3C] rounded-bl-sm'
                        }`}
                      >
                        {panel.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pending comprehension check */}
              {pendingCheck && (
                <ComprehensionCheck
                  key={pendingCheck.after_panel}
                  check={pendingCheck}
                  onAnswer={() => handleCheckDone(pendingCheck.after_panel)}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom action */}
        {!completed && (
          <div className="px-5 pb-6 pt-3 border-t-2 border-[#E5E5E5] flex-shrink-0">
            {allDone ? (
              <button onClick={finish} disabled={finishing} className="btn-green w-full">
                {finishing ? 'Saving…' : `FINISH STORY  (+${story.xp_reward} XP)`}
              </button>
            ) : !pendingCheck ? (
              <button onClick={advance} className="btn-blue w-full">CONTINUE</button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stories index page ───────────────────────────────────────────────────────
export default function Stories() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(null);
  const { refreshUser } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get(`/stories/${courseId}`),
      api.get(`/courses/${courseId}`),
    ]).then(([s, c]) => {
      setStories(s.data);
      setCourse(c.data);
    }).catch(() => setStories([])).finally(() => setLoading(false));
  }, [courseId]);

  const completeStory = async storyId => {
    await api.post(`/stories/${storyId}/complete`);
    await refreshUser();
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, completed: true } : s));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-[#AFAFAF] hover:text-[#3C3C3C] transition-colors font-extrabold text-lg"
        >
          ←
        </button>
        <span className="text-3xl">{course?.flag || '🌐'}</span>
        <div>
          <h1 className="text-2xl font-black text-[#3C3C3C]">Stories</h1>
          <p className="text-sm text-[#AFAFAF] font-bold">{course?.name} · {stories.length} stories</p>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📖</div>
          <p className="font-extrabold text-[#AFAFAF] text-lg">No stories available yet</p>
          <p className="text-sm text-[#AFAFAF] mt-1">Check back after completing some lessons</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stories.map(story => (
            <div key={story.id} className="relative">
              {story.completed && (
                <div className="absolute top-3 right-3 z-10 bg-[#58CC02] text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                  ✓ Done
                </div>
              )}
              <StoryCard story={story} onClick={() => setActiveStory(story)} />
            </div>
          ))}
        </div>
      )}

      {activeStory && (
        <StoryReader
          story={activeStory}
          onClose={() => setActiveStory(null)}
          onComplete={completeStory}
        />
      )}
    </div>
  );
}
