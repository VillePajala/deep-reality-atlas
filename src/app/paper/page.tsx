import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'paper',
};

export default function PaperPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 selection:bg-neutral-700">

      <header className="mb-20 text-center">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
      </header>

      <article
        className="max-w-lg w-full flex flex-col items-center space-y-12 text-center"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {/* The unknown glyph — not the recurring symbol */}
        <svg
          viewBox="0 0 100 120"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-32 h-auto text-neutral-300"
          aria-hidden
        >
          {/* small serif mark at top */}
          <circle cx="50" cy="12" r="1.5" fill="currentColor" stroke="none" />
          {/* vertical stem */}
          <path d="M 50 18 L 50 88" />
          {/* horizontal crossbar, upper */}
          <path d="M 28 36 Q 50 32 72 36" />
          {/* second bar, short */}
          <path d="M 38 52 L 62 52" />
          {/* spiral-like terminus at bottom-right */}
          <path d="M 50 68 Q 68 72 68 84 Q 56 90 52 82 Q 52 76 62 76" />
          {/* small descending tail to lower-left */}
          <path d="M 50 88 Q 42 98 34 108" />
        </svg>

        <p className="max-w-sm text-sm leading-7 italic text-neutral-600">
          A single mark on a small piece of paper, folded four times,
          found in the drawer beside the envelope. The paper is older
          than anything else in the archive. I cannot read it. I
          reproduce it here for the reader who may.
          <br />
          — V.P.
        </p>
      </article>

      <footer className="mt-24 text-center">
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
