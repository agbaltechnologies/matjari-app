'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { financeApi } from '@/src/core/api/api';

interface NodeOption { id: string; name: string; }

export default function EditFinanceNodePage() {
  const { orgId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [nodes, setNodes] = useState<NodeOption[]>([]);
  const [form, setForm] = useState({ name: '', kind: 'cost_center', parentNodeId: '', projectId: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId || !id) return;
    Promise.all([
      financeApi.getNode(orgId, id).then((d: any) => d?.node ?? d),
      financeApi.listNodes(orgId).then((d: any) => (Array.isArray(d?.nodes ?? d) ? (d?.nodes ?? d) : [])),
    ]).then(([node, allNodes]) => {
      setForm({
        name: node?.name ?? '',
        kind: node?.kind ?? 'cost_center',
        parentNodeId: node?.parentNodeId ?? '',
        projectId: node?.projectId ?? '',
      });
      setNodes(allNodes.filter((n: NodeOption) => n.id !== id));
    }).catch((err: any) => setError(err.message)).finally(() => setLoading(false));
  }, [orgId, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !id) return;
    setSaving(true); setError('');
    try {
      await financeApi.updateNode(orgId, id, {
        name: form.name,
        kind: form.kind,
        parentNodeId: form.parentNodeId || null,
        projectId: form.projectId || null,
      });
      router.push('/dashboard/finance');
    } catch (err: any) { setError(err.message); setSaving(false); }
  }

  async function handleDelete() {
    if (!orgId || !id || !confirm('Delete this node? It must have no child nodes.')) return;
    try {
      await financeApi.deleteNode(orgId, id);
      router.push('/dashboard/finance');
    } catch (err: any) { alert(err.message); }
  }

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Finance Node</h1>
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
          <button type="button" onClick={handleDelete}
            className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
            Delete node
          </button>
        </form>
      </div>
    </div>
  );
}
