'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { productApi } from '@/src/core/api/api';
import { ProductForm, EMPTY_PRODUCT_FORM, ProductFormValues } from '@/src/presentation/components/product-form';

export default function NewProductPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(form: ProductFormValues) {
    if (!orgId) return;
    setSaving(true); setError('');
    try {
      await productApi.create(orgId, {
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
      });
      router.push('/dashboard/products');
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  return (
    <ProductForm
      title="New Product"
      initial={EMPTY_PRODUCT_FORM}
      isEditing={false}
      saving={saving}
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/dashboard/products')}
    />
  );
}
