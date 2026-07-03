'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { deviceApi } from '@/src/core/api/api';

interface Device { id: string; name: string; deviceCode: string; type: string; isActive: boolean; requiresPersonAuth: boolean; lastSeenAt?: string; }

export default function DevicesPage() {
  const { orgId } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'pos' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newDevice, setNewDevice] = useState<{ deviceCode: string; passcode: string } | null>(null);

  const load = () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    deviceApi.list(orgId)
      .then((d: any) => setDevices(Array.isArray(d?.devices ?? d) ? (d?.devices ?? d) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) { setLoading(false); return; }
    setSaving(true); setError('');
    try {
      const result: any = await deviceApi.create(orgId, form);
      const dev = result?.device ?? result;
      setNewDevice({ deviceCode: dev.deviceCode, passcode: dev.passcode });
      setShowForm(false);
      setForm({ name: '', type: 'pos' });
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!orgId || !confirm('Remove this device? It will no longer be able to authenticate.')) return;
    await deviceApi.delete(orgId, id).catch(() => {});
    load();
  }

  async function handleResetPasscode(id: string) {
    if (!orgId) { setLoading(false); return; }
    try {
      const result: any = await deviceApi.update(orgId, id, { resetPasscode: true });
      const dev = result?.device ?? result;
      setNewDevice({ deviceCode: dev.deviceCode, passcode: dev.passcode });
    } catch (err: any) { alert(err.message); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kiosk / POS Devices</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          + Register device
        </button>
      </div>

      {/* New device credentials modal */}
      {newDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-lg font-bold mb-2">Device Registered!</h2>
            <p className="text-sm text-gray-500 mb-4">Share these credentials with the device operator. The passcode is shown <strong>only once</strong>.</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4 text-left">
              <div>
                <span className="text-xs text-gray-400 uppercase font-medium">Device Code</span>
                <p className="font-mono text-lg font-bold text-indigo-700">{newDevice.deviceCode}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase font-medium">One-Time Passcode</span>
                <p className="font-mono text-lg font-bold text-green-700">{newDevice.passcode}</p>
              </div>
            </div>
            <button onClick={() => setNewDevice(null)} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
              I've noted it, close
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">Register New Device</h2>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-3">
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
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Registering…' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : devices.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No devices registered yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d) => (
            <div key={d.id} className={`bg-white border rounded-xl p-4 ${d.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{d.deviceCode}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${d.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {d.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <span className="uppercase font-medium text-gray-500">{d.type}</span>
                {d.lastSeenAt && <span>· Last seen {new Date(d.lastSeenAt).toLocaleDateString()}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleResetPasscode(d.id)}
                  className="flex-1 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50">
                  Reset passcode
                </button>
                <button onClick={() => handleDelete(d.id)}
                  className="py-1.5 px-3 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
