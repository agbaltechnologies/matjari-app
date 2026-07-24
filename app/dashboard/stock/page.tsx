'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { stockApi, productApi } from '@/src/core/api/api';

interface Movement {
  id: string;
  productId: string;
  productName?: string;
  movementType: string;
  direction: 'in' | 'out';
  qty: number;
  reason?: string | null;
  createdAt: string;
}
interface Product { id: string; name: string; tracksStock: boolean; stock: number; }

export default function StockPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      stockApi.movements(orgId).then((d: any) => setMovements(Array.isArray(d?.movements ?? d) ? (d?.movements ?? d) : [])).catch(() => {}),
      productApi.list(orgId).then((d: any) => setProducts(Array.isArray(d?.products ?? d) ? (d?.products ?? d) : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <div className="flex gap-2">
          <button onClick={() => router.push('/dashboard/stock/add')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            + Stock in
          </button>
          <button onClick={() => router.push('/dashboard/stock/adjust')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            Adjust / count
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No stock movements yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Date', 'Product', 'Type', 'Qty', 'Reason'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.productName ?? products.find((p) => p.id === m.productId)?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.direction === 'in' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{m.direction === 'out' ? '-' : '+'}{m.qty}</td>
                  <td className="px-4 py-3 text-gray-400">{m.reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
