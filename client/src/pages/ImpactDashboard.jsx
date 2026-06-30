import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Leaf, Users, Recycle, DollarSign, TreePine, Globe } from 'lucide-react';

const COLORS = ['#16a34a','#0ea5e9','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#84cc16','#f97316'];
const CAT_EMOJI = { plastics:'🧴',metals:'⚙️',paper:'📦',ewaste:'💻',organics:'🌿',hazardous:'⚠️',glass:'🫙',textiles:'👕',rubber:'🔵',other:'♻️' };

export default function ImpactDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/impact').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const s = data?.stats || {};
  const byCategory = (data?.byCategory || []).map(c => ({ name: c._id, kg: c.totalKg, emoji: CAT_EMOJI[c._id]||'♻️' }));
  const byCounty = (data?.byCounty || []).map(c => ({ name: c._id, reports: c.count }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center"><Globe className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900">TakaLoop Impact</h1>
              <p className="text-gray-500 text-sm">Live circular economy metrics across Kenya</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Live Data
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin" style={{borderWidth:'3px'}} /></div>
        ) : (
          <>
            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              {[
                { icon:'👥', label:'Users', value: s.totalUsers?.toLocaleString()||'0', color:'blue' },
                { icon:'📦', label:'Listings', value: s.totalListings?.toLocaleString()||'0', color:'green' },
                { icon:'💰', label:'Transactions', value: s.totalTransactions?.toLocaleString()||'0', color:'amber' },
                { icon:'🗑️', label:'Waste (kg)', value: s.wasteKg?.toLocaleString()||'0', color:'purple' },
                { icon:'🌿', label:'CO₂ Offset (kg)', value: s.co2SavedKg?.toLocaleString()||'0', color:'emerald' },
                { icon:'🌳', label:'Trees Equiv.', value: s.treesEquivalent?.toLocaleString()||'0', color:'green' },
              ].map(stat => (
                <div key={stat.label} className="card text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <p className="text-2xl font-bold font-display text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* KES Circulated Banner */}
            <div className="bg-gradient-to-r from-green-900 to-emerald-800 text-white rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-green-300 text-sm font-medium mb-1">Total Economic Value Circulated</p>
                <p className="text-4xl font-bold font-display">KES {s.moneyCirculatedKes?.toLocaleString() || '0'}</p>
                <p className="text-green-300 text-xs mt-1">From waste transactions on TakaLoop</p>
              </div>
              <div className="text-center">
                <p className="text-green-300 text-sm mb-1">Dump Reports Resolved</p>
                <p className="text-4xl font-bold font-display">{s.resolvedReports || 0} / {s.totalReports || 0}</p>
                <p className="text-green-300 text-xs mt-1">Sites cleaned up</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Waste by Category */}
              <div className="card">
                <h3 className="font-display font-bold text-lg mb-4">Waste Diverted by Category (kg)</h3>
                {byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={byCategory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`${v} kg`, 'Waste']} />
                      <Bar dataKey="kg" radius={[6,6,0,0]}>
                        {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-300">
                    <div className="text-center"><Recycle className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Waste data will appear here</p></div>
                  </div>
                )}
              </div>

              {/* Reports by County */}
              <div className="card">
                <h3 className="font-display font-bold text-lg mb-4">Dump Reports by County</h3>
                {byCounty.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={byCounty} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                      <Tooltip />
                      <Bar dataKey="reports" fill="#16a34a" radius={[0,6,6,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-300">
                    <div className="text-center"><Globe className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">County data will appear here</p></div>
                  </div>
                )}
              </div>
            </div>

            {/* SDG alignment */}
            <div className="card">
              <h3 className="font-display font-bold text-lg mb-4">🌍 UN Sustainable Development Goals Alignment</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { sdg:'SDG 11', title:'Sustainable Cities', desc:'Clean communities through DumpAlert', color:'bg-orange-50 border-orange-200' },
                  { sdg:'SDG 12', title:'Responsible Consumption', desc:'Circular economy via TrashChain & ReLoop', color:'bg-yellow-50 border-yellow-200' },
                  { sdg:'SDG 13', title:'Climate Action', desc:'Carbon offset tracking per transaction', color:'bg-green-50 border-green-200' },
                  { sdg:'SDG 1', title:'No Poverty', desc:'TakaPoints converts waste to income', color:'bg-red-50 border-red-200' },
                ].map(g => (
                  <div key={g.sdg} className={`rounded-xl p-4 border ${g.color}`}>
                    <p className="text-xs font-bold text-gray-500 mb-1">{g.sdg}</p>
                    <p className="font-semibold text-gray-800 text-sm mb-1">{g.title}</p>
                    <p className="text-xs text-gray-500">{g.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
