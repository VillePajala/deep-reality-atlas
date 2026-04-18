/**
 * Journal entries from The Holy Book of Insanity.
 * Parsed from the markdown at build time (imported as string).
 *
 * Each entry has a slug (URL-safe identifier), a title (the bold header
 * if present), a body (the raw text), and an index (order in the journal).
 */

import fs from 'fs';
import path from 'path';
import { cache } from 'react';

export interface JournalEntry {
  slug: string;
  index: number;
  title: string;
  body: string;
}

function slugify(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  if (!base) return `entry-${index + 1}`;
  return `${String(index + 1).padStart(3, '0')}-${base}`;
}

/**
 * Parse the journal markdown into entries.
 * Wrapped with React's `cache()` for per-request memoisation, and
 * additionally cached at module scope so multiple requests share the
 * parse on the same server instance. The 484KB file is otherwise
 * re-read/re-parsed on every call, which happens thousands of times
 * during a static build of 358 entry routes.
 */
let moduleCache: JournalEntry[] | null = null;

export const getJournalEntries = cache((): JournalEntry[] => {
  if (moduleCache) return moduleCache;

  const filePath = path.join(process.cwd(), 'content', 'holy-book-of-insanity.md');
  const raw = fs.readFileSync(filePath, 'utf-8');

  const journalMarker = '# THE JOURNAL';
  const journalStart = raw.indexOf(journalMarker);
  if (journalStart === -1) return [];

  const journalText = raw.slice(journalStart);
  const blocks = journalText.split(/\n---\n/).slice(1);

  const entries: JournalEntry[] = [];

  blocks.forEach((block) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const titleMatch = trimmed.match(/^\*\*(.+?)\*\*/);
    const title = titleMatch ? titleMatch[1] : '';

    const body = titleMatch
      ? trimmed.slice(trimmed.indexOf('\n') + 1).trim()
      : trimmed;

    if (!body) return;

    const index = entries.length;
    entries.push({
      slug: slugify(title || body.slice(0, 40), index),
      index,
      title,
      body,
    });
  });

  moduleCache = entries;
  return entries;
});

export function getEntryBySlug(slug: string): JournalEntry | null {
  const entries = getJournalEntries();
  return entries.find((e) => e.slug === slug) ?? null;
}

/** Lookup by exact title. Survives journal re-shufflings that change slugs. */
export function getEntryByTitle(title: string): JournalEntry | null {
  const entries = getJournalEntries();
  return entries.find((e) => e.title === title) ?? null;
}

/** Return { prev, next } for navigation on a single-entry page. */
export function getEntryNeighbours(slug: string): {
  prev: JournalEntry | null;
  next: JournalEntry | null;
} {
  const entries = getJournalEntries();
  const idx = entries.findIndex((e) => e.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? entries[idx - 1] : null,
    next: idx < entries.length - 1 ? entries[idx + 1] : null,
  };
}
