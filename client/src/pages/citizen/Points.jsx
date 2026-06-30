import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Star, Phone, DollarSign } from 'lucide-react';

export default function CitizenPoints() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [redeemForm, setRedeemForm] = useState({ type:'airtime', amount:100, phone:user?.phone||'' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get('/points/my').then(r => setData(r.data)).catch(console.error);
    api.get('/points/leaderboard').then(r => setLeaderboard(r.data.leaderboard||[])).catch(console.error);
  }, []);

  const handleRedeem = async (e) => {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      const r = await api.post('/points/redeem', redeemForm);
      setMsg(r.data.message);
      updateUser({ points: r.data.newBalance });
      api.get('/points/my').then(r => setData(r.data));
    } catch(err) { setMsg(err.response?.data?.message || 'Redemption failed'); }
    setLoading(false);
  };

  return (
    <DashboardLayout title="TakaPoints" subtitle="Earn, track, and redeem your waste rewards">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance */}
        <div className="card bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <Star className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-80">Available Points</p>
          <p className="text-5xl font-bold font-display mt-1">{data?.points || user?.points || 0}</p>
          <p className="text-sm opacity-70 mt-2">≈ KES {((data?.points||0)*0.8).toFixed(0)} value</p>
        </div>

        {/* Stats */}
        <div className="card">
          <p className="text-sm text-gray-500 mb-4 font-medium">Your Impact</p>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between"><span className="text-sm text-gray-600">Total Waste</span><span className="font-bold text-green-600">{data?.totalWasteKg||0} kg</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">CO₂ Offset</span><span className="font-bold text-blue-600">{((data?.totalWasteKg||0)*0.5).toFixed(1)} kg</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Trees Equiv.</span><span className="font-bold text-emerald-600">{(((data?.totalWasteKg||0)*0.5)/21).toFixed(1)} 🌳</span></div>
          </div>
        </div>

        {/* Redeem */}
        <div className="card">
          <h3 className="font-display font-bold text-lg mb-4">Redeem Points</h3>
          {msg && <div className={`text-sm px-3 py-2 rounded-lg mb-3 ${msg.includes('failed')||msg.includes('Insufficient')?'bg-red-50 text-red-700':'bg-green-50 text-green-700'}`}>{msg}</div>}
          <form onSubmit={handleRedeem} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Redeem as</label>
              <select className="input-field" value={redeemForm.type} onChange={e => setRedeemForm({...redeemForm, type:e.target.value})}>
                <option value="airtime">Airtime (1pt = KES 1)</option>
                <option value="cash">M-Pesa Cash (1pt = KES 0.80)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Amount (KES)</label>
              <input className="input-field" type="number" min={50} value={redeemForm.amount} onChange={e => setRedeemForm({...redeemForm, amount:+e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Phone Number</label>
              <input className="input-field" value={redeemForm.phone} onChange={e => setRedeemForm({...redeemForm, phone:e.target.value})} placeholder="0712345678" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary text-sm">{loading?'Processing...':'Redeem Now'}</button>
          </form>
        </div>

        {/* History */}
        <div className="card lg:col-span-2">
          <h3 className="font-display font-bold text-lg mb-4">Points History</h3>
          <div className="flex flex-col gap-1">
            {(data?.history||[]).map(h => (
              <div key={h._id} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium capitalize text-gray-700">{h.action.replace(/_/g,' ')}</p>
                  <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString('en-KE')}</p>
                </div>
                <span className={`font-bold text-sm ${h.type==='credit'?'text-green-600':'text-red-500'}`}>{h.type==='credit'?'+':'-'}{h.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <h3 className="font-display font-bold text-lg mb-4">🏆 Top Recyclers</h3>
          {leaderboard.map((u,i) => (
            <div key={u._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i===0?'bg-yellow-100 text-yellow-700':i===1?'bg-gray-100 text-gray-600':i===2?'bg-orange-100 text-orange-600':'bg-gray-50 text-gray-400'}`}>{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                <p className="text-xs text-gray-400">{u.ward}, {u.county}</p>
              </div>
              <span className="text-sm font-bold text-amber-600">{u.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
