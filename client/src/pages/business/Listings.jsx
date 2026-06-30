import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { Plus, Trash2, Edit, Package } from 'lucide-react';
import { COUNTIES } from '../../lib/constants';

const CATEGORIES = ['plastics','metals','paper','ewaste','organics','hazardous','glass','textiles','rubber','other'];

export default function BusinessListings() {
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [prices, setPrices] = useState([]);
  const [form, setForm] = useState({ title:'', wasteCategory:'plastics', wasteSubtype:'', grade:'B', quantity:'', unit:'kg', pricePerUnit:'', description:'', 'location.address':'', 'location.county':'Nairobi', listingType:'sell', pickupAvailable:true });
  const [msg, setMsg] = useState({ text:'', type:'success' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/listings/my').then(r => setListings(r.data.listings || [])).catch(console.error);
  useEffect(() => { load(); api.get('/pricing').then(r => setPrices(r.data.prices||[])).catch(console.error); }, []);

  const getSuggestedPrice = () => {
    const match = prices.find(p => p.wasteCategory === form.wasteCategory && p.grade === form.grade);
    return match ? match.pricePerKg : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMsg({ text:'', type:'success' });
    try {
      await api.post('/listings', {
        ...form, quantity: +form.quantity, pricePerUnit: +form.pricePerUnit,
        location: { address: form['location.address'], county: form['location.county'], coordinates: [36.8219, -1.2921] }
      });
      setMsg({ text:'Listing created successfully!', type:'success' });
      setShowForm(false);
      setForm({ title:'', wasteCategory:'plastics', wasteSubtype:'', grade:'B', quantity:'', unit:'kg', pricePerUnit:'', description:'', 'location.address':'', 'location.county':'Nairobi', listingType:'sell', pickupAvailable:true });
      load();
    } catch(err) { setMsg({ text: err.response?.data?.message || 'Failed to create listing', type:'error' }); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/listings/${id}`).catch(console.error);
    load();
  };

  const suggested = getSuggestedPrice();

  return (
    <DashboardLayout title="My Listings" subtitle="Manage your waste material listings">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{listings.length} listing(s)</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" />{showForm ? 'Cancel' : 'New Listing'}</button>
      </div>

      {msg.text && <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${msg.type==='success'?'bg-green-50 border border-green-200 text-green-700':'bg-red-50 border border-red-200 text-red-700'}`}>{msg.text}</div>}

      {showForm && (
        <div className="card mb-6 border-2 border-green-100">
          <h3 className="font-display font-bold text-lg mb-5">New Waste Listing</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Title</label>
              <input className="input-field" placeholder="e.g. Clean PET Plastic Bottles, Grade A" value={form.title} onChange={e => setForm({...form,title:e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Waste Category</label>
              <select className="input-field" value={form.wasteCategory} onChange={e => setForm({...form,wasteCategory:e.target.value})}>
                {CATEGORIES.map(c => <option key={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Subtype (optional)</label>
              <input className="input-field" placeholder="e.g. PET, HDPE, Aluminum..." value={form.wasteSubtype} onChange={e => setForm({...form,wasteSubtype:e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Grade</label>
              <select className="input-field" value={form.grade} onChange={e => setForm({...form,grade:e.target.value})}>
                <option value="A">Grade A — Premium, clean, sorted</option>
                <option value="B">Grade B — Standard, minor contamination</option>
                <option value="C">Grade C — Mixed, needs sorting</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Listing Type</label>
              <select className="input-field" value={form.listingType} onChange={e => setForm({...form,listingType:e.target.value})}>
                <option value="sell">Sell</option>
                <option value="exchange">Exchange / Barter</option>
                <option value="donate">Donate</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Quantity</label>
              <div className="flex gap-2">
                <input className="input-field" type="number" min="0.1" step="0.1" placeholder="100" value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value})} required />
                <select className="input-field w-28" value={form.unit} onChange={e => setForm({...form,unit:e.target.value})}>
                  <option value="kg">kg</option>
                  <option value="tonnes">tonnes</option>
                  <option value="pieces">pieces</option>
                  <option value="litres">litres</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Price per {form.unit} (KES)
                {suggested && <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full cursor-pointer" onClick={() => setForm({...form,pricePerUnit:String(suggested)})}>Market: KES {suggested} ↑ Use</span>}
              </label>
              <input className="input-field" type="number" min="0" step="0.01" placeholder="25" value={form.pricePerUnit} onChange={e => setForm({...form,pricePerUnit:e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Location / Address</label>
              <input className="input-field" placeholder="Industrial Area, Nairobi" value={form['location.address']} onChange={e => setForm({...form,'location.address':e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">County</label>
              <select className="input-field" value={form['location.county']} onChange={e => setForm({...form,'location.county':e.target.value})}>
                {COUNTIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Describe the waste — condition, packaging, collection requirements..." value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="pickup" checked={form.pickupAvailable} onChange={e => setForm({...form,pickupAvailable:e.target.checked})} className="w-4 h-4 accent-green-600" />
              <label htmlFor="pickup" className="text-sm text-gray-700">Pickup available at my location</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Listing'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(l => (
          <div key={l._id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className={`badge text-xs ${l.status==='available'?'badge-green':l.status==='reserved'?'badge-yellow':l.status==='sold'?'badge-blue':'badge-red'}`}>{l.status}</span>
              <button onClick={() => handleDelete(l._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">{l.title}</h4>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{l.description}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{l.quantity} {l.unit}</span>
              <span className="font-bold text-green-700">KES {l.pricePerUnit}/{l.unit}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Grade {l.grade}</span>
              <span>{l.location?.county}</span>
              <span>👁 {l.views || 0} views</span>
            </div>
            <p className="text-xs text-green-600 mt-2">🌱 {l.carbonOffset?.toFixed(1)} kg CO₂ if sold</p>
          </div>
        ))}
        {listings.length === 0 && !showForm && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="mb-3">No listings yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Create your first listing</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
