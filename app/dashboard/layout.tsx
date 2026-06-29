'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/sales', label: 'Sales / POS', icon: '🛒' },
  { href: '/dashboard/products', label: 'Products', icon: '📦' },
  { href: '/dashboard/stock', label: 'Stock', icon: '🏭' },
  { href: '/dashboard/customers', label: 'Customers', icon: '👥' },
  { href: '/dashboard/expenses', label: 'Expenses', icon: '💰' },
  { href: '/dashboard/devices', label: 'Devices', icon: '🖥️' },
  { href: '/dashboard/settings', label: 'Shop Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-2xl font-bold text-indigo-700">Matjari</span>
          <span className="ml-2 text-xs text-gray-400 font-medium">Shop</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map(({ href, label, icon }) => {
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition
                  ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-sm text-gray-500 hover:text-red-600 text-left transition"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-4 text-lg font-bold text-indigo-700">Matjari</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
