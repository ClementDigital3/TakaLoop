'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Recycle, Menu, X, User, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const NAV_BY_ROLE = {
  citizen:        [{ label: 'My Dashboard', href: '/citizen' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Report Dump', href: '/county' }, { label: 'Impact', href: '/impact' }],
  collector:      [{ label: 'My Listings', href: '/marketplace' }, { label: 'Transactions', href: '/marketplace/transactions' }, { label: 'Impact', href: '/impact' }],
  business:       [{ label: 'B2B Exchange', href: '/b2b' }, { label: 'WasteIQ Audit', href: '/audit' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Impact', href: '/impact' }],
  recycler:       [{ label: 'Marketplace', href: '/marketplace' }, { label: 'B2B Exchange', href: '/b2b' }, { label: 'WasteIQ', href: '/audit' }],
  county_officer: [{ label: 'Dump Reports', href: '/county' }, { label: 'Collection Points', href: '/county/collection-points' }, { label: 'Map', href: '/county/map' }],
  admin:          [{ label: 'Admin Panel', href: '/admin' }, { label: 'Users', href: '/admin/users' }, { label: 'Disputes', href: '/admin/disputes' }, { label: 'Market Rates', href: '/admin/market-rates' }],
};

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const links = user ? (NAV_BY_ROLE[user.role] || []) : [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Impact', href: '/impact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl text-taka-green">
          <div className="w-8 h-8 bg-taka-green rounded-lg flex items-center justify-center">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          TakaLoop
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-taka-charcoal/70 hover:text-taka-green transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 bg-taka-mist px-3 py-2 rounded-lg hover:bg-taka-green/10 transition-colors">
                <div className="w-7 h-7 bg-taka-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
                <span className="badge-green text-xs">{user.role}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    {user.points !== undefined && (
                      <p className="text-xs text-taka-green font-medium mt-1">⭐ {user.points} TakaPoints</p>
                    )}
                  </div>
                  <Link href="/citizen" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                  <Link href="/auth/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"><User className="w-4 h-4" /> Profile</Link>
                  <button onClick={logoutUser} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn-outline text-sm py-2 px-4">Sign In</Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {links.map(l => <Link key={l.href} href={l.href} className="text-sm font-medium py-1">{l.label}</Link>)}
          {user ? (
            <button onClick={logoutUser} className="text-left text-sm text-red-600 font-medium py-1 flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</button>
          ) : (
            <>
              <Link href="/auth/login" className="btn-outline text-sm py-2 text-center">Sign In</Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2 text-center justify-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
