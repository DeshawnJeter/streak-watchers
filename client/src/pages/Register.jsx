import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#E5E5E5]">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl">🦉</span>
          <span className="text-[22px] font-black text-[#58CC02] tracking-tight">duolingo</span>
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🦉</div>
            <h1 className="text-3xl font-black text-[#3C3C3C]">Create your profile</h1>
            <p className="text-[#AFAFAF] font-bold mt-1">Learn a language for free. Forever.</p>
          </div>

          {error && (
            <div className="bg-[#FFDFE0] border-2 border-[#FF4B4B] text-[#EA2B2B] rounded-2xl p-4 mb-4 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handle} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Username</label>
              <input
                type="text"
                required
                minLength={3}
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl px-4 py-3 font-bold text-[#3C3C3C] focus:outline-none focus:border-[#84D8FF] transition-colors"
                placeholder="learner123"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl px-4 py-3 font-bold text-[#3C3C3C] focus:outline-none focus:border-[#84D8FF] transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-[#AFAFAF] mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
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

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#E5E5E5]" />
            <span className="text-xs font-extrabold text-[#AFAFAF] uppercase">or</span>
            <div className="flex-1 h-px bg-[#E5E5E5]" />
          </div>

          <p className="text-center text-sm text-[#AFAFAF] font-bold">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1CB0F6] font-extrabold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
