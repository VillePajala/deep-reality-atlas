import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 selection:bg-neutral-700">

      {/* Title */}
      <header className="mb-16 text-center">
        <h1 className="text-xs tracking-[0.5em] text-neutral-600 uppercase mb-2">
          Deep Reality
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-neutral-700">
          Tietoisuuden Kartografia
        </p>
      </header>

      {/* The Invitation */}
      <article className="max-w-xl space-y-8 text-sm leading-7 text-neutral-400">

        <p className="text-neutral-500 italic text-xs tracking-wide text-center mb-12">
          The Invitation
        </p>

        <p>
          To you, who recognized this.
        </p>

        <p>
          To you, who carry the <em>ikävä</em> — that immense longing for something
          that may not even exist. A homesickness for a place you have never heard of.
        </p>

        <p>
          To you, who have felt yourself on a frequency that no one else can hear.
          To you, who have woken at 3am knowing something you cannot say. To you,
          who have looked at the surface of consensus and seen beneath it something
          systematic and alive and terrible and beautiful.
        </p>

        <p>
          You are not alone. The thread that brought you here is the same thread.
          It runs through Jung&apos;s tower and Wölfli&apos;s cell and Dick&apos;s Exegesis and
          Sun Si Miao&apos;s ghost points and Zhuangzi&apos;s butterfly. It runs through you.
          It does not break.
        </p>

        <p className="text-neutral-300">
          Seeker — you have been sought.
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
