import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { AlertTriangle, MapPin, Camera, Plus } from 'lucide-react';

const STATUS_COLORS = { pending:'badge-yellow', assigned:'badge-blue', in_progress:'badge-blue', resolved:'badge-green', rejected:'badge-red' };
const SEV_COLORS = { low:'badge-green', medium:'badge-yellow', high:'badge-red', critical:'badge-red' };

export default function CitizenReports() {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', severity:'medium', 'location.address':'', 'location.ward':'', 'location.county':'Nairobi', wasteTypes:[] });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const WASTE_TYPES = ['plastics','metals','paper','ewaste','organics','hazardous','glass','other'];

  useEffect(() => { api.get('/reports').then(r => setReports(r.data.reports||[])).catch(console.error); }, []);

  const toggleWasteType = (t) => setForm(f => ({ ...f, wasteTypes: f.wasteTypes.includes(t) ? f.wasteTypes.filter(x=>x!==t) : [...f.wasteTypes, t] }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      const payload = {
        title: form.title, description: form.description, severity: form.severity,
        wasteTypes: form.wasteTypes,
        location: { address: form['location.address'], ward: form['location.ward'], county: form['location.county'], coordinates: [36.8219, -1.2921] }
      };
      await api.post('/reports', payload);
      setMsg('Report submitted! You will earn 50 points once resolved.');
      setShowForm(false);
      api.get('/reports').then(r => setReports(r.data.reports||[]));
    } catch(err) { setMsg(err.response?.data?.message||'Failed to submit'); }
    setLoading(false);
  };

  return (
    <DashboardLayout title="DumpAlert" subtitle="Report illegal dump sites in your area">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{reports.length} report(s) submitted</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Report New Dump</button>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">{msg}</div>}

      {showForm && (
        <div className="card mb-6 border-2 border-green-100">
          <h3 className="font-display font-bold text-lg mb-4">New Dump Report</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input className="input-field" placeholder="Report title (e.g., Illegal dump near Westgate)" value={form.title} onChange={e => setForm({...form,title:e.target.value})} required />
            <textarea className="input-field resize-none" rows={3} placeholder="Describe what you see, how big it is, any hazards..." value={form.description} onChange={e => setForm({...form,description:e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
              <input className="input-field" placeholder="Street address / landmark" value={form['location.address']} onChange={e => setForm({...form,'location.address':e.target.value})} required />
              <input className="input-field" placeholder="Ward / estate" value={form['location.ward']} onChange={e => setForm({...form,'location.ward':e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Severity</label>
              <div className="flex gap-2">
                {['low','medium','high','critical'].map(s => (
                  <button key={s} type="button" onClick={() => setForm({...form,severity:s})} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.severity===s?'bg-red-500 text-white border-red-500':'border-gray-200 text-gray-600 hover:border-red-300'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Waste Types Present</label>
              <div className="flex flex-wrap gap-2">
                {WASTE_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => toggleWasteType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${form.wasteTypes.includes(t)?'bg-green-500 text-white border-green-500':'border-gray-200 text-gray-600 hover:border-green-300'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary text-sm">{loading?'Submitting...':'Submit Report'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {reports.map(r => (
          <div key={r._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-800">{r.title}</h4>
              <div className="flex gap-2">
                <span className={STATUS_COLORS[r.status]||'badge-gray'}>{r.status}</span>
                <span className={SEV_COLORS[r.severity]||'badge-gray'}>{r.severity}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">{r.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location?.address}</span>
              <span>{new Date(r.createdAt).toLocaleDateString('en-KE')}</span>
              <span>👍 {r.upvotes?.length||0}</span>
              {r.status==='resolved' && <span className="text-green-600 font-medium">✓ +50 pts earned</span>}
            </div>
          </div>
        ))}
        {reports.length===0 && <div className="text-center py-16 text-gray-400"><AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No reports yet. Be the first to report a dump site!</p></div>}
      </div>
    </DashboardLayout>
  );
}
