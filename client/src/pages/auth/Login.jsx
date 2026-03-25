import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-primary-900 via-slate-900 to-slate-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(67,97,238,0.15)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-white">NexusCRM</span>
        </div>

        <div className="flex-1 flex flex-col justify-center relative">
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-6">
            Manage your<br />
            <span className="text-primary-400">customer relations</span><br />
            with precision.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Track leads, manage customers, and close deals faster with your modern CRM dashboard.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { value: '10k+', label: 'Leads tracked' },
              { value: '98%', label: 'Uptime' },
              { value: '3x', label: 'Faster close rate' },
              { value: '∞', label: 'Scalable' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="text-slate-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">NexusCRM</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Create one
            </Link>
          </p>

          <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm">
            <p className="text-slate-400 mb-2 font-medium">Demo credentials:</p>
            <p className="text-slate-500 font-mono">admin@demo.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
