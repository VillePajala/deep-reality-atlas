import Link from 'next/link';
import { Suspense } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ManifestoContentEN } from './content-en';
import { ManifestoContentFI } from './content-fi';

type Lang = 'en' | 'fi';

export default async function ManifestoPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === 'fi' ? 'fi' : 'en';

  const label = lang === 'fi' ? 'Manifesti' : 'Manifesto';

  return (
    <main className="flex flex-col items-center min-h-screen px-6 py-16">

      {/* Header */}
      <header className="mb-16 text-center relative w-full max-w-xl">
        <Link
          href="/"
          className="text-xs tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-neutral-700 mt-2 uppercase">
          {label}
        </p>
        <div className="absolute top-0 right-0">
          <Suspense fallback={null}>
            <LanguageToggle />
          </Suspense>
        </div>
      </header>

      {/* Bilingual content */}
      {lang === 'fi' ? <ManifestoContentFI /> : <ManifestoContentEN />}

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
