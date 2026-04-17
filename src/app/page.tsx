import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 selection:bg-neutral-700">

      {/* Title — book cover weight */}
      <header className="mb-24 text-center">
        <h1
          className="text-5xl sm:text-7xl tracking-wide text-neutral-200 mb-6 italic"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          Deep Reality
        </h1>
        <div className="flex items-center justify-center gap-4 text-neutral-600">
          <span className="h-px w-12 bg-neutral-700" />
          <p className="text-[11px] tracking-[0.4em] uppercase">
            Tietoisuuden Kartografia
          </p>
          <span className="h-px w-12 bg-neutral-700" />
        </div>
        <p className="mt-4 text-[10px] tracking-[0.25em] text-neutral-700 italic">
          an atlas of invisible systems
        </p>
      </header>

      {/* The Invitation */}
      <article className="max-w-2xl space-y-8 text-base sm:text-lg leading-8 sm:leading-9 text-neutral-400">

        <p>
          To you, who have felt yourself on a frequency that no one else can hear.
          To you, who have woken at 3am knowing something you cannot say. To you,
          who have seen the surface for what it is, a fragile and desperate layer.
          You have seen beneath it something systematic and chaotic and alive and
          horrifying and beautiful.
        </p>

        <p>
          Something is wrong with the surface, and you have always known it. You sense
          the signal bleeding through. You don&apos;t know what it is. You don&apos;t know if
          it&apos;s alive or dead. You have been tuning toward it your whole life, and you
          cannot tune away. It might be an invitation. A warning. Or just Śūnyatā,
          the great nothing.
        </p>

        <p className="text-neutral-600 italic">
          Hic sunt dracones. Come. To where the dragons are.
        </p>

      </article>

      {/* Three reading destinations — journal, manifesto, gallery */}
      <nav className="mt-20 flex flex-col items-center gap-5">
        <Link
          href="/book"
          className="group px-8 py-3 border border-neutral-800 hover:border-neutral-500
            text-xs tracking-[0.4em] text-neutral-500 hover:text-neutral-200
            transition-all duration-500 uppercase"
        >
          The Journal
        </Link>
        <Link
          href="/manifesto"
          className="text-[11px] tracking-[0.3em] text-neutral-600 hover:text-neutral-300
            transition-colors duration-500 uppercase"
        >
          Read the Manifesto
        </Link>
        <Link
          href="/gallery"
          className="text-[11px] tracking-[0.3em] text-neutral-600 hover:text-neutral-300
            transition-colors duration-500 uppercase"
        >
          Gallery
        </Link>
      </nav>

      {/* Footer */}
      <footer className="mt-24 text-center">
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
        <p className="text-[8px] tracking-[0.2em] text-neutral-800 mt-2">
          Ville Johannes Pajala — Helsinki, 2026
        </p>
      </footer>
    </main>
  );
}
