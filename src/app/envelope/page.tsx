import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'envelope',
};

export default function EnvelopePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 selection:bg-neutral-700">

      <header className="mb-16 text-center">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
      </header>

      <article
        className="max-w-xl w-full flex flex-col items-center space-y-12"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {/* Sealed envelope — minimal line drawing */}
        <svg
          viewBox="0 0 180 120"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-64 h-auto text-neutral-500"
          aria-hidden
        >
          {/* envelope body */}
          <rect x="20" y="30" width="140" height="80" rx="1" />
          {/* flap triangle */}
          <path d="M 20 30 L 90 75 L 160 30" />
          {/* seal — a tiny circle at the apex */}
          <circle cx="90" cy="75" r="3" fill="currentColor" stroke="none" />
          {/* faint crease */}
          <line x1="20" y1="30" x2="90" y2="75" className="opacity-40" />
          <line x1="160" y1="30" x2="90" y2="75" className="opacity-40" />
        </svg>

        <p className="text-[10px] tracking-[0.4em] text-neutral-500 uppercase">
          do not open
        </p>

        <p className="max-w-sm text-sm leading-7 italic text-neutral-600 text-center">
          Found in the drawer with the needles. The seal is intact. I
          have not opened it. I photographed the seal and have reproduced
          it above.
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
