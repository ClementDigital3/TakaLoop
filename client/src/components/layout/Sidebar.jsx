import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Package, Star, AlertTriangle, FileText, BarChart3, Settings, Users, MapPin, Leaf, TrendingUp } from 'lucide-react';

const menus = {
  citizen: [
    { path:'/citizen', icon:Home, label:'Dashboard' },
    { path:'/citizen/points', icon:Star, label:'My Points' },
    { path:'/citizen/reports', icon:AlertTriangle, label:'Report Dump' },
    { path:'/marketplace', icon:Package, label:'Marketplace' },
    { path:'/impact', icon:BarChart3, label:'Impact' },
  ],
  collector: [
    { path:'/business', icon:Home, label:'Dashboard' },
    { path:'/business/listings', icon:Package, label:'My Listings' },
    { path:'/marketplace', icon:TrendingUp, label:'Marketplace' },
    { path:'/impact', icon:BarChart3, label:'Impact' },
  ],
  business: [
    { path:'/business', icon:Home, label:'Dashboard' },
    { path:'/business/listings', icon:Package, label:'Listings' },
    { path:'/business/audit', icon:FileText, label:'WasteIQ Audit' },
    { path:'/marketplace', icon:TrendingUp, label:'Marketplace' },
  ],
  recycler: [
    { path:'/business', icon:Home, label:'Dashboard' },
    { path:'/business/audit', icon:FileText, label:'WasteIQ Audit' },
    { path:'/marketplace', icon:TrendingUp, label:'Marketplace' },
  ],
  officer: [
    { path:'/officer', icon:Home, label:'Dashboard' },
    { path:'/officer?tab=users', icon:Users, label:'Users' },
    { path:'/officer?tab=reports', icon:AlertTriangle, label:'Dump Reports' },
    { path:'/officer?tab=hubs', icon:MapPin, label:'Collection Hubs' },
    { path:'/marketplace', icon:Package, label:'Marketplace' },
    { path:'/impact', icon:BarChart3, label:'Impact' },
  ],
  admin: [
    { path:'/admin', icon:Home, label:'Dashboard' },
    { path:'/admin?tab=users', icon:Users, label:'Users' },
    { path:'/admin?tab=pricing', icon:TrendingUp, label:'Market Rates' },
    { path:'/admin?tab=reports', icon:AlertTriangle, label:'Dump Reports' },
    { path:'/admin?tab=hubs', icon:MapPin, label:'Collection Hubs' },
    { path:'/marketplace', icon:Package, label:'Marketplace' },
    { path:'/impact', icon:BarChart3, label:'Impact' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const items = menus[user?.role] || menus.citizen;

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 pt-20 pb-6 px-4">
      {/* Role badge */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Role</p>
            <p className="text-xs font-bold text-slate-800 capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {items.map(({ path, icon: Icon, label }) => {
          const currentPath = window.location.pathname + window.location.search;
          const isLinkActive = path.includes('?')
            ? currentPath.includes(path)
            : window.location.pathname === path && !window.location.search.includes('tab=');

          return (
            <NavLink key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-l-4 ${isLinkActive ? 'bg-emerald-50/40 text-emerald-700 border-emerald-600 shadow-[0_2px_8px_-3px_rgba(16,185,129,0.08)]' : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 border-transparent'}`}>
              <Icon className={`w-4 h-4 ${isLinkActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {user?.role === 'citizen' && (
        <div className="mt-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 shadow-[0_4px_12px_-5px_rgba(245,158,11,0.15)]">
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Your TakaPoints</p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <p className="text-3xl font-extrabold text-amber-600 font-display">{user?.points || 0}</p>
            <span className="text-xs font-semibold text-amber-700">PTS</span>
          </div>
          <p className="text-[10px] text-amber-600 mt-2 font-medium">Keep recycling to earn more rewards!</p>
        </div>
      )}
    </aside>
  );
}
