'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { saleApi, expenseApi, productApi, customerApi } from '@/src/core/api/api';

interface Summary {
  totalRevenue?: number;
  salesCount?: number;
  totalExpenses?: number;
  netProfit?: number;
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { orgId } = useAuth();
  const [summary, setSummary] = useState<Summary>({});
  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([
      saleApi.summary(orgId).then((d: any) => setSummary(d ?? {})).catch(() => {}),
      productApi.list(orgId).then((d: any) => setProductCount(Array.isArray(d?.products ?? d) ? (d?.products ?? d).length : 0)).catch(() => {}),
      customerApi.list(orgId).then((d: any) => setCustomerCount(Array.isArray(d?.customers ?? d) ? (d?.customers ?? d).length : 0)).catch(() => {}),
      saleApi.list(orgId, { limit: 5 }).then((d: any) => setRecentSales(Array.isArray(d?.sales ?? d) ? (d?.sales ?? d).slice(0, 5) : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [orgId]);

  if (!orgId) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No shop linked yet</h2>
        <p className="text-gray-500 mb-6">Set up your shop to start managing products, sales, and more.</p>
        <a href="/dashboard/settings" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
          Set up your shop →
        </a>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>;

  const fmt = (n?: number) => (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`${fmt(summary.totalRevenue)} DA`} icon="💵" color="bg-green-50" />
        <StatCard label="Sales" value={String(summary.salesCount ?? 0)} icon="🛒" color="bg-blue-50" />
        <StatCard label="Products" value={String(productCount)} icon="📦" color="bg-purple-50" />
        <StatCard label="Customers" value={String(customerCount)} icon="👥" color="bg-orange-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Sales</h2>
        {recentSales.length === 0 ? (
          <p className="text-gray-400 text-sm">No sales yet.</p>
        ) : (
          <div className="space-y-2">
            {recentSales.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">#{s.id?.slice(-6)}</p>
                  <p className="text-xs text-gray-400">{s.paymentMethod} · {s.items?.length ?? 0} item(s)</p>
                </div>
                <span className="text-sm font-semibold text-green-700">{fmt(s.totalAmount)} DA</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
