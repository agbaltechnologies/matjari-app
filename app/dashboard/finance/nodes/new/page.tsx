'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { financeApi } from '@/src/core/api/api';

interface NodeOption { id: string; name: string; }

export default function NewFinanceNodePage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [nodes, setNodes] = useState<NodeOption[]>([]);
  const [form, setForm] = useState({ name: '', kind: 'cost_center', parentNodeId: '', projectId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId) return;
    financeApi.listNodes(orgId).then((d: any) => setNodes(Array.isArray(d?.nodes ?? d) ? (d?.nodes ?? d) : [])).catch(() => {});
  }, [orgId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSaving(true); setError('');
    try {
      await financeApi.createNode(orgId, {
        name: form.name,
        kind: form.kind,
        parentNodeId: form.parentNodeId || undefined,
        projectId: form.projectId || undefined,
      });
      router.push('/dashboard/finance');
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Finance Node</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kind</label>
            <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="cost_center">Cost center</option>
              <option value="project">Project</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent node (optional)</label>
            <select value={form.parentNodeId} onChange={(e) => setForm((f) => ({ ...f, parentNodeId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">None</option>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Linked project ID (optional)</label>
            <input type="text" value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => router.push('/dashboard/finance')}
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
