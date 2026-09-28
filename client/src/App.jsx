import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import RightPanel from './components/RightPanel';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Learn from './pages/Learn';
import Lesson from './pages/Lesson';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Stories from './pages/Stories';
import Shop from './pages/Shop';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Pages that get the right panel
const withRightPanel = new Set(['/learn', '/leaderboard', '/profile', '/shop']);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      {user && <Navbar />}

      {/* Main content — offset for sidebar */}
      <main className={`flex-1 ${user ? 'lg:ml-[256px]' : ''} ${user ? 'xl:mr-[368px]' : ''} mt-[56px] lg:mt-0 mb-[64px] lg:mb-0`}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/learn" replace /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/learn" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/learn" replace /> : <Register />} />
          <Route path="/learn" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/learn/:courseId" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
          <Route path="/lesson/:lessonId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/stories/:courseId" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
          <Route path="/quests" element={<ProtectedRoute><Quests /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {user && <RightPanel />}
    </div>
  );
}

function Quests() {
  const achievements = [
    { icon: '🔥', title: '7 Day Streak', desc: 'Keep a streak for 7 days', xp: 100, done: false },
    { icon: '⚡', title: 'XP Earner', desc: 'Earn 100 XP', xp: 50, done: false },
    { icon: '🎯', title: 'Sharpshooter', desc: 'Complete a lesson with no mistakes', xp: 75, done: false },
    { icon: '🌙', title: 'Night Owl', desc: 'Complete a lesson after 9pm', xp: 30, done: false },
    { icon: '🚀', title: 'Quick Learner', desc: 'Complete 3 lessons in one day', xp: 80, done: false },
    { icon: '💎', title: 'Gem Collector', desc: 'Earn 1000 gems', xp: 60, done: false },
  ];
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[#3C3C3C] mb-2">Quests</h1>
      <p className="text-[#AFAFAF] font-bold mb-8">Complete quests to earn bonus XP</p>
      <div className="flex flex-col gap-3">
        {achievements.map(a => (
          <div key={a.title} className="border-2 border-[#E5E5E5] rounded-2xl p-4 flex items-center gap-4">
            <span className="text-3xl">{a.icon}</span>
            <div className="flex-1">
              <p className="font-extrabold text-[#3C3C3C]">{a.title}</p>
              <p className="text-sm text-[#AFAFAF] font-bold">{a.desc}</p>
            </div>
            <span className="text-sm font-extrabold text-[#58CC02]">+{a.xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
