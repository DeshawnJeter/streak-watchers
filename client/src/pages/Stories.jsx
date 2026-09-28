import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-light text-green-dark',
  intermediate: 'bg-yellow-light text-yellow-800',
  advanced: 'bg-red-light text-red-dark',
};

function StoryModal({ story, onClose, onComplete }) {
  const [reading, setReading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const { refreshUser } = useAuth();

  const paragraphs = [
    `${story.cover_emoji} ${story.title}`,
    story.description,
    `This is a ${story.difficulty} level story. In the full version, you'd follow along with a native speaker conversation, with audio and translations provided step by step.`,
    `Key vocabulary from this story includes common phrases used in real-life situations in countries where ${story.title.includes('café') || story.title.includes('Boulangerie') ? 'French' : story.title.includes('はじめ') || story.title.includes('レスト') ? 'Japanese' : 'Spanish'} is spoken.`,
    `You'll practice listening comprehension, reading speed, and natural conversation patterns.`,
  ];

  const complete = async () => {
    await onComplete(story.id);
    setCompleted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 animate-pop" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${DIFFICULTY_COLORS[story.difficulty] || 'bg-gray-100 text-gray-500'}`}>
            {story.difficulty}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
        </div>

        <div className="text-5xl text-center mb-4">{story.cover_emoji}</div>
        <h2 className="text-2xl font-black text-gray-700 text-center mb-2">{story.title}</h2>
        <p className="text-gray-500 text-center text-sm mb-6">~{story.duration_minutes} min · +{story.xp_reward} XP</p>

        <div className="space-y-4 mb-8">
          {paragraphs.map((p, i) => (
            <p key={i} className={`text-gray-600 leading-relaxed ${i === 0 ? 'font-black text-xl text-gray-700' : ''}`}>
              {i > 0 ? p : ''}
            </p>
          ))}
          <div className="bg-blue-light border-2 border-blue rounded-2xl p-4">
            <p className="font-bold text-blue text-sm">📚 Story excerpt</p>
            <p className="text-gray-700 mt-2 italic">"{story.description}"</p>
            <p className="text-gray-500 text-xs mt-2">In the full experience, audio, vocabulary tooltips, and character animations would appear here.</p>
          </div>
        </div>

        {completed ? (
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-black text-green text-xl">+{story.xp_reward} XP earned!</p>
            <button onClick={onClose} className="btn-primary mt-4 w-full">Continue</button>
          </div>
        ) : (
          <button onClick={complete} className="btn-primary w-full">
            Complete story (+{story.xp_reward} XP)
          </button>
        )}
      </div>
    </div>
  );
}

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
      api.get(`/lessons/stories/${courseId}`),
      api.get(`/courses/${courseId}`),
    ]).then(([s, c]) => {
      setStories(s.data);
      setCourse(c.data);
    }).finally(() => setLoading(false));
  }, [courseId]);

  const completeStory = async storyId => {
    await api.post(`/lessons/story/${storyId}/complete`);
    await refreshUser();
  };

  if (loading) return (
    <div className="md:ml-56 flex items-center justify-center h-96">
      <span className="text-4xl animate-spin">🦉</span>
    </div>
  );

  return (
    <main className="md:ml-56 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 font-bold">←</button>
          <span className="text-3xl">{course?.flag}</span>
          <div>
            <h1 className="text-2xl font-black text-gray-700">Stories</h1>
            <p className="text-sm text-gray-400">{course?.name} · {stories.length} stories</p>
          </div>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-4">📖</div>
            <p className="font-semibold">No stories for this language yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stories.map(story => (
              <button
                key={story.id}
                onClick={() => setActiveStory(story)}
                className="card p-5 text-left hover:shadow-md transition-shadow group"
              >
                <div className="text-4xl mb-3">{story.cover_emoji}</div>
                <h3 className="font-black text-gray-700 mb-1 group-hover:text-blue transition-colors">{story.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{story.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${DIFFICULTY_COLORS[story.difficulty] || 'bg-gray-100'}`}>
                    {story.difficulty}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">~{story.duration_minutes}min · +{story.xp_reward}XP</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeStory && (
        <StoryModal
          story={activeStory}
          onClose={() => setActiveStory(null)}
          onComplete={completeStory}
        />
      )}
    </main>
  );
}
