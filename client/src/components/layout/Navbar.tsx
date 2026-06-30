'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, X, Recycle, User } from 'lucide-react';
import { useState } from 'react';

const roleRoutes: Record<string, string> = {
  citizen: '/citizen',
  collector: '/marketplace',
  business: '/business',
  recycler: '/marketplace',
  county_officer: '/county',
  admin: '/admin',
};

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const dashboardPath = user ? roleRoutes[user.role] || '/' : '/';

  return (
    <nav className="sticky top-0 z-50 bg-ash-900/80 backdrop-blur-md border-b border-ash-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-leaf-600 rounded-lg flex items-center justify-center group-hover:bg-leaf-500 transition-colors">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-ash-100 text-lg tracking-tight">TakaLoop</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/marketplace" className="text-sm text-ash-300 hover:text-leaf-400 transition-colors">Marketplace</Link>
          <Link href="/impact" className="text-sm text-ash-300 hover:text-leaf-400 transition-colors">Impact</Link>
          {user && (
            <>
              <Link href={dashboardPath} className="text-sm text-ash-300 hover:text-leaf-400 transition-colors">Dashboard</Link>
              {(user.role === 'citizen' || user.role === 'collector') && (
                <span className="text-xs bg-leaf-900/50 text-leaf-400 px-2 py-1 rounded-full border border-leaf-800">
                  {user.totalPoints?.toLocaleString()} pts
                </span>
              )}
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 bg-leaf-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-ash-300">{user.name?.split(' ')[0]}</span>
              </div>
              <button onClick={handleLogout} className="hidden md:flex items-center gap-1 text-ash-400 hover:text-red-400 transition-colors text-sm">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth" className="btn-secondary text-sm !px-4 !py-2">Sign in</Link>
              <Link href="/auth?mode=register" className="btn-primary text-sm !px-4 !py-2">Join TakaLoop</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden text-ash-300" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ash-900 border-t border-ash-800 px-4 py-4 flex flex-col gap-3">
          <Link href="/marketplace" className="text-ash-300 py-2 border-b border-ash-800">Marketplace</Link>
          <Link href="/impact" className="text-ash-300 py-2 border-b border-ash-800">Impact Dashboard</Link>
          {user ? (
            <>
              <Link href={dashboardPath} className="text-ash-300 py-2 border-b border-ash-800">My Dashboard</Link>
              <button onClick={handleLogout} className="text-red-400 py-2 text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn-secondary text-center">Sign in</Link>
              <Link href="/auth?mode=register" className="btn-primary text-center">Join TakaLoop</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
