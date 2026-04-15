'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import type { JournalEntry } from './entries';

const ENTRIES_PER_PAGE = 3;

interface BookViewerProps {
  entries: JournalEntry[];
}

export default function BookViewer({ entries }: BookViewerProps) {
  const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
  const [page, setPage] = useState(0);

  const currentEntries = entries.slice(
    page * ENTRIES_PER_PAGE,
    (page + 1) * ENTRIES_PER_PAGE
  );

  const goNext = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goRandom = useCallback(() => {
    let next = Math.floor(Math.random() * totalPages);
    // avoid landing on the same page
    while (next === page && totalPages > 1) {
      next = Math.floor(Math.random() * totalPages);
    }
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'r' || e.key === 'R') {
        goRandom();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, goRandom]);

  return (
    <main className="min-h-screen px-6 py-20 flex flex-col items-center selection:bg-neutral-700">

      {/* Header */}
      <header className="mb-20 text-center">
        <Link
          href="/"
          className="text-xs tracking-[0.5em] text-neutral-700 hover:text-neutral-400
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
      </header>

      {/* Preamble — only on first page */}
      {page === 0 && (
        <p className="text-[10px] tracking-[0.25em] text-neutral-700 text-center mb-20 max-w-lg">
          Found documents. Undated unless marked. Pages unnumbered. Author unknown.
        </p>
      )}

      {/* Entries */}
      <div className="max-w-2xl w-full space-y-20 min-h-[60vh]">
        {currentEntries.map((entry, i) => (
          <article key={`${page}-${i}`}>

            {/* Entry title */}
            {entry.title && (
              <p className="text-[10px] tracking-[0.2em] text-neutral-600 mb-6">
                {entry.title}
              </p>
            )}

            {/* Entry body */}
            <div className="space-y-5">
              {entry.body.split('\n\n').map((paragraph, j) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                const isScream = trimmed === trimmed.toUpperCase() && trimmed.length > 20 && !trimmed.startsWith('-');
                const isList = trimmed.startsWith('- ');
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

            {/* Separator between entries on same page */}
            {i < currentEntries.length - 1 && (
              <div className="mt-20 flex justify-center">
                <div className="w-8 h-px bg-neutral-800" />
              </div>
            )}

          </article>
        ))}
      </div>

      {/* Navigation */}
      <nav className="mt-20 flex items-center gap-6 font-mono text-xs text-neutral-600">
        <button
          onClick={goPrev}
          disabled={page === 0}
          className="px-4 py-2 border border-neutral-800 hover:border-neutral-500 hover:text-neutral-300
            transition-all disabled:opacity-20 disabled:hover:border-neutral-800 disabled:hover:text-neutral-600
            disabled:cursor-default tracking-widest"
        >
          ←
        </button>

        <button
          onClick={goRandom}
          className="px-6 py-2 border border-neutral-800 hover:border-neutral-500 hover:text-neutral-300
            transition-all tracking-[0.3em] uppercase text-[10px]"
        >
          Random page
        </button>

        <button
          onClick={goNext}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 border border-neutral-800 hover:border-neutral-500 hover:text-neutral-300
            transition-all disabled:opacity-20 disabled:hover:border-neutral-800 disabled:hover:text-neutral-600
            disabled:cursor-default tracking-widest"
        >
          →
        </button>
      </nav>

      {/* Page indicator */}
      <p className="mt-4 text-[9px] tracking-[0.3em] text-neutral-800">
        §{page + 1} / {totalPages}
      </p>

      {/* Footer */}
      <footer className="mt-16 text-center space-y-4">
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
