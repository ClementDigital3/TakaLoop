import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Package, TrendingUp, DollarSign, FileText, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

const STATUS_COLORS = { available:'badge-green', reserved:'badge-yellow', sold:'badge-blue', cancelled:'badge-red' };

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/listings/my'),
      api.get('/transactions/my')
    ]).then(([l, t]) => {
      setListings(l.data.listings || []);
      setTransactions(t.data.transactions || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const isRecycler = user?.role === 'recycler';
  const totalRevenue = transactions.filter(t => t.paymentStatus === 'completed' && t.seller?._id === user?._id).reduce((s, t) => s + (t.sellerAmount || 0), 0);
  const totalSpend = transactions.filter(t => t.paymentStatus === 'completed' && t.buyer?._id === user?._id).reduce((s, t) => s + (t.amount || 0), 0);
  const activeListings = listings.filter(l => l.status === 'available').length;
  const activePurchases = transactions.filter(t => t.buyer?._id === user?._id && t.deliveryStatus !== 'confirmed').length;
  const pendingTx = transactions.filter(t => t.paymentStatus === 'pending' && t.seller?._id === user?._id).length;
  const pendingPayments = transactions.filter(t => t.paymentStatus === 'pending' && t.buyer?._id === user?._id).length;

  const handleConfirmDelivery = async (id) => {
    if (!confirm('Are you sure you have received this delivery? This will release funds to the seller.')) return;
    try {
      await api.put(`/transactions/${id}/delivery`);
      alert('Delivery confirmed! Funds released.');
      Promise.all([
        api.get('/listings/my'),
        api.get('/transactions/my')
      ]).then(([l, t]) => {
        setListings(l.data.listings || []);
        setTransactions(t.data.transactions || []);
      });
    } catch(err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <DashboardLayout title={`${user?.businessName || user?.name} Dashboard`} subtitle={isRecycler ? "Manage your waste purchases and transactions" : "Manage your waste listings and transactions"}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isRecycler ? (
          <>
            <StatCard title="Active Purchases" value={activePurchases} subtitle="Awaiting delivery" icon={Package} color="green" />
            <StatCard title="Total Spent" value={`KES ${totalSpend.toLocaleString()}`} subtitle="On waste materials" icon={DollarSign} color="amber" />
            <StatCard title="Pending Payments" value={pendingPayments} subtitle="Awaiting checkout" icon={Clock} color="blue" />
            <StatCard title="CO₂ Recycled" value={transactions.filter(t => t.paymentStatus === 'completed' && t.buyer?._id === user?._id).reduce((s, t) => s + (t.listing?.carbonOffset || 0), 0).toFixed(1) + " kg"} subtitle="Carbon footprint offset" icon={TrendingUp} color="purple" />
          </>
        ) : (
          <>
            <StatCard title="Active Listings" value={activeListings} subtitle="Available on marketplace" icon={Package} color="green" />
            <StatCard title="Total Revenue" value={`KES ${totalRevenue.toLocaleString()}`} subtitle="After platform fees" icon={DollarSign} color="amber" />
            <StatCard title="Pending Orders" value={pendingTx} subtitle="Awaiting payment" icon={Clock} color="blue" />
            <StatCard title="Carbon Credits" value={(user?.carbonCredits || 0).toFixed(2)} subtitle="Accumulated credits" icon={TrendingUp} color="purple" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="font-display font-bold text-lg mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {user?.role !== 'recycler' && (
              <Link to="/business/listings" className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <Plus className="w-5 h-5 text-green-600" />
                <div><p className="font-semibold text-gray-800 text-sm">New Listing</p><p className="text-xs text-gray-500">List waste materials for sale</p></div>
              </Link>
            )}
            {['business','recycler'].includes(user?.role) && (
              <Link to="/business/audit" className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                <FileText className="w-5 h-5 text-purple-600" />
                <div><p className="font-semibold text-gray-800 text-sm">WasteIQ Audit</p><p className="text-xs text-gray-500">AI-powered waste analysis</p></div>
              </Link>
            )}
            <Link to="/marketplace" className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div><p className="font-semibold text-gray-800 text-sm">Browse Marketplace</p><p className="text-xs text-gray-500">Find materials to buy</p></div>
            </Link>
          </div>
        </div>

        {/* My Listings / My Purchases */}
        <div className="card">
          {isRecycler ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-lg">My Purchases</h3>
                <Link to="/marketplace" className="text-sm text-green-600 font-medium hover:underline">Marketplace</Link>
              </div>
              {transactions.filter(t => t.buyer?._id === user?._id).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No purchases yet. Visit the marketplace to buy waste raw materials.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {transactions.filter(t => t.buyer?._id === user?._id).slice(0, 5).map(t => (
                    <div key={t._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.listing?.title || 'Waste Purchase'}</p>
                        <p className="text-xs text-gray-400">KES {t.amount?.toLocaleString()} · Seller: {t.seller?.name}</p>
                      </div>
                      <span className={`badge text-xs ${t.deliveryStatus === 'confirmed' ? 'badge-green' : 'badge-yellow'}`}>{t.deliveryStatus}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-lg">My Listings</h3>
                <Link to="/business/listings" className="text-sm text-green-600 font-medium hover:underline">View all</Link>
              </div>
              {listings.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No listings yet. Create your first listing!</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {listings.slice(0, 5).map(l => (
                    <div key={l._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{l.title}</p>
                        <p className="text-xs text-gray-400">{l.quantity} {l.unit} · KES {l.pricePerUnit}/kg</p>
                      </div>
                      <span className={STATUS_COLORS[l.status] || 'badge-gray'}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card lg:col-span-2">
          <h3 className="font-display font-bold text-lg mb-4">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 text-left font-medium">Item</th>
                  <th className="pb-2 text-left font-medium">Amount</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                  <th className="pb-2 text-left font-medium">Delivery</th>
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-left font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {transactions.slice(0, 8).map(t => (
                    <tr key={t._id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 text-gray-700">{t.listing?.title || 'N/A'}</td>
                      <td className="py-2.5 font-semibold text-green-700">KES {t.amount?.toLocaleString()}</td>
                      <td className="py-2.5"><span className={`badge text-xs ${t.paymentStatus === 'completed' ? 'badge-green' : t.paymentStatus === 'pending' ? 'badge-yellow' : 'badge-red'}`}>{t.paymentStatus}</span></td>
                      <td className="py-2.5"><span className="badge badge-gray text-xs">{t.deliveryStatus}</span></td>
                      <td className="py-2.5 text-gray-400">{new Date(t.createdAt).toLocaleDateString('en-KE')}</td>
                      <td className="py-2.5">
                        {t.buyer?._id === user?._id && t.paymentStatus === 'completed' && t.deliveryStatus === 'pending' && (
                          <button onClick={() => handleConfirmDelivery(t._id)} className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700 transition-colors">Confirm Delivery</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
