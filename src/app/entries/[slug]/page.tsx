import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getJournalEntries,
  getEntryBySlug,
  getEntryNeighbours,
} from '@/app/book/entries';
import { Plate } from '@/app/gallery/Plate';
import { getRelatedEntries } from '@/app/threads/threads';

/**
 * Thematic pairings between specific journal entries and atlas plates.
 * Match on entry.title. The paired plate renders inline above the entry body.
 * Keys are exact title strings.
 */
const ENTRY_PLATE_PAIRS: Record<string, { src: string; caption: string }> = {
  '3:22am': {
    src: '/gallery/217-thinking-web.png',
    caption: 'Page 217 — the thinking web',
  },
  '4:11am': {
    src: '/gallery/094-thing-that-watched-back.png',
    caption: 'Page 094 — the thing that watched back',
  },
  'on ego death': {
    src: '/gallery/031-central-absence.png',
    caption: 'Page 031 — the central absence',
  },
  'on the dead': {
    src: '/gallery/143-eye-that-reads-back.png',
    caption: 'Page 143 — the eye that reads back',
  },
  'entry — the wire in the wall': {
    src: '/gallery/127-apparatus-breathing.png',
    caption: 'Page 127 — the apparatus breathing',
  },
};

export async function generateStaticParams() {
  const entries = getJournalEntries();
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) return { title: 'Entry not found — Deep Reality Atlas' };
  const title = entry.title || `Entry §${entry.index + 1}`;
  return {
    title: `${title} — Deep Reality Atlas`,
    description: entry.body.slice(0, 160),
  };
}

function renderParagraph(text: string, key: number) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const isScream =
    trimmed === trimmed.toUpperCase() &&
    trimmed.length > 20 &&
    !trimmed.startsWith('-');
  const isList = trimmed.startsWith('- ');
  const isBreath = trimmed.length < 60 && !trimmed.includes('\n');

  if (isList) {
    return (
      <div
        key={key}
        className="text-base leading-8 text-neutral-400 pl-4 font-mono"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {trimmed.split('\n').map((line, k) => (
          <p key={k}>{line}</p>
        ))}
      </div>
    );
  }

  if (isScream) {
    return (
      <p
        key={key}
        className="text-sm tracking-[0.15em] leading-7 text-neutral-300"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {trimmed}
      </p>
    );
  }

  if (isBreath) {
    return (
      <p key={key} className="text-lg leading-8 text-neutral-400 italic">
        {trimmed}
      </p>
    );
  }

  return (
    <p key={key} className="text-lg leading-8 text-neutral-300">
      {trimmed}
    </p>
  );
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) notFound();

  const { prev, next } = getEntryNeighbours(slug);

  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center selection:bg-neutral-700">

      {/* Header */}
      <header className="mb-16 text-center w-full max-w-2xl">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-neutral-700 mt-2 uppercase font-mono">
          the journal — entry §{entry.index + 1} of {getJournalEntries().length}
        </p>
      </header>

      {/* Entry */}
      <article className="max-w-2xl w-full">
        {entry.title && (
          <p
            className="text-[11px] tracking-[0.25em] text-neutral-500 mb-8 uppercase font-mono"
          >
            {entry.title}
          </p>
        )}

        {/* Paired plate, when this entry has one */}
        {ENTRY_PLATE_PAIRS[entry.title] && (
          <figure className="mb-10">
            <Plate
              src={ENTRY_PLATE_PAIRS[entry.title].src}
              alt={ENTRY_PLATE_PAIRS[entry.title].caption}
            />
            <figcaption className="mt-3 text-[10px] tracking-[0.3em] text-neutral-500 uppercase text-center font-mono">
              {ENTRY_PLATE_PAIRS[entry.title].caption}
            </figcaption>
          </figure>
        )}

        <div
          className="space-y-6"
          style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        >
          {entry.body.split('\n\n').map((p, i) => renderParagraph(p, i))}
        </div>
      </article>

      {/* Related entries — thematic siblings in the archive */}
      {(() => {
        const related = getRelatedEntries(entry, 3);
        if (related.length === 0) return null;
        return (
          <section className="mt-24 w-full max-w-2xl">
            <p className="text-[10px] tracking-[0.3em] text-neutral-600 uppercase font-mono mb-4 text-center">
              nearby in the archive
            </p>
            <ul className="space-y-2 font-mono">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/entries/${r.slug}`}
                    className="group flex items-baseline gap-4 py-2 px-3 border-b border-neutral-900
                      hover:border-neutral-700 transition-colors"
                  >
                    <span className="text-[10px] tracking-[0.2em] text-neutral-700 w-10 shrink-0 tabular-nums">
                      §{String(r.index + 1).padStart(3, '0')}
                    </span>
                    <span className="text-sm text-neutral-500 group-hover:text-neutral-200 transition-colors">
                      {r.title || <em className="text-neutral-700">(untitled)</em>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {/* Neighbour navigation */}
      <nav className="mt-16 w-full max-w-2xl flex items-stretch justify-between gap-4 font-mono">
        {prev ? (
          <Link
            href={`/entries/${prev.slug}`}
            className="flex-1 p-4 border border-neutral-800 hover:border-neutral-500
              transition-colors text-left group"
          >
            <p className="text-[9px] tracking-[0.3em] text-neutral-700 uppercase mb-1">
              ← previous
            </p>
            <p className="text-[11px] text-neutral-500 group-hover:text-neutral-300
              transition-colors truncate">
              {prev.title || `§${prev.index + 1}`}
            </p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        <Link
          href="/entries"
          className="px-4 py-4 border border-neutral-800 hover:border-neutral-500
            text-[10px] tracking-[0.3em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase flex items-center"
        >
          index
        </Link>
        {next ? (
          <Link
            href={`/entries/${next.slug}`}
            className="flex-1 p-4 border border-neutral-800 hover:border-neutral-500
              transition-colors text-right group"
          >
            <p className="text-[9px] tracking-[0.3em] text-neutral-700 uppercase mb-1">
              next →
            </p>
            <p className="text-[11px] text-neutral-500 group-hover:text-neutral-300
              transition-colors truncate">
              {next.title || `§${next.index + 1}`}
            </p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>

      {/* Footer */}
      <footer className="mt-20 text-center">
        <Link
          href="/book"
          className="text-[10px] tracking-[0.3em] text-neutral-600 hover:text-neutral-300 transition-colors uppercase"
        >
          Read all entries →
        </Link>
        <p className="text-[9px] tracking-[0.3em] text-neutral-800 mt-6">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
