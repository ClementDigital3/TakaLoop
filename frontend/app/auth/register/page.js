'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Recycle } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

const ROLES = [
  { value: 'citizen', label: '🏠 Citizen', desc: 'Deposit waste & earn TakaPoints' },
  { value: 'collector', label: '♻️ Collector', desc: 'Collect & sell waste on marketplace' },
  { value: 'business', label: '🏢 Business', desc: 'AI waste audit & B2B exchange' },
  { value: 'recycler', label: '⚙️ Recycler', desc: 'Buy waste as raw materials' },
  { value: 'county_officer', label: '🗺️ County Officer', desc: 'Manage dump reports & collection points' },
];

const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Machakos','Nyeri','Meru','Garissa','Kisii','Kakamega','Kitale','Malindi','Lamu','Other'];

export default function RegisterPage() {
  const { loginUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', role:'citizen', county:'Nairobi', ward:'', businessName:'', mpesaNumber:'' });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data.token, res.data.user);
      toast.success('Account created! Welcome to TakaLoop 🌱');
      const role = res.data.user.role;
      if (role === 'citizen') router.push('/citizen');
      else if (role === 'county_officer') router.push('/county');
      else router.push('/marketplace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-taka-sand flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-taka-green">
            <div className="w-10 h-10 bg-taka-green rounded-xl flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            TakaLoop
          </Link>
          <h1 className="text-2xl font-display font-bold text-taka-charcoal mt-4 mb-1">Join TakaLoop</h1>
          <p className="text-taka-charcoal/60">Step {step} of 2</p>
          <div className="flex gap-2 mt-3 justify-center">
            {[1,2].map(s => <div key={s} className={`h-1.5 w-16 rounded-full transition-colors ${s <= step ? 'bg-taka-green' : 'bg-gray-200'}`} />)}
          </div>
        </div>

        <div className="card p-8 space-y-5">
          {step === 1 ? (
            <>
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Jane Wanjiku" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="jane@example.com" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input" placeholder="0712345678" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="At least 6 characters" value={form.password} onChange={set('password')} />
              </div>
              <button onClick={() => { if (!form.name || !form.email || !form.phone || !form.password) return toast.error('Fill all fields'); setStep(2); }} className="btn-primary w-full justify-center py-3">
                Continue
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="label">I am a...</label>
                <div className="space-y-2">
                  {ROLES.map(r => (
                    <label key={r.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.role === r.value ? 'border-taka-green bg-taka-mist' : 'border-gray-200 hover:border-taka-green/40'}`}>
                      <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={set('role')} className="mt-1" />
                      <div>
                        <div className="font-medium text-sm">{r.label}</div>
                        <div className="text-xs text-gray-500">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">County</label>
                <select className="select" value={form.county} onChange={set('county')}>
                  {COUNTIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Ward / Estate</label>
                <input className="input" placeholder="e.g. Westlands, Kibera" value={form.ward} onChange={set('ward')} />
              </div>
              {(form.role === 'business' || form.role === 'recycler') && (
                <div>
                  <label className="label">Business Name</label>
                  <input className="input" placeholder="Your business name" value={form.businessName} onChange={set('businessName')} />
                </div>
              )}
              <div>
                <label className="label">M-Pesa Number (for payments)</label>
                <input className="input" placeholder="0712345678" value={form.mpesaNumber} onChange={set('mpesaNumber')} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center py-3">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center py-3">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </>
          )}
          <p className="text-center text-sm text-taka-charcoal/60">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-taka-green font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
