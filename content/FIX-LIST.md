# Deep Reality Atlas — fix list

Working through findings from multi-agent review, 2026-04-18.

## Completed

### Technical
- [x] `next.config.ts`: scoped `no-store` to dev only — CDN caching restored in production
- [x] `src/app/book/entries.ts`: memoised with React `cache()` + module-scope cache
- [x] `package.json`: removed unused `p5` + `@types/p5`; moved `canvas` + `puppeteer` to devDependencies
- [x] `src/app/layout.tsx`: added `metadataBase`, `openGraph`, `twitter`, editor-voice title/description
- [x] `src/app/opengraph-image.tsx`: dynamic OG image with recurring Symbol, dark palette
- [x] `src/components/LangSync.tsx`: client runtime updater syncs `<html lang>` with `?lang=fi`
- [x] Home hero figcaption: added `font-mono`

### Frame/voice surgery
- [x] `src/app/page.tsx`: dropped "Helsinki" from `[V.P., Helsinki — editor]` footer → now `[V.P. — editor]`
- [x] `src/app/the-finding/page.tsx`: signs "— Ville Pajala" (no middle Johannes) in both EN and FI
- [x] `src/app/atlas/page.tsx`: reframed with V.P.'s editor's note describing the generator as a reconstruction of Kamikaze's apparatus; also set `robots: noindex`
- [x] `src/app/manifesto/content-en.tsx` + `content-fi.tsx`: cut §44, §46, §47, §48 (lineage roll call); kept §45 (Jung — tightest). Replaced §91 ("void learning your name") with "The page ends. The pen continues." Replaced §94 flattery anaphora with "Some of this was written to a reader who has not yet been born. Read anyway."
- [x] `src/app/kutsu.tsx`: replaced variant 1 (both EN + FI) — no more "To you, who..." flattery, no more "void learning your name" closer
- [x] `src/app/letters/page.tsx`: Letter III compressed to two lines — "The thing I wanted to say has left me. The note is all that is left of the thing."

### Gallery rewire
- [x] `src/app/gallery/images.ts`: stripped fabricated "Manifesto — X" citations; new policy documented at top. Added `pairedEntryTitle` field for 5 specific pairings
- [x] `src/app/gallery/page.tsx`: added V.P. editor's note at top distinguishing descriptors (V.P.'s readings) from quotes (Kamikaze's voice). 5 quotes now link to their paired journal entry via `getEntryByTitle`. Descriptors now italic to signal editorial voice. Footer uses Symbol component. "Atlas" title used. Renamed atlas-instrument footer link to "V.P.'s reconstruction"

### Hidden page continuity
- [x] `/envelope` + `/paper`: reconciled — paper found "in the drawer beside the envelope," not inside

### Typography
- [x] Normalised "Deep Reality" back-link across all pages to `text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300`

### Content
- [x] 35 new entries delivered (30 voice-balance + 5 promissory: Jung's Red Book, Dick's Exegesis, Artaud, Laing, Foucault)
- [x] Appended + re-shuffled with seed 1997 → journal now 394 entries

### Verification
- [x] `npx tsc --noEmit` — 0 errors

## Deferred (not on critical path)

- [ ] LanguageToggle deployment to `/gallery`, `/book`, `/letters`, `/entries`, `/entries/[slug]`, `/reading-room`. Adding FI variants for /letters and /gallery is a bigger content lift.
- [ ] BookViewer footer: "Enter the Atlas" link still points to generator under old phrasing
- [ ] Reading Room's warm-brown palette fights the cool-gray elsewhere (visual agent flagged; aesthetically contested)
- [ ] Better /book viewer: index sidebar, fast scrub, URL-per-entry (larger feature)
- [ ] Accessibility pass: add `<h1>` to pages missing them, `aria-live` on BookViewer entry change
- [ ] Footer pattern standardisation (Symbol + mantra + gap-4 + mt-24) across ALL pages — about half are standardised

## Policies committed

- V.P.'s public editor signature: "Ville Pajala" (no middle name). Doppelganger clue remains in shared infrastructure but is not explicitly broadcast.
- Gallery descriptors are V.P.'s editorial readings (italic, marked by note at top). Quotes are Kamikaze's, linked to journal where possible.
- `/atlas` route is V.P.'s reconstruction of a lost instrument, not a live artist's tool. `robots: noindex`.
- Manifesto closes without flattery. Lineage references land inside journal entries (where earned), not in the manifesto as a roll call.
- "The void has been learning your name" is retired from the project.
