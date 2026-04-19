import { getJournalEntries, type JournalEntry } from '@/app/book/entries';

/**
 * Threads are V.P.'s attempt to cluster Kamikaze's entries by motif.
 * Each thread is a curated reading of the archive — its membership
 * is computed at request time by substring matching on title or body.
 *
 * Threads are not mutually exclusive: an entry can belong to several.
 */
export interface Thread {
  slug: string;
  title: string;
  editorNote: string;
  keywords: string[];
}

export const THREADS: Thread[] = [
  {
    slug: 'the-moth',
    title: 'The moth',
    editorNote:
      'A moth appears on a lamp, is kept in an envelope, is never released. The figure recurs on the most literal surface of the archive and, differently, in the deeper material. — V.P.',
    keywords: ['moth'],
  },
  {
    slug: 'the-clinic',
    title: 'The clinic',
    editorNote:
      'Case notes, patient encounters, the things that happened in the treatment room. Some written as clinical reports; some as witness. — V.P.',
    keywords: ['patient', 'clinic', 'acupuncture', 'treatment', 'needle', 'case note', 'intake'],
  },
  {
    slug: '3am',
    title: 'The 3am signal',
    editorNote:
      'Entries timestamped in the small hours. The archive concentrates here. Kamikaze was most himself when he should have been asleep. — V.P.',
    keywords: ['3am', '3:0', '3:1', '3:2', '3:3', '3:4', '3:5', '4am', '4:0', '4:1', '4:2', '4:3', '4:4', '4:5', "haven't slept"],
  },
  {
    slug: 'dreams',
    title: 'Dreams and thresholds',
    editorNote:
      'Dream reports, hypnagogic encounters, the specific country Kamikaze visits before sleep completes. — V.P.',
    keywords: ['dream', 'hypnagog', 'sleep paralysis', 'bardo', 'threshold state'],
  },
  {
    slug: 'the-second-body',
    title: 'The second body',
    editorNote:
      'The acupuncture body, the ghost points, the meridians. Kamikaze\u2019s working theory of anatomy; the map he used every day. — V.P.',
    keywords: ['meridian', 'ghost point', 'ghost palace', 'ghost heart', 'qi ', 'Sun Si Miao', 'second body', 'second anatomy', 'LU-', 'PC-', 'HT-'],
  },
  {
    slug: 'editor',
    title: 'Editorial marginalia',
    editorNote:
      'Entries I was compelled to annotate \u2014 where the archive contradicts itself, where the paper is damaged, where I could not verify what I was reading. — V.P.',
    keywords: ['— V.P.]'],
  },
  {
    slug: 'the-void',
    title: 'The void',
    editorNote:
      'Almost every page circles it. These are the entries where it is most directly addressed. — V.P.',
    keywords: ['void', 'emptiness', '\u015b\u016bnyat\u0101', 'sunyata'],
  },
  {
    slug: 'the-tenant',
    title: 'The hand\u2019s tenant',
    editorNote:
      'Entries in which Kamikaze describes being operated, ridden, occupied. The figure of the tenant \u2014 a competent presence that draws through him \u2014 is the project\u2019s most personal recurring image. — V.P.',
    keywords: ['tenant', 'occupied', 'occupier', 'possession', 'ridden', 'someone else was operating', 'the gap'],
  },
  {
    slug: 'mirrors',
    title: 'Mirrors',
    editorNote:
      'Reflections that return the gaze. The mirror is Kamikaze\u2019s secondary surface \u2014 less often described than the page, but pulled on with the same kind of attention. — V.P.',
    keywords: ['mirror', 'reflection'],
  },
  {
    slug: 'hauntings',
    title: 'Hauntings',
    editorNote:
      'The crows at the tree since 2014. The old woman who knits. The hat-man. Entries where the ordinary world has been, briefly, unordinary. — V.P.',
    keywords: ['crow', 'old woman', 'felt presence', 'ghost', 'hat-man', 'foot of the bed', 'haunted', 'sweater'],
  },
  {
    slug: 'readings',
    title: 'Kamikaze\u2019s readings',
    editorNote:
      'Entries where Kamikaze engages with other figures \u2014 Jung, Dick, Artaud, Laing, Foucault, Otto, W\u00f6lfli. Reading notes at the edge of madness. — V.P.',
    keywords: ['Jung', 'Dick', 'Artaud', 'Laing', 'Foucault', 'Otto', 'Red Book', 'Exegesis', 'W\u00f6lfli', 'Stevenson', 'Corbin'],
  },
  {
    slug: 'the-symbol',
    title: 'The recurring symbol',
    editorNote:
      'The symbol Kamikaze draws on every page, described variously as a head on a body, a planet on an axis, an ankh that forgot its arms. — V.P.',
    keywords: ['recurring symbol', 'the symbol', 'same symbol', 'that symbol'],
  },
  {
    slug: 'the-third-country',
    title: 'The third country',
    editorNote:
      'The imaginal realm \u2014 neither out-there nor in-here. Entries where Kamikaze describes meeting figures that are neither hallucination nor external. — V.P.',
    keywords: ['third country', 'third light', 'imaginal', 'mundus imaginalis', 'third state', 'third hand'],
  },
  {
    slug: 'meditations',
    title: 'Meditations',
    editorNote:
      'The essayistic entries — where Kamikaze steps back and thinks about something in a calmer register. Most begin "on X". Not madness but its examination. — V.P.',
    keywords: [
      'consciousness', 'observer', 'observation', 'observed', 'perception', 'attention',
      'the instrument', 'apophatic', 'numinous', 'consensus', 'synaesthesia', 'synchronicity',
      'on the ', 'on a ', 'phenomenology', 'epistemology', 'the numinous', 'the measurement',
      'the map is not', 'knowing', 'measurement',
    ],
  },
];

export function getThreadBySlug(slug: string): Thread | null {
  return THREADS.find((t) => t.slug === slug) ?? null;
}

/** Case-insensitive substring match across title + body. */
function matchesThread(entry: JournalEntry, thread: Thread): boolean {
  const haystack = `${entry.title}\n${entry.body}`.toLowerCase();
  return thread.keywords.some((k) => haystack.includes(k.toLowerCase()));
}

export function getEntriesForThread(slug: string): JournalEntry[] {
  const thread = getThreadBySlug(slug);
  if (!thread) return [];
  return getJournalEntries().filter((e) => matchesThread(e, thread));
}

export function getThreadCounts(): { slug: string; count: number }[] {
  const entries = getJournalEntries();
  return THREADS.map((thread) => ({
    slug: thread.slug,
    count: entries.filter((e) => matchesThread(e, thread)).length,
  }));
}

/** For a given entry, return other entries sharing at least one thread. */
export function getRelatedEntries(entry: JournalEntry, limit = 3): JournalEntry[] {
  const entries = getJournalEntries();
  const entryThreads = THREADS.filter((t) => matchesThread(entry, t));
  if (entryThreads.length === 0) return [];

  const scored = entries
    .filter((e) => e.slug !== entry.slug)
    .map((candidate) => {
      const shared = entryThreads.filter((t) => matchesThread(candidate, t)).length;
      return { entry: candidate, score: shared };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || Math.random() - 0.5);

  return scored.slice(0, limit).map((s) => s.entry);
}
