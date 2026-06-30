'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashNav from './DashNav';
import { useAuthStore } from '../../store/auth';

export default function DashLayout({ children, title }) {
  const { user, isLoading, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => { init(); }, []);
  useEffect(() => { if (!isLoading && !user) router.push('/auth/login'); }, [user, isLoading]);

  if (isLoading) return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-green-600 text-lg font-semibold animate-pulse">Loading TakaLoop...</div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-green-50">
      <DashNav />
      <main className="md:ml-60 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          {title && <h1 className="text-2xl font-bold text-green-950 mb-6">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}
