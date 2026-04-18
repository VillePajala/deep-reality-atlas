import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'the sweater',
};

export default function TheSweaterPage() {
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
        className="max-w-lg w-full flex flex-col items-center space-y-10 text-center"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        <p className="text-base sm:text-lg leading-8 text-neutral-300">
          The sweater is nearly done.
        </p>

        <p className="text-base sm:text-lg leading-8 text-neutral-300">
          I do not know who will wear it.
        </p>

        <div className="h-px w-16 bg-neutral-700 my-4" />

        <p className="max-w-sm text-sm leading-7 italic text-neutral-600">
          Two lines in Kamikaze&apos;s hand, on the back of a torn piece
          of card. The card has no other text. I include it because
          Kamikaze appears to have kept it. — V.P.
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
