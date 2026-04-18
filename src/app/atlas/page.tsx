import Link from 'next/link';
import type { Metadata } from 'next';
import AtlasViewer from '../components/AtlasViewer';

export const metadata: Metadata = {
  title: 'The instrument',
  robots: { index: false, follow: false },
};

export default function AtlasPage() {
  return (
    <main className="flex flex-col items-center min-h-screen px-4">
      {/* Header */}
      <header className="w-full flex flex-col items-center pt-8 pb-4 max-w-3xl">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-neutral-500 mt-2 uppercase font-mono">
          The instrument — reconstruction
        </p>

        {/* V.P.'s note framing the generator as editorial apparatus */}
        <p
          className="max-w-xl text-sm leading-7 italic text-neutral-600 text-center mt-8"
          style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        >
          Kamikaze appears to have drawn with an instrument he described
          variously as &ldquo;the generator,&rdquo; &ldquo;the procedure,&rdquo;
          and once &ldquo;the thing that pages the hand.&rdquo; No such
          device survived in the archive. What follows is my best
          reconstruction, in code, of what that instrument may have been.
          It produces images; it is not the original.
          <br />
          <span className="not-italic">— V.P.</span>
        </p>
      </header>

      {/* The reconstructed instrument */}
      <div className="flex-1 w-full max-w-5xl flex items-start justify-center mt-4">
        <AtlasViewer />
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center">
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
