'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { productApi, storageApi, stockApi } from '@/src/core/api/api';

const CATEGORIES = ['copy', 'photo', 'frame', 'card', 'media', 'gift', 'print', 'other'];
const CAT_LABELS: Record<string, string> = {
  copy: 'Copy', photo: 'Photo', frame: 'Frame', card: 'Card',
  media: 'Media', gift: 'Gift', print: 'Print', other: 'Other',
};

interface Product {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  sku?: string | null;
  imageUrl?: string | null;
  basePrice: number;
  costPrice: number;
  unit: string;
  tracksStock: boolean;
  stock: number;
  lowStockAlert: number;
  isActive?: boolean;
}

const EMPTY_FORM = {
  name: '', category: 'other', sku: '', description: '', imageUrl: '',
  basePrice: '0', costPrice: '0', unit: 'piece', tracksStock: false,
  stock: '0', lowStockAlert: '5',
};

export default function ProductsPage() {
  const { orgId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [newQty, setNewQty] = useState('0');
  const [stockReason, setStockReason] = useState('');
  const [stockSaving, setStockSaving] = useState(false);

  const load = () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    productApi.list(orgId)
      .then((d: any) => setProducts(Array.isArray(d?.products ?? d) ? (d?.products ?? d) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setError(''); setShowForm(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, sku: p.sku ?? '', description: p.description ?? '', imageUrl: p.imageUrl ?? '',
      basePrice: String(p.basePrice), costPrice: String(p.costPrice), unit: p.unit,
      tracksStock: p.tracksStock, stock: String(p.stock), lowStockAlert: String(p.lowStockAlert),
    });
    setError('');
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;
    setUploadingImg(true);
    try {
      const res: any = await storageApi.uploadFile(orgId, file, 'products');
      const d = res?.data ?? res;
      const url = d?.url ?? d?.file?.url ?? d?.imageUrl ?? '';
      if (url) setForm((f) => ({ ...f, imageUrl: url }));
    } catch {}
    setUploadingImg(false);
    e.target.value = '';
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSaving(true); setError('');
    try {
      const payload = {
        name: form.name,
        category: form.category,
        sku: form.sku || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        basePrice: parseFloat(form.basePrice) || 0,
        costPrice: parseFloat(form.costPrice) || 0,
        unit: form.unit || 'piece',
        tracksStock: form.tracksStock,
        stock: parseInt(form.stock) || 0,
        lowStockAlert: parseInt(form.lowStockAlert) || 5,
      };
      if (editing) await productApi.update(orgId, editing.id, payload);
      else await productApi.create(orgId, payload);
      setShowForm(false);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!orgId || !confirm('Delete this product?')) return;
    await productApi.delete(orgId, id).catch(() => {});
    load();
  }

  const openStockAdjust = (p: Product) => {
    setStockTarget(p);
    setNewQty(String(p.stock));
    setStockReason('');
  };

  async function handleStockAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !stockTarget) return;
    setStockSaving(true);
    try {
      await stockApi.adjust(orgId, { productId: stockTarget.id, newQty: parseInt(newQty) || 0, reason: stockReason || undefined });
      setStockTarget(null);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setStockSaving(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          + Add product
        </button>
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Product' : 'New Product'}</h2>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition text-center">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                  ) : (
                    <p className="text-sm text-gray-500">{uploadingImg ? 'Uploading…' : 'Click to add a photo'}</p>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="number" min={0} step={0.01} value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost price</label>
                  <input type="number" min={0} step={0.01} value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input type="text" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="tracksStock" type="checkbox" checked={form.tracksStock}
                  onChange={(e) => setForm((f) => ({ ...f, tracksStock: e.target.checked }))} />
                <label htmlFor="tracksStock" className="text-sm text-gray-700">Track stock for this item</label>
              </div>

              {form.tracksStock && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{editing ? 'Current stock' : 'Initial stock'}</label>
                    <input type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} disabled={!!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low stock alert</label>
                    <input type="number" min={0} value={form.lowStockAlert} onChange={(e) => setForm((f) => ({ ...f, lowStockAlert: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock adjust modal */}
      {stockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold mb-1">Adjust stock</h2>
            <p className="text-sm text-gray-500 mb-4">{stockTarget.name} — current: {stockTarget.stock} {stockTarget.unit}</p>
            <form onSubmit={handleStockAdjust} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New quantity</label>
                <input type="number" min={0} value={newQty} onChange={(e) => setNewQty(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input type="text" value={stockReason} onChange={(e) => setStockReason(e.target.value)} placeholder="Physical count, damage, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStockTarget(null)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={stockSaving}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {stockSaving ? 'Saving…' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No products yet. Add your first product.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            const isOut = p.tracksStock && p.stock === 0;
            const isLow = p.tracksStock && p.stock > 0 && p.stock <= p.lowStockAlert;
            return (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No photo</div>
                  )}
                  {p.tracksStock && (
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isOut ? 'bg-red-50 text-red-600 border-red-200' :
                        isLow ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {isOut ? 'Out' : `${p.stock} ${p.unit}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-1">{p.name}</p>
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                    {CAT_LABELS[p.category] ?? p.category}
                  </span>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-base font-bold text-gray-900">{Number(p.basePrice).toFixed(2)} DA</p>
                    {p.sku && <span className="text-[10px] text-gray-400 font-mono">{p.sku}</span>}
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {p.tracksStock && (
                      <button onClick={() => openStockAdjust(p)}
                        className="flex-1 px-2 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
                        Stock
                      </button>
                    )}
                    <button onClick={() => openEdit(p)}
                      className="flex-1 px-2 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="px-2 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
