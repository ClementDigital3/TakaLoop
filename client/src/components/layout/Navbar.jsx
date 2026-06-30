import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Menu, X, Bell, User, LogOut, BarChart3, Star, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import LogoIcon from './LogoIcon';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => { logout(); navigate('/'); };

  const fetchNotifications = () => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then(r => {
          const notifs = r.data.notifications || [];
          setNotifications(notifs);
          setUnreadCount(notifs.filter(n => !n.isRead).length);
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch(e) { console.error(e); }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch(e) { console.error(e); }
  };

  const dashboardPath = { citizen:'/citizen', collector:'/business', business:'/business', recycler:'/business', officer:'/officer', admin:'/admin' }[user?.role] || '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <LogoIcon className="w-9 h-9" />
            <span className="font-display font-extrabold text-2xl text-slate-900 tracking-tight transition-colors group-hover:text-emerald-600">TakaLoop</span>
            <span className="hidden sm:block text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full">KENYA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/marketplace" className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors">Marketplace</Link>
            <Link to="/impact" className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors flex items-center gap-1"><BarChart3 className="w-4 h-4" />Impact</Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user.role === 'citizen' && (
                  <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">{user.points || 0} pts</span>
                )}
                <div className="relative">
                  <button onClick={() => { setNotifOpen(!notifOpen); setDropOpen(false); }} className="relative p-2 text-gray-500 hover:text-green-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="flex justify-between items-center px-4 py-1.5 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-green-600 hover:underline font-medium">
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(n => {
                            const Icon = {
                              report: AlertTriangle,
                              points: Star,
                              transaction: Leaf,
                            }[n.type] || Bell;
                            
                            const iconColors = {
                              report: 'bg-red-50 text-red-500',
                              points: 'bg-amber-50 text-amber-500',
                              transaction: 'bg-green-50 text-green-500',
                            }[n.type] || 'bg-gray-50 text-gray-500';

                            return (
                              <div key={n._id} onClick={() => { handleMarkRead(n._id); setNotifOpen(false); }}
                                className={`flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${!n.isRead ? 'bg-green-50/20' : ''}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <p className={`text-xs text-gray-800 ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                                  <p className="text-[11px] text-gray-500 mt-0.5">{n.message}</p>
                                  <p className="text-[9px] text-gray-400 mt-1">
                                    {new Date(n.createdAt).toLocaleDateString('en-KE')} {new Date(n.createdAt).toLocaleTimeString('en-KE', {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-8 text-center text-xs text-gray-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button onClick={() => { setDropOpen(!dropOpen); setNotifOpen(false); }} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link to={dashboardPath} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropOpen(false)}>Dashboard</Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                        <LogOut className="w-4 h-4" />Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-gray-700 hover:text-green-600 font-medium">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-3">
            <Link to="/marketplace" className="text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Marketplace</Link>
            <Link to="/impact" className="text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Impact Dashboard</Link>
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>My Dashboard</Link>
                <button onClick={handleLogout} className="text-sm text-red-600 font-medium text-left py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-center text-sm" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary text-center text-sm" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
