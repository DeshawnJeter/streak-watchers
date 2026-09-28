import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/courses/user/enrolled')
      .then(r => setEnrolled(r.data))
      .finally(() => setLoading(false));
  }, []);

  // If enrolled in exactly one course, go straight to the skill tree
  useEffect(() => {
    if (!loading && enrolled.length === 1) {
      navigate(`/learn/${enrolled[0].id}`, { replace: true });
    }
  }, [loading, enrolled]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  if (enrolled.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-7xl mb-6 animate-bounce">🌍</div>
        <h2 className="text-3xl font-black text-[#3C3C3C] mb-3">What do you want to learn?</h2>
        <p className="text-[#AFAFAF] font-bold mb-8 text-lg">Pick a language and start today — it's free!</p>
        <Link to="/courses" className="btn-green">
          GET STARTED
        </Link>
      </div>
    );
  }

  // Multiple courses enrolled — show picker
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[#3C3C3C] mb-2">Choose a course</h1>
      <p className="text-[#AFAFAF] font-bold mb-6">Pick up where you left off</p>

      <div className="flex flex-col gap-3">
        {enrolled.map(course => (
          <button
            key={course.id}
            onClick={() => navigate(`/learn/${course.id}`)}
            className="flex items-center gap-4 p-5 border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl hover:bg-[#F7F7F7] transition-colors text-left group"
          >
            <span className="text-4xl">{course.flag}</span>
            <div className="flex-1">
              <p className="text-lg font-extrabold text-[#3C3C3C]">{course.name}</p>
              <p className="text-sm text-[#AFAFAF] font-bold">{course.native_name}</p>
            </div>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#AFAFAF] group-hover:text-[#1CB0F6]" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
            </svg>
          </button>
        ))}
      </div>

      <Link to="/courses" className="mt-6 flex items-center justify-center gap-2 text-[#1CB0F6] font-extrabold hover:underline">
        <span>+ Add a new language</span>
      </Link>
    </div>
  );
}
