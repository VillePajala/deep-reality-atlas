import Link from 'next/link';
import { getJournalEntries } from './entries';

export default function BookPage() {
  const entries = getJournalEntries();

  return (
    <main className="min-h-screen px-6 py-20 flex flex-col items-center">

      {/* Header — minimal */}
      <header className="mb-24 text-center">
        <Link
          href="/"
          className="text-xs tracking-[0.5em] text-neutral-700 hover:text-neutral-400
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
      </header>

      {/* The Book */}
      <div className="max-w-2xl w-full">

        {/* Preamble */}
        <p className="text-[10px] tracking-[0.25em] text-neutral-700 text-center mb-20">
          Found documents. Undated unless marked. Pages unnumbered. Author unknown.
        </p>

        {/* Entries */}
        <div className="space-y-20">
          {entries.map((entry, i) => (
            <article key={i} className="group">

              {/* Entry title */}
              {entry.title && (
                <p className="text-[10px] tracking-[0.2em] text-neutral-600 mb-6">
                  {entry.title}
                </p>
              )}

              {/* Entry body — split into paragraphs */}
              <div className="space-y-5">
                {entry.body.split('\n\n').map((paragraph, j) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  // Check if it's an ALL CAPS scream
                  const isScream = trimmed === trimmed.toUpperCase() && trimmed.length > 20 && !trimmed.startsWith('-');

                  // Check if it's a list (starts with -)
                  const isList = trimmed.startsWith('- ');

                  // Check if it's very short (one-liner / breath)
                  const isBreath = trimmed.length < 60 && !trimmed.includes('\n');

                  if (isList) {
                    return (
                      <div key={j} className="text-sm leading-7 text-neutral-500 pl-4">
                        {trimmed.split('\n').map((line, k) => (
                          <p key={k}>{line}</p>
                        ))}
                      </div>
                    );
                  }

                  if (isScream) {
                    return (
                      <p key={j} className="text-xs tracking-[0.15em] leading-7 text-neutral-400">
                        {trimmed}
                      </p>
                    );
                  }

                  if (isBreath) {
                    return (
                      <p key={j} className="text-base leading-8 text-neutral-500 italic">
                        {trimmed}
                      </p>
                    );
                  }

                  return (
                    <p key={j} className="text-base leading-8 text-neutral-500">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* Separator — thin line */}
              {i < entries.length - 1 && (
                <div className="mt-20 flex justify-center">
                  <div className="w-8 h-px bg-neutral-800" />
                </div>
              )}

            </article>
          ))}
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-32 text-center space-y-4">
        <nav className="flex gap-8 justify-center">
          <Link
            href="/atlas"
            className="text-[10px] tracking-[0.3em] text-neutral-700 hover:text-neutral-400
              transition-colors uppercase"
          >
            Enter the Atlas
          </Link>
          <Link
            href="/manifesto"
            className="text-[10px] tracking-[0.3em] text-neutral-700 hover:text-neutral-400
              transition-colors uppercase"
          >
            Manifesto
          </Link>
        </nav>
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
