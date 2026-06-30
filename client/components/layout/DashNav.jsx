'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth';

const NAV_ITEMS = {
  citizen: [
    { href: '/citizen', label: 'Dashboard', icon: '🏠' },
    { href: '/citizen/points', label: 'TakaPoints', icon: '🪙' },
    { href: '/citizen/reports', label: 'DumpAlert', icon: '📍' },
    { href: '/marketplace', label: 'Marketplace', icon: '🛒' },
    { href: '/impact', label: 'Impact', icon: '🌍' },
  ],
  collector: [
    { href: '/collector', label: 'Dashboard', icon: '🏠' },
    { href: '/collector/listings', label: 'My Listings', icon: '📦' },
    { href: '/collector/transactions', label: 'Sales', icon: '💰' },
    { href: '/marketplace', label: 'Marketplace', icon: '🛒' },
    { href: '/impact', label: 'Impact', icon: '🌍' },
  ],
  business: [
    { href: '/business', label: 'Dashboard', icon: '🏠' },
    { href: '/business/listings', label: 'ReLoop B2B', icon: '🏭' },
    { href: '/business/transactions', label: 'Purchases', icon: '💳' },
    { href: '/audit', label: 'WasteIQ Audit', icon: '🤖' },
    { href: '/business/carbon', label: 'Carbon Credits', icon: '🌱' },
    { href: '/marketplace', label: 'Marketplace', icon: '🛒' },
  ],
  recycler: [
    { href: '/business', label: 'Dashboard', icon: '🏠' },
    { href: '/business/listings', label: 'My Listings', icon: '📦' },
    { href: '/business/transactions', label: 'Transactions', icon: '💰' },
    { href: '/audit', label: 'WasteIQ', icon: '🤖' },
    { href: '/marketplace', label: 'Marketplace', icon: '🛒' },
  ],
  county_officer: [
    { href: '/county', label: 'Dashboard', icon: '🏠' },
    { href: '/county/reports', label: 'Dump Reports', icon: '📍' },
    { href: '/county/collection-points', label: 'Collection Points', icon: '🗺️' },
    { href: '/county/points', label: 'Award Points', icon: '🪙' },
    { href: '/impact', label: 'County Impact', icon: '🌍' },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/disputes', label: 'Disputes', icon: '⚖️' },
    { href: '/admin/pricing', label: 'Pricing', icon: '💲' },
    { href: '/impact', label: 'Platform Impact', icon: '🌍' },
  ],
};

export default function DashNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push('/'); };
  const items = NAV_ITEMS[user?.role] || NAV_ITEMS.citizen;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-green-950 text-white min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-green-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">♻️</span>
            <span className="font-bold text-lg">TakaLoop</span>
          </Link>
          {user && (
            <div className="mt-4">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-green-400 text-xs capitalize">{user.role?.replace('_', ' ')}</p>
              <p className="text-green-300 text-xs mt-1">🪙 {user.points || 0} pts</p>
            </div>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {items.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === item.href ? 'bg-green-700 text-white' : 'text-green-300 hover:bg-green-800 hover:text-white'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-green-800">
          <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-green-400 hover:text-red-400 text-sm font-medium rounded-xl hover:bg-green-900 transition-all">
            🚪 Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-green-100 px-2 py-2">
        <div className="flex justify-around">
          {items.slice(0, 5).map(item => (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all text-xs ${pathname === item.href ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="mt-0.5 truncate max-w-[50px] text-center">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
