import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/courses'), api.get('/courses/user/enrolled')])
      .then(([all, enr]) => {
        setCourses(all.data);
        setEnrolled(enr.data.map(c => c.id));
      }).finally(() => setLoading(false));
  }, []);

  const enroll = async course => {
    setEnrolling(course.id);
    try {
      await api.post(`/courses/${course.id}/enroll`);
      setEnrolled(e => [...e, course.id]);
      await refreshUser();
      navigate(`/learn/${course.id}`);
    } catch {}
    setEnrolling(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[#3C3C3C] mb-2">What do you want to learn?</h1>
      <p className="text-[#AFAFAF] font-bold mb-8">Choose a language to get started — it's free!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map(course => {
          const isEnrolled = enrolled.includes(course.id);
          return (
            <button
              key={course.id}
              onClick={() => isEnrolled ? navigate(`/learn/${course.id}`) : enroll(course)}
              disabled={enrolling === course.id}
              className="flex items-center gap-4 p-5 border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl hover:bg-[#F7F7F7] transition-colors text-left group"
            >
              <span className="text-4xl">{course.flag}</span>
              <div className="flex-1">
                <p className="text-lg font-extrabold text-[#3C3C3C]">{course.name}</p>
                <p className="text-sm text-[#AFAFAF] font-bold">{course.learners} learners</p>
              </div>
              <span
                className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-2xl ${
                  isEnrolled
                    ? 'bg-[#D7FFB8] text-[#2B730A]'
                    : 'bg-[#DDF4FF] text-[#1CB0F6] group-hover:bg-[#1CB0F6] group-hover:text-white'
                } transition-colors`}
              >
                {enrolling === course.id ? '...' : isEnrolled ? '✓ START' : 'BEGIN'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
