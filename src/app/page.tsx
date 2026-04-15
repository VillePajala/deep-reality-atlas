import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 selection:bg-neutral-700">

      {/* Title */}
      <header className="mb-20 text-center">
        <h1 className="text-2xl sm:text-3xl tracking-[0.5em] text-neutral-400 uppercase mb-3">
          Deep Reality
        </h1>
        <p className="text-xs tracking-[0.3em] text-neutral-600">
          Tietoisuuden Kartografia
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

      {/* Enter the Atlas */}
      <nav className="mt-20 flex flex-col items-center gap-6">
        <Link
          href="/atlas"
          className="group px-8 py-3 border border-neutral-800 hover:border-neutral-500
            text-xs tracking-[0.4em] text-neutral-600 hover:text-neutral-300
            transition-all duration-500 uppercase"
        >
          Enter the Atlas
        </Link>
        <Link
          href="/gallery"
          className="text-[10px] tracking-[0.3em] text-neutral-700 hover:text-neutral-400
            transition-colors duration-500"
        >
          Gallery
        </Link>
        <Link
          href="/book"
          className="text-[10px] tracking-[0.3em] text-neutral-700 hover:text-neutral-400
            transition-colors duration-500"
        >
          The Journal
        </Link>
        <Link
          href="/manifesto"
          className="text-[10px] tracking-[0.3em] text-neutral-700 hover:text-neutral-400
            transition-colors duration-500"
        >
          Read the Manifesto
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
