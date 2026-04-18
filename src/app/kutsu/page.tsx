import Link from 'next/link';
import { Suspense } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Symbol } from '@/components/Symbol';
import { Kutsu } from '../kutsu';

type Lang = 'en' | 'fi';

export default async function KutsuPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === 'fi' ? 'fi' : 'en';

  return (
    <main className="flex flex-col items-center min-h-screen px-6 py-16 selection:bg-neutral-700">

      {/* Header */}
      <header className="mb-16 text-center relative w-full max-w-xl">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-neutral-500 mt-2 uppercase font-mono">
          {lang === 'fi' ? 'Kutsu — yksi arkiston vedoksista' : 'Kutsu — one of the invitation drafts'}
        </p>
        <div className="absolute top-0 right-0">
          <Suspense fallback={null}>
            <LanguageToggle />
          </Suspense>
        </div>
      </header>

      {/* Editor's note */}
      <p
        className="max-w-lg text-sm leading-7 italic text-neutral-600 text-center mb-16"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {lang === 'fi'
          ? 'Useita vedoksia kutsusta oli arkistossa. Eri vedos esitetään eri päivänä. — V.P.'
          : 'Several invitation drafts were found among the papers. A different draft is shown on different days. — V.P.'}
      </p>

      {/* The Kutsu itself (rotated by day-of-year) */}
      <Kutsu lang={lang} />

      {/* Footer */}
      <footer className="mt-24 flex flex-col items-center gap-4">
        <Symbol size={18} className="text-neutral-800" />
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
