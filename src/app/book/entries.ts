/**
 * Journal entries from The Holy Book of Insanity.
 * Parsed from the markdown at build time (imported as string).
 *
 * Each entry has a title (the bold header) and a body (the raw text).
 */

import fs from 'fs';
import path from 'path';

export interface JournalEntry {
  title: string;
  body: string;
}

export function getJournalEntries(): JournalEntry[] {
  const filePath = path.join(process.cwd(), 'content', 'holy-book-of-insanity.md');
  const raw = fs.readFileSync(filePath, 'utf-8');

  // Find the JOURNAL section
  const journalMarker = '# THE JOURNAL';
  const journalStart = raw.indexOf(journalMarker);
  if (journalStart === -1) return [];

  const journalText = raw.slice(journalStart);

  // Split by --- separators
  const blocks = journalText.split(/\n---\n/).slice(1); // skip the header block

  const entries: JournalEntry[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Extract title from **bold** on first line
    const titleMatch = trimmed.match(/^\*\*(.+?)\*\*/);
    const title = titleMatch ? titleMatch[1] : '';

    // Body is everything after the title line
    let body: string;
    if (titleMatch) {
      body = trimmed.slice(trimmed.indexOf('\n') + 1).trim();
    } else {
      body = trimmed;
    }

    if (body) {
      entries.push({ title, body });
    }
  }

  return entries;
}
