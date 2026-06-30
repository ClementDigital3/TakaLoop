import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../lib/api';
import { FileText, Loader, CheckCircle, ChevronDown, ChevronUp, Leaf, DollarSign, Recycle } from 'lucide-react';

export default function BusinessAudit() {
  const [audits, setAudits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ businessDescription: '', wasteLogInput: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [polling, setPolling] = useState(null);

  const loadAudits = () => api.get('/audit/my').then(r => setAudits(r.data.audits || [])).catch(console.error);
  useEffect(() => { loadAudits(); }, []);

  useEffect(() => {
    const processing = audits.find(a => a.status === 'processing');
    if (processing && !polling) {
      const interval = setInterval(() => {
        api.get(`/audit/${processing._id}`).then(r => {
          if (r.data.audit?.status !== 'processing') {
            loadAudits(); clearInterval(interval); setPolling(null);
          }
        }).catch(console.error);
      }, 3000);
      setPolling(interval);
    }
    return () => { if (polling) clearInterval(polling); };
  }, [audits]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      await api.post('/audit', form);
      setMsg('Audit initiated! AI is analysing your business waste profile. Results in 30–60 seconds.');
      setShowForm(false);
      setForm({ businessDescription: '', wasteLogInput: '' });
      setTimeout(loadAudits, 2000);
    } catch(err) { setMsg(err.response?.data?.message || 'Failed to start audit'); }
    setLoading(false);
  };

  return (
    <DashboardLayout title="WasteIQ Audit" subtitle="AI-powered waste intelligence for your business">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{audits.length} audit(s) completed</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />{showForm ? 'Cancel' : 'New Audit'}
        </button>
      </div>

      {msg && <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-xl mb-4">{msg}</div>}

      {showForm && (
        <div className="card mb-6 border-2 border-purple-100">
          <h3 className="font-display font-bold text-lg mb-2">New WasteIQ Audit</h3>
          <p className="text-sm text-gray-500 mb-5">Our AI will analyse your waste streams, identify recovery opportunities, and estimate savings.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Describe Your Business</label>
              <textarea className="input-field resize-none" rows={4} placeholder="e.g. We are a garment manufacturer producing 500 units/day. We generate significant fabric offcuts, cardboard packaging from inputs, and plastic wrapping. We currently dispose of all waste to landfill..." value={form.businessDescription} onChange={e => setForm({...form,businessDescription:e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Waste Log (optional)</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Paste any existing waste data — e.g. monthly tonnages, waste categories, disposal costs..." value={form.wasteLogInput} onChange={e => setForm({...form,wasteLogInput:e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Submitting...</> : <><FileText className="w-4 h-4" />Run AI Audit</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {audits.map(a => (
          <div key={a._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {a.status === 'processing' ? (
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                ) : a.status === 'completed' ? (
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{a.businessDescription.substring(0, 60)}...</p>
                  <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('en-KE')} · <span className="capitalize">{a.status}</span></p>
                </div>
              </div>
              {a.status === 'completed' && (
                <button onClick={() => setExpanded(expanded === a._id ? null : a._id)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  {expanded === a._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              )}
            </div>

            {a.status === 'processing' && (
              <div className="mt-3 bg-blue-50 rounded-xl p-3 text-xs text-blue-700 flex items-center gap-2">
                <Loader className="w-3 h-3 animate-spin" /> AI is analysing your waste profile... This takes about 30–60 seconds.
              </div>
            )}

            {expanded === a._id && a.status === 'completed' && (
              <div className="mt-4 border-t border-gray-100 pt-4 flex flex-col gap-4">
                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">AI Summary</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.aiAnalysis}</p>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-700">KES {(a.estimatedSavingsKes||0).toLocaleString()}</p>
                    <p className="text-xs text-green-600">Estimated Savings</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <Leaf className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-700">{a.carbonCreditsPotential || 0}</p>
                    <p className="text-xs text-blue-600">Carbon Credits</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <Recycle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-700">{a.recoveryOpportunities?.length || 0}</p>
                    <p className="text-xs text-purple-600">Opportunities</p>
                  </div>
                </div>

                {/* Recovery opportunities */}
                {a.recoveryOpportunities?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">♻️ Recovery Opportunities</p>
                    <ul className="flex flex-col gap-1.5">
                      {a.recoveryOpportunities.map((op, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>{op}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {a.recommendations?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">💡 Recommendations</p>
                    <ul className="flex flex-col gap-1.5">
                      {a.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">→</span>{rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Certified handlers */}
                {a.certifiedHandlers?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">🏢 Certified Waste Handlers</p>
                    <div className="flex flex-col gap-2">
                      {a.certifiedHandlers.map((h, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{h.name}</p>
                            <p className="text-xs text-gray-500">{h.wasteTypes?.join(', ')}</p>
                          </div>
                          <a href={`tel:${h.contact}`} className="text-sm text-green-600 font-medium hover:underline">{h.contact}</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {audits.length === 0 && !showForm && (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="mb-1">No audits yet</p>
            <p className="text-sm mb-4">Run your first AI waste audit to discover hidden value in your waste streams.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Start Free Audit</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
