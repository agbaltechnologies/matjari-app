'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { UserMenuDropdown } from '@/src/presentation/components/user-menu-dropdown';
import { LowStockBell } from '@/src/presentation/components/low-stock-bell';

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/sales', label: 'Sales / POS' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/stock', label: 'Stock' },
  { href: '/dashboard/customers', label: 'Customers' },
  { href: '/dashboard/expenses', label: 'Expenses' },
  { href: '/dashboard/finance', label: 'Finance' },
  { href: '/dashboard/devices', label: 'Devices' },
  { href: '/dashboard/settings', label: 'Shop Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !token) router.push('/login');
  }, [hydrated, token, router]);

  if (!hydrated) return null;

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
          {NAV.map(({ href, label }) => {
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition
                  ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                onClick={() => setSidebarOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-gray-200 p-4">
          <UserMenuDropdown
            name={user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.email ?? ''}
            email={user?.email}
            initial={user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? '?'}
            onLogout={logout}
          />
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

        {/* Top bar (desktop) */}
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-900">
            {[...NAV].reverse().find(({ href }) => href === '/dashboard' ? pathname === href : pathname.startsWith(href))?.label ?? ''}
          </h1>
          <LowStockBell />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
