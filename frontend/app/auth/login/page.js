'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Recycle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name?.split(' ')[0]}!`);
      const role = res.data.user.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'county_officer') router.push('/county');
      else if (role === 'citizen') router.push('/citizen');
      else router.push('/marketplace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-taka-sand flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-taka-green">
            <div className="w-10 h-10 bg-taka-green rounded-xl flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            TakaLoop
          </Link>
          <h1 className="text-2xl font-display font-bold text-taka-charcoal mt-4 mb-1">Welcome back</h1>
          <p className="text-taka-charcoal/60">Sign in to your TakaLoop account</p>
        </div>
        <div className="card p-8 space-y-5">
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} className="input pr-12" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShow(!show)}>
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-taka-charcoal/60">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-taka-green font-medium hover:underline">Create one</Link>
          </p>
        </div>
        {/* Demo credentials */}
        <div className="mt-4 bg-taka-mist rounded-xl p-4 text-sm text-taka-charcoal/70">
          <p className="font-semibold mb-2 text-taka-charcoal">Demo Credentials:</p>
          <p>Admin: admin@takaloop.ke / admin123</p>
          <p>Citizen: citizen@takaloop.ke / test123</p>
        </div>
      </div>
    </div>
  );
}
