'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { stockApi, productApi } from '@/src/core/api/api';

interface Product { id: string; name: string; tracksStock: boolean; stock: number; }

export default function AdjustStockOverviewPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ productId: '', qty: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId) return;
    productApi.list(orgId).then((d: any) => setProducts(Array.isArray(d?.products ?? d) ? (d?.products ?? d) : [])).catch(() => {});
  }, [orgId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSaving(true); setError('');
    try {
      await stockApi.adjust(orgId, { productId: form.productId, newQty: parseInt(form.qty) || 0, reason: form.reason || undefined });
      router.push('/dashboard/stock');
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  const trackedProducts = products.filter((p) => p.tracksStock);

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Adjust Stock</h1>
      <p className="text-sm text-gray-500 -mt-4 mb-6">Physical count correction</p>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select a product</option>
              {trackedProducts.map((p) => <option key={p.id} value={p.id}>{p.name} (current: {p.stock})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New total quantity</label>
            <input type="number" min="0" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <input type="text" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => router.push('/dashboard/stock')}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
