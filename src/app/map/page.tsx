import Link from 'next/link';
import type { Metadata } from 'next';
import { Symbol } from '@/components/Symbol';
import { buildGraphData } from './graph-data';
import { NetworkGraph } from './NetworkGraph';

export const metadata: Metadata = {
  title: 'The Map — Deep Reality',
  description:
    'A force-directed view of the archive. Threads cluster. Entries settle around what they belong to.',
};

export default function MapPage() {
  const data = buildGraphData();

  const counts = {
    entry: data.nodes.filter((n) => n.kind === 'entry').length,
    plate: data.nodes.filter((n) => n.kind === 'plate').length,
    thread: data.nodes.filter((n) => n.kind === 'thread').length,
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#0a0a0a] selection:bg-neutral-700">

      {/* Thin header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-neutral-900">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase font-mono">
          The Map
        </p>
        <p className="text-[9px] tracking-[0.3em] text-neutral-700 uppercase font-mono tabular-nums">
          {counts.thread} · {counts.plate} · {counts.entry}
        </p>
      </header>

      {/* Editor's brief note */}
      <div className="px-6 py-4 border-b border-neutral-900">
        <p
          className="max-w-3xl mx-auto text-xs leading-6 italic text-neutral-600 text-center"
          style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        >
          I built this to see the archive at once. Threads are the bright
          centres; plates are squares; entries are the dots that settle
          around what they belong to. Click any node to enter it. Hover to
          see its title and its connections.
          <br />
          <span className="not-italic">— V.P.</span>
        </p>
      </div>

      {/* The map itself */}
      <div className="flex-1 flex">
        <NetworkGraph data={data} />
      </div>

      {/* Bottom return */}
      <footer className="flex items-center justify-center gap-6 px-6 py-4 border-t border-neutral-900">
        <Symbol size={14} className="text-neutral-800" />
        <p className="text-[9px] tracking-[0.3em] text-neutral-800 uppercase font-mono">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
