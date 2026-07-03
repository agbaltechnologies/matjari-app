'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { shopApi, orgApi } from '@/src/core/api/api';

export default function SettingsPage() {
  const { orgId, setOrgId, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '', currency: 'DZD', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }
    shopApi.getMyShop(orgId)
      .then((d: any) => {
        const s = d?.shop ?? d?.data ?? d;
        if (s?.name) setForm({
          name: s.name ?? '',
          slug: s.slug ?? '',
          description: s.description ?? '',
          currency: s.currency ?? 'DZD',
          phone: s.phone ?? '',
          address: s.address ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (!user?.id) throw new Error('Not authenticated');
      const org: any = await orgApi.create(user.id, { name: form.name, type: 'matjari' });
      const id = org?.organization?.id ?? org?.id ?? org?.data?.id;
      if (!id) throw new Error('Organization creation failed');
      await shopApi.setup(id, form);
      setOrgId(id);
      setSuccess('Shop created!');
    } catch (err: any) { setError(err.message ?? 'Setup failed'); }
    finally { setSaving(false); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      await shopApi.update(orgId, form);
      setSuccess('Settings saved!');
    } catch (err: any) { setError(err.message ?? 'Save failed'); }
    finally { setSaving(false); }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Settings</h1>
      {!orgId && (
        <p className="text-gray-500 text-sm mb-6">Fill in your shop details to get started.</p>
      )}

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

      <form onSubmit={orgId ? handleUpdate : handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop name</label>
          <input type="text" value={form.name} onChange={set('name')} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="My Shop" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL handle)</label>
          <input type="text" value={form.slug} onChange={set('slug')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="my-shop" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="What does your shop sell?" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={set('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select value={form.currency} onChange={set('currency')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="DZD">DZD (Algerian Dinar)</option>
              <option value="MAD">MAD (Moroccan Dirham)</option>
              <option value="TND">TND (Tunisian Dinar)</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={form.address} onChange={set('address')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
          {saving ? 'Saving…' : orgId ? 'Save changes' : 'Create my shop'}
        </button>
      </form>

      {orgId && (
        <p className="mt-4 text-xs text-gray-400">Organization ID: {orgId}</p>
      )}
    </div>
  );
}
