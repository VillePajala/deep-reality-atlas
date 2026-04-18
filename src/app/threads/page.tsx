import Link from 'next/link';
import type { Metadata } from 'next';
import { Symbol } from '@/components/Symbol';
import { THREADS, getThreadCounts } from './threads';

export const metadata: Metadata = {
  title: 'Threads — V.P.\u2019s working index',
};

export default function ThreadsIndexPage() {
  const counts = Object.fromEntries(
    getThreadCounts().map(({ slug, count }) => [slug, count]),
  );

  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center selection:bg-neutral-700">

      {/* Header */}
      <header className="mb-16 text-center max-w-2xl">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <h1
          className="mt-6 text-3xl sm:text-4xl text-neutral-200 italic"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          Threads
        </h1>
        <p className="mt-3 text-[10px] tracking-[0.3em] text-neutral-500 uppercase font-mono">
          V.P.&apos;s working index
        </p>
        <p
          className="mt-8 text-sm leading-7 italic text-neutral-500"
          style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        >
          These are threads I have found while reading. The list is my attempt
          to see what Kamikaze was doing across the archive. I may be wrong
          about any of it. An entry often belongs to several threads at once.
          Follow whichever pulls.
          <br />— V.P.
        </p>
      </header>

      {/* Thread list */}
      <div className="w-full max-w-2xl space-y-2 font-mono">
        {THREADS.map((thread) => (
          <Link
            key={thread.slug}
            href={`/threads/${thread.slug}`}
            className="group block py-4 px-4 border-b border-neutral-900
              hover:border-neutral-600 hover:bg-neutral-900/40 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-base text-neutral-300 group-hover:text-neutral-100 transition-colors">
                {thread.title}
              </h2>
              <span className="text-[10px] tracking-[0.2em] text-neutral-700 tabular-nums shrink-0">
                {counts[thread.slug] ?? 0} entries
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-neutral-500 italic">
              {thread.editorNote.split('—')[0].trim()}
            </p>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-24 flex flex-col items-center gap-4">
        <Symbol size={18} className="text-neutral-800" />
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
