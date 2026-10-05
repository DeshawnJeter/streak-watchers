import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

// Zigzag offsets: center, right, far-right, right, center, left, far-left, left
const PATH_OFFSETS = [0, 60, 90, 60, 0, -60, -90, -60];

const UNIT_COLORS = [
  { bg: '#58CC02', border: '#46A302', text: 'white', guidebook: 'rgba(255,255,255,0.3)' },
  { bg: '#1CB0F6', border: '#1899D6', text: 'white', guidebook: 'rgba(255,255,255,0.3)' },
  { bg: '#CE82FF', border: '#B463F5', text: 'white', guidebook: 'rgba(255,255,255,0.3)' },
  { bg: '#FF9600', border: '#E58700', text: 'white', guidebook: 'rgba(255,255,255,0.3)' },
  { bg: '#FF4B4B', border: '#EA2B2B', text: 'white', guidebook: 'rgba(255,255,255,0.3)' },
];

const NODE_COLORS = [
  { ring: '#58CC02', shadow: '#58A700', bg: '#58CC02' },
  { ring: '#1CB0F6', shadow: '#1899D6', bg: '#1CB0F6' },
  { ring: '#CE82FF', shadow: '#B463F5', bg: '#CE82FF' },
  { ring: '#FF9600', shadow: '#E58700', bg: '#FF9600' },
  { ring: '#FF4B4B', shadow: '#EA2B2B', bg: '#FF4B4B' },
];

function UnitBanner({ skill, index, isLocked }) {
  const c = UNIT_COLORS[index % UNIT_COLORS.length];
  return (
    <div
      className="w-full rounded-3xl p-6 flex items-center justify-between"
      style={{ backgroundColor: isLocked ? '#E5E5E5' : c.bg, opacity: isLocked ? 0.7 : 1 }}
    >
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest mb-1"
           style={{ color: isLocked ? '#AFAFAF' : 'rgba(255,255,255,0.75)' }}>
          Unit {index + 1}
        </p>
        <h2 className="text-2xl font-black" style={{ color: isLocked ? '#AFAFAF' : 'white' }}>
          {skill.name}
        </h2>
        {skill.description && (
          <p className="text-sm mt-1 font-bold" style={{ color: isLocked ? '#AFAFAF' : 'rgba(255,255,255,0.75)' }}>
            {skill.description}
          </p>
        )}
      </div>
      {!isLocked && (
        <button
          className="text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-2xl border-2 transition-colors"
          style={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          GUIDEBOOK
        </button>
      )}
    </div>
  );
}

function SkillNode({ lesson, skillIndex, lessonIndex, isLocked, isActive, onStart }) {
  const c = NODE_COLORS[skillIndex % NODE_COLORS.length];
  const offsetX = PATH_OFFSETS[lessonIndex % PATH_OFFSETS.length];

  // Stars based on completion status
  const stars = lesson.completed ? 1 : 0;

  return (
    <div className="flex flex-col items-center" style={{ marginLeft: offsetX }}>
      {/* START / CONTINUE tooltip above active node */}
      {isActive && (
        <div
          className="mb-3 px-5 py-2 rounded-2xl text-sm font-extrabold text-white animate-bounceIn shadow-lg"
          style={{ backgroundColor: c.bg, boxShadow: `0 4px 0 ${c.shadow}` }}
        >
          ▼ {lesson.completed ? 'PRACTICE' : 'START'}
        </div>
      )}

      {/* Node circle */}
      <button
        onClick={() => !isLocked && onStart(lesson.id)}
        disabled={isLocked}
        className="relative flex flex-col items-center group"
      >
        <div
          className={`w-[80px] h-[80px] rounded-full flex flex-col items-center justify-center
            transition-transform duration-100 ${!isLocked ? 'hover:scale-105 active:scale-95' : ''}
          `}
          style={{
            backgroundColor: isLocked ? '#E5E5E5' : c.bg,
            boxShadow: isLocked ? '0 4px 0 #C7C7C7' : `0 4px 0 ${c.shadow}`,
            cursor: isLocked ? 'default' : 'pointer',
          }}
        >
          <span className="text-2xl">
            {isLocked ? '🔒' : lesson.completed ? '⭐' : skillIndex === 0 ? '👋' :
             skillIndex === 1 ? '🐱' : skillIndex === 2 ? '🍎' :
             skillIndex === 3 ? '✈️' : '👨‍👩‍👧'}
          </span>
          {!isLocked && (
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[6px] h-[6px] rounded-full"
                  style={{ backgroundColor: i < stars ? 'white' : 'rgba(255,255,255,0.35)' }}
                />
              ))}
            </div>
          )}
        </div>
      </button>

      {/* Node label */}
      <p className={`mt-2 text-xs font-extrabold uppercase tracking-wider ${isLocked ? 'text-[#AFAFAF]' : 'text-[#3C3C3C]'}`}>
        {isLocked ? 'LOCKED' : lesson.completed ? 'DONE' : 'NEW'}
      </p>
    </div>
  );
}

export default function Learn() {
  const { courseId } = useParams();
  const [skills, setSkills] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get(`/lessons/skills/${courseId}`),
      api.get(`/courses/${courseId}`),
    ]).then(([s, c]) => {
      setSkills(s.data);
      setCourse(c.data);
    }).finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  // ── Feature 2: Shrinking Lesson Path ────────────────────────────────────────
  // Total + completed counts across all skills
  const totalLessons = skills.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedLessons = skills.reduce((sum, s) => sum + s.lessons.filter(l => l.completed).length, 0);
  const completionRatio = totalLessons > 0 ? completedLessons / totalLessons : 0;

  // Per-lesson scale + margin: upcoming nodes shrink and crowd together,
  // creating the illusion that the finish line is getting closer.
  function getLessonStyle(globalIndex) {
    const distanceFromCurrent = globalIndex - completedLessons;
    if (distanceFromCurrent <= 0) {
      // Completed or active: full size, generous spacing
      return { transform: 'scale(1)', marginTop: '24px', transition: 'transform 0.5s ease, margin 0.5s ease' };
    }
    // Upcoming: shrink 4% per step from current, min 65%
    const scale = Math.max(0.65, 1 - distanceFromCurrent * 0.04);
    // Crowd upcoming nodes together
    const marginTop = Math.max(4, 24 - distanceFromCurrent * 3);
    return {
      transform: `scale(${scale})`,
      marginTop: `${marginTop}px`,
      transformOrigin: 'center top',
      transition: 'transform 0.5s ease, margin 0.5s ease',
    };
  }

  // At 70%+ completion: zoom in on the path to make the finish feel close
  const pathZoomedStyle = completionRatio >= 0.70 ? {
    transform: 'scale(1.06) translateY(-32px)',
    transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
    transformOrigin: 'top center',
  } : {};

  // Pre-compute global sequential index per lesson (for shrink transforms)
  const lessonGlobalIndex = new Map();
  let idx = 0;
  skills.forEach(skill => skill.lessons.forEach(lesson => lessonGlobalIndex.set(lesson.id, idx++)));

  // Find the first incomplete lesson across all skills
  let firstIncompleteFound = false;

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6">
      {/* Course header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/learn')}
          className="text-[#AFAFAF] hover:text-[#3C3C3C] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <span className="text-4xl">{course?.flag}</span>
        <div>
          <h1 className="text-2xl font-black text-[#3C3C3C]">{course?.name}</h1>
          <p className="text-sm text-[#AFAFAF] font-bold">{course?.native_name}</p>
        </div>
        <Link
          to={`/stories/${courseId}`}
          className="ml-auto border-2 border-[#E5E5E5] border-b-[4px] text-[#3C3C3C] font-extrabold text-xs uppercase tracking-wider px-4 py-2 rounded-2xl hover:bg-[#F7F7F7] transition-colors"
        >
          📖 STORIES
        </Link>
      </div>

      {/* Skill units — Feature 2: path container receives zoom at 70%+ completion */}
      <div className="flex flex-col gap-6" style={pathZoomedStyle}>
        {skills.map((skill, si) => {
          const isUnitLocked = si > 0 && skills[si - 1].completed_lessons === 0;

          return (
            <div key={skill.id} className="flex flex-col gap-6">
              {/* Unit banner */}
              <UnitBanner skill={skill} index={si} isLocked={isUnitLocked} />

              {/* Lesson nodes — each wrapped in shrink transform */}
              <div className="flex flex-col items-center pb-4">
                {skill.lessons.map((lesson, li) => {
                  const isLocked = isUnitLocked || (li > 0 && !skill.lessons[li - 1].completed && !lesson.completed);
                  const isActive = !isLocked && !firstIncompleteFound && !lesson.completed;
                  if (isActive) firstIncompleteFound = true;

                  const nodeStyle = getLessonStyle(lessonGlobalIndex.get(lesson.id));

                  return (
                    <div key={lesson.id} style={nodeStyle}>
                      <SkillNode
                        lesson={lesson}
                        skillIndex={si}
                        lessonIndex={li}
                        isLocked={isLocked}
                        isActive={isActive}
                        onStart={id => navigate(`/lesson/${id}`)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-20 text-[#AFAFAF]">
          <div className="text-5xl mb-4">📚</div>
          <p className="font-extrabold text-lg">No lessons available yet</p>
        </div>
      )}
    </div>
  );
}
