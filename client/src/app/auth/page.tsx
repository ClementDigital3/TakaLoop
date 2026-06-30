'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Recycle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const ROLES = [
  { value: 'citizen', label: '🏘️ Citizen', desc: 'Earn points for waste deposits' },
  { value: 'collector', label: '♻️ Collector', desc: 'List and sell collected waste' },
  { value: 'business', label: '🏢 Business / Recycler', desc: 'Buy waste, list byproducts, get AI audit' },
  { value: 'county_officer', label: '🏛️ County Officer', desc: 'Manage dump reports in your ward' },
];

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: searchParams.get('role') || 'citizen',
    ward: '', county: 'Nairobi', businessName: ''
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) return toast.error('Fill in all required fields');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register(form);

      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      toast.success(mode === 'login' ? `Welcome back, ${user.name}!` : `Welcome to TakaLoop, ${user.name}!`);

      const routes: Record<string, string> = {
        citizen: '/citizen', collector: '/marketplace', business: '/business',
        recycler: '/marketplace', county_officer: '/county', admin: '/admin'
      };
      router.push(routes[user.role] || '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ash-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-leaf-600 rounded-xl flex items-center justify-center">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">TakaLoop</span>
        </Link>

        <div className="card">
          {/* Tabs */}
          <div className="flex bg-ash-900 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === m ? 'bg-leaf-600 text-white' : 'text-ash-400 hover:text-ash-200'}`}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="label">Full name *</label>
                  <input className="input" placeholder="Jane Wanjiku" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>

                <div>
                  <label className="label">I am a...</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => (
                      <button key={r.value} onClick={() => update('role', r.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${form.role === r.value ? 'border-leaf-500 bg-leaf-900/30' : 'border-ash-700 hover:border-ash-500'}`}>
                        <div className="text-sm font-medium text-ash-100">{r.label}</div>
                        <div className="text-xs text-ash-500 mt-0.5">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Phone (M-Pesa) *</label>
                  <input className="input" placeholder="0712 345 678" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>

                {(form.role === 'business' || form.role === 'recycler') && (
                  <div>
                    <label className="label">Business name</label>
                    <input className="input" placeholder="Nairobi Recyclers Ltd" value={form.businessName} onChange={e => update('businessName', e.target.value)} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">County</label>
                    <input className="input" placeholder="Nairobi" value={form.county} onChange={e => update('county', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Ward</label>
                    <input className="input" placeholder="Westlands" value={form.ward} onChange={e => update('ward', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="label">Email address *</label>
              <input type="email" className="input" placeholder="jane@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input pr-10" placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-ash-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full !py-3 text-base mt-2">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create my account'}
            </button>
          </div>

          <p className="text-center text-ash-500 text-sm mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-leaf-400 hover:underline">
              {mode === 'login' ? 'Join free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
