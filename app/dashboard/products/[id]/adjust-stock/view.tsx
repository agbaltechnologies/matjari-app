'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { productApi, stockApi } from '@/src/core/api/api';

interface Product { id: string; name: string; stock: number; unit: string; }

export default function AdjustStockPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [newQty, setNewQty] = useState('0');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId || !id) return;
    productApi.get(orgId, id).then((d: any) => {
      const p = d?.product ?? d;
      setProduct(p);
      setNewQty(String(p.stock));
    }).catch(() => setError('Failed to load product'));
  }, [orgId, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !product) return;
    setSaving(true); setError('');
    try {
      await stockApi.adjust(orgId, { productId: product.id, newQty: parseInt(newQty) || 0, reason: reason || undefined });
      router.push('/dashboard/products');
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  if (!product) return <div className="text-center py-12 text-gray-400">{error || 'Loading…'}</div>;

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Adjust stock</h1>
      <p className="text-sm text-gray-500 mb-6">{product.name} — current: {product.stock} {product.unit}</p>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New quantity</label>
            <input type="number" min={0} value={newQty} onChange={(e) => setNewQty(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Physical count, damage, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => router.push('/dashboard/products')}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
