'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { productApi } from '@/src/core/api/api';
import { ProductForm, ProductFormValues } from '@/src/presentation/components/product-form';

export default function EditProductPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<ProductFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId || !id) return;
    productApi.get(orgId, id).then((d: any) => {
      const p = d?.product ?? d;
      setInitial({
        name: p.name, category: p.category, sku: p.sku ?? '', description: p.description ?? '', imageUrl: p.imageUrl ?? '',
        basePrice: String(p.basePrice), costPrice: String(p.costPrice), unit: p.unit,
        tracksStock: p.tracksStock, stock: String(p.stock), lowStockAlert: String(p.lowStockAlert),
      });
    }).catch(() => setError('Failed to load product'));
  }, [orgId, id]);

  async function handleSubmit(form: ProductFormValues) {
    if (!orgId) return;
    setSaving(true); setError('');
    try {
      await productApi.update(orgId, id, {
        name: form.name,
        category: form.category,
        sku: form.sku || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        basePrice: parseFloat(form.basePrice) || 0,
        costPrice: parseFloat(form.costPrice) || 0,
        unit: form.unit || 'piece',
        tracksStock: form.tracksStock,
        lowStockAlert: parseInt(form.lowStockAlert) || 5,
      });
      router.push('/dashboard/products');
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  if (!initial) return <div className="text-center py-12 text-gray-400">{error || 'Loading…'}</div>;

  return (
    <ProductForm
      title="Edit Product"
      initial={initial}
      isEditing={true}
      saving={saving}
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/dashboard/products')}
    />
  );
}
