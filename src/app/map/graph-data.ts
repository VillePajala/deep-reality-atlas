import { getJournalEntries } from '@/app/book/entries';
import { THREADS, getEntriesForThread } from '@/app/threads/threads';
import { galleryImages } from '@/app/gallery/images';

/**
 * Builds the force-directed graph representation of the archive.
 *
 * Node kinds:
 *   - 'thread' — 13 curated motif hubs
 *   - 'plate'  — 16 gallery plates
 *   - 'entry'  — every journal entry
 *
 * Edges:
 *   - entry → thread, for every thread an entry matches
 *   - plate → thread, via relatedThreadSlug
 *   - plate → entry, via pairedEntryTitle
 *
 * Threads act as natural gravity centres: entries cluster around the
 * threads they belong to. Highly-connected entries (belonging to many
 * threads) drift toward the centre of the graph.
 */

export type GraphNode = {
  id: string;
  kind: 'entry' | 'plate' | 'thread';
  label: string;
  href: string;
};

export type GraphLink = {
  source: string;
  target: string;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

export function buildGraphData(): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // 1. Thread hubs
  for (const thread of THREADS) {
    nodes.push({
      id: `thread:${thread.slug}`,
      kind: 'thread',
      label: thread.title,
      href: `/threads/${thread.slug}`,
    });
  }

  // 2. Entry nodes
  const entries = getJournalEntries();
  for (const entry of entries) {
    nodes.push({
      id: `entry:${entry.slug}`,
      kind: 'entry',
      label: entry.title || `§${entry.index + 1}`,
      href: `/entries/${entry.slug}`,
    });
  }

  // 3. Plate nodes
  for (const plate of galleryImages) {
    nodes.push({
      id: `plate:${plate.src}`,
      kind: 'plate',
      label: `${plate.plate} · ${plate.title}`,
      href: '/gallery',
    });
  }

  // 4. Entry → thread edges
  for (const thread of THREADS) {
    const threadEntries = getEntriesForThread(thread.slug);
    for (const entry of threadEntries) {
      links.push({
        source: `entry:${entry.slug}`,
        target: `thread:${thread.slug}`,
      });
    }
  }

  // 5. Plate → thread edges
  for (const plate of galleryImages) {
    if (plate.relatedThreadSlug) {
      links.push({
        source: `plate:${plate.src}`,
        target: `thread:${plate.relatedThreadSlug}`,
      });
    }
  }

  // 6. Plate → entry edges (paired)
  for (const plate of galleryImages) {
    if (plate.pairedEntryTitle) {
      const entry = entries.find((e) => e.title === plate.pairedEntryTitle);
      if (entry) {
        links.push({
          source: `plate:${plate.src}`,
          target: `entry:${entry.slug}`,
        });
      }
    }
  }

  return { nodes, links };
}
