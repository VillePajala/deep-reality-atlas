import Link from 'next/link';
import type { Metadata } from 'next';
import { Symbol } from '@/components/Symbol';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: '§74',
};

export default function Page074() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 selection:bg-neutral-700">

      {/* Header */}
      <header className="mb-16 text-center">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
      </header>

      {/* The fragment */}
      <article
        className="max-w-xl w-full space-y-8"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        <p className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase text-center">
          §74
        </p>

        <p className="text-sm leading-7 italic text-neutral-500">
          What follows is the only text in the archive that bears this
          number in Kamikaze&apos;s hand. I have included it without
          certainty that it is the seventy-fourth entry. The paper is
          unlike the others — lighter, thinner, a single sheet. It was
          folded in four.
          <br />
          — V.P.
        </p>

        <div className="flex items-center justify-center gap-4 py-4">
          <span className="h-px w-8 bg-neutral-700" />
          <Symbol size={14} className="text-neutral-700" />
          <span className="h-px w-8 bg-neutral-700" />
        </div>

        <p className="text-base sm:text-lg leading-8 text-neutral-300">
          What is the word for the space between the thought and the
          first word of the thought?
        </p>

        <p className="text-base sm:text-lg leading-8 text-neutral-300">
          There is no word. There is only the space.
        </p>

        <p className="text-base sm:text-lg leading-8 text-neutral-400 italic pt-6">
          Everything I have written is a translation from this space.
          The translation is always late.
        </p>
      </article>

      {/* Footer */}
      <footer className="mt-24 flex flex-col items-center gap-4">
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
