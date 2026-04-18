'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GraphData, GraphNode } from './graph-data';

// react-force-graph-2d is a browser-only canvas renderer; load client-side only.
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full text-neutral-600 text-[11px] tracking-[0.3em] uppercase font-mono">
      Loading the map…
    </div>
  ),
});

type NodeInternal = GraphNode & {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

interface NetworkGraphProps {
  data: GraphData;
}

const COLORS = {
  // Restrained neutral palette so the graph reads as archival, not decorative.
  thread: '#e5e5e5',        // brightest
  plate: '#a3a3a3',         // medium
  entry: '#525252',          // quiet
  edge: 'rgba(160,160,160,0.08)', // very faint
  hover: '#fafafa',
  hoverEdge: 'rgba(210,210,210,0.4)',
};

const RADIUS = {
  thread: 5.5,
  plate: 3.2,
  entry: 1.4,
};

export function NetworkGraph({ data }: NetworkGraphProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Track container size for responsive layout
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build a lookup of neighbour ids so we can highlight a node's thread
  // connections on hover.
  const neighboursRef = useRef<Map<string, Set<string>>>(new Map());
  useEffect(() => {
    const m = new Map<string, Set<string>>();
    for (const link of data.links) {
      const a = typeof link.source === 'string' ? link.source : (link.source as NodeInternal).id;
      const b = typeof link.target === 'string' ? link.target : (link.target as NodeInternal).id;
      if (!m.has(a)) m.set(a, new Set());
      if (!m.has(b)) m.set(b, new Set());
      m.get(a)!.add(b);
      m.get(b)!.add(a);
    }
    neighboursRef.current = m;
  }, [data]);

  const handleNodeClick = useCallback(
    (raw: object) => {
      const node = raw as NodeInternal;
      if (node?.href) router.push(node.href);
    },
    [router],
  );

  // Custom draw: circle + label for threads; smaller dots for entries/plates.
  const drawNode = useCallback(
    (raw: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = raw as NodeInternal;
      if (node.x == null || node.y == null) return;

      const isHover = hoverId === node.id;
      const isNeighbour =
        hoverId != null && neighboursRef.current.get(hoverId)?.has(node.id);
      const dim = hoverId != null && !isHover && !isNeighbour;

      const baseColor = COLORS[node.kind];
      const color = isHover ? COLORS.hover : dim ? `${baseColor}40` : baseColor;
      const r = RADIUS[node.kind];

      ctx.beginPath();
      if (node.kind === 'plate') {
        // Square for plates — distinct shape
        const s = r * 1.8;
        ctx.rect(node.x - s / 2, node.y - s / 2, s, s);
      } else {
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      }
      ctx.fillStyle = color;
      ctx.fill();

      // Thread nodes always show a label; hovered node shows its label too.
      if (node.kind === 'thread' || isHover) {
        const fontSize = node.kind === 'thread' ? 11 / globalScale : 10 / globalScale;
        ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isHover ? COLORS.hover : '#d4d4d4';
        ctx.fillText(node.label, node.x, node.y + r + fontSize * 0.9);
      }
    },
    [hoverId],
  );

  const linkColor = useCallback(
    (link: object) => {
      const l = link as { source: NodeInternal | string; target: NodeInternal | string };
      const a = typeof l.source === 'string' ? l.source : l.source.id;
      const b = typeof l.target === 'string' ? l.target : l.target.id;
      if (hoverId != null && (a === hoverId || b === hoverId)) return COLORS.hoverEdge;
      return COLORS.edge;
    },
    [hoverId],
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ minHeight: 'calc(100vh - 12rem)' }}
    >
      {dims && (
        <ForceGraph2D
          graphData={data}
          width={dims.w}
          height={dims.h}
          backgroundColor="#0a0a0a"
          nodeRelSize={1}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(raw, color, ctx) => {
            const node = raw as NodeInternal;
            if (node.x == null || node.y == null) return;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, Math.max(6, RADIUS[node.kind] + 4), 0, 2 * Math.PI);
            ctx.fill();
          }}
          linkColor={linkColor}
          linkWidth={0.4}
          onNodeHover={(n) => setHoverId((n as NodeInternal | null)?.id ?? null)}
          onNodeClick={handleNodeClick}
          cooldownTicks={200}
          d3VelocityDecay={0.35}
          d3AlphaDecay={0.015}
          enableNodeDrag={false}
          warmupTicks={30}
          minZoom={0.3}
          maxZoom={6}
        />
      )}
      {/* Legend — top-right, quiet */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 text-[9px] tracking-[0.3em] uppercase font-mono text-neutral-500 bg-[#0a0a0a]/60 backdrop-blur-sm px-3 py-2 border border-neutral-900">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.thread }} />
          threads (13)
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-[9px] h-[9px]" style={{ background: COLORS.plate }} />
          plates (16)
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: COLORS.entry }} />
          entries ({data.nodes.filter((n) => n.kind === 'entry').length})
        </div>
      </div>
    </div>
  );
}
