'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { expenseApi } from '@/src/core/api/api';

interface Expense { id: string; amount: number; category: string; description?: string; date: string; }

export default function ExpensesPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    expenseApi.list(orgId)
      .then((d: any) => setExpenses(Array.isArray(d?.expenses ?? d) ? (d?.expenses ?? d) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [orgId]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          {expenses.length > 0 && <p className="text-sm text-gray-500 mt-0.5">Total: <strong>{total.toFixed(2)} DA</strong></p>}
        </div>
        <button onClick={() => router.push('/dashboard/expenses/new')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          + Add expense
        </button>
      </div>

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
                    <button onClick={() => router.push(`/dashboard/expenses/${ex.id}/edit`)} className="text-indigo-600 hover:underline text-xs mr-2">Edit</button>
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
