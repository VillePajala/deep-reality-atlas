# Renderer Direction

A strategic note for whoever touches the renderers next — including me.

## The anti-principle

**Do not try to make code-rendered pages look hand-drawn.** Midjourney
does it better than we can. Every renderer we have — canvas, HTML,
SVG, node-canvas, Puppeteer — has evolved toward "this should look
like ink on paper." That race is unwinnable and, more importantly,
beside the point.

## What code actually does well that Midjourney cannot

1. **Real readable text.** Our journal entries are actual, readable,
   searchable strings — not simulated glyph-noise. A reader who zooms
   into a Midjourney image finds pseudo-runes; a reader who zooms
   into a code-rendered page finds actual sentences by a specific
   author with a specific voice.

2. **Content that responds to its theme.** A code-rendered page can
   be seeded with a specific well from the Holy Book (numinous,
   alchemy, ghost points, etc.) and pull relevant journal fragments,
   symbols, and composition cues accordingly. A seed is a theme.

3. **Interactivity and addressability.** A web page can be hovered,
   clicked, linked, updated. Every entry can have a permanent URL.
   Every mark on the page can point somewhere. Midjourney outputs
   are frozen images; our outputs can be interfaces.

4. **Seed-sharable URLs.** A visitor can bookmark a specific
   generation and come back to it. Each seed is a coordinate in
   the possibility space.

5. **Theme-aware composition.** A TCM page can show meridian curves
   through text. A glossolalia page can show invented alphabets. A
   simulation page can show grid glitches. Midjourney has no idea
   what it's drawing.

## Where future renderer effort should go

**Serving the writing.** Every rendering decision should ask: does
this help the reader encounter the text more powerfully? If the
answer is "it makes the visual prettier but adds nothing to the
text," it's the wrong direction.

Concretely:

- **Interactive manuscript pages** — render a single entry with
  illuminated typography, organism drawings, and void shapes, where
  hovering on passages expands context or links to related entries.
- **Theme-linked generators** — render pages that EXPRESS the theme,
  not that mimic JK's visual vocabulary. A consciousness page
  should feel recursive. A sunyata page should feel empty.
- **Hero-image pipeline from Midjourney** — pair Midjourney
  generations with code-overlaid text for "journal entry + image"
  units per the roadmap.
- **Print-ready single pages** — 1m × 1m, designed not generated,
  per exhibition format (roadmap).

## What is ON ice

- Canvas 2D chaos renderers (`render-page.mjs`, `render-text.mjs`,
  `render-svg.mjs`, `render-html.mjs`, the original real-time atlas
  viewer under `/src/engine/`)
- Feature-stacking "unhinged" style chaos

These remain as artifacts of the development process and as the
real-time curiosity (/atlas). They are not where we invest next.

## What is ACTIVE

- `render-exquisite.mjs` and `render-unhinged.mjs` — the current
  best-of-both worlds for the Plates I–IX gallery. If we need more
  gallery plates, start there, refine selectively.
- The Reading Room layout (`src/app/reading-room/page.tsx`) — where
  design, typography, and curation win over generation.

## The one-line version

**Serve the text. Let Midjourney serve the vision.**
