'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { productApi } from '@/src/core/api/api';

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

export default function ProductsPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    productApi.list(orgId)
      .then((d: any) => setProducts(Array.isArray(d?.products ?? d) ? (d?.products ?? d) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  async function handleDelete(id: string) {
    if (!orgId || !confirm('Delete this product?')) return;
    await productApi.delete(orgId, id).catch(() => {});
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={() => router.push('/dashboard/products/new')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          + Add product
        </button>
      </div>

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
                      <button onClick={() => router.push(`/dashboard/products/${p.id}/adjust-stock`)}
                        className="flex-1 px-2 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
                        Stock
                      </button>
                    )}
                    <button onClick={() => router.push(`/dashboard/products/${p.id}/edit`)}
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
