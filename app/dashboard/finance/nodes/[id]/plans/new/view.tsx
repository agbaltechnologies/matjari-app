'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { financeApi } from '@/src/core/api/api';

export default function NewFinancePlanPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const nodeId = params?.id as string;
  const [form, setForm] = useState({ category: '', periodType: 'monthly', budgetMode: 'amount', amount: '', percentRule: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !nodeId) return;
    setSaving(true); setError('');
    try {
      await financeApi.createPlan(orgId, {
        nodeId,
        category: form.category,
        periodType: form.periodType,
        amount: form.budgetMode === 'amount' ? parseFloat(form.amount) || 0 : undefined,
        percentRule: form.budgetMode === 'percent' ? parseFloat(form.percentRule) || 0 : undefined,
      });
      router.push(`/dashboard/finance/nodes/${nodeId}`);
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Budget Plan</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select value={form.periodType} onChange={(e) => setForm((f) => ({ ...f, periodType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget type</label>
            <select value={form.budgetMode} onChange={(e) => setForm((f) => ({ ...f, budgetMode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="amount">Fixed amount</option>
              <option value="percent">% of revenue</option>
            </select>
          </div>
          {form.budgetMode === 'amount' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (DA)</label>
              <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percent of revenue</label>
              <input type="number" step="0.1" min="0" max="100" value={form.percentRule} onChange={(e) => setForm((f) => ({ ...f, percentRule: e.target.value }))} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => router.push(`/dashboard/finance/nodes/${nodeId}`)}
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
