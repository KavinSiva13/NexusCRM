import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, AlertCircle } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">NexusCRM</span>
        </div>

        <h2 className="font-display text-3xl font-bold text-white mb-1">Create account</h2>
        <p className="text-slate-400 mb-8">Get started with your CRM workspace</p>

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input type="text" className="input" placeholder="John Smith" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email address</label>
            <input type="email" className="input" placeholder="you@company.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
