import Link from 'next/link';
import { Suspense } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Symbol } from '@/components/Symbol';
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

  const label = lang === 'fi' ? 'Fragmentit — Atlaksen viereltä' : 'Fragments — Notes beside the Atlas';

  return (
    <main className="flex flex-col items-center min-h-screen px-6 py-16">

      {/* Header */}
      <header className="mb-16 flex flex-col items-center relative w-full max-w-xl">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-neutral-500 mt-2 uppercase">
          {label}
        </p>
        <Symbol size={16} className="text-neutral-700 mt-6" />
        <div className="absolute top-0 right-0">
          <Suspense fallback={null}>
            <LanguageToggle />
          </Suspense>
        </div>
      </header>

      {/* Bilingual content */}
      {lang === 'fi' ? <ManifestoContentFI /> : <ManifestoContentEN />}

      {/* Footer */}
      <footer className="mt-24 flex flex-col items-center gap-3">
        <Symbol size={18} className="text-neutral-800" />
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
