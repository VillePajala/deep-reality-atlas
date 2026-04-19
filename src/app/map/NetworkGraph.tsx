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
  thread: '#e5e5e5',
  plate: '#a3a3a3',
  entry: '#525252',
  edge: 'rgba(160,160,160,0.08)',
  hover: '#fafafa',
  hoverEdge: 'rgba(210,210,210,0.4)',
};

const RADIUS = {
  thread: 6.5,
  plate: 3.6,
  entry: 1.6,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FGRef = any;

export function NetworkGraph({ data }: NetworkGraphProps) {
  const router = useRouter();
  const fgRef = useRef<FGRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Track container size
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Neighbour lookup for hover highlighting
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

  // Tune physics after engine initialises:
  //   - stronger repulsion so dense clusters breathe
  //   - shorter link on entry→thread so entries stay close to their hub
  //   - longer link between thread hubs (via lower link strength
  //     balancing charge) so hubs separate across the viewport
  useEffect(() => {
    if (!fgRef.current || !dims) return;
    const fg = fgRef.current;
    // stronger repulsion overall; no distanceMax so hubs can push far apart
    fg.d3Force('charge')?.strength(-80);
    // shorter links keep entries close to their thread hub
    fg.d3Force('link')?.distance((link: { source: NodeInternal; target: NodeInternal }) => {
      const s = typeof link.source === 'object' ? link.source.kind : 'entry';
      const t = typeof link.target === 'object' ? link.target.kind : 'thread';
      // thread↔plate → medium, entry↔thread → short, plate↔entry → medium
      if (s === 'thread' && t === 'thread') return 220;
      if (s === 'entry' || t === 'entry') return 28;
      return 60;
    });
    // centre force pulls orphan-groups back toward middle
    const centerForce = fg.d3Force('center');
    if (centerForce) centerForce.strength(0.03);
  }, [dims, data]);

  const handleNodeClick = useCallback(
    (raw: object) => {
      const node = raw as NodeInternal;
      if (node?.href) router.push(node.href);
    },
    [router],
  );

  const drawNode = useCallback(
    (raw: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = raw as NodeInternal;
      if (node.x == null || node.y == null) return;

      const isHover = hoverId === node.id;
      const isNeighbour =
        hoverId != null && neighboursRef.current.get(hoverId)?.has(node.id);
      const dim = hoverId != null && !isHover && !isNeighbour;

      const baseColor = COLORS[node.kind];
      const color = isHover ? COLORS.hover : dim ? `${baseColor}35` : baseColor;
      const r = RADIUS[node.kind];

      ctx.beginPath();
      if (node.kind === 'plate') {
        const s = r * 1.8;
        ctx.rect(node.x - s / 2, node.y - s / 2, s, s);
      } else {
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      }
      ctx.fillStyle = color;
      ctx.fill();

      // Thread nodes always label; hover shows any node's label above it
      if (node.kind === 'thread') {
        const fontSize = 11 / globalScale;
        ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isHover ? COLORS.hover : dim ? '#737373' : '#d4d4d4';
        // alternate label offset by node id hash to reduce label collisions
        const hashOffset = (node.id.charCodeAt(node.id.length - 1) % 2) === 0 ? 1 : -1;
        const offset = r + fontSize * 0.9;
        ctx.fillText(node.label, node.x, node.y + hashOffset * offset);
      } else if (isHover) {
        const fontSize = 10 / globalScale;
        ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // label pill background
        const padX = 4 / globalScale;
        const padY = 2 / globalScale;
        const metrics = ctx.measureText(node.label);
        const w = metrics.width + padX * 2;
        const h = fontSize + padY * 2;
        ctx.fillStyle = 'rgba(10,10,10,0.9)';
        ctx.fillRect(node.x - w / 2, node.y - r - h - 2 / globalScale, w, h);
        ctx.fillStyle = COLORS.hover;
        ctx.fillText(node.label, node.x, node.y - r - h / 2 - 2 / globalScale);
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
      if (hoverId != null) return 'rgba(160,160,160,0.03)'; // dim non-connected edges
      return COLORS.edge;
    },
    [hoverId],
  );

  const handleEngineStop = useCallback(() => {
    if (!fgRef.current) return;
    fgRef.current.zoomToFit(600, 80);
  }, []);

  // Fit the graph to the viewport once nodes have initial positions.
  // zoomToFit on engine-stop handles the final settle; this one handles
  // the first-render tiny-graph flash.
  useEffect(() => {
    if (!fgRef.current || !dims) return;
    const t1 = setTimeout(() => fgRef.current?.zoomToFit(400, 80), 200);
    const t2 = setTimeout(() => fgRef.current?.zoomToFit(400, 80), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [dims]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ minHeight: 'calc(100vh - 12rem)' }}
    >
      {dims && (
        <ForceGraph2D
          ref={fgRef}
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
          onEngineStop={handleEngineStop}
          cooldownTicks={300}
          d3VelocityDecay={0.4}
          d3AlphaDecay={0.02}
          warmupTicks={60}
          enableNodeDrag={false}
          minZoom={0.2}
          maxZoom={8}
        />
      )}
      {/* Legend */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 text-[9px] tracking-[0.3em] uppercase font-mono text-neutral-500 bg-[#0a0a0a]/70 backdrop-blur-sm px-3 py-2 border border-neutral-900">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLORS.thread }} />
          threads ({data.nodes.filter((n) => n.kind === 'thread').length})
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-[9px] h-[9px]" style={{ background: COLORS.plate }} />
          plates ({data.nodes.filter((n) => n.kind === 'plate').length})
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: COLORS.entry }} />
          entries ({data.nodes.filter((n) => n.kind === 'entry').length})
        </div>
      </div>
      {/* Hint */}
      <div className="absolute bottom-4 left-4 text-[9px] tracking-[0.3em] uppercase font-mono text-neutral-700">
        scroll to zoom · drag to pan
      </div>
    </div>
  );
}
