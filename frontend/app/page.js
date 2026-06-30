'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Recycle, MapPin, Star, BarChart3, ShieldCheck, Leaf, ArrowRight, Menu, X, Zap, Users, TrendingUp } from 'lucide-react';
import { getImpact } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

const NAV_LINKS = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'B2B Exchange', href: '/b2b' },
  { label: 'Dump Reports', href: '/county' },
  { label: 'WasteIQ', href: '/audit' },
  { label: 'Impact', href: '/impact' },
];

const MODULES = [
  { icon: Star, color: 'bg-amber-100 text-amber-700', title: 'TakaPoints', desc: 'Earn points for every KG of waste you deposit. Redeem for M-Pesa cash or airtime.' },
  { icon: Recycle, color: 'bg-green-100 text-green-700', title: 'TrashChain', desc: 'Buy and sell recyclables on Kenya\'s first verified waste marketplace with escrow payments.' },
  { icon: TrendingUp, color: 'bg-blue-100 text-blue-700', title: 'ReLoop B2B', desc: 'Businesses exchange by-products as raw inputs. One company\'s waste is another\'s feedstock.' },
  { icon: Zap, color: 'bg-purple-100 text-purple-700', title: 'WasteIQ', desc: 'AI-powered audit that profiles your waste, finds recovery opportunities, and tracks carbon credits.' },
  { icon: MapPin, color: 'bg-red-100 text-red-700', title: 'DumpAlert', desc: 'Geo-tag and report illegal dump sites. County officers get instant alerts and deploy cleanup crews.' },
  { icon: BarChart3, color: 'bg-teal-100 text-teal-700', title: 'Impact Dashboard', desc: 'Live data: KG diverted, CO₂ saved, KES circulated — Kenya\'s circular economy, tracked.' },
];

function CountUp({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({ wasteKgDiverted: 0, co2KgSaved: 0, kesCirculated: 0, totalUsers: 0 });

  useEffect(() => {
    getImpact().then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-taka-sand">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-taka-sand/90 backdrop-blur border-b border-taka-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl text-taka-green">
            <div className="w-8 h-8 bg-taka-green rounded-lg flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            TakaLoop
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-taka-charcoal/70 hover:text-taka-green transition-colors">{l.label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href={`/${user.role === 'citizen' ? 'citizen' : user.role === 'admin' ? 'admin' : 'marketplace'}`} className="btn-primary text-sm py-2 px-4">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-outline text-sm py-2 px-4">Sign In</Link>
                <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
            {NAV_LINKS.map(l => <Link key={l.href} href={l.href} className="text-sm font-medium">{l.label}</Link>)}
            <Link href="/auth/login" className="btn-outline text-sm py-2 text-center">Sign In</Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 text-center justify-center">Get Started</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-hero-pattern overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-taka-green/10 text-taka-green text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Leaf className="w-4 h-4" /> Kenya's Circular Economy Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold text-taka-charcoal leading-tight mb-6">
              Turn Kenya's Waste<br />
              <span className="text-taka-green">Into Wealth.</span>
            </h1>
            <p className="text-xl text-taka-charcoal/60 mb-8 leading-relaxed">
              TakaLoop connects waste collectors, recyclers, businesses, and communities on one intelligent platform — marketplace, rewards, AI audits, and live dump reporting in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register" className="btn-primary text-base py-4 px-8 justify-center">
                Join TakaLoop <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/impact" className="btn-secondary text-base py-4 px-8 justify-center">
                See Our Impact <BarChart3 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        {/* Floating stat cards */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
          {[
            { label: 'KG Diverted', value: stats.wasteKgDiverted, suffix: 'kg', color: 'border-l-taka-green' },
            { label: 'CO₂ Saved', value: stats.co2KgSaved, suffix: 'kg', color: 'border-l-taka-lime' },
            { label: 'KES Circulated', value: stats.kesCirculated, suffix: '', color: 'border-l-taka-earth' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl p-4 shadow-lg border-l-4 ${s.color} min-w-[160px]`}>
              <div className="text-2xl font-bold text-taka-charcoal"><CountUp target={s.value} suffix={s.suffix} /></div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-taka-green text-white py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'KG Waste Diverted', value: stats.wasteKgDiverted, suffix: '' },
            { label: 'Tonnes CO₂ Saved', value: Math.round(stats.co2KgSaved / 1000), suffix: 't' },
            { label: 'KES Circulated', value: stats.kesCirculated, suffix: '' },
            { label: 'Active Users', value: stats.totalUsers, suffix: '' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-display font-bold"><CountUp target={s.value} suffix={s.suffix} /></div>
              <div className="text-sm text-white/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modules ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-taka-charcoal mb-3">One Platform. Five Modules.</h2>
            <p className="text-taka-charcoal/60 max-w-xl mx-auto">Every link in the circular economy chain, connected in one place.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map(m => (
              <div key={m.title} className="card p-6">
                <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center mb-4`}>
                  <m.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-taka-charcoal mb-2">{m.title}</h3>
                <p className="text-taka-charcoal/60 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-taka-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center mb-12">How TakaLoop Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Join as a citizen, collector, business, or county officer' },
              { step: '02', title: 'Deposit or List', desc: 'Drop waste at collection points or list it on the marketplace' },
              { step: '03', title: 'Earn & Trade', desc: 'Collect TakaPoints or complete M-Pesa-powered transactions' },
              { step: '04', title: 'Impact', desc: 'Track your carbon offset and contribute to a cleaner Kenya' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-taka-green text-white rounded-2xl flex items-center justify-center text-lg font-bold font-mono mx-auto mb-4">{s.step}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-taka-charcoal/60 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-taka-green rounded-3xl p-12 text-white">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-taka-lime" />
            <h2 className="text-3xl font-display font-bold mb-4">Ready to close the loop?</h2>
            <p className="text-white/80 mb-8 text-lg">Join thousands of Kenyans turning waste into opportunity.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-white text-taka-green font-semibold px-8 py-4 rounded-xl hover:bg-taka-mist transition-colors inline-flex items-center gap-2 justify-center">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/marketplace" className="border border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center justify-center">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-taka-charcoal text-white/60 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-white mb-2">
              <div className="w-6 h-6 bg-taka-green rounded flex items-center justify-center"><Recycle className="w-4 h-4 text-white" /></div>
              TakaLoop
            </div>
            <p className="text-sm">Kenya's Circular Waste Intelligence Platform</p>
          </div>
          <div className="flex gap-6 text-sm">
            {NAV_LINKS.map(l => <Link key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</Link>)}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-6 pt-6 border-t border-white/10 text-sm">
          © {new Date().getFullYear()} TakaLoop. Built for Kenya's circular economy.
        </div>
      </footer>
    </div>
  );
}
