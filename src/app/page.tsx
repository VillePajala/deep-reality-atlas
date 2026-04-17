import Link from 'next/link';
import { Suspense } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Kutsu } from './kutsu';
import { Plate } from './gallery/Plate';

type Lang = 'en' | 'fi';

/** A curated short journal entry, chosen for strength + self-containment. */
const FEATURED_ENTRY_1 = {
  label: '§II — from the journal',
  body: `The pharmacist asked me today what I do and I said I draw maps. She said of what. I said of things that probably don't exist. She said why. I said because someone has to. She said that's not a reason. I said I know.

She's right. It's not a reason. A reason would imply a rational basis for the work. There is no rational basis. The atlas is not rational. The atlas is a compulsion dressed as a methodology.`,
};

const FEATURED_ENTRY_2 = {
  label: '§IV — one line, undated',
  body: `The void is not where meaning goes to die. The void is where meaning goes to stop pretending.`,
};

type ManifestoExcerpt = { label: string; body: string[] };

const MANIFESTO_EXCERPT_EN: ManifestoExcerpt = {
  label: '§III — from the manifesto',
  body: [
    `Reality is layered. This is not mysticism — it is observation. The acupuncturist knows it: beneath the anatomical body lies a body of channels and currents, spirit gates and ghost points, seas of qi and gushing springs. Sun Si Miao mapped thirteen points where trauma lodges in the flesh like uninvited guests — ghost palace, ghost heart, ghost path, ghost pillow — and his protocol was sequential, ritualistic, an exorcism performed through the body's own geography. The body is not a machine. The body is a landscape, and the landscape is haunted.`,
    `The alchemist knows it: solve et coagula, dissolve and reconstitute. The substance must pass through nigredo — blackening, putrefaction, the death of its current form — before the gold hidden in lead can reveal itself. Aurum nostrum non est aurum vulgi. Our gold is not the common gold.`,
  ],
};

const MANIFESTO_EXCERPT_FI: ManifestoExcerpt = {
  label: '§III — manifestista',
  body: [
    `Todellisuus on kerrostunutta. Tämä ei ole mystiikkaa — se on havaintoa. Akupunktuurihoitaja tietää sen: anatomisen kehon alla on kanavien ja virtausten keho, henkiportteja ja haamupisteitä, qin meriä ja pulppuavia lähteitä. Sun Si Miao kartoitti kolmetoista pistettä, joihin trauma asettuu lihaan kuin kutsumaton vieras — haamupalatsi, haamusydän, haamupolku, haamutyyny — ja hänen protokollansa oli peräkkäinen, ritualistinen, manaus suoritettuna kehon oman maantieteen kautta. Keho ei ole kone. Keho on maisema, ja maisema on kummitteleva.`,
    `Alkemisti tietää sen: solve et coagula, liuota ja tiivistä uudelleen. Aineen on kuljettava nigredon läpi — mustuminen, mätäneminen, nykyisen muotonsa kuolema — ennen kuin lyijyyn kätketty kulta voi paljastua. Aurum nostrum non est aurum vulgi. Meidän kultamme ei ole kansan kultaa.`,
  ],
};

const HERO_IMAGE = {
  src: '/gallery/031-central-absence.png',
  alt: 'The central absence — Page 031 from the atlas',
};

const LABELS = {
  en: {
    subtitle: 'Cartography of Consciousness',
    tagline: 'an atlas of invisible systems',
    first: '§I — the invitation',
    entry1: FEATURED_ENTRY_1,
    manifestoExcerpt: MANIFESTO_EXCERPT_EN,
    entry2: FEATURED_ENTRY_2,
    close: 'the thread does not break',
    footer: {
      journal: 'The Journal',
      manifesto: 'Read the full manifesto',
      gallery: 'Gallery',
    },
  },
  fi: {
    subtitle: 'Tietoisuuden Kartografia',
    tagline: 'atlas näkymättömistä järjestelmistä',
    first: '§I — kutsu',
    entry1: FEATURED_ENTRY_1, // Journal stays English
    manifestoExcerpt: MANIFESTO_EXCERPT_FI,
    entry2: FEATURED_ENTRY_2, // Journal stays English
    close: 'lanka ei katkea',
    footer: {
      journal: 'Päiväkirja',
      manifesto: 'Lue koko manifesti',
      gallery: 'Galleria',
    },
  },
} as const;

function Divider() {
  return (
    <div className="flex items-center justify-center gap-6 my-20">
      <span className="h-px w-16 bg-neutral-600" />
      <span className="text-xs tracking-[0.4em] text-neutral-400">§</span>
      <span className="h-px w-16 bg-neutral-600" />
    </div>
  );
}

function Breath({ label }: { label: string }) {
  return (
    <p className="my-16 text-[11px] tracking-[0.3em] text-neutral-400 uppercase font-mono">
      {label}
    </p>
  );
}

function JournalSnippet({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  return (
    <section className="max-w-xl flex flex-col items-center">
      <Breath label={label} />
      <div
        className="space-y-6 text-base sm:text-lg leading-8 text-neutral-200"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {body.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

function ManifestoSnippet({ excerpt }: { excerpt: ManifestoExcerpt }) {
  return (
    <section className="max-w-xl flex flex-col items-center">
      <Breath label={excerpt.label} />
      <div
        className="space-y-6 text-base sm:text-lg leading-8 text-neutral-300"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {excerpt.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
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

  return (
    <main className="flex flex-col items-center min-h-screen px-6 py-12 sm:py-20 selection:bg-neutral-700">

      {/* Language toggle, top-right corner */}
      <div className="w-full max-w-5xl flex justify-end">
        <Suspense fallback={null}>
          <LanguageToggle />
        </Suspense>
      </div>

      {/* Title — book-cover weight */}
      <header className="mt-10 mb-20 text-center">
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
      </header>

      {/* The Invitation */}
      <Breath label={labels.first} />
      <Kutsu lang={lang} />

      {/* English-only featured journal entry */}
      {lang === 'en' && (
        <>
          <Divider />
          <JournalSnippet label={labels.entry1.label} body={labels.entry1.body} />
        </>
      )}

      <Divider />

      {/* Hero image from the gallery */}
      <figure className="w-full max-w-3xl">
        <Plate src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} priority />
        <figcaption className="mt-4 text-center text-[10px] tracking-[0.3em] text-neutral-700 uppercase">
          Page 031 — the central absence
        </figcaption>
      </figure>

      <Divider />

      {/* Manifesto excerpt */}
      <ManifestoSnippet excerpt={labels.manifestoExcerpt} />

      {/* English-only second featured entry */}
      {lang === 'en' && (
        <>
          <Divider />
          <JournalSnippet label={labels.entry2.label} body={labels.entry2.body} />
        </>
      )}

      <Divider />

      {/* Closing line */}
      <p
        className="text-lg sm:text-xl italic text-neutral-300 mb-24"
        style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
      >
        {labels.close}
      </p>

      {/* Quiet footer — four destinations */}
      <nav className="flex flex-col items-center gap-5 mb-16">
        <Link
          href="/reading-room"
          className="group px-8 py-3 border border-neutral-700 hover:border-neutral-400
            text-xs tracking-[0.4em] text-neutral-300 hover:text-neutral-100
            transition-all duration-500 uppercase"
        >
          {lang === 'fi' ? 'Lukusali' : 'Reading Room'}
        </Link>
        <Link
          href="/book"
          className="text-[11px] tracking-[0.3em] text-neutral-400 hover:text-neutral-100
            transition-colors duration-500 uppercase"
        >
          {labels.footer.journal}
        </Link>
        <Link
          href={manifestoHref}
          className="text-[11px] tracking-[0.3em] text-neutral-400 hover:text-neutral-100
            transition-colors duration-500 uppercase"
        >
          {labels.footer.manifesto}
        </Link>
        <Link
          href="/gallery"
          className="text-[11px] tracking-[0.3em] text-neutral-400 hover:text-neutral-100
            transition-colors duration-500 uppercase"
        >
          {labels.footer.gallery}
        </Link>
      </nav>

      {/* Final footer */}
      <footer className="text-center">
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
        <p
          className="text-[9px] tracking-[0.2em] text-neutral-800 mt-3"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          Ville Johannes Pajala — Helsinki, 2026
        </p>
      </footer>
    </main>
  );
}
