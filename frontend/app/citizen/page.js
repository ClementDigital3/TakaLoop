'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { getPointsHistory, getLeaderboard, getCollectionPoints } from '@/lib/api';
import { Star, Leaf, MapPin, TrendingUp, Gift, ChevronRight, QrCode } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [points, setPoints] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemForm, setRedeemForm] = useState({ points: 100, redeemFor: 'airtime', mpesaNumber: user?.mpesaNumber || '' });

  useEffect(() => {
    getPointsHistory().then(r => setHistory(r.data.data)).catch(() => {});
    getLeaderboard({ county: user?.county }).then(r => setLeaders(r.data.data)).catch(() => {});
  }, []);

  const myRank = leaders.findIndex(l => l._id === user?._id) + 1;

  return (
    <div className="min-h-screen bg-taka-sand">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-taka-charcoal/60 mt-1">{user?.ward}, {user?.county}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowQR(true)} className="btn-secondary py-2 px-4 text-sm">
              <QrCode className="w-4 h-4" /> My QR Code
            </button>
            <button onClick={() => setShowRedeem(true)} className="btn-primary py-2 px-4 text-sm">
              <Gift className="w-4 h-4" /> Redeem Points
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Star, color: 'text-amber-500 bg-amber-50', label: 'TakaPoints', value: user?.points?.toLocaleString() || '0' },
            { icon: Leaf, color: 'text-green-500 bg-green-50', label: 'Waste Deposited', value: `${user?.totalWasteKg || 0} kg` },
            { icon: TrendingUp, color: 'text-blue-500 bg-blue-50', label: 'CO₂ Saved', value: `${Math.round((user?.totalWasteKg || 0) * 1.2)} kg` },
            { icon: MapPin, color: 'text-purple-500 bg-purple-50', label: 'County Rank', value: myRank ? `#${myRank}` : '—' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold font-display">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Points History */}
          <div className="card p-6">
            <h2 className="section-title mb-4">Points Activity</h2>
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No activity yet. Start by depositing waste!</p>
                <Link href="/county" className="btn-primary text-sm py-2 px-4 mt-3 inline-flex">Find Collection Points</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 8).map(h => (
                  <div key={h._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{h.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold text-sm ${h.points > 0 ? 'text-taka-green' : 'text-red-500'}`}>
                      {h.points > 0 ? '+' : ''}{h.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="card p-6">
            <h2 className="section-title mb-4">County Leaderboard — {user?.county}</h2>
            <div className="space-y-3">
              {leaders.slice(0, 8).map((l, i) => (
                <div key={l._id} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${l._id === user?._id ? 'bg-taka-mist border border-taka-green/20' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{l.name} {l._id === user?._id && '(You)'}</p>
                    <p className="text-xs text-gray-400">{l.ward} • {l.totalWasteKg} kg deposited</p>
                  </div>
                  <span className="font-bold text-taka-green text-sm">{l.points?.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Browse Marketplace', href: '/marketplace', color: 'bg-green-50 text-green-700 border-green-100' },
            { label: 'Report Illegal Dump', href: '/county', color: 'bg-red-50 text-red-700 border-red-100' },
            { label: 'Find Drop-Off Point', href: '/county/collection-points', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'View Impact', href: '/impact', color: 'bg-purple-50 text-purple-700 border-purple-100' },
          ].map(a => (
            <Link key={a.href} href={a.href} className={`card border p-4 ${a.color} flex items-center justify-between hover:shadow-md`}>
              <span className="text-sm font-medium">{a.label}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl mb-2">Your TakaLoop QR</h3>
            <p className="text-sm text-gray-500 mb-6">Show this to a collection point officer to log your deposit</p>
            <div className="flex justify-center mb-6">
              <QRCodeSVG value={`TAKALOOP:USER:${user?._id}`} size={200} fgColor="#1A7A4A" />
            </div>
            <p className="font-semibold text-taka-charcoal">{user?.name}</p>
            <p className="text-taka-green font-bold">⭐ {user?.points} TakaPoints</p>
            <button onClick={() => setShowQR(false)} className="btn-primary w-full justify-center mt-6">Close</button>
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {showRedeem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRedeem(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl mb-1">Redeem TakaPoints</h3>
            <p className="text-sm text-gray-500 mb-6">10 points = KES 1</p>
            <div className="space-y-4">
              <div>
                <label className="label">Points to Redeem (min 100)</label>
                <input type="number" className="input" min={100} max={user?.points} value={redeemForm.points} onChange={e => setRedeemForm({ ...redeemForm, points: Number(e.target.value) })} />
                <p className="text-xs text-gray-400 mt-1">= KES {Math.round(redeemForm.points / 10)}</p>
              </div>
              <div>
                <label className="label">Redeem For</label>
                <select className="select" value={redeemForm.redeemFor} onChange={e => setRedeemForm({ ...redeemForm, redeemFor: e.target.value })}>
                  <option value="airtime">Airtime</option>
                  <option value="mpesa_cash">M-Pesa Cash</option>
                </select>
              </div>
              <div>
                <label className="label">M-Pesa Number</label>
                <input className="input" value={redeemForm.mpesaNumber} onChange={e => setRedeemForm({ ...redeemForm, mpesaNumber: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowRedeem(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                <button onClick={() => { toast.success('Redemption requested! Processing within 24hrs.'); setShowRedeem(false); }} className="btn-primary flex-1 justify-center">Redeem</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
