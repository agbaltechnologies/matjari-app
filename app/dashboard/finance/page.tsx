'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { financeApi } from '@/src/core/api/api';
import { FinanceNodeGraph, FinanceNodeView, FinanceAllocationView } from '@/src/presentation/components/finance-node-graph';

interface Summary { totalExpense: number; totalRevenue: number; net: number; }

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function FinancePage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [nodes, setNodes] = useState<FinanceNodeView[]>([]);
  const [allocations, setAllocations] = useState<FinanceAllocationView[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [view, setView] = useState<'list' | 'graph'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      financeApi.listNodes(orgId).then((d: any) => setNodes(Array.isArray(d?.nodes ?? d) ? (d?.nodes ?? d) : [])).catch(() => {}),
      financeApi.listAllocations(orgId).then((d: any) => setAllocations(Array.isArray(d?.allocations ?? d) ? (d?.allocations ?? d) : [])).catch(() => {}),
      financeApi.overallSummary(orgId).then((d: any) => setSummary(d?.summary ?? d ?? null)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [orgId]);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const fmt = (n?: number) => `${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} DA`;

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <div className="flex gap-2">
          <button onClick={() => router.push('/dashboard/finance/allocations/new')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            + Allocation
          </button>
          <button onClick={() => router.push('/dashboard/finance/nodes/new')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            + New node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Revenue" value={fmt(summary?.totalRevenue)} color="text-green-700" />
        <StatCard label="Total Expense" value={fmt(summary?.totalExpense)} color="text-red-700" />
        <StatCard label="Net" value={fmt(summary?.net)} color={(summary?.net ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Nodes</h2>
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm">
          <button onClick={() => setView('list')} className={`px-3 py-1.5 font-medium ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            List
          </button>
          <button onClick={() => setView('graph')} className={`px-3 py-1.5 font-medium ${view === 'graph' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            Graph
          </button>
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No finance nodes yet.</div>
      ) : view === 'graph' ? (
        <FinanceNodeGraph nodes={nodes} allocations={allocations} onSelectNode={(id) => router.push(`/dashboard/finance/nodes/${id}`)} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Kind', 'Parent', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nodes.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/finance/nodes/${n.id}`)}>
                  <td className="px-4 py-3 font-medium text-gray-900">{n.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.kind === 'project' ? 'text-green-700 bg-green-50' : 'text-indigo-700 bg-indigo-50'}`}>
                      {n.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{n.parentNodeId ? (nodeById.get(n.parentNodeId)?.name ?? '—') : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/finance/nodes/${n.id}/edit`); }} className="text-indigo-600 hover:underline text-xs">
                      Edit
                    </button>
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
