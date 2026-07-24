'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { financeApi } from '@/src/core/api/api';

interface FinanceNode { id: string; name: string; kind: string; parentNodeId?: string | null; projectId?: string | null; }
interface Account { id: string; category: string; name: string; mode: string; }
interface Revenue { id: string; category: string; description?: string; amount: number; occurredAt: string; }
interface Plan { id: string; category: string; amount?: number; percentRule?: number; periodType: string; }
interface Allocation { id: string; sourceNodeId: string; targetNodeId: string; amount: number; purpose?: string; occurredAt: string; }
interface Variance { planId: string; category: string; periodType: string; from: string; to: string; plannedAmount: number; actual: number; variance: number; }
interface Summary { totalExpense: number; totalRevenue: number; allocationsIn: number; allocationsOut: number; inflow: number; outflow: number; net: number; roiPercent: number | null; }

const fmt = (n?: number | null) => `${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} DA`;

export default function FinanceNodeDetailPage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [node, setNode] = useState<FinanceNode | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [variance, setVariance] = useState<Variance[]>([]);
  const [allocationsIn, setAllocationsIn] = useState<Allocation[]>([]);
  const [allocationsOut, setAllocationsOut] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodesById, setNodesById] = useState<Map<string, string>>(new Map());

  const load = () => {
    if (!orgId || !id) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      financeApi.getNode(orgId, id).then((d: any) => setNode(d?.node ?? d)).catch(() => {}),
      financeApi.nodeSummary(orgId, id).then((d: any) => setSummary(d?.summary ?? d)).catch(() => {}),
      financeApi.listAccounts(orgId, id).then((d: any) => setAccounts(Array.isArray(d?.accounts ?? d) ? (d?.accounts ?? d) : [])).catch(() => {}),
      financeApi.listRevenue(orgId, id).then((d: any) => setRevenue(Array.isArray(d?.revenue ?? d) ? (d?.revenue ?? d) : [])).catch(() => {}),
      financeApi.listPlans(orgId, id).then((d: any) => setPlans(Array.isArray(d?.plans ?? d) ? (d?.plans ?? d) : [])).catch(() => {}),
      financeApi.nodeVariance(orgId, id).then((d: any) => setVariance(Array.isArray(d?.variance ?? d) ? (d?.variance ?? d) : [])).catch(() => {}),
      financeApi.listAllocations(orgId, id).then((d: any) => {
        const all: Allocation[] = Array.isArray(d?.allocations ?? d) ? (d?.allocations ?? d) : [];
        setAllocationsIn(all.filter((a) => a.targetNodeId === id));
        setAllocationsOut(all.filter((a) => a.sourceNodeId === id));
      }).catch(() => {}),
      financeApi.listNodes(orgId).then((d: any) => {
        const all = Array.isArray(d?.nodes ?? d) ? (d?.nodes ?? d) : [];
        setNodesById(new Map(all.map((n: any) => [n.id, n.name])));
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(load, [orgId, id]);

  async function handleDeleteAccount(accId: string) {
    if (!orgId || !confirm('Delete this account?')) return;
    await financeApi.deleteAccount(orgId, accId).catch(() => {});
    load();
  }
  async function handleDeleteRevenue(revId: string) {
    if (!orgId || !confirm('Delete this revenue entry?')) return;
    await financeApi.deleteRevenue(orgId, revId).catch(() => {});
    load();
  }
  async function handleDeletePlan(planId: string) {
    if (!orgId || !confirm('Delete this plan?')) return;
    await financeApi.deletePlan(orgId, planId).catch(() => {});
    load();
  }
  async function handleDeleteAllocation(allocId: string) {
    if (!orgId || !confirm('Delete this allocation?')) return;
    await financeApi.deleteAllocation(orgId, allocId).catch(() => {});
    load();
  }

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>;
  if (!node) return <div className="text-center py-12 text-gray-400">Node not found.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{node.name}</h1>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${node.kind === 'project' ? 'text-green-700 bg-green-50' : 'text-indigo-700 bg-indigo-50'}`}>
            {node.kind}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/dashboard/finance')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            Back
          </button>
          <button onClick={() => router.push(`/dashboard/finance/nodes/${id}/edit`)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Inflow</p>
          <p className="text-lg font-bold text-green-700">{fmt(summary?.inflow)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Outflow</p>
          <p className="text-lg font-bold text-red-700">{fmt(summary?.outflow)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Net</p>
          <p className={`text-lg font-bold ${(summary?.net ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(summary?.net)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">ROI</p>
          <p className="text-lg font-bold text-gray-900">{summary?.roiPercent != null ? `${summary.roiPercent}%` : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Accounts</h2>
            <button onClick={() => router.push(`/dashboard/finance/nodes/${id}/accounts/new`)} className="text-indigo-600 hover:underline text-xs font-medium">+ Add account</button>
          </div>
          {accounts.length === 0 ? <p className="text-gray-400 text-sm">No accounts yet.</p> : (
            <div className="space-y-2">
              {accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.category} · {a.mode}</p>
                  </div>
                  <button onClick={() => handleDeleteAccount(a.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Revenue</h2>
            <button onClick={() => router.push(`/dashboard/finance/nodes/${id}/revenue/new`)} className="text-indigo-600 hover:underline text-xs font-medium">+ Add revenue</button>
          </div>
          {revenue.length === 0 ? <p className="text-gray-400 text-sm">No revenue entries yet.</p> : (
            <div className="space-y-2">
              {revenue.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.category}</p>
                    <p className="text-xs text-gray-400">{new Date(r.occurredAt).toLocaleDateString()} {r.description ? `· ${r.description}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-700">{fmt(r.amount)}</span>
                    <button onClick={() => handleDeleteRevenue(r.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Plans & variance</h2>
            <button onClick={() => router.push(`/dashboard/finance/nodes/${id}/plans/new`)} className="text-indigo-600 hover:underline text-xs font-medium">+ Add plan</button>
          </div>
          {plans.length === 0 ? <p className="text-gray-400 text-sm">No plans yet.</p> : (
            <div className="space-y-2">
              {plans.map((p) => {
                const v = variance.find((x) => x.planId === p.id);
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.category}</p>
                      <p className="text-xs text-gray-400">
                        {p.periodType} · planned {fmt(v?.plannedAmount ?? p.amount)}
                        {v && ` · actual ${fmt(v.actual)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {v && <span className={`text-sm font-semibold ${v.variance <= 0 ? 'text-green-700' : 'text-red-700'}`}>{v.variance > 0 ? '+' : ''}{fmt(v.variance)}</span>}
                      <button onClick={() => handleDeletePlan(p.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Allocations</h2>
            <button onClick={() => router.push('/dashboard/finance/allocations/new')} className="text-indigo-600 hover:underline text-xs font-medium">+ Add allocation</button>
          </div>
          {allocationsIn.length === 0 && allocationsOut.length === 0 ? <p className="text-gray-400 text-sm">No allocations yet.</p> : (
            <div className="space-y-2">
              {allocationsIn.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">In from {nodesById.get(a.sourceNodeId) ?? '—'}</p>
                    <p className="text-xs text-gray-400">{new Date(a.occurredAt).toLocaleDateString()} {a.purpose ? `· ${a.purpose}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-700">+{fmt(a.amount)}</span>
                    <button onClick={() => handleDeleteAllocation(a.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </div>
              ))}
              {allocationsOut.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Out to {nodesById.get(a.targetNodeId) ?? '—'}</p>
                    <p className="text-xs text-gray-400">{new Date(a.occurredAt).toLocaleDateString()} {a.purpose ? `· ${a.purpose}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-700">-{fmt(a.amount)}</span>
                    <button onClick={() => handleDeleteAllocation(a.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
