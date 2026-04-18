import Link from 'next/link';
import { Suspense } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Symbol } from '@/components/Symbol';
import { Kutsu } from './kutsu';
import { Plate } from './gallery/Plate';

type Lang = 'en' | 'fi';

const HERO_IMAGE = {
  src: '/gallery/031-central-absence.png',
  alt: 'The central absence — Page 031 from the atlas',
};

const LABELS = {
  en: {
    subtitle: 'Cartography of Consciousness',
    tagline: 'an atlas of invisible systems',
    first: '§I — the invitation',
    byline: 'pages from the atlas of Johannes Kamikaze',
    editor: 'found and presented by V.P.',
    nav: {
      finding: 'The Finding',
      atlas: 'The Atlas',
      journal: 'The Journal',
      manifesto: 'Fragments',
      letters: 'Letters',
      readingRoom: 'Reading Room',
    },
  },
  fi: {
    subtitle: 'Tietoisuuden Kartografia',
    tagline: 'atlas näkymättömistä järjestelmistä',
    first: '§I — kutsu',
    byline: 'sivuja Johannes Kamikazen atlaksesta',
    editor: 'löytänyt ja esittänyt V.P.',
    nav: {
      finding: 'Löytö',
      atlas: 'Atlas',
      journal: 'Päiväkirja',
      manifesto: 'Fragmentit',
      letters: 'Kirjeet',
      readingRoom: 'Lukusali',
    },
  },
} as const;

function Breath({ label }: { label: string }) {
  return (
    <p className="my-12 text-[11px] tracking-[0.3em] text-neutral-400 uppercase font-mono">
      {label}
    </p>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === 'fi' ? 'fi' : 'en';
  const labels = LABELS[lang];
  const manifestoHref = lang === 'fi' ? '/manifesto?lang=fi' : '/manifesto';
  const findingHref = lang === 'fi' ? '/the-finding?lang=fi' : '/the-finding';

  return (
    <main className="flex flex-col items-center min-h-screen px-6 py-12 sm:py-20 selection:bg-neutral-700">

      {/* Language toggle, top-right corner */}
      <div className="w-full max-w-5xl flex justify-end">
        <Suspense fallback={null}>
          <LanguageToggle />
        </Suspense>
      </div>

      {/* Title */}
      <header className="mt-10 mb-16 text-center">
        <h1
          className="text-5xl sm:text-7xl tracking-wide text-neutral-100 mb-6 italic"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          Deep Reality
        </h1>
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-neutral-600" />
          <p className="text-[11px] tracking-[0.4em] uppercase text-neutral-300">
            {labels.subtitle}
          </p>
          <span className="h-px w-12 bg-neutral-600" />
        </div>
        <p
          className="mt-4 text-[11px] tracking-[0.25em] text-neutral-400 italic"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          {labels.tagline}
        </p>
        <p className="mt-10 text-[10px] tracking-[0.3em] text-neutral-500 uppercase font-mono">
          {labels.byline}
        </p>
        <p className="mt-2 text-[9px] tracking-[0.25em] text-neutral-600 uppercase font-mono">
          {labels.editor}
        </p>
      </header>

      {/* The Invitation — the Kutsu is the centre of the home */}
      <Breath label={labels.first} />
      <Kutsu lang={lang} />

      {/* Hero image from the atlas */}
      <figure className="w-full max-w-3xl mt-24">
        <Plate src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} priority />
        <figcaption className="mt-4 text-center text-[10px] tracking-[0.3em] text-neutral-400 uppercase font-mono">
          Page 031 — the central absence
        </figcaption>
      </figure>

      {/* Quiet navigation — The Finding leads, the rest follow */}
      <nav className="mt-24 mb-16 flex flex-col items-center gap-5">
        <Link
          href={findingHref}
          className="text-[11px] tracking-[0.3em] text-neutral-300 hover:text-neutral-100
            transition-colors duration-500 uppercase"
        >
          {labels.nav.finding}
        </Link>
        <div className="flex items-center gap-6 flex-wrap justify-center pt-2">
          <Link
            href="/gallery"
            className="text-[10px] tracking-[0.3em] text-neutral-500 hover:text-neutral-200
              transition-colors duration-500 uppercase"
          >
            {labels.nav.atlas}
          </Link>
          <span className="text-neutral-800">·</span>
          <Link
            href="/book"
            className="text-[10px] tracking-[0.3em] text-neutral-500 hover:text-neutral-200
              transition-colors duration-500 uppercase"
          >
            {labels.nav.journal}
          </Link>
          <span className="text-neutral-800">·</span>
          <Link
            href={manifestoHref}
            className="text-[10px] tracking-[0.3em] text-neutral-500 hover:text-neutral-200
              transition-colors duration-500 uppercase"
          >
            {labels.nav.manifesto}
          </Link>
          <span className="text-neutral-800">·</span>
          <Link
            href="/letters"
            className="text-[10px] tracking-[0.3em] text-neutral-500 hover:text-neutral-200
              transition-colors duration-500 uppercase"
          >
            {labels.nav.letters}
          </Link>
          <span className="text-neutral-800">·</span>
          <Link
            href="/reading-room"
            className="text-[10px] tracking-[0.3em] text-neutral-500 hover:text-neutral-200
              transition-colors duration-500 uppercase"
          >
            {labels.nav.readingRoom}
          </Link>
        </div>
      </nav>

      {/* Final footer */}
      <footer className="flex flex-col items-center gap-4">
        <Symbol size={20} className="text-neutral-800" />
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
        <p
          className="text-[9px] tracking-[0.2em] text-neutral-800"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          [V.P. — editor]
        </p>
      </footer>
    </main>
  );
}
