import Link from 'next/link';
import { galleryImages } from './images';

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
          The Gallery
        </h1>
        <p className="mt-3 text-[10px] tracking-[0.3em] text-neutral-400 uppercase font-mono">
          Plates I–IX
        </p>
        <p
          className="mt-6 max-w-xl text-sm text-neutral-500 italic leading-7"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          Pages from the atlas, paired with fragments of the journal that accompanies them.
          The images are evidence; the text is what the evidence is evidence of.
        </p>
      </header>

      {galleryImages.length === 0 ? (
        <p className="text-neutral-600 text-sm">No plates yet.</p>
      ) : (
        <div className="w-full max-w-4xl space-y-32">
          {galleryImages.map((img) => (
            <article key={img.src} className="flex flex-col items-center">

              {/* Plate label */}
              <p className="text-[10px] tracking-[0.4em] text-neutral-400 uppercase mb-6 font-mono">
                {img.plate}
              </p>

              {/* Image */}
              <a
                href={img.src}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full border border-neutral-800 hover:border-neutral-500
                    transition-colors cursor-zoom-in"
                />
              </a>

              {/* Caption */}
              <div className="mt-10 max-w-2xl text-center space-y-6">
                <h2
                  className="text-2xl text-neutral-200 italic"
                  style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
                >
                  {img.title}
                </h2>
                <p
                  className="text-base text-neutral-300 leading-7 font-mono"
                  style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                >
                  {img.descriptor}
                </p>

                {/* Quote — mono, the journal voice */}
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
                  <p className="mt-3 text-[10px] tracking-[0.25em] text-neutral-500 uppercase">
                    — {img.quoteSource}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <footer className="mt-32 text-center space-y-4">
        <nav className="flex gap-8 justify-center">
          <Link href="/gallery-2" className="text-[10px] tracking-[0.3em] text-neutral-400 hover:text-neutral-100 transition-colors uppercase">
            Gallery II
          </Link>
          <Link href="/book" className="text-[10px] tracking-[0.3em] text-neutral-400 hover:text-neutral-100 transition-colors uppercase">
            The Journal
          </Link>
          <Link href="/manifesto" className="text-[10px] tracking-[0.3em] text-neutral-400 hover:text-neutral-100 transition-colors uppercase">
            Manifesto
          </Link>
        </nav>
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
        <p className="pt-6">
          <Link
            href="/atlas"
            className="text-[9px] tracking-[0.25em] text-neutral-800 hover:text-neutral-500 transition-colors italic"
          >
            (the instrument — real-time generator)
          </Link>
        </p>
      </footer>
    </main>
  );
}
