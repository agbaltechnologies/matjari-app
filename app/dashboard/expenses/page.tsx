'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { expenseApi } from '@/src/core/api/api';

interface Expense { id: string; amount: number; category: string; description?: string; date: string; }

const CATEGORIES = ['Supplies', 'Rent', 'Utilities', 'Salaries', 'Marketing', 'Equipment', 'Other'];

export default function ExpensesPage() {
  const { orgId } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({ amount: '', category: 'Supplies', description: '', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    expenseApi.list(orgId)
      .then((d: any) => setExpenses(Array.isArray(d?.expenses ?? d) ? (d?.expenses ?? d) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  const openCreate = () => { setEditing(null); setForm({ amount: '', category: 'Supplies', description: '', date: new Date().toISOString().split('T')[0] }); setShowForm(true); };
  const openEdit = (ex: Expense) => { setEditing(ex); setForm({ amount: String(ex.amount), category: ex.category, description: ex.description ?? '', date: ex.date?.split('T')[0] ?? '' }); setShowForm(true); };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) { setLoading(false); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editing) await expenseApi.update(orgId, editing.id, payload);
      else await expenseApi.create(orgId, payload);
      setShowForm(false);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          {expenses.length > 0 && <p className="text-sm text-gray-500 mt-0.5">Total: <strong>{total.toFixed(2)} DA</strong></p>}
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          + Add expense
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Expense' : 'New Expense'}</h2>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (DA)</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
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
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No expenses recorded yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Date', 'Category', 'Description', 'Amount', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((ex) => (
                <tr key={ex.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{ex.date ? new Date(ex.date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full font-medium">{ex.category}</span></td>
                  <td className="px-4 py-3 text-gray-600">{ex.description ?? '—'}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{ex.amount.toFixed(2)} DA</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(ex)} className="text-indigo-600 hover:underline text-xs mr-2">Edit</button>
                    <button onClick={async () => { if (orgId && confirm('Delete?')) { await expenseApi.delete(orgId, ex.id).catch(() => {}); load(); } }} className="text-red-500 hover:underline text-xs">Delete</button>
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
