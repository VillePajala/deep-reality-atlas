import Link from 'next/link';
import { galleryImages } from './images';
import { Plate } from './Plate';
import { Symbol } from '@/components/Symbol';
import { getEntryByTitle } from '@/app/book/entries';
import { getThreadBySlug } from '@/app/threads/threads';

export default function GalleryPage() {
  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center">

      {/* Header */}
      <header className="mb-16 text-center">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <h1
          className="mt-6 text-3xl sm:text-4xl text-neutral-200 italic"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          The Atlas
        </h1>
        <p className="mt-3 text-[10px] tracking-[0.3em] text-neutral-400 uppercase font-mono">
          Sixteen plates
        </p>
        <p
          className="mt-6 max-w-xl text-sm text-neutral-500 italic leading-7"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          The descriptions below are my readings of the plates. The quoted
          passages are Kamikaze&apos;s, drawn from the journal where a thematic
          pairing seemed unmistakable. Where a pairing is specific the quote
          links to its entry. — V.P.
        </p>
      </header>

      {galleryImages.length === 0 ? (
        <p className="text-neutral-600 text-sm">No plates yet.</p>
      ) : (
        <div className="w-full max-w-4xl space-y-32">
          {galleryImages.map((img, i) => {
            const pairedEntry = img.pairedEntryTitle
              ? getEntryByTitle(img.pairedEntryTitle)
              : null;
            const relatedThread = img.relatedThreadSlug
              ? getThreadBySlug(img.relatedThreadSlug)
              : null;

            return (
              <article key={img.src} className="flex flex-col items-center">

                {/* Plate label */}
                <p className="text-[10px] tracking-[0.4em] text-neutral-400 uppercase mb-6 font-mono">
                  {img.plate}
                </p>

                {/* Image — client-side fade-in, no progressive paint visible */}
                <Plate src={img.src} alt={img.title} priority={i === 0} />

                {/* Caption */}
                <div className="mt-10 max-w-2xl text-center space-y-6">
                  <h2
                    className="text-2xl text-neutral-200 italic"
                    style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
                  >
                    {img.title}
                  </h2>
                  <p
                    className="text-base text-neutral-300 leading-7 font-mono italic"
                    style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                  >
                    {img.descriptor}
                  </p>

                  {/* Quote — Kamikaze's voice */}
                  <div className="pt-4">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span className="h-px w-8 bg-neutral-600" />
                      <span className="text-[9px] tracking-[0.3em] text-neutral-400 uppercase font-mono">
                        paired entry
                      </span>
                      <span className="h-px w-8 bg-neutral-600" />
                    </div>
                    <blockquote
                      className="text-base text-neutral-300 leading-7 px-6 font-mono"
                      style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                    >
                      &ldquo;{img.quote}&rdquo;
                    </blockquote>
                    <p className="mt-3 text-[10px] tracking-[0.25em] text-neutral-500 uppercase font-mono">
                      — {pairedEntry ? (
                        <Link
                          href={`/entries/${pairedEntry.slug}`}
                          className="underline decoration-dotted underline-offset-4 hover:text-neutral-300 transition-colors"
                        >
                          {img.quoteSource}
                        </Link>
                      ) : (
                        img.quoteSource
                      )}
                    </p>

                    {relatedThread && (
                      <p className="mt-4 text-[9px] tracking-[0.3em] text-neutral-600 uppercase font-mono">
                        thread:{' '}
                        <Link
                          href={`/threads/${relatedThread.slug}`}
                          className="underline decoration-dotted underline-offset-4 hover:text-neutral-300 transition-colors"
                        >
                          {relatedThread.title}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <footer className="mt-32 flex flex-col items-center gap-4">
        <Symbol size={18} className="text-neutral-800" />
        <nav className="flex gap-8 justify-center">
          <Link href="/book" className="text-[10px] tracking-[0.3em] text-neutral-400 hover:text-neutral-100 transition-colors uppercase">
            The Journal
          </Link>
          <Link href="/manifesto" className="text-[10px] tracking-[0.3em] text-neutral-400 hover:text-neutral-100 transition-colors uppercase">
            Fragments
          </Link>
          <Link href="/letters" className="text-[10px] tracking-[0.3em] text-neutral-400 hover:text-neutral-100 transition-colors uppercase">
            Letters
          </Link>
        </nav>
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
        <p className="pt-2">
          <Link
            href="/atlas"
            className="text-[9px] tracking-[0.25em] text-neutral-800 hover:text-neutral-500 transition-colors italic"
          >
            (the instrument — V.P.&apos;s reconstruction)
          </Link>
        </p>
      </footer>
    </main>
  );
}
