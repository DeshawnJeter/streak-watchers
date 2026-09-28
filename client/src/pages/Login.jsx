import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/learn');
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#E5E5E5]">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl">🦉</span>
          <span className="text-[22px] font-black text-[#58CC02] tracking-tight">duolingo</span>
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-black text-[#3C3C3C] mb-8 text-center">Log in to Duolingo</h1>

          {error && (
            <div className="bg-[#FFDFE0] border-2 border-[#FF4B4B] text-[#EA2B2B] rounded-2xl p-4 mb-4 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handle} className="flex flex-col gap-4">
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
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border-2 border-[#E5E5E5] border-b-[4px] rounded-2xl px-4 py-3 font-bold text-[#3C3C3C] focus:outline-none focus:border-[#84D8FF] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-green mt-2 text-center w-full">
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#E5E5E5]" />
            <span className="text-xs font-extrabold text-[#AFAFAF] uppercase">or</span>
            <div className="flex-1 h-px bg-[#E5E5E5]" />
          </div>

          <p className="text-center text-sm text-[#AFAFAF] font-bold">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1CB0F6] font-extrabold hover:underline">
              Sign up
            </Link>
          </p>

          <p className="text-center text-xs text-[#AFAFAF] font-bold mt-4">
            Demo: <strong>demo@demo.com</strong> / <strong>demo123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
