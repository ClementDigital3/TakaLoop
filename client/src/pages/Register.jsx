import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { COUNTIES } from '../lib/constants';
import LogoIcon from '../components/layout/LogoIcon';

const ROLES = [
  { value:'citizen', label:'Citizen', desc:'Earn rewards for recycling', emoji:'🏠' },
  { value:'collector', label:'Waste Collector', desc:'List and sell waste materials', emoji:'♻️' },
  { value:'business', label:'Business', desc:'Get AI audits & trade byproducts', emoji:'🏢' },
  { value:'recycler', label:'Recycler', desc:'Buy waste as raw materials', emoji:'🔄' },
  { value:'officer', label:'County Officer', desc:'Manage dump reports & cleanups', emoji:'🏛️' },
];

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', role: params.get('role')||'citizen', ward:'', county:'Nairobi', businessName:'' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const res = await register(form);
    if (res?.success) {
      const paths = { citizen:'/citizen', collector:'/business', business:'/business', recycler:'/business', officer:'/officer', admin:'/admin' };
      navigate(paths[res.role] || '/dashboard');
    } else { setError(res?.message || 'Registration failed'); }
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

      <div className="w-full max-w-lg relative z-10 my-12">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 hover:opacity-90 transition-opacity">
            <LogoIcon className="w-12 h-12" />
            <span className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">TakaLoop</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Join the loop</h1>
          <p className="text-slate-500 text-sm mt-2">Create your free account and start recycling</p>
        </div>

        <div className="card shadow-md">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

          {/* Role selector */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-slate-700 block mb-2.5">I want to register as a...</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setForm({...form, role:r.value})}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${form.role===r.value ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                  <div className="text-2xl mb-1.5">{r.emoji}</div>
                  <div className="text-xs font-bold text-slate-900">{r.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
                <input className="input-field" placeholder="Jane Wanjiru" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Phone (M-Pesa)</label>
                <input className="input-field" placeholder="0712345678" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email address</label>
              <input className="input-field" type="email" placeholder="jane@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            {(form.role==='business'||form.role==='recycler') && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Business Name</label>
                <input className="input-field" placeholder="Acme Recyclers Ltd" value={form.businessName} onChange={e => setForm({...form, businessName:e.target.value})} required />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">County</label>
                <select className="input-field" value={form.county} onChange={e => setForm({...form, county:e.target.value})}>
                  {COUNTIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Ward / Estate</label>
                <input className="input-field" placeholder="Westlands" value={form.ward} onChange={e => setForm({...form, ward:e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
              <input className="input-field" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Already registered? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
