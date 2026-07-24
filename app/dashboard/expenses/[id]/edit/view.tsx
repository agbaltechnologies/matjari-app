'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { expenseApi, financeApi } from '@/src/core/api/api';

const CATEGORIES = ['Supplies', 'Rent', 'Utilities', 'Salaries', 'Marketing', 'Equipment', 'Other'];

interface FinanceNode { id: string; name: string; }

export default function EditExpensePage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [nodes, setNodes] = useState<FinanceNode[]>([]);
  const [form, setForm] = useState<{ amount: string; category: string; description: string; date: string; nodeId: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId) return;
    financeApi.listNodes(orgId).then((d: any) => setNodes(Array.isArray(d?.nodes ?? d) ? (d?.nodes ?? d) : [])).catch(() => {});
  }, [orgId]);

  useEffect(() => {
    if (!orgId || !id) return;
    expenseApi.list(orgId).then((d: any) => {
      const list = Array.isArray(d?.expenses ?? d) ? (d?.expenses ?? d) : [];
      const ex = list.find((e: any) => e.id === id);
      if (!ex) { setError('Expense not found'); return; }
      setForm({
        amount: String(ex.amount), category: ex.category, description: ex.description ?? '',
        date: ex.date?.split('T')[0] ?? '', nodeId: ex.nodeId ?? '',
      });
    }).catch(() => setError('Failed to load expense'));
  }, [orgId, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !form) return;
    setSaving(true); setError('');
    try {
      const { nodeId, ...rest } = form;
      await expenseApi.update(orgId, id, { ...rest, amount: parseFloat(form.amount), nodeId: nodeId || null });
      router.push('/dashboard/expenses');
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  if (!form) return <div className="text-center py-12 text-gray-400">{error || 'Loading…'}</div>;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Expense</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (DA)</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f!, amount: e.target.value }))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f!, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f!, date: e.target.value }))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f!, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          {nodes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Finance node (optional)</label>
              <select value={form.nodeId} onChange={(e) => setForm((f) => ({ ...f!, nodeId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">— None —</option>
                {nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => router.push('/dashboard/expenses')}
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
