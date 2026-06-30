'use client';
import Link from 'next/link';
import { Recycle, MapPin, TrendingUp, Shield, Users, Zap, ArrowRight, Leaf, Award, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { impactAPI } from '@/lib/api';

const WASTE_CATEGORIES = [
  { name: 'Plastics', color: 'text-blue-400', bg: 'bg-blue-900/20', icon: '♻️' },
  { name: 'Metals', color: 'text-gray-300', bg: 'bg-gray-800/40', icon: '🔩' },
  { name: 'E-Waste', color: 'text-purple-400', bg: 'bg-purple-900/20', icon: '📱' },
  { name: 'Paper', color: 'text-yellow-400', bg: 'bg-yellow-900/20', icon: '📦' },
  { name: 'Organics', color: 'text-green-400', bg: 'bg-green-900/20', icon: '🌿' },
  { name: 'Glass', color: 'text-cyan-400', bg: 'bg-cyan-900/20', icon: '🍶' },
];

const MODULES = [
  { title: 'TakaPoints', desc: 'Earn points for depositing sorted waste. Redeem for M-Pesa cash or airtime.', icon: Award, color: 'leaf', href: '/citizen' },
  { title: 'TrashChain', desc: 'Buy and sell waste materials. M-Pesa escrow protects every transaction.', icon: TrendingUp, color: 'ember', href: '/marketplace' },
  { title: 'ReLoop', desc: 'B2B circular exchange. Trade byproducts and offcuts as raw inputs.', icon: Recycle, color: 'soil', href: '/marketplace?type=byproduct' },
  { title: 'WasteIQ', desc: 'AI-powered waste audit for businesses. Identify recovery opportunities.', icon: Zap, color: 'leaf', href: '/audit' },
  { title: 'DumpAlert', desc: 'Report illegal dump sites. County officers respond. You earn points.', icon: MapPin, color: 'ember', href: '/citizen#reports' },
  { title: 'Impact Board', desc: 'Live public dashboard. Real numbers. Tonnes diverted. CO₂ avoided.', icon: BarChart3, color: 'soil', href: '/impact' },
];

export default function HomePage() {
  const [stats, setStats] = useState({ totalKgsCollected: 0, totalUsers: 0, co2Avoided: 0, totalTransactions: 0 });

  useEffect(() => {
    impactAPI.getStats().then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-ash-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-ash-900/80 backdrop-blur-md border-b border-ash-800">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-leaf-600 rounded-lg flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">TakaLoop</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-ash-300">
            <Link href="/marketplace" className="hover:text-leaf-400 transition-colors">Marketplace</Link>
            <Link href="/impact" className="hover:text-leaf-400 transition-colors">Impact</Link>
            <Link href="/audit" className="hover:text-leaf-400 transition-colors">AI Audit</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm text-ash-300 hover:text-white transition-colors">Sign in</Link>
            <Link href="/auth?mode=register" className="btn-primary text-sm !px-4 !py-2">Join free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-leaf-900/20 via-ash-900 to-ash-900" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-leaf-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-ember-500/5 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-leaf-900/40 border border-leaf-800 rounded-full px-4 py-2 text-sm text-leaf-400 mb-8 fade-in-up">
              <span className="w-2 h-2 bg-leaf-500 rounded-full pulse-green" />
              Kenya's Circular Economy Platform
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
              Waste is not
              <br />
              <span className="text-leaf-400 font-display italic">the end.</span>
              <br />
              It's the input.
            </h1>

            <p className="text-lg text-ash-300 max-w-xl mb-10 leading-relaxed fade-in-up" style={{ animationDelay: '0.2s' }}>
              TakaLoop connects waste collectors, recyclers, citizens and county governments to build a circular economy across Kenya — powered by M-Pesa and AI.
            </p>

            <div className="flex flex-wrap gap-4 fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/auth?mode=register" className="btn-primary flex items-center gap-2 text-base !px-6 !py-3">
                Start earning from waste <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/impact" className="btn-secondary flex items-center gap-2 text-base !px-6 !py-3">
                View live impact
              </Link>
            </div>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: `${(stats.totalKgsCollected || 0).toLocaleString()}kg`, label: 'Waste Diverted' },
              { value: (stats.totalUsers || 0).toLocaleString(), label: 'Active Users' },
              { value: `${(stats.co2Avoided || 0).toFixed(1)}t`, label: 'CO₂ Avoided' },
              { value: (stats.totalTransactions || 0).toLocaleString(), label: 'Transactions' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <div className="text-2xl font-bold text-leaf-400 font-display">{s.value}</div>
                <div className="text-xs text-ash-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waste categories */}
      <section className="py-16 border-t border-ash-800">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-ash-500 text-sm uppercase tracking-widest mb-8">We handle every waste stream</p>
          <div className="flex flex-wrap justify-center gap-3">
            {WASTE_CATEGORIES.map(c => (
              <div key={c.name} className={`flex items-center gap-2 ${c.bg} border border-ash-700 rounded-full px-4 py-2`}>
                <span>{c.icon}</span>
                <span className={`text-sm font-medium ${c.color}`}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-24 border-t border-ash-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">One platform. Six modules.</h2>
            <p className="text-ash-400 max-w-xl mx-auto">Everything Kenya needs to close the waste loop — from street collection to corporate compliance.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((m, i) => (
              <Link key={m.title} href={m.href}>
                <div className="card-hover group h-full" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${m.color === 'leaf' ? 'bg-leaf-900/50' : m.color === 'ember' ? 'bg-ember-900/50' : 'bg-soil-700/30'}`}>
                    <m.icon className={`w-5 h-5 ${m.color === 'leaf' ? 'text-leaf-400' : m.color === 'ember' ? 'text-ember-400' : 'text-soil-500'}`} />
                  </div>
                  <h3 className="font-bold text-ash-100 mb-2 group-hover:text-leaf-400 transition-colors">{m.title}</h3>
                  <p className="text-sm text-ash-400 leading-relaxed">{m.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs text-ash-500 group-hover:text-leaf-500 transition-colors">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-ash-800 bg-ash-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">How TakaLoop works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Collect & Sort', desc: 'Citizens sort waste at home and deposit it at TakaLoop collection points across their ward.' },
              { step: '02', title: 'Earn & Trade', desc: 'Earn TakaPoints for every kilogram. Collectors list waste on TrashChain. Recyclers buy via M-Pesa escrow.' },
              { step: '03', title: 'Close the Loop', desc: 'Businesses use WasteIQ to audit their waste. Byproducts listed on ReLoop become another business\'s input.' },
            ].map(s => (
              <div key={s.step} className="card">
                <div className="text-5xl font-bold text-leaf-900 font-display mb-4">{s.step}</div>
                <h3 className="text-lg font-bold text-ash-100 mb-2">{s.title}</h3>
                <p className="text-ash-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-ash-800">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Leaf className="w-12 h-12 text-leaf-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">Kenya wastes 22,000 tonnes daily.<br />Help us recover it.</h2>
          <p className="text-ash-400 mb-8">Join collectors, recyclers, businesses, and county officers already on TakaLoop.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=register&role=citizen" className="btn-primary !px-8 !py-3 text-base">I'm a citizen</Link>
            <Link href="/auth?mode=register&role=business" className="btn-secondary !px-8 !py-3 text-base">I'm a business</Link>
            <Link href="/auth?mode=register&role=collector" className="btn-secondary !px-8 !py-3 text-base">I'm a collector</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ash-800 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Recycle className="w-5 h-5 text-leaf-500" />
            <span className="font-bold text-ash-300">TakaLoop</span>
            <span className="text-ash-600 text-sm ml-2">Kenya's Circular Waste Platform</span>
          </div>
          <div className="flex gap-6 text-sm text-ash-500">
            <Link href="/impact" className="hover:text-ash-300">Impact</Link>
            <Link href="/marketplace" className="hover:text-ash-300">Marketplace</Link>
            <Link href="/audit" className="hover:text-ash-300">WasteIQ</Link>
            <Link href="/auth" className="hover:text-ash-300">Sign in</Link>
          </div>
          <p className="text-xs text-ash-600">© 2025 TakaLoop. Built for Kenya.</p>
        </div>
      </footer>
    </div>
  );
}
