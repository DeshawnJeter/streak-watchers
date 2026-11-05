import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import RightPanel from './components/RightPanel';
import IntroTour from './components/IntroTour';
import MobileXpStrip from './components/MobileXpStrip';
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
import Achievements from './pages/Achievements';
import Quests from './pages/Quests';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <span className="text-5xl animate-bounce">🦉</span>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Pages that show the daily XP goal on small screens (the right panel only shows on xl)
const showsXpStrip = path => path.startsWith('/learn') || path === '/leaderboard' || path === '/profile';

function AppRoutes() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  // Lessons are full-screen (like real Duolingo) so the app chrome doesn't cover the lesson's own top bar
  const chrome = user && !pathname.startsWith('/lesson/');

  return (
    <div className="flex min-h-screen">
      {chrome && <Navbar />}

      {/* Main content — offset for sidebar */}
      <main className={`flex-1 min-w-0 ${chrome ? 'lg:ml-[256px] xl:mr-[368px] mt-[56px] lg:mt-0 mb-[64px] lg:mb-0' : ''}`}>
        {chrome && showsXpStrip(pathname) && <MobileXpStrip />}
        <div key={pathname} className="animate-pageIn">
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
          <Route path="/quests" element={<ProtectedRoute><Quests /></ProtectedRoute>} />

          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
      </main>

      {chrome && <RightPanel />}
      {user && <IntroTour />}
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
