import Link from 'next/link';
import { getJournalEntries } from '@/app/book/entries';

export const metadata = {
  title: 'The Journal — Index — Deep Reality Atlas',
  description: 'Complete index of journal entries from the Holy Book of Insanity.',
};

export default function EntriesIndexPage() {
  const entries = getJournalEntries();

  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center selection:bg-neutral-700">

      <header className="mb-16 text-center">
        <Link
          href="/"
          className="text-xs tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <h1
          className="mt-6 text-3xl sm:text-4xl text-neutral-200 italic"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          The Journal — Index
        </h1>
        <p className="mt-3 text-[10px] tracking-[0.3em] text-neutral-600 uppercase font-mono">
          {entries.length} entries
        </p>
        <p
          className="mt-6 max-w-xl text-sm text-neutral-500 italic leading-7"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          Every entry has a permanent address. Flip through the complete journal
          in the reading room, or jump to any single entry below.
        </p>
        <p className="mt-6">
          <Link
            href="/book"
            className="text-[11px] tracking-[0.3em] text-neutral-400 hover:text-neutral-200
              underline underline-offset-4 uppercase transition-colors"
          >
            Reading room — flip through ↓
          </Link>
        </p>
      </header>

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

      <footer className="mt-24 text-center">
        <Link
          href="/"
          className="text-[10px] tracking-[0.3em] text-neutral-600 hover:text-neutral-300 transition-colors uppercase"
        >
          ← home
        </Link>
        <p className="text-[9px] tracking-[0.3em] text-neutral-800 mt-6">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
