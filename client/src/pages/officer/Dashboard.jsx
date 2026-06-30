import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Package, DollarSign, AlertTriangle, Shield, CheckCircle, XCircle, Search, MapPin, Clock, Plus, Trash2 } from 'lucide-react';

const SEV_COLORS = { low: 'badge-green', medium: 'badge-yellow', high: 'badge-red', critical: 'badge-red' };
const STATUS_COLORS = { pending: 'badge-yellow', assigned: 'badge-blue', in_progress: 'badge-blue', resolved: 'badge-green', rejected: 'badge-red' };
const ROLE_COLORS = { citizen: 'badge-green', collector: 'badge-blue', business: 'badge-purple', recycler: 'badge-blue', officer: 'badge-amber', admin: 'badge-red' };

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const setTab = (t) => setSearchParams({ tab: t });

  const [dashboard, setDashboard] = useState({});
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [msg, setMsg] = useState('');

  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState('pending');
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [showHubForm, setShowHubForm] = useState(false);
  const [hubForm, setHubForm] = useState({
    name: '',
    'location.address': '',
    capacity: ''
  });

  const [listings, setListings] = useState([]);
  const [listingSearch, setListingSearch] = useState('');

  const loadReports = () => {
    api.get(`/reports?status=${reportFilter}`).then(r => setReports(r.data.reports || [])).catch(console.error);
  };

  const loadHubs = () => {
    const county = user?.county || 'Nairobi';
    const ward = user?.ward || '';
    api.get(`/collection-points?county=${county}&ward=${ward}`).then(r => setCollectionPoints(r.data.points || [])).catch(console.error);
  };

  const loadUsers = () => {
    api.get(`/admin/users?role=${roleFilter}&search=${search}`).then(r => setUsers(r.data.users || [])).catch(console.error);
  };

  const loadListings = () => {
    const county = user?.county || 'Nairobi';
    api.get(`/listings?county=${county}`).then(r => setListings(r.data.listings || [])).catch(console.error);
  };

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setDashboard(r.data.dashboard || {})).catch(console.error);
  }, []);

  useEffect(() => {
    if (tab === 'reports') loadReports();
    if (tab === 'hubs') loadHubs();
    if (tab === 'users') loadUsers();
    if (tab === 'listings') loadListings();
  }, [tab, reportFilter, roleFilter, search]);

  const updateReportStatus = async (id, status) => {
    try {
      await api.put(`/reports/${id}/status`, { status, officerId: user?._id });
      setMsg(`Report marked as ${status}`);
      loadReports();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    }
  };

  const verifyUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/verify`);
      setMsg('User account verified');
      loadUsers();
    } catch (err) {
      setMsg('Verification failed');
    }
  };

  const toggleUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      setMsg('User status updated');
      loadUsers();
    } catch (err) {
      setMsg('Failed to toggle user status');
    }
  };

  const handleAddHub = async (e) => {
    e.preventDefault();
    const data = {
      name: hubForm.name,
      capacity: Number(hubForm.capacity),
      location: {
        address: hubForm['location.address'],
        county: user?.county || 'Nairobi',
        ward: user?.ward || ''
      },
      officer: user?._id
    };
    try {
      await api.post('/collection-points', data);
      setMsg('Collection hub registered successfully');
      loadHubs();
      setShowHubForm(false);
      setHubForm({ name: '', 'location.address': '', capacity: '' });
    } catch (err) {
      setMsg('Failed to register hub');
    }
  };

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
    l.wasteCategory.toLowerCase().includes(listingSearch.toLowerCase())
  );

  return (
    <DashboardLayout title="Officer Dashboard" subtitle={`Oversight & regional monitoring for ${user?.ward} Ward, ${user?.county} County`}>
      {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">{msg}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['overview', 'users', 'reports', 'hubs', 'listings'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${tab === t ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard title="Regional Users" value={dashboard.users || 0} subtitle={`In ${user?.county}`} icon={Users} color="blue" />
            <StatCard title="Regional Listings" value={dashboard.listings || 0} subtitle={`In ${user?.county}`} icon={Package} color="green" />
            <StatCard title="Completed Escrows" value={dashboard.transactions || 0} subtitle={`In ${user?.county}`} icon={DollarSign} color="amber" />
            <StatCard title="Pending Reports" value={dashboard.pendingReports || 0} subtitle={`In ${user?.ward}`} icon={AlertTriangle} color="red" />
            <StatCard title="Open Disputes" value={dashboard.openDisputes || 0} subtitle={`In ${user?.county}`} icon={Shield} color="red" />
            <StatCard title="Pending Verifications" value={dashboard.pendingVerifications || 0} subtitle={`In ${user?.county}`} icon={CheckCircle} color="purple" />
          </div>

          <div className="card">
            <h3 className="font-display font-bold text-lg mb-4">Regional Status Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-700 font-medium">County / Region</p>
                <p className="text-xl font-bold text-green-800 mt-1">{user?.county}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700 font-medium">Assigned Ward</p>
                <p className="text-xl font-bold text-blue-800 mt-1">{user?.ward}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input className="input-field pl-9" placeholder="Search users in your county..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-field w-full sm:w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {['citizen', 'collector', 'business', 'recycler'].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 text-left font-medium">User</th>
                  <th className="pb-2 text-left font-medium">Role</th>
                  <th className="pb-2 text-left font-medium">Verified</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                  <th className="pb-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="py-3"><span className={`badge text-xs capitalize ${ROLE_COLORS[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                    <td className="py-3">{u.isVerified ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}</td>
                    <td className="py-3"><span className={`badge text-xs ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {!u.isVerified && <button onClick={() => verifyUser(u._id)} className="text-xs text-green-600 hover:underline font-medium">Verify</button>}
                        <button onClick={() => toggleUser(u._id)} className={`text-xs font-medium hover:underline ${u.isActive ? 'text-red-500' : 'text-green-600'}`}>{u.isActive ? 'Disable' : 'Enable'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No users found in your county.</p>}
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="card">
          <h3 className="font-display font-bold text-lg mb-4">Manage Ward Dump Reports</h3>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {['pending', 'assigned', 'in_progress', 'resolved', 'rejected'].map(s => (
              <button key={s} onClick={() => setReportFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize ${reportFilter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>{s.replace('_', ' ')}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map(r => (
              <div key={r._id} className="card border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm">{r.title}</h4>
                  <div className="flex gap-1.5 flex-shrink-0 ml-2">
                    <span className={`badge text-xs capitalize ${STATUS_COLORS[r.status] || 'badge-gray'}`}>{r.status}</span>
                    <span className={`badge text-xs ${SEV_COLORS[r.severity] || 'badge-gray'}`}>{r.severity}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{r.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{r.location?.address}</span>
                  <span>👍 {r.upvotes?.length || 0}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString('en-KE')}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <div className="text-xs text-gray-500">
                    Reported by: <span className="font-medium text-gray-700">{r.reporter?.name}</span>
                  </div>
                  <div className="flex gap-2">
                    {r.status === 'pending' && (
                      <button onClick={() => updateReportStatus(r._id, 'assigned')} className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">Assign</button>
                    )}
                    {['assigned', 'in_progress'].includes(r.status) && (
                      <button onClick={() => updateReportStatus(r._id, 'resolved')} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors">Mark Resolved</button>
                    )}
                    {r.status === 'pending' && (
                      <button onClick={() => updateReportStatus(r._id, 'rejected')} className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">Reject</button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No {reportFilter} reports in your ward.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'hubs' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg">Collection Points & Hubs ({user?.ward})</h3>
            <button onClick={() => setShowHubForm(!showHubForm)} className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />{showHubForm ? 'Cancel' : 'New Hub'}
            </button>
          </div>

          {showHubForm && (
            <div className="card mb-6 border-2 border-green-100">
              <h4 className="font-display font-bold text-md mb-4">Register Hub in {user?.ward} Ward</h4>
              <form onSubmit={handleAddHub} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Hub Name</label>
                  <input className="input-field" placeholder="e.g. Westlands Recycling Point" value={hubForm.name} onChange={e => setHubForm({ ...hubForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Capacity (kg)</label>
                  <input className="input-field" type="number" min="10" placeholder="1000" value={hubForm.capacity} onChange={e => setHubForm({ ...hubForm, capacity: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Address / Location</label>
                  <input className="input-field" placeholder="e.g. Peponi Road, Westlands" value={hubForm['location.address']} onChange={e => setHubForm({ ...hubForm, 'location.address': e.target.value })} required />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" className="btn-primary">Create Hub</button>
                  <button type="button" onClick={() => setShowHubForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectionPoints.map(cp => (
              <div key={cp._id} className="card border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm">{cp.name}</h4>
                  <span className={`badge text-xs ${cp.isActive ? 'badge-green' : 'badge-red'}`}>{cp.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{cp.location?.address}</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Capacity: {cp.currentLoad}/{cp.capacity} kg</span>
                  <span>Deposits: {cp.totalDeposits}</span>
                </div>
                <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{width:`${Math.min((cp.currentLoad/cp.capacity)*100,100)}%`}} />
                </div>
              </div>
            ))}
            {collectionPoints.length === 0 && <p className="text-gray-400 text-sm col-span-full py-4 text-center">No collection points registered in your ward.</p>}
          </div>
        </div>
      )}

      {tab === 'listings' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg">Marketplace Listings in {user?.county} County</h3>
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input className="input-field pl-9" placeholder="Search by title or category..." value={listingSearch} onChange={e => setListingSearch(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 text-left font-medium">Listing Details</th>
                  <th className="pb-2 text-left font-medium">Category</th>
                  <th className="pb-2 text-left font-medium">Quantity</th>
                  <th className="pb-2 text-left font-medium">Price (KES)</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                  <th className="pb-2 text-left font-medium">Ward</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map(l => (
                  <tr key={l._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <p className="font-medium text-gray-800">{l.title}</p>
                      <p className="text-xs text-gray-400">Seller ID: {l.seller?.name || l.seller}</p>
                    </td>
                    <td className="py-3"><span className="badge badge-gray capitalize">{l.wasteCategory}</span></td>
                    <td className="py-3 text-gray-700">{l.quantity} {l.unit}</td>
                    <td className="py-3 font-semibold text-green-700">{l.totalPrice ? `KES ${l.totalPrice}` : `KES ${l.pricePerUnit}/${l.unit}`}</td>
                    <td className="py-3"><span className={`badge text-xs capitalize ${l.status === 'available' ? 'badge-green' : l.status === 'sold' ? 'badge-blue' : 'badge-red'}`}>{l.status}</span></td>
                    <td className="py-3 text-gray-500">{l.location?.ward}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredListings.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No listings found in your county.</p>}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
