/**
 * The Reading Room.
 *
 * Unlike /book (flip-through) and /entries (index), this is a single
 * deeply-designed manuscript page. One entry per visit, curated and
 * presented as if it were page 47 of the physical atlas.
 *
 * Typography: large serif body, illuminated drop cap, ornamented margins,
 * a hero organism image, hand-drawn borders. This is where we invest in
 * design rather than generation.
 */

import Link from 'next/link';
import { getEntryByTitle } from '@/app/book/entries';

/**
 * A small curated set of entries worth reading as standalone works.
 * Keyed by title so re-shuffling the journal does not break the curation.
 */
const READING_ROOM_TITLES = [
  'entry — the moth',
  'on the bardos',
  'the afternoon the bells',
  'the morning I recognised',
  'entry — two bodies',
  'found folded — a list of praises',
  'on the numinous, after Otto',
  'the stranger on the train',
  'entry — autumn',
  '5:15am — haven\u2019t slept',
  'found in a pocket, folded four times',
  'last entry — or first — the pages aren\u2019t numbered',
] as const;

function pickTitleForToday(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return READING_ROOM_TITLES[dayOfYear % READING_ROOM_TITLES.length];
}

export const metadata = {
  title: 'Reading Room — Deep Reality Atlas',
  description: 'One page of the atlas, presented as a manuscript.',
};

export default async function ReadingRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; title?: string }>;
}) {
  const { title: requestedTitle } = await searchParams;
  const title = requestedTitle && READING_ROOM_TITLES.includes(requestedTitle as typeof READING_ROOM_TITLES[number])
    ? requestedTitle
    : pickTitleForToday();

  // Try the curated title; if not found, fall through the list.
  let entry = getEntryByTitle(title);
  if (!entry) {
    for (const t of READING_ROOM_TITLES) {
      entry = getEntryByTitle(t);
      if (entry) break;
    }
  }
  if (!entry) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">The reading room is empty tonight.</p>
      </main>
    );
  }

  const paragraphs = entry.body.split('\n\n').map((p) => p.trim()).filter(Boolean);
  const firstParagraph = paragraphs[0] ?? '';
  const restParagraphs = paragraphs.slice(1);

  // Drop cap: first letter (or Ⅰ if starts with a non-letter)
  const dropCapMatch = firstParagraph.match(/[A-Za-z]/);
  const dropCap = dropCapMatch ? dropCapMatch[0].toUpperCase() : '§';
  const firstParagraphRest = dropCapMatch
    ? firstParagraph.replace(dropCapMatch[0], '')
    : firstParagraph;

  return (
    <main
      className="min-h-screen px-6 py-16 flex flex-col items-center bg-[#0b0907] selection:bg-neutral-700"
    >
      {/* Parchment panel — our "page" of the atlas */}
      <div
        className="relative w-full max-w-4xl"
        style={{
          background: '#1a1510',
          boxShadow:
            '0 10px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(180,150,100,0.08) inset',
        }}
      >
        {/* Hand-drawn border (SVG) */}
        <HandDrawnBorder />

        <div className="relative z-10 px-12 sm:px-20 py-20">

          {/* Top label */}
          <header className="flex items-center justify-between mb-16">
            <Link
              href="/"
              className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
                transition-colors uppercase font-mono"
            >
              Deep Reality
            </Link>
            <p className="text-[10px] tracking-[0.35em] text-neutral-600 uppercase font-mono">
              reading room · §{entry.index + 1}
            </p>
          </header>

          {/* Folio number / plate label */}
          <p
            className="text-center text-[11px] tracking-[0.4em] text-neutral-600 uppercase font-mono mb-12"
          >
            {entry.title || 'UNTITLED FRAGMENT'}
          </p>

          {/* Decorative ornament */}
          <div className="flex items-center justify-center gap-6 mb-16">
            <span className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-neutral-700" />
            <span className="text-neutral-700 text-2xl italic" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>§</span>
            <span className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-neutral-700" />
          </div>

          {/* Body — serif, large, leading comfortable */}
          <article
            className="max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          >
            {/* First paragraph with drop cap */}
            <p className="text-xl leading-9 text-neutral-200 mb-8">
              <span
                className="float-left text-7xl sm:text-8xl font-semibold pr-4 pt-2 leading-[0.9] text-neutral-100"
                style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
              >
                {dropCap}
              </span>
              {firstParagraphRest}
            </p>

            {/* Remaining paragraphs */}
            {restParagraphs.map((p, i) => {
              const isScream =
                p === p.toUpperCase() && p.length > 20 && !p.startsWith('-');
              const isBreath = p.length < 60 && !p.includes('\n');

              if (isScream) {
                return (
                  <p
                    key={i}
                    className="mt-6 text-sm tracking-[0.15em] leading-7 text-neutral-400 font-mono"
                    style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                  >
                    {p}
                  </p>
                );
              }

              if (isBreath) {
                return (
                  <p
                    key={i}
                    className="mt-6 text-xl leading-9 italic text-neutral-300 text-center"
                  >
                    {p}
                  </p>
                );
              }

              return (
                <p key={i} className="mt-6 text-xl leading-9 text-neutral-200">
                  {p}
                </p>
              );
            })}
          </article>

          {/* Closing ornament */}
          <div className="flex items-center justify-center gap-6 mt-20">
            <span className="h-px flex-1 max-w-16 bg-neutral-800" />
            <span className="text-neutral-700 font-mono text-[10px] tracking-[0.3em]">
              FINIS
            </span>
            <span className="h-px flex-1 max-w-16 bg-neutral-800" />
          </div>

          {/* Footer with attribution */}
          <footer className="mt-16 flex items-center justify-between text-[9px] tracking-[0.3em] text-neutral-700 uppercase font-mono">
            <span>FIELD NOTES · DATE UNKNOWN</span>
            <span>folio §{entry.index + 1} / {READING_ROOM_TITLES.length}</span>
          </footer>
        </div>
      </div>

      {/* Under-page navigation */}
      <nav className="mt-16 flex flex-col items-center gap-5">
        <p className="text-[9px] tracking-[0.3em] text-neutral-700 uppercase font-mono">
          Another page from the reading room
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {READING_ROOM_TITLES.map((t, i) => (
            <Link
              key={t}
              href={`/reading-room?title=${encodeURIComponent(t)}`}
              className={`text-[10px] tracking-[0.3em] uppercase transition-colors ${
                t === title
                  ? 'text-neutral-300'
                  : 'text-neutral-700 hover:text-neutral-500'
              }`}
            >
              §{String(i + 1).padStart(2, '0')}
            </Link>
          ))}
        </div>
        <div className="flex gap-8 mt-6">
          <Link
            href={`/entries/${entry.slug}`}
            className="text-[10px] tracking-[0.3em] text-neutral-700 hover:text-neutral-400 transition-colors uppercase"
          >
            permanent link to this entry
          </Link>
          <Link
            href="/entries"
            className="text-[10px] tracking-[0.3em] text-neutral-700 hover:text-neutral-400 transition-colors uppercase"
          >
            all entries →
          </Link>
        </div>
      </nav>
    </main>
  );
}

/**
 * Wobbly hand-drawn border as an SVG overlay on the parchment panel.
 */
function HandDrawnBorder() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 1000 1400"
    >
      {/* Four sides with slight wobble */}
      <path
        d="M20,22 Q200,18 400,23 T800,20 T982,24 L984,400 Q980,700 982,1000 T980,1378 L500,1376 Q200,1380 22,1378 L20,1000 Q18,600 20,200 Z"
        fill="none"
        stroke="rgba(180,150,100,0.22)"
        strokeWidth="1.3"
      />
      {/* Inner thinner line */}
      <path
        d="M36,40 Q200,37 500,42 T970,38 L968,1360 Q500,1364 36,1362 Z"
        fill="none"
        stroke="rgba(180,150,100,0.12)"
        strokeWidth="0.6"
      />
      {/* Corner flourishes */}
      {[
        [36, 40],
        [964, 40],
        [36, 1360],
        [964, 1360],
      ].map(([cx, cy], i) => (
        <g key={i} stroke="rgba(180,150,100,0.25)" strokeWidth="0.8" fill="none">
          <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} />
          <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} />
          <circle cx={cx} cy={cy} r="4" />
        </g>
      ))}
    </svg>
  );
}
