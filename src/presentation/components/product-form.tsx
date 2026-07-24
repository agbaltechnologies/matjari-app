'use client';
import { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { storageApi } from '@/src/core/api/api';

const CATEGORIES = ['copy', 'photo', 'frame', 'card', 'media', 'gift', 'print', 'other'];
const CAT_LABELS: Record<string, string> = {
  copy: 'Copy', photo: 'Photo', frame: 'Frame', card: 'Card',
  media: 'Media', gift: 'Gift', print: 'Print', other: 'Other',
};

export interface ProductFormValues {
  name: string; category: string; sku: string; description: string; imageUrl: string;
  basePrice: string; costPrice: string; unit: string; tracksStock: boolean;
  stock: string; lowStockAlert: string;
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: '', category: 'other', sku: '', description: '', imageUrl: '',
  basePrice: '0', costPrice: '0', unit: 'piece', tracksStock: false,
  stock: '0', lowStockAlert: '5',
};

export function ProductForm({
  title,
  initial,
  isEditing,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial: ProductFormValues;
  isEditing: boolean;
  saving: boolean;
  error: string;
  onSubmit: (form: ProductFormValues) => void;
  onCancel: () => void;
}) {
  const { orgId } = useAuth();
  const [form, setForm] = useState<ProductFormValues>(initial);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{isEditing ? 'Current stock' : 'Initial stock'}</label>
                <input type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} disabled={isEditing}
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
            <button type="button" onClick={onCancel}
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
