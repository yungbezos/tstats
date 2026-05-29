// src/components/social/GraphInfoPanel.tsx
import React, { useMemo } from "react";
import ChartCard from "../charts/ChartCard";
import type { Node as TNode } from "../../types";
import { getId } from "../../lib/helpers";

type GLink = {
  source: string | number;
  target: string | number;
  weight: number;
};
type GNode = TNode & { __deg?: number };
type Data = { nodes: GNode[]; links: GLink[] };

type Props = {
  data: Data;
  selectedNodeId: string | number | null;
  selectedLink: { a: string | number; b: string | number } | null;
};

export default function GraphInfoPanel({
  data,
  selectedNodeId,
  selectedLink,
}: Props) {
  const nodesById = useMemo(() => {
    const map = new Map<string | number, GNode>();
    data.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [data.nodes]);

  // суммарный pair weight (в обе стороны)
  const pairWeight = (a: string | number, b: string | number): number => {
    let w = 0;
    for (const l of data.links) {
      const s = getId(l.source);
      const t = getId(l.target);
      if ((s === a && t === b) || (s === b && t === a))
        w += Number(l.weight || 0);
    }
    return w;
  };

  let body: React.ReactNode = (
    <div className="text-slate-400">
      Выберите пользователя или связь на графе
    </div>
  );

  if (selectedNodeId != null) {
    const me = nodesById.get(selectedNodeId);
    const partners = new Map<string | number, number>();
    data.links.forEach((l) => {
      const s = getId(l.source);
      const t = getId(l.target);
      if (s === selectedNodeId)
        partners.set(t, (partners.get(t) ?? 0) + Number(l.weight || 0));
      if (t === selectedNodeId)
        partners.set(s, (partners.get(s) ?? 0) + Number(l.weight || 0));
    });
    const rows = [...partners.entries()]
      .map(([other, _]) => ({ other, w: pairWeight(selectedNodeId, other) }))
      .sort((a, b) => b.w - a.w);

    body = (
      <div className="space-y-3">
        <div className="text-slate-200">
          Пользователь:{" "}
          <span className="font-medium">
            {me?.name || String(selectedNodeId)}
          </span>{" "}
          <span className="text-slate-400">(ID: {String(selectedNodeId)})</span>
        </div>
        {rows.length === 0 ? (
          <div className="text-slate-400">Связей нет</div>
        ) : (
          <div className="divide-y divide-white/10 rounded-xl overflow-hidden border border-white/10">
            {rows.map(({ other, w }) => {
              const n = nodesById.get(other);
              return (
                <div
                  key={String(other)}
                  className="px-3 py-2 bg-slate-900/40 hover:bg-slate-900/60 flex justify-between"
                >
                  <div className="truncate pr-2">
                    {n?.name || String(other)}
                  </div>
                  <div className="tabular-nums text-slate-300">
                    Реплаев: {w}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } else if (selectedLink) {
    const a = nodesById.get(selectedLink.a);
    const b = nodesById.get(selectedLink.b);
    const w = pairWeight(selectedLink.a, selectedLink.b);
    body = (
      <div className="space-y-2">
        <div className="text-slate-200">
          Связь:{" "}
          <span className="font-medium">
            {a?.name || String(selectedLink.a)}
          </span>{" "}
          ↔{" "}
          <span className="font-medium">
            {b?.name || String(selectedLink.b)}
          </span>
        </div>
        <div className="text-slate-300">Реплаев: {w}</div>
      </div>
    );
  }

  return <ChartCard title="📊 Связи">{body}</ChartCard>;
}
