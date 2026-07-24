'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { customerApi } from '@/src/core/api/api';

interface Customer { id: string; name: string; email?: string; phone?: string; totalSpent?: number; visitCount?: number; }

export default function CustomersPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    customerApi.list(orgId)
      .then((d: any) => setCustomers(Array.isArray(d?.customers ?? d) ? (d?.customers ?? d) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  const filtered = customers.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.includes(search) || c.phone?.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button onClick={() => router.push('/dashboard/customers/new')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          + Add customer
        </button>
      </div>

      <input
        type="search" placeholder="Search by name, email, or phone…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{search ? 'No customers match your search.' : 'No customers yet.'}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Phone', 'Total Spent', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{c.totalSpent != null ? `${c.totalSpent.toFixed(2)} DA` : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => router.push(`/dashboard/customers/${c.id}/edit`)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
