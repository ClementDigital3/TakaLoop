import { Link } from 'react-router-dom';
import { Recycle, MapPin, Star, BarChart3, Shield, ArrowRight, CheckCircle, Users, Package, TreePine } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LogoIcon from '../components/layout/LogoIcon';

const STATS = [
  { value: '22,000', label: 'Tonnes of waste Kenya generates daily', icon: '🗑️' },
  { value: '90%', label: 'Goes to landfill unrecycled', icon: '😔' },
  { value: 'KES 8B', label: 'Lost economic value annually', icon: '💸' },
  { value: '47', label: 'Counties with inadequate waste systems', icon: '🗺️' },
];

const FEATURES = [
  { icon: Star, title: 'TakaPoints', desc: 'Earn points for depositing sorted waste at collection points. Redeem for M-Pesa airtime or cash.', color: 'amber' },
  { icon: Package, title: 'TrashChain', desc: 'Buy and sell waste materials on Kenya\'s first waste marketplace with M-Pesa escrow protection.', color: 'green' },
  { icon: Recycle, title: 'ReLoop', desc: 'B2B circular economy — turn your business waste byproducts into another business\'s raw materials.', color: 'blue' },
  { icon: BarChart3, title: 'WasteIQ', desc: 'AI-powered waste audit for your business. Get recovery opportunities and carbon credit potential.', color: 'purple' },
  { icon: MapPin, title: 'DumpAlert', desc: 'Geo-tag and report illegal dump sites. County officers get alerted instantly for cleanup.', color: 'red' },
  { icon: TreePine, title: 'Carbon Credits', desc: 'Track your environmental impact. Every kg diverted earns carbon credits for ESG reporting.', color: 'emerald' },
];

const ROLES = [
  { title: 'Citizen', desc: 'Earn rewards for recycling, report illegal dumps, track your environmental impact.', cta: 'Join as Citizen', path: '/register?role=citizen', emoji: '🏠' },
  { title: 'Collector / Recycler', desc: 'List waste materials, find buyers, get fair market prices with M-Pesa protection.', cta: 'Join as Collector', path: '/register?role=collector', emoji: '♻️' },
  { title: 'Business', desc: 'Get AI waste audits, trade byproducts, earn carbon credits, meet compliance requirements.', cta: 'Join as Business', path: '/register?role=business', emoji: '🏢' },
  { title: 'County Officer', desc: 'Manage dump reports, coordinate cleanups, track waste collection across your ward.', cta: 'Join as Officer', path: '/register?role=officer', emoji: '🏛️' },
];

const colors = { amber:'text-amber-600 bg-amber-50', green:'text-green-600 bg-green-50', blue:'text-blue-600 bg-blue-50', purple:'text-purple-600 bg-purple-50', red:'text-red-600 bg-red-50', emerald:'text-emerald-600 bg-emerald-50' };

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 bg-gradient-to-br from-slate-950 via-emerald-950 to-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-emerald-400 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-green-500 blur-3xl animate-pulse" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-8 text-sm font-medium text-emerald-300">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Kenya's First Circular Waste Intelligence Platform
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Waste Less.<br />
            <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">Earn More.</span><br />
            Loop Smarter.
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/80 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            TakaLoop connects citizens, collectors, businesses and county governments into one circular economy — powered by M-Pesa, AI, and community action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/impact" className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/40 transition-all active:scale-95">
              View Live Impact
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-emerald-600 uppercase tracking-widest mb-10">The Waste Problem in Kenya</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-extrabold font-display text-slate-950">{s.value}</div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">One Platform, Full Circle</p>
            <h2 className="font-display text-4xl font-extrabold text-slate-950">Everything in one loop</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card group hover:border-emerald-100 hover:shadow-[0_12px_30px_rgba(16,185,129,0.05)]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${colors[f.color]}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is It For */}
      <section className="py-24 px-4 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-extrabold tracking-tight">Built for everyone in the loop</h2>
            <p className="text-emerald-400/80 text-sm mt-3">One platform, four roles, infinite circular impact</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROLES.map(r => (
              <div key={r.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_12px_40px_-10px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="text-4xl mb-3">{r.emoji}</div>
                  <h3 className="font-display font-bold text-xl mb-2 text-white">{r.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">{r.desc}</p>
                </div>
                <Link to={r.path} className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm hover:text-emerald-300 transition-colors w-fit">
                  {r.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to close the loop?</h2>
          <p className="text-green-100 mb-8">Join thousands of Kenyans turning waste into wealth, one deposit at a time.</p>
          <Link to="/register" className="bg-white text-green-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all inline-flex items-center gap-2">
            Join TakaLoop Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-gray-900 text-gray-400 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <LogoIcon className="w-7 h-7" />
          <span className="font-display font-bold text-white">TakaLoop</span>
        </div>
        <p>© 2024 TakaLoop Kenya. Circular Economy for a Greener Africa.</p>
      </footer>
    </div>
  );
}
