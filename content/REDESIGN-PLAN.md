# Site Redesign Plan

Working on branch `site-redesign`. Each priority below gets its own commit. When all are complete we merge to `main` via PR.

## Diagnosis — why we're doing this

The project has two gravitational centers pulling apart:
- **The writing** (Kutsu → Manifesto → Journal) — patient, inward, literary, distinctive voice
- **The visuals** (Atlas viewer → Gallery) — frenetic, outward, often trying to replicate Midjourney

The writing is where the project lives. The site currently treats the four destinations as peers with equal weight. We're going to reframe it as a writing-first document with visuals as supporting evidence.

## Execution order

Small/standalone edits first. Big structural change (#1) goes last, after the pieces it needs are in place.

| # | Priority | Status | Commit |
|---|----------|--------|--------|
| 8 | Strong manifesto opening | ✓ | redesign(8) |
| 2 | Journal typography upgrade | ✓ | redesign(2) |
| 5 | Title header confidence | ✓ | redesign(5) |
| 3 | Demote the atlas viewer | ☐ | — |
| 4 | Gallery curation + captions | ☐ | — |
| 6 | Bilingual EN/FI toggle | ☐ | — |
| 1 | Continuous-scroll home page | ☐ | — |
| 7 | Entries pipeline (`/entries/[slug]`) | ☐ | — |
| 10 | Reading Room single-page experience | ☐ | — |
| 9 | Renderer strategic direction (doc-only) | ☐ | — |

---

## Priority 8 — Strong manifesto opening
**Commit tag:** `redesign(8): manifesto opening`

**Problem.** Manifesto starts with a Liber Novus quote. Correct reference, but it's borrowed ignition. The Kutsu itself is the strongest original text.

**Change.** Open the manifesto with a line as strong as the Kutsu. Options to consider:
- Move the "There is a structure beneath the structure..." paragraph to be the opener (already the first body paragraph; drop the Jung quote above it)
- Or: write a single-line opener like "The atlas does not exist. This is the evidence of its absence."

**Files.** `src/app/manifesto/page.tsx`, `content/project-documentation.md`.

**Done when.** First thing you read on the manifesto page is a Ville line, not a Jung quote. Jung can return later in the body.

---

## Priority 2 — Journal typography upgrade
**Commit tag:** `redesign(2): journal typography`

**Problem.** Journal uses Courier New. For text this good, that's wrong. Reads like code, not like a notebook.

**Change.** Load a distinctive serif for the Journal only. Candidates:
- **EB Garamond** (free, classical, warm)
- **Spectral** (free, more contemporary, readable)
- **Lora** (free, excellent readability)

Keep the terminal/mono aesthetic for the Atlas page and gallery captions — those are the instrument's voice. The Journal is a diary and should read as a diary.

**Files.** `src/app/layout.tsx` or `src/app/book/page.tsx` and `src/app/book/BookViewer.tsx`. Use Next.js `next/font/google` to load the face.

**Done when.** Journal page displays in a serif face; rest of site unchanged.

---

## Priority 5 — Title header confidence
**Commit tag:** `redesign(5): title treatment`

**Problem.** "Deep Reality / Tietoisuuden Kartografia" as tiny letterspaced uppercase is the generic minimal-dev-site look. Too small to carry the weight of the project.

**Change.** Make the title feel like a BOOK COVER. Large, serious, centered. Possibly paired with a faint hero image (one curated Midjourney piece) behind it at very low opacity.

**Files.** `src/app/page.tsx` — title block at the top. Later, also Journal/Manifesto/Gallery headers.

**Done when.** The first impression is "body of work," not "design experiment."

---

## Priority 3 — Demote the atlas viewer
**Commit tag:** `redesign(3): demote atlas viewer`

**Problem.** `/atlas` is the weakest part of the site. Real-time canvas engine produces one-trick images much worse than offline renders. It's currently the first CTA on home.

**Change.** Remove "Enter the Atlas" as the primary CTA. Keep the route for the curious, but link to it quietly from the Gallery footer with a label like "the instrument" or "real-time generator." Do not delete the code — it's interesting as an artifact of the project's development.

**Files.** `src/app/page.tsx` (remove primary CTA), `src/app/gallery/page.tsx` (add footer link).

**Done when.** A new visitor does not encounter the real-time generator as their first experience of the work.

---

## Priority 4 — Gallery curation + captions
**Commit tag:** `redesign(4): gallery captions`

**Problem.** Gallery shows 9 images with no context. The images are similar enough to each other that without captions you can't tell them apart. No text-image pairing.

**Change.** Each gallery image gets a caption: the title (composition), a 1-2 sentence descriptor, and a paired journal-fragment quote. Curate down to 6-8 strongest images if needed.

**Files.** `src/app/gallery/page.tsx` — add a metadata object mapping filenames to captions. Optionally extract to `src/app/gallery/images.ts`.

**Done when.** Each image stands alongside text that contextualises it. The gallery reads like plates from a catalog, not screenshots from a generator.

---

## Priority 6 — Bilingual EN/FI toggle
**Commit tag:** `redesign(6): i18n`

**Problem.** Finnish Kutsu and Manifesto exist in `content/project-documentation.md` but are not on the site. For a Finnish project rooted in Jung/Otto/JK, the Finnish version is arguably primary.

**Change.** Add a language toggle to the page header. Route strategy: either
- (a) query param `?lang=fi` with client-side swap, or
- (b) parallel routes `/fi/*` mirroring `/*` — cleaner for SEO but more files.

Recommend (a) for simplicity initially. Content lives in a TS/JSON file keyed by language.

**Files.** `src/content/translations.ts` (new), each page component consumes translations, a small `LanguageToggle` component.

**Scope.** Kutsu + Manifesto first. Journal entries stay English-only (that is the voice). Gallery captions bilingual. Navigation labels bilingual.

**Done when.** EN/FI toggle works on Kutsu and Manifesto pages.

---

## Priority 1 — Continuous-scroll home page
**Commit tag:** `redesign(1): continuous scroll home`

**Problem.** Current home: title → Kutsu → link grid. The link grid makes destinations feel peer-equal and disconnected. The site feels like a portfolio, not a document.

**Change.** Rebuild home as one long scroll:

1. Title / hero
2. Kutsu (current text)
3. A pause — whitespace or a small piece of marginalia
4. One selected journal entry (curated, not random)
5. Pause
6. A single hero image
7. An excerpt from the manifesto — ~3 paragraphs, not the whole thing
8. Pause
9. Another journal entry
10. Closing line — "hic sunt dracones" or similar
11. Quiet footer links: "read the full manifesto", "the journal", "gallery", "(the instrument)"

Visitor doesn't navigate — they READ. The rest of the site becomes depth for readers who finish the scroll.

**Files.** Major rewrite of `src/app/page.tsx`. May extract new components for the hero, entry, excerpt blocks.

**Done when.** New visitor experience is "read one continuous document," not "pick a destination."

**Depends on.** #2 (typography), #5 (title), #4 (gallery — for the hero image selection). Do this after those so it composes them.

---

## Priority 7 — Entries pipeline (`/entries/[slug]`)
**Commit tag:** `redesign(7): entries route`

**Problem.** No way to share/reference individual journal entries. The atlas grows one entry at a time but the site doesn't reflect that growth.

**Change.** Add a new route `/entries/[slug]` that renders one journal entry as a designed page (not a flipbook). Each entry gets a stable URL. Optional: an index at `/entries` listing entries in reverse chronological order.

**Data model.** For now, entries come from the markdown parser we already have. Slugs derived from the entry title (or seed if no title).

**Files.**
- `src/app/entries/[slug]/page.tsx` — dynamic route
- `src/app/entries/page.tsx` — index
- `src/app/book/entries.ts` — add slug helper

**Considerations (Next.js 16).** Use `generateStaticParams` for SSG. Check `node_modules/next/dist/docs/` for the current dynamic-route contract before writing.

**Done when.** Each journal entry has a stable URL that works standalone.

---

## Priority 10 — Reading Room — curated single-page experience
**Commit tag:** `redesign(10): reading room`

**Problem.** Procedural atlas images are forgettable at volume. A single DEEPLY CRAFTED page would win more attention than a hundred random ones.

**Change.** Add a `/reading-room` route. Shows ONE chosen journal entry per session, laid out as a designed manuscript page:
- Beautiful serif typography
- Handset drop cap
- One curated organism drawing
- Ink-bleed void in one corner
- Hand-drawn wobbly border
- Decorated margin with one selected journal entry
- Ambient background (very faint)

Initial version: 3 hand-curated pages, one selected at random per visit (or by date).

**Files.** `src/app/reading-room/page.tsx`, optionally `src/app/reading-room/layouts/*`.

**Done when.** The reading-room page feels like an exhibition piece rather than a generator output.

**Depends on.** #7 (entries infrastructure) ideally so we can pair a reading-room page with a canonical entry.

---

## Priority 9 — Renderer strategic direction (documentation only)
**Commit tag:** `redesign(9): renderer direction doc`

**Problem.** All renderers evolve toward mimicking hand-drawn Midjourney output — a losing game.

**Change.** Write `renderer/DIRECTION.md` stating the strategic pivot: code should do what code does uniquely — real readable text, theme-linked content selection, interactivity, seed-sharable URLs. Future renderers should serve the WRITING not the VISUALS.

**Files.** `renderer/DIRECTION.md` (new).

**Done when.** Any future work on renderers has a clear north star that isn't "look more like a pen drawing."

---

## Global considerations

### Next.js 16 awareness
This project is on Next.js 16. Before writing any new route/component/page, check `node_modules/next/dist/docs/` for current APIs. Prefer Server Components. Add `'use client'` only where interactivity requires it. Consider Cache Components where content is static.

### Keep the existing renderers
All rendering code in `renderer/` stays. The gallery images in `public/gallery/` stay. This redesign is about FRAMING and NAVIGATION of the existing work, not replacing the work.

### Branch & merge
All commits go to `site-redesign`. When the plan is complete, create a PR from `site-redesign` to `main`. Merge only after a live preview review.

### Rollback insurance
Each priority is a separate commit. If any one of them makes things worse, we can `git revert` just that commit without losing the others.

## Progress log

Updates will be appended as priorities are completed.

### Priority 5 — Title header confidence — complete

Home page title now uses EB Garamond italic at 5xl/7xl, flanked by
dividing rules and the Finnish subtitle in spaced uppercase mono.
Added a subtitle line "an atlas of invisible systems". The page
opens with book-cover weight rather than minimal-dev-site weight.

### Priority 2 — Journal typography upgrade — complete

Loaded EB Garamond via `next/font/google` alongside the existing
Geist Mono. Registered `--font-serif` CSS variable. Journal entry
bodies now render in serif at a larger body size (`text-lg`) for
a notebook/diary feel. Kept mono for:
- Entry titles (the found-document label)
- ALL-CAPS "scream" paragraphs (the instrument breaking through)
- List-style paragraphs (enumerations, specimen counts)
- Nav, page counters, footer — the instrument UI

The serif transforms the reading experience. Journal now feels like
literature; Atlas viewer / Gallery keep their terminal aesthetic.

### Priority 8 — Strong manifesto opening — complete

Removed the Jung "Marry the ordered to the chaos" epigraph from both
English and Finnish manifestos. The existing first paragraph ("There
is a structure beneath the structure...") now stands alone as the
opener, rendered with slightly larger leading and brighter text colour
for emphasis. Also removed the residual mycelium/sienirihmasto reference
from the Finnish manifesto to match the earlier English change.
