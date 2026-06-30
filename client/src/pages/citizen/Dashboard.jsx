import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Star, Recycle, AlertTriangle, TrendingUp, QrCode } from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/points/my').then(r => setPointsData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title={`Habari, ${user?.name?.split(' ')[0]}! 👋`} subtitle="Your circular economy dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="TakaPoints" value={pointsData?.points || user?.points || 0} subtitle="Earn more by depositing" icon={Star} color="amber" />
        <StatCard title="Waste Deposited" value={`${pointsData?.totalWasteKg || 0} kg`} subtitle="Total contribution" icon={Recycle} color="green" />
        <StatCard title="Carbon Offset" value={`${(pointsData?.totalWasteKg*0.5||0).toFixed(1)} kg`} subtitle="CO₂ equivalent" icon={TrendingUp} color="blue" />
        <StatCard title="Carbon Credits" value={user?.carbonCredits || 0} subtitle="Accumulated" icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="card">
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><QrCode className="w-5 h-5 text-green-600" />Your Deposit QR Code</h3>
          {user?.qrCode ? (
            <div className="flex flex-col items-center gap-3">
              <img src={user.qrCode} alt="QR Code" className="w-40 h-40 border border-gray-200 rounded-xl p-2" />
              <p className="text-sm text-gray-500 text-center">Show this at any TakaLoop collection point to deposit waste and earn points</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">QR code not available. Contact support.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="font-display font-bold text-lg mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link to="/citizen/reports" className="flex items-center gap-3 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div><p className="font-semibold text-gray-800 text-sm">Report Illegal Dump</p><p className="text-xs text-gray-500">Earn 50 points when resolved</p></div>
            </Link>
            <Link to="/citizen/points" className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
              <Star className="w-5 h-5 text-amber-600" />
              <div><p className="font-semibold text-gray-800 text-sm">Redeem Points</p><p className="text-xs text-gray-500">Convert to M-Pesa airtime or cash</p></div>
            </Link>
            <Link to="/marketplace" className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <Recycle className="w-5 h-5 text-green-600" />
              <div><p className="font-semibold text-gray-800 text-sm">Browse Marketplace</p><p className="text-xs text-gray-500">Buy and sell waste materials</p></div>
            </Link>
          </div>
        </div>

        {/* Points History */}
        <div className="card lg:col-span-2">
          <h3 className="font-display font-bold text-lg mb-4">Recent Activity</h3>
          {pointsData?.history?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {pointsData.history.slice(0,8).map(h => (
                <div key={h._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700 capitalize">{h.action.replace(/_/g,' ')}</p>
                    <p className="text-xs text-gray-400">{h.description || h.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${h.type==='credit'?'text-green-600':'text-red-500'}`}>
                      {h.type==='credit'?'+':'-'}{h.points} pts
                    </p>
                    <p className="text-xs text-gray-400">Bal: {h.balanceAfter}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No activity yet. Start depositing waste to earn points!</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
