import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Symbol } from '@/components/Symbol';
import { THREADS, getThreadBySlug, getEntriesForThread } from '../threads';

export async function generateStaticParams() {
  return THREADS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const thread = getThreadBySlug(slug);
  if (!thread) return { title: 'Thread not found' };
  return {
    title: `${thread.title} — Threads`,
    description: thread.editorNote.split('—')[0].trim(),
  };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const thread = getThreadBySlug(slug);
  if (!thread) notFound();

  const entries = getEntriesForThread(slug);

  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center selection:bg-neutral-700">

      {/* Header */}
      <header className="mb-12 text-center max-w-2xl">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="mt-2 text-[10px] tracking-[0.3em] text-neutral-500 uppercase font-mono">
          thread
        </p>
        <h1
          className="mt-6 text-3xl sm:text-4xl text-neutral-200 italic"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          {thread.title}
        </h1>
        <p className="mt-2 text-[10px] tracking-[0.2em] text-neutral-700 uppercase font-mono">
          {entries.length} entries
        </p>

        <p
          className="mt-8 text-sm leading-7 italic text-neutral-500 text-left"
          style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        >
          {thread.editorNote}
        </p>
      </header>

      {/* Entry list */}
      {entries.length === 0 ? (
        <p className="text-neutral-600 text-sm font-mono">
          No entries yet match this thread.
        </p>
      ) : (
        <ol className="w-full max-w-2xl space-y-3 font-mono">
          {entries.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/entries/${entry.slug}`}
                className="group flex items-baseline gap-4 py-3 px-4 border-b border-neutral-900
                  hover:border-neutral-600 hover:bg-neutral-900/40 transition-colors"
              >
                <span className="text-[10px] tracking-[0.2em] text-neutral-700 w-10 shrink-0 tabular-nums">
                  §{String(entry.index + 1).padStart(3, '0')}
                </span>
                <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">
                  {entry.title || <em className="text-neutral-700">(untitled)</em>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {/* Navigation */}
      <nav className="mt-16 flex items-center gap-6 text-[10px] tracking-[0.3em] uppercase font-mono">
        <Link href="/threads" className="text-neutral-500 hover:text-neutral-200 transition-colors">
          all threads
        </Link>
        <span className="text-neutral-800">·</span>
        <Link href="/entries" className="text-neutral-500 hover:text-neutral-200 transition-colors">
          full index
        </Link>
      </nav>

      {/* Footer */}
      <footer className="mt-16 flex flex-col items-center gap-4">
        <Symbol size={18} className="text-neutral-800" />
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
