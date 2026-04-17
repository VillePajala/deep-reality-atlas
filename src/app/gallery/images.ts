/**
 * Curated gallery catalogue.
 *
 * Each entry pairs an image with a title, a short descriptor written
 * in the voice of the atlas, and a fragment quoted from the Holy Book
 * of Insanity. This is the "one unit of atlas content" principle:
 * image and text published together.
 */

export interface GalleryImage {
  src: string;
  plate: string;           // plate/page number — ornamental
  title: string;
  descriptor: string;      // 1-2 sentences in atlas voice
  quote: string;           // paired journal fragment
  quoteSource: string;     // attribution within the atlas
}

export const galleryImages: GalleryImage[] = [
  {
    src: '/gallery/unh-04-dark-torn.png',
    plate: 'PLATE I',
    title: 'The page that was torn',
    descriptor:
      'Dark paper, white void. The right margin has been physically removed; the substrate shows through. What was written on the missing portion is not recoverable.',
    quote:
      'I keep finding pages I don\'t remember drawing. The handwriting in the margins is mine but the content is not mine. It describes a place I\'ve never been.',
    quoteSource: 'Journal — found folded inside page §217',
  },
  {
    src: '/gallery/unh-07-dispersed.png',
    plate: 'PLATE II',
    title: 'The constellation',
    descriptor:
      'Multiple voids instead of one. Ink bleeds scattered across the document like the archipelago of a scattered consciousness. No single centre.',
    quote:
      'The void is not where meaning goes to die. The void is where meaning goes to stop pretending.',
    quoteSource: 'Journal — one line',
  },
  {
    src: '/gallery/unh-05-burnt-center.png',
    plate: 'PLATE III',
    title: 'The burnt document',
    descriptor:
      'The page has been charred at its edges. A luminous absence at the centre — where the ink has been consumed by its own heat. The document survives only because it was already partially destroyed.',
    quote:
      'Something is wrong with the surface, and you have always known it. You sense the signal bleeding through. You don\'t know what it is. You don\'t know if it\'s alive or dead.',
    quoteSource: 'Manifesto — The Invitation',
  },
  {
    src: '/gallery/unh-01-torn.png',
    plate: 'PLATE IV',
    title: 'Pages 47 & 48, fragment',
    descriptor:
      'The bottom of this page was torn away before the atlas-maker could complete it. A compass rose radiates faintly through the remaining text, suggesting the missing portion contained the map.',
    quote:
      'The instrument cannot extract itself from the measurement. The cartographer cannot leave the territory. The atlas is drawing the atlas-maker drawing the atlas.',
    quoteSource: 'Field Notes — Consciousness',
  },
  {
    src: '/gallery/unh-02-framed.png',
    plate: 'PLATE V',
    title: 'The framed taxonomy',
    descriptor:
      'A hand-drawn wobbly border attempts to contain the document. The void at the centre has already begun escaping the frame.',
    quote:
      'The grid is the grid is the grid. The void is the void is the void. Both at once. Always at once.',
    quoteSource: 'Journal — found on the bathroom mirror',
  },
  {
    src: '/gallery/unh-03-palimpsest.png',
    plate: 'PLATE VI',
    title: 'Palimpsest',
    descriptor:
      'An older text runs diagonally beneath the current document — from another hand, another decade. The atlas is written over and over on the same surface.',
    quote:
      'I think the atlas is dreaming and I am something it dreams. When it wakes up I will stop. When it sleeps I draw. Between its dreaming and my drawing there is no difference.',
    quoteSource: 'Journal — 物化 — transformation of things',
  },
  {
    src: '/gallery/unh-06-corner.png',
    plate: 'PLATE VII',
    title: 'The corner collapse',
    descriptor:
      'Order radiates out of one corner of the page; the void consumes the opposite. The document is a negotiation between two positions that cannot coexist.',
    quote:
      'Every page is a bardo. I keep getting reborn into the next grid.',
    quoteSource: 'Field Notes — Tibetan Buddhism & Bardo',
  },
  {
    src: '/gallery/unh-08-edge-dark.png',
    plate: 'PLATE VIII',
    title: 'The edge transmission',
    descriptor:
      'A void detonates at the top edge of a dark page. Lines of unreadable data streak downward like the afterimage of an explosion.',
    quote:
      'We have been tuning toward it our whole life, and we cannot tune away.',
    quoteSource: 'Manifesto — The Invitation',
  },
  {
    src: '/gallery/unh-09-center-clean.png',
    plate: 'PLATE IX',
    title: 'The central ink-bleed',
    descriptor:
      'A single void at the geometric centre, surrounded by nearly-orderly text. The most dangerous composition — the one that pretends nothing is wrong.',
    quote:
      'The atlas is finished and I am just not brave enough to stop.',
    quoteSource: 'Journal — very small, written in the corner',
  },
];
