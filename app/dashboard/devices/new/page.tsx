'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { deviceApi } from '@/src/core/api/api';

export default function NewDevicePage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', type: 'pos' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ deviceCode: string; passcode: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSaving(true); setError('');
    try {
      const result: any = await deviceApi.create(orgId, form);
      const dev = result?.device ?? result;
      setCreated({ deviceCode: dev.deviceCode, passcode: dev.passcode });
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  if (created) {
    return (
      <div className="max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="text-lg font-bold mb-2">Device Registered!</h1>
          <p className="text-sm text-gray-500 mb-4">Share these credentials with the device operator. The passcode is shown <strong>only once</strong>.</p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4 text-left">
            <div>
              <span className="text-xs text-gray-400 uppercase font-medium">Device Code</span>
              <p className="font-mono text-lg font-bold text-indigo-700">{created.deviceCode}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase font-medium">One-Time Passcode</span>
              <p className="font-mono text-lg font-bold text-green-700">{created.passcode}</p>
            </div>
          </div>
          <button onClick={() => router.push('/dashboard/devices')} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
            I've noted it, done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Register New Device</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
              placeholder="e.g. Main Cashier, Kiosk 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="pos">POS (Cash register)</option>
              <option value="kiosk">Kiosk (Customer-facing)</option>
              <option value="kds">KDS (Kitchen Display)</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => router.push('/dashboard/devices')}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Registering…' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
