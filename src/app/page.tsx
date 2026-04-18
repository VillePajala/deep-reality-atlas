import Link from 'next/link';
import { Suspense } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Symbol } from '@/components/Symbol';
import { Plate } from './gallery/Plate';
import { getJournalEntries } from './book/entries';
import { galleryImages } from './gallery/images';

type Lang = 'en' | 'fi';

const HERO_IMAGE = {
  src: '/gallery/031-central-absence.png',
  alt: 'The central absence — Page 031 from the atlas',
};

const LABELS = {
  en: {
    subtitle: 'Cartography of Consciousness',
    tagline: 'an atlas of invisible systems',
    byline: 'pages from the atlas of Johannes Kamikaze',
    editor: 'found and presented by V.P.',
    orientation: {
      p1: 'What follows was found, not composed.',
      p2: 'Drawings, pages, letters, an instrument. None of it finished. Most of it undated. I have preserved what I could read and present it here without resolving what it is.',
      p3: 'Begin wherever you like.',
      sig: '— V.P.',
    },
    fragment: 'the first cup of coffee remembers the last one.',
    nav: {
      finding: 'The Finding',
      atlas: 'The Atlas',
      journal: 'The Journal',
      entries: 'Index',
      manifesto: 'Fragments',
      letters: 'Letters',
      readingRoom: 'Reading Room',
      kutsu: 'The Invitation',
      threads: 'Threads',
    },
    scaleNote: (j: number, p: number, l: number) =>
      `${j} entries · ${p} plates · ${l} letters · 36 fragments`,
  },
  fi: {
    subtitle: 'Tietoisuuden Kartografia',
    tagline: 'atlas näkymättömistä järjestelmistä',
    byline: 'sivuja Johannes Kamikazen atlaksesta',
    editor: 'löytänyt ja esittänyt V.P.',
    orientation: {
      p1: 'Seuraava on löydettyä, ei sävellettyä.',
      p2: 'Piirroksia, sivuja, kirjeitä, yksi kone. Mikään niistä ei ole valmis. Suurin osa on päiväämättömiä. Olen säilyttänyt mitä pystyin lukemaan ja esitän ne tässä ratkaisematta mitä ne ovat.',
      p3: 'Aloita mistä haluat.',
      sig: '— V.P.',
    },
    fragment: 'the first cup of coffee remembers the last one.',
    nav: {
      finding: 'Löytö',
      atlas: 'Atlas',
      journal: 'Päiväkirja',
      entries: 'Hakemisto',
      manifesto: 'Fragmentit',
      letters: 'Kirjeet',
      readingRoom: 'Lukusali',
      kutsu: 'Kutsu',
      threads: 'Juonteet',
    },
    scaleNote: (j: number, p: number, l: number) =>
      `${j} merkintää · ${p} laattaa · ${l} kirjettä · 36 fragmenttia`,
  },
} as const;

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
  const kutsuHref = lang === 'fi' ? '/kutsu?lang=fi' : '/kutsu';

  const entryCount = getJournalEntries().length;
  const plateCount = galleryImages.length;
  const letterCount = 3;

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

      {/* Editor's brief orientation — V.P.'s voice */}
      <section
        className="max-w-xl text-center space-y-5 mb-20"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        <p className="text-base sm:text-lg leading-8 text-neutral-300">
          {labels.orientation.p1}
        </p>
        <p className="text-base leading-8 text-neutral-400">
          {labels.orientation.p2}
        </p>
        <p className="text-base leading-8 text-neutral-400 italic">
          {labels.orientation.p3}
        </p>
        <p className="text-sm leading-7 text-neutral-600 italic pt-2">
          {labels.orientation.sig}
        </p>
      </section>

      {/* Hero plate */}
      <figure className="w-full max-w-3xl">
        <Plate src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} priority />
        <figcaption className="mt-4 text-center text-[10px] tracking-[0.3em] text-neutral-400 uppercase font-mono">
          Page 031 — the central absence
        </figcaption>
      </figure>

      {/* One quiet fragment from the journal, unlabeled */}
      <section className="mt-24 text-center">
        <p
          className="text-base sm:text-lg leading-8 text-neutral-400 italic max-w-lg"
          style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        >
          {labels.fragment}
        </p>
      </section>

      {/* Scale note — a quiet counter giving readers a sense of size */}
      <p className="mt-24 text-[9px] tracking-[0.35em] text-neutral-700 uppercase font-mono">
        {labels.scaleNote(entryCount, plateCount, letterCount)}
      </p>

      {/* Navigation — The Finding leads */}
      <nav className="mt-12 mb-16 flex flex-col items-center gap-5">
        <Link
          href={findingHref}
          className="text-[11px] tracking-[0.3em] text-neutral-300 hover:text-neutral-100
            transition-colors duration-500 uppercase"
        >
          {labels.nav.finding}
        </Link>
        <div className="flex items-center gap-5 flex-wrap justify-center pt-2 max-w-xl">
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
            href="/entries"
            className="text-[10px] tracking-[0.3em] text-neutral-500 hover:text-neutral-200
              transition-colors duration-500 uppercase"
          >
            {labels.nav.entries}
          </Link>
          <span className="text-neutral-800">·</span>
          <Link
            href="/threads"
            className="text-[10px] tracking-[0.3em] text-neutral-500 hover:text-neutral-200
              transition-colors duration-500 uppercase"
          >
            {labels.nav.threads}
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
        </div>
        <div className="flex items-center gap-5 flex-wrap justify-center pt-4 max-w-xl">
          <Link
            href="/reading-room"
            className="text-[10px] tracking-[0.3em] text-neutral-600 hover:text-neutral-300
              transition-colors duration-500 uppercase"
          >
            {labels.nav.readingRoom}
            <span className="ml-2 text-[8px] tracking-[0.2em] text-neutral-800 not-italic lowercase">
              (today&apos;s page)
            </span>
          </Link>
          <span className="text-neutral-800">·</span>
          <Link
            href={kutsuHref}
            className="text-[10px] tracking-[0.3em] text-neutral-600 hover:text-neutral-300
              transition-colors duration-500 uppercase"
          >
            {labels.nav.kutsu}
            <span className="ml-2 text-[8px] tracking-[0.2em] text-neutral-800 not-italic lowercase">
              (today&apos;s draft)
            </span>
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
