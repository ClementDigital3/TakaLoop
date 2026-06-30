'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth';
import { KENYAN_COUNTIES, ROLES } from '../../../lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'citizen', county: '', ward: '', businessName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
      const dashRoutes = { citizen: '/citizen', collector: '/collector', business: '/business', recycler: '/business', county_officer: '/county', admin: '/admin' };
      router.push(dashRoutes[form.role] || '/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">♻️</span>
            <span className="font-bold text-xl text-green-800">TakaLoop</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Join TakaLoop</h1>
          <p className="text-gray-500 text-sm mt-1">Create your free account</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input className="input" placeholder="Jane Mwangi" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+254700000000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
            <div className="col-span-2">
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
            </div>
            <div className="col-span-2">
              <label className="label">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLES).filter(([k]) => k !== 'admin').map(([key, val]) => (
                  <button type="button" key={key} onClick={() => setForm({...form, role: key})}
                    className={`p-3 rounded-xl border text-left transition-all ${form.role === key ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                    <div className="font-medium text-sm text-gray-800">{val.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{val.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">County</label>
              <select className="select" value={form.county} onChange={e => setForm({...form, county: e.target.value})}>
                <option value="">Select county</option>
                {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ward / Estate</label>
              <input className="input" placeholder="e.g. Westlands" value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} />
            </div>
            {['business', 'recycler', 'collector'].includes(form.role) && (
              <div className="col-span-2">
                <label className="label">Business Name</label>
                <input className="input" placeholder="Your business name" value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} />
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account — Free'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Have an account? <Link href="/auth/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
