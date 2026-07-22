'use client';
import { useEffect, useState } from 'react';
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
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'add' | 'adjust'>('add');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', qty: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      stockApi.movements(orgId).then((d: any) => setMovements(Array.isArray(d?.movements ?? d) ? (d?.movements ?? d) : [])).catch(() => {}),
      productApi.list(orgId).then((d: any) => setProducts(Array.isArray(d?.products ?? d) ? (d?.products ?? d) : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  const openForm = (m: 'add' | 'adjust') => {
    setMode(m);
    setForm({ productId: '', qty: '', reason: '' });
    setError('');
    setShowForm(true);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSaving(true); setError('');
    try {
      if (mode === 'add') {
        await stockApi.add(orgId, { productId: form.productId, qty: parseInt(form.qty) || 0, reason: form.reason || undefined });
      } else {
        await stockApi.adjust(orgId, { productId: form.productId, newQty: parseInt(form.qty) || 0, reason: form.reason || undefined });
      }
      setShowForm(false);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  const trackedProducts = products.filter((p) => p.tracksStock);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <div className="flex gap-2">
          <button onClick={() => openForm('add')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            + Stock in
          </button>
          <button onClick={() => openForm('adjust')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            Adjust / count
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">{mode === 'add' ? 'Add Stock (purchase / delivery)' : 'Adjust Stock (physical count)'}</h2>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">Select a product</option>
                  {trackedProducts.map((p) => <option key={p.id} value={p.id}>{p.name} (current: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{mode === 'add' ? 'Quantity to add' : 'New total quantity'}</label>
                <input type="number" min="0" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input type="text" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
