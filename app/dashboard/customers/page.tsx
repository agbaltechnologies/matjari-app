'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { customerApi } from '@/src/core/api/api';

interface Customer { id: string; name: string; email?: string; phone?: string; totalSpent?: number; visitCount?: number; }

export default function CustomersPage() {
  const { orgId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    if (!orgId) return;
    setLoading(true);
    customerApi.list(orgId)
      .then((d: any) => setCustomers(Array.isArray(d?.customers ?? d) ? (d?.customers ?? d) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', phone: '' }); setShowForm(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '' }); setShowForm(true); };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSaving(true); setError('');
    try {
      if (editing) await customerApi.update(orgId, editing.id, form);
      else await customerApi.create(orgId, form);
      setShowForm(false);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  const filtered = customers.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.includes(search) || c.phone?.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          + Add customer
        </button>
      </div>

      <input
        type="search" placeholder="Search by name, email, or phone…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Customer' : 'New Customer'}</h2>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSave} className="space-y-3">
              {[
                { k: 'name', label: 'Name', type: 'text', required: true },
                { k: 'email', label: 'Email', type: 'email', required: false },
                { k: 'phone', label: 'Phone', type: 'tel', required: false },
              ].map(({ k, label, type, required }) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={(form as any)[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} required={required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              ))}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{search ? 'No customers match your search.' : 'No customers yet.'}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Phone', 'Total Spent', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{c.totalSpent != null ? `${c.totalSpent.toFixed(2)} DA` : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
