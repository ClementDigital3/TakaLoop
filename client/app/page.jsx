'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { impactAPI } from '../lib/api';
import { formatKg, formatKES, formatCO2 } from '../lib/utils';

export default function LandingPage() {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    impactAPI.getPublic().then(r => setImpact(r.data.impact)).catch(() => {});
  }, []);

  const features = [
    { icon: '♻️', title: 'TrashChain Marketplace', desc: 'Buy and sell waste with M-Pesa escrow payments. Graded listings, verified collectors, pickup scheduling.' },
    { icon: '🪙', title: 'TakaPoints Rewards', desc: 'Earn points for every KG deposited at collection points. Redeem for M-Pesa cash or airtime.' },
    { icon: '🏭', title: 'ReLoop B2B Exchange', desc: 'Turn your manufacturing byproducts into someone else\'s raw material. Circular economy in action.' },
    { icon: '🤖', title: 'WasteIQ AI Auditor', desc: 'Describe your business, get an AI-powered waste profile, recovery opportunities, and carbon credit report.' },
    { icon: '📍', title: 'DumpAlert Reporting', desc: 'Geo-tag illegal dump sites with photos. County officers respond. You earn points for valid reports.' },
    { icon: '🌍', title: 'Carbon Credits', desc: 'Every KG diverted from landfill earns carbon credits. Track your ESG impact and export compliance reports.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">♻️</span>
            <span className="font-bold text-xl text-green-800">TakaLoop</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/marketplace" className="hover:text-green-700">Marketplace</Link>
            <Link href="/impact" className="hover:text-green-700">Impact</Link>
            <Link href="/audit" className="hover:text-green-700">WasteIQ</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-green-700">Log in</Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-24 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6 backdrop-blur">
            <span>🇰🇪</span> Built for Kenya's Circular Economy
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Waste is the new<br />
            <span className="text-green-300">raw material.</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            TakaLoop connects waste collectors, recyclers, businesses, and citizens — turning Kenya's 22,000 daily tonnes of waste into economic opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-green-800 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-all">
              Join the Loop
            </Link>
            <Link href="/marketplace" className="border border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      {impact && (
        <section className="bg-green-950 text-white py-16 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold text-green-300">{formatKg(impact.totalWasteKgDiverted)}</div>
              <div className="text-sm text-green-400 mt-1">Waste Diverted</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-green-300">{formatCO2(impact.co2AvoidedKg)}</div>
              <div className="text-sm text-green-400 mt-1">CO₂ Avoided</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-green-300">{formatKES(impact.kesCirculated)}</div>
              <div className="text-sm text-green-400 mt-1">KES Circulated</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-green-300">{impact.citizens + impact.collectors + impact.businesses}</div>
              <div className="text-sm text-green-400 mt-1">Active Users</div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-green-950 mb-4">One platform. Full circle.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Every part of the waste lifecycle — from reporting to trading to auditing — in one connected system.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg text-green-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles CTA */}
      <section className="py-24 px-6 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-extrabold text-green-950 text-center mb-16">Who is TakaLoop for?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '🏘️', role: 'Citizens', action: 'Earn TakaPoints', desc: 'Deposit sorted waste and report illegal dumpsites.' },
              { emoji: '🚛', role: 'Collectors', action: 'Sell to recyclers', desc: 'List your collected waste and find buyers instantly.' },
              { emoji: '🏭', role: 'Businesses', action: 'Get AI audit', desc: 'Turn your waste into savings with WasteIQ analysis.' },
              { emoji: '🏛️', role: 'County Govts', action: 'Manage cleanups', desc: 'Dashboard for dump reports, officers, and cleanup tracking.' },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center border border-green-100 shadow-sm">
                <div className="text-5xl mb-3">{r.emoji}</div>
                <div className="font-bold text-green-900 text-lg mb-1">{r.role}</div>
                <div className="text-green-600 text-sm font-medium mb-3">{r.action}</div>
                <p className="text-gray-500 text-sm">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/auth/register" className="btn-primary text-lg px-10 py-4">
              Join TakaLoop — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-950 text-green-300 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">♻️</span>
            <span className="font-bold text-white">TakaLoop</span>
            <span className="text-sm">— Kenya's Circular Waste Platform</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/marketplace" className="hover:text-white">Marketplace</Link>
            <Link href="/impact" className="hover:text-white">Impact</Link>
            <Link href="/auth/register" className="hover:text-white">Register</Link>
          </div>
          <p className="text-sm text-green-500">© 2024 TakaLoop. Built for Kenya 🇰🇪</p>
        </div>
      </footer>
    </div>
  );
}
