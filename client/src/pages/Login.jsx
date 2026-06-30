import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import LogoIcon from '../components/layout/LogoIcon';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const res = await login(form.email, form.password);
    if (res?.success) {
      const paths = { citizen:'/citizen', collector:'/business', business:'/business', recycler:'/business', officer:'/officer', admin:'/admin' };
      navigate(paths[res.role] || '/dashboard');
    } else { setError(res?.message || 'Login failed'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />

      {/* Back button */}
      <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors bg-white/80 backdrop-blur border border-slate-200/50 px-4 py-2 rounded-xl shadow-sm hover:shadow active:scale-95 z-20">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 hover:opacity-90 transition-opacity">
            <LogoIcon className="w-12 h-12" />
            <span className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">TakaLoop</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-2">Sign in to continue making an impact</p>
        </div>

        <div className="card shadow-md">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <div className="relative">
                <input className="input-field pr-10" type={showPw?'text':'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account? <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 p-4 bg-slate-900/5 rounded-2xl border border-slate-900/10 text-xs text-slate-500">
          <span className="font-bold text-slate-700 block mb-2 uppercase tracking-wider text-[10px]">Quick Access Demo Credentials</span>
          <div className="flex flex-col gap-1 text-[11px] font-mono">
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span>Citizen: <strong className="text-slate-700">citizen@demo.com</strong></span>
              <span className="text-slate-400">Admin@2024!</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/50">
              <span>Business: <strong className="text-slate-700">business@demo.com</strong></span>
              <span className="text-slate-400">Admin@2024!</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Admin: <strong className="text-slate-700">admin@takaloop.ke</strong></span>
              <span className="text-slate-400">Admin@2024!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
