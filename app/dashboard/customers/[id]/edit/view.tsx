'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { customerApi } from '@/src/core/api/api';

const FIELDS = [
  { k: 'name', label: 'Name', type: 'text', required: true },
  { k: 'email', label: 'Email', type: 'email', required: false },
  { k: 'phone', label: 'Phone', type: 'tel', required: false },
] as const;

export default function EditCustomerPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId || !id) return;
    customerApi.get(orgId, id).then((d: any) => {
      const c = d?.customer ?? d;
      setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '' });
    }).catch(() => setError('Failed to load customer'));
  }, [orgId, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !form) return;
    setSaving(true); setError('');
    try {
      await customerApi.update(orgId, id, form);
      router.push('/dashboard/customers');
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  if (!form) return <div className="text-center py-12 text-gray-400">{error || 'Loading…'}</div>;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Customer</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {FIELDS.map(({ k, label, type, required }) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={(form as any)[k]} onChange={(e) => setForm((f) => ({ ...f!, [k]: e.target.value }))} required={required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => router.push('/dashboard/customers')}
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
