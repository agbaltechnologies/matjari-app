'use client';
import { useMemo } from 'react';

export interface FinanceNodeView {
  id: string;
  name: string;
  kind: 'cost_center' | 'project' | string;
  parentNodeId?: string | null;
}

export interface FinanceAllocationView {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  amount: number;
}

function money(amount: number): string {
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} DA`;
}

const LEVEL_WIDTH = 220;
const ROW_HEIGHT = 60;
const BOX_WIDTH = 170;
const BOX_HEIGHT = 40;
const MARGIN = 24;

interface Positioned {
  node: FinanceNodeView;
  x: number;
  y: number;
}

export function FinanceNodeGraph({
  nodes,
  allocations,
  onSelectNode,
}: {
  nodes: FinanceNodeView[];
  allocations: FinanceAllocationView[];
  onSelectNode: (id: string) => void;
}) {
  const { positioned, width, height } = useMemo(() => {
    const validIds = new Set(nodes.map((n) => n.id));
    const childrenByParent = new Map<string | null, FinanceNodeView[]>();
    for (const n of nodes) {
      const key = n.parentNodeId && validIds.has(n.parentNodeId) ? n.parentNodeId : null;
      if (!childrenByParent.has(key)) childrenByParent.set(key, []);
      childrenByParent.get(key)!.push(n);
    }

    const rowsPerLevel = new Map<number, number>();
    const positions: Positioned[] = [];

    function place(parentId: string | null, depth: number) {
      const kids = childrenByParent.get(parentId) ?? [];
      for (const kid of kids) {
        const row = rowsPerLevel.get(depth) ?? 0;
        positions.push({ node: kid, x: MARGIN + depth * LEVEL_WIDTH, y: MARGIN + row * ROW_HEIGHT });
        rowsPerLevel.set(depth, row + 1);
        place(kid.id, depth + 1);
      }
    }
    place(null, 0);

    const maxDepth = Math.max(0, ...Array.from(rowsPerLevel.keys()));
    const maxRows = Math.max(1, ...Array.from(rowsPerLevel.values()));
    return {
      positioned: positions,
      width: MARGIN * 2 + (maxDepth + 1) * LEVEL_WIDTH,
      height: MARGIN * 2 + maxRows * ROW_HEIGHT,
    };
  }, [nodes]);

  const posById = useMemo(() => {
    const m = new Map<string, Positioned>();
    positioned.forEach((p) => m.set(p.node.id, p));
    return m;
  }, [positioned]);

  const flowEdges = useMemo(() => {
    const totals = new Map<string, number>();
    for (const a of allocations) {
      const key = `${a.sourceNodeId}->${a.targetNodeId}`;
      totals.set(key, (totals.get(key) ?? 0) + a.amount);
    }
    return Array.from(totals.entries())
      .map(([key, amount]) => {
        const [sourceNodeId, targetNodeId] = key.split('->');
        return { sourceNodeId, targetNodeId, amount };
      })
      .filter((e) => posById.has(e.sourceNodeId) && posById.has(e.targetNodeId));
  }, [allocations, posById]);

  if (nodes.length === 0) {
    return <p className="text-sm text-gray-400">No finance nodes yet.</p>;
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">Gray lines: parent/child structure. Blue arrows: money flow between nodes (summed allocations).</p>
      <div className="overflow-auto border border-gray-200 rounded-lg bg-gray-50/50">
        <svg width={width} height={height} style={{ display: 'block' }}>
          <defs>
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
            </marker>
          </defs>

          {positioned
            .filter((p) => p.node.parentNodeId && posById.has(p.node.parentNodeId))
            .map((p) => {
              const parent = posById.get(p.node.parentNodeId as string)!;
              const x1 = parent.x + BOX_WIDTH;
              const y1 = parent.y + BOX_HEIGHT / 2;
              const x2 = p.x;
              const y2 = p.y + BOX_HEIGHT / 2;
              const midX = (x1 + x2) / 2;
              return (
                <path key={`tree-${p.node.id}`} d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  fill="none" stroke="#c7cbd4" strokeWidth={1.5} />
              );
            })}

          {flowEdges.map((e, i) => {
            const from = posById.get(e.sourceNodeId)!;
            const to = posById.get(e.targetNodeId)!;
            const x1 = from.x + BOX_WIDTH / 2;
            const y1 = from.y + BOX_HEIGHT;
            const x2 = to.x + BOX_WIDTH / 2;
            const y2 = to.y;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            return (
              <g key={`flow-${i}`}>
                <path d={`M ${x1} ${y1} Q ${midX} ${midY}, ${x2} ${y2}`}
                  fill="none" stroke="#4f46e5" strokeWidth={2} markerEnd="url(#flow-arrow)" opacity={0.8} />
                <rect x={midX - 34} y={midY - 10} width={68} height={18} fill="#fff" stroke="#4f46e5" rx={4} />
                <text x={midX} y={midY + 3} textAnchor="middle" fontSize={10.5} fill="#4f46e5">{money(e.amount)}</text>
              </g>
            );
          })}

          {positioned.map((p) => (
            <g key={p.node.id} transform={`translate(${p.x}, ${p.y})`} style={{ cursor: 'pointer' }} onClick={() => onSelectNode(p.node.id)}>
              <rect width={BOX_WIDTH} height={BOX_HEIGHT} rx={6} fill="#fff"
                stroke={p.node.kind === 'project' ? '#16a34a' : '#4f46e5'} strokeWidth={1.5} />
              <text x={10} y={BOX_HEIGHT / 2 + 4} fontSize={12.5} fill="#1f2937">
                {p.node.name.length > 20 ? `${p.node.name.slice(0, 19)}…` : p.node.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
