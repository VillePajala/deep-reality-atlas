/**
 * Gallery catalogue.
 *
 * Each entry pairs an image with a title, a short descriptor written
 * in the voice of the atlas, and a fragment quoted from the Holy Book
 * of Insanity. This is the "one unit of atlas content" principle:
 * image and text published together.
 *
 * Sequenced so the gallery reads as a walk through one atlas,
 * page 007 → page 217.
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
    src: '/gallery/007-tendril-taxonomy.png',
    plate: 'PAGE 007',
    title: 'The tendril taxonomy',
    descriptor:
      'The taxonomy on the left was completed first — circuits, compartments, the language kept under control. Then it broke. The right half is the record of the breaking: tendrils the cataloguer did not authorise.',
    quote:
      'I drew the grid to keep the thing inside it. The thing grew tendrils. The grid is now a skin the tendrils wear.',
    quoteSource: 'Journal — page 7 notes',
  },
  {
    src: '/gallery/008-foam-index.png',
    plate: 'PAGE 008',
    title: 'The foam index',
    descriptor:
      'The index on the left catalogues cells — nucleus, membrane, division stage. The index is accurate up to the moment the cells burst their frame and became the cluster on the right.',
    quote:
      'Every classification system is a promise we make to the mess. The mess does not sign the contract.',
    quoteSource: 'Field Notes — Classification',
  },
  {
    src: '/gallery/012-glyph-that-grew-a-body.png',
    plate: 'PAGE 012',
    title: 'The glyph that grew a body',
    descriptor:
      'A wall of unknown glyphs occupies the left. On the right, one of them has escaped the grid and is growing — tendrils, a floating orb, a coil at the base. The legend has outgrown its key.',
    quote:
      'The sign was supposed to point at the thing. Now the sign IS the thing and points at me.',
    quoteSource: 'Journal — 3am entry',
  },
  {
    src: '/gallery/029-ink-tide.png',
    plate: 'PAGE 029',
    title: 'The ink-tide',
    descriptor:
      'The taxonomic grid is intact in the upper-left quadrant. Elsewhere a dark tide has risen through it. The cells where the tide has passed show only silhouettes of what was catalogued there.',
    quote:
      'The flood does not read the labels. The flood does not recognise our definitions. The flood arrives and the definitions float.',
    quoteSource: 'Manifesto — Cartography of Invisible Systems',
  },
  {
    src: '/gallery/031-central-absence.png',
    plate: 'PAGE 031',
    title: 'The central absence',
    descriptor:
      'Annotations, keys, marginal diagrams crowd the edges of the page. The centre is a flat rectangle of pure black. The atlas has surrounded the absence without being able to name it.',
    quote:
      'You cannot draw the hole. You can only draw the things that stop at its edge.',
    quoteSource: 'Journal — a single line, undated',
  },
  {
    src: '/gallery/047-inventory-of-the-site.png',
    plate: 'PAGE 047',
    title: 'Inventory of the site',
    descriptor:
      'A grid of observed specimens at the top-left. The rest is field notes — small boxes, cross-references, one dark specimen framed in the upper right. A record made before the cataloguer stopped being sure what was specimen and what was surroundings.',
    quote:
      'I have been cataloguing for weeks. Last night I realised the specimens are cataloguing me.',
    quoteSource: 'Journal — field week three',
  },
  {
    src: '/gallery/063-downpour.png',
    plate: 'PAGE 063',
    title: 'The downpour',
    descriptor:
      'On the left, the ledger survives — columns, dot-counts, faint pictograms. On the right, the ink has fallen as rain. The document is being returned to weather.',
    quote:
      'The numbers were accurate when I wrote them. Now the numbers are wet and the accuracy is somewhere downstream.',
    quoteSource: 'Field Notes — the archive leaking',
  },
  {
    src: '/gallery/071-cellular-coast.png',
    plate: 'PAGE 071',
    title: 'The cellular coast',
    descriptor:
      'The left margin keeps its grid and its annotations. Everywhere else: a coastline of ink-cells, bubble-edges, voids punched through the living tissue of the page. Where the grid meets the coast, the grid does not win.',
    quote:
      'The surface is a coastline. On one side you can still count the squares. On the other side counting stops being useful.',
    quoteSource: 'Manifesto — Reality is Layered',
  },
  {
    src: '/gallery/088-wall-of-the-archive.png',
    plate: 'PAGE 088',
    title: 'The wall of the archive',
    descriptor:
      'A dense dark wall takes the centre and right of the page — layers of grid, writing, and ink collapsing into one another. On the left, small creatures are catalogued at their original scale, as if they escaped before the wall fell.',
    quote:
      'The archive is not a building. The archive is a weight. It is standing on something that is still alive.',
    quoteSource: 'Journal — the archive note',
  },
  {
    src: '/gallery/094-thing-that-watched-back.png',
    plate: 'PAGE 094',
    title: 'The thing that watched back',
    descriptor:
      'Columns of writing stack neatly in the upper-left. The rest of the page is occupied by a single presence — tangled, partially gridded, with a dark compass-eye in its lower reach. It is not a diagram of the presence. It is the presence itself, pretending to be a diagram.',
    quote:
      'I watched it on the page for an hour. At the end of the hour I understood I had been watched back for an hour.',
    quoteSource: 'Journal — observation protocol',
  },
  {
    src: '/gallery/101-void-has-a-body.png',
    plate: 'PAGE 101',
    title: 'The void has a body',
    descriptor:
      'Handwritten columns run down the left. On the right, a perfect black sphere — and around it a froth of cellular tissue, as if the void had grown flesh. This is the first page in the atlas where the absence is no longer passive.',
    quote:
      'It turns out the void is not a thing we fall into. The void is a thing that has been slowly building itself next to us.',
    quoteSource: 'Journal — reconsidered',
  },
  {
    src: '/gallery/119-cell-atlas.png',
    plate: 'PAGE 119',
    title: 'The cell atlas',
    descriptor:
      'The grid at the top-left catalogues cells one by one. Below, the cells have multiplied beyond the atlas-maker\'s ability to index them. A compass rose in the lower right points nowhere useful.',
    quote:
      'I catalogued the first hundred. Then the first thousand. At ten thousand I stopped counting and started praying.',
    quoteSource: 'Field Notes — the cell count',
  },
  {
    src: '/gallery/127-apparatus-breathing.png',
    plate: 'PAGE 127',
    title: 'The apparatus breathing',
    descriptor:
      'A column of dot-glyphs on the left. In the centre, an apparatus of tendrils, capsules, and spiral organs — not mechanical, not quite biological. In the lower right, two spirals mark where it last took in breath.',
    quote:
      'The machine is breathing. I will not write the word "alive". I will write the word "breathing".',
    quoteSource: 'Journal — careful wording',
  },
  {
    src: '/gallery/142-column-that-became-weather.png',
    plate: 'PAGE 142',
    title: 'The column that became weather',
    descriptor:
      'A precise column of numbers on the left — ledger, counting, the voice of accuracy. The right half is the same data rendered as vertical rain, as signal, as what the numbers sounded like at the moment of their collapse.',
    quote:
      'Every column of numbers is a description of weather. We had forgotten. The weather has not forgotten.',
    quoteSource: 'Manifesto — the reading instruments',
  },
  {
    src: '/gallery/143-eye-that-reads-back.png',
    plate: 'PAGE 143',
    title: 'The eye that reads back',
    descriptor:
      'The mirrored page to 142. The numbers on the left are the same. The right half, instead of weather, is a large dark pupil — the page reading the reader. One of the two pages is a forgery. The atlas does not indicate which.',
    quote:
      'The document is reading me while I read it. Neither of us can stop. Neither of us is in charge.',
    quoteSource: 'Journal — mirrored entries',
  },
  {
    src: '/gallery/217-thinking-web.png',
    plate: 'PAGE 217',
    title: 'The thinking web',
    descriptor:
      'The grid underlies the whole page. Through it, a thinking web has grown — nodes, tendrils, small dark chambers. A single black rectangle sits at the top centre, occluding what the web was thinking about.',
    quote:
      'A thought is a shape. A long thought is a web. A very long thought is what you are looking at, and it is looking at you.',
    quoteSource: 'Journal — page 217 of the atlas',
  },
];
