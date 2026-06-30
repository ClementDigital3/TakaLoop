import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Package, Filter, MapPin, Scale, ShoppingCart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATS = ['all','plastics','metals','paper','ewaste','organics','hazardous','glass','textiles','rubber'];
const CAT_EMOJI = { plastics:'🧴',metals:'⚙️',paper:'📦',ewaste:'💻',organics:'🌿',hazardous:'⚠️',glass:'🫙',textiles:'👕',rubber:'🔵',all:'♻️' };

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [cat, setCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [buyForm, setBuyForm] = useState({ phone:'', pickupDate:'' });
  const [msg, setMsg] = useState('');
  const { user, isAuthenticated } = useAuth();
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    setLoading(true);
    const q = cat !== 'all' ? `?category=${cat}` : '';
    api.get(`/listings${q}`).then(r => setListings(r.data.listings||[])).catch(console.error).finally(() => setLoading(false));
    api.get('/pricing').then(r => setPrices(r.data.prices||[])).catch(console.error);
  }, [cat]);

  const handleBuy = async (listing) => {
    if (!isAuthenticated) { window.location.href='/login'; return; }
    setMsg('');
    try {
      await api.post('/transactions', { listingId: listing._id, buyerPhone: buyForm.phone||user?.phone, pickupDate: buyForm.pickupDate });
      setMsg('Purchase initiated! Check your phone for M-Pesa prompt.'); setBuying(null);
      api.get(`/listings${cat!=='all'?`?category=${cat}`:''}`).then(r => setListings(r.data.listings||[]));
    } catch(err) { setMsg(err.response?.data?.message||'Purchase failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Waste Marketplace</h1>
            <p className="text-gray-500 text-sm mt-1">Buy and sell waste materials across Kenya</p>
          </div>
          {isAuthenticated && ['collector','business'].includes(user?.role) && (
            <Link to="/business/listings" className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" />List Waste</Link>
          )}
        </div>

        {/* Market Prices Banner */}
        {prices.length > 0 && (
          <div className="bg-green-900 text-white rounded-2xl p-4 mb-6 overflow-x-auto">
            <p className="text-xs text-green-300 mb-2 font-medium">📊 CURRENT MARKET RATES (KES/kg)</p>
            <div className="flex gap-4">
              {prices.slice(0,8).map(p => (
                <div key={p._id} className="text-center min-w-fit">
                  <p className="text-xs text-green-300 capitalize">{p.wasteCategory}</p>
                  <p className="font-bold text-green-400">{p.pricePerKg}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${cat===c?'bg-green-600 text-white shadow-sm':'bg-white text-gray-600 border border-gray-200 hover:border-green-300'}`}>
              {CAT_EMOJI[c]} <span className="capitalize">{c === 'all' ? 'All Waste' : c}</span>
            </button>
          ))}
        </div>

        {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">{msg}</div>}

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin" style={{borderWidth:'3px'}} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map(l => (
              <div key={l._id} className="card hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{CAT_EMOJI[l.wasteCategory]||'♻️'}</span>
                  <div className="flex gap-1">
                    <span className={`badge text-xs ${l.grade==='A'?'badge-green':l.grade==='B'?'badge-yellow':'badge-gray'}`}>Grade {l.grade}</span>
                    <span className="badge badge-blue capitalize text-xs">{l.wasteCategory}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{l.title}</h4>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{l.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{l.quantity} {l.unit}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.location?.county}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-green-700">KES {l.pricePerUnit?.toLocaleString()}<span className="text-xs text-gray-400">/{l.unit}</span></p>
                    <p className="text-xs text-gray-400">Total: KES {l.totalPrice?.toLocaleString()}</p>
                  </div>
                  {buying === l._id ? (
                    <div className="flex flex-col gap-2">
                      <input className="input-field text-xs py-1.5 px-2" placeholder="M-Pesa phone" defaultValue={user?.phone} onChange={e => setBuyForm({...buyForm,phone:e.target.value})} />
                      <input className="input-field text-xs py-1.5 px-2" type="date" onChange={e => setBuyForm({...buyForm,pickupDate:e.target.value})} />
                      <div className="flex gap-1">
                        <button onClick={() => handleBuy(l)} className="btn-primary text-xs py-1.5 px-3">Pay</button>
                        <button onClick={() => setBuying(null)} className="btn-secondary text-xs py-1.5 px-3">×</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setBuying(l._id)} className="btn-primary text-xs py-2 px-3 flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />Buy
                    </button>
                  )}
                </div>
                <p className="text-xs text-green-600 mt-2">🌱 {l.carbonOffset?.toFixed(1)} kg CO₂ offset</p>
              </div>
            ))}
            {listings.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No listings found for this category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
