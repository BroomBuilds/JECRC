# JECRC University — Build Your World

The Royal Palace design system and its full animation set, rebuilt for JECRC University:
JECRC's brand colours, JECRC's content, and a hero you scrub with the scroll wheel.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Lenis · no scroll-animation library

> ### ⚠️ Two things to swap before this ships
> 1. **The tour footage is a placeholder.** `public/media/tour` currently holds a 30-second
>    stand-in built from royalty-free aerial campus clips. Drop in the real film with one command —
>    see below.
> 2. **The school-card photographs are stock.** Replace `public/media/school-*.jpg` and
>    `facility-library.jpg` with real JECRC photography. Everything else on the page is dressed
>    from stills of the film itself, so it re-skins automatically when you swap the video.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start
```

---

## Changing the video — one command

```bash
npm run tour:build -- ./JECRC.mp4
```

That single command:

- explodes the film into a numbered frame sequence at two widths (`public/media/tour/…`),
- pulls eight **stills** out of it into `public/media/stills/` — which is where the Legacy
  background, the Interlude plate, the Campus Life rows and two of the three Facilities cards
  get their imagery, so the whole page re-dresses itself from the new film,
- writes a poster frame,
- and refreshes `src/lib/tour-manifest.json`, the only thing the tour component reads.

Nothing else in the codebase needs touching.

Useful options:

```bash
npm run tour:build -- ./JECRC.mp4 --start 0 --end 30 --fps 12       # trim + finer scrub
npm run tour:build -- ./JECRC.mp4 --widths 1600,900 --quality 62    # production quality
npm run tour:build -- ./JECRC.mp4 --stills 12                       # more section imagery

#   --fps <n>        frames per second of video      default 10
#   --start <sec>    trim from                       default 0
#   --end <sec>      trim to                         default end of file
#   --widths <list>  output widths, comma separated  default 1600,900
#   --quality <n>    WebP quality 0-100              default 58
#   --format <fmt>   webp | jpg                      default webp
#   --stills <n>     stills for the rest of the page default 8
#   --max <n>        hard cap on frame count         default 400
```

**Then retime the captions.** `TOUR_CAPTIONS` in `src/lib/content.ts`; each carries
`at: [fadeIn, fadeOut]` as fractions of the tour, which are also fractions of the film.
A beat at 0:07 of a 0:30 cut is `7/30 = 0.23`.

Scroll length is `TOUR_VH` in `src/components/ScrollTour.tsx` (currently `900`).

---

## What's on the page

Same structure and the same animations as the Royal Palace build, one for one:

| Section | Animation |
|---|---|
| **Hero — the tour** | The film, scrubbed by scroll. Crest, wordmark and rule-and-tagline lockup fade through it; captions cross-fade at fixed beats; a hairline playhead tracks progress. |
| **The University** | Parallax still behind an ivory panel; headline wipes up from a clipped baseline with a ghost copy offset behind it; accent line in crimson italic; stats reveal in sequence. |
| **Interlude** | Full-bleed plate at 13% parallax, two-tone headline. |
| **Schools** | Sticky showcase — five schools cross-dissolve as you scroll, the active image slowly de-zooms through its segment, index chips and a progress rail track position. |
| **Campus Life** | Alternating rows; images wipe in left-to-right, headings mask up with ghost text. |
| **Facilities** | Staggered card reveals, slow image scale on hover. |
| **Visit** | Hand-drawn SVG map of Jaipur with the campus pinned at Sitapura — no map tiles, no API key — over the address, admissions CTAs and a getting-here table. |
| **Footer** | Crest, address set in the accent face, link columns, socials, giant ghost monogram. |

Reveals are rect-based rather than `IntersectionObserver`, so nothing is ever skipped on a
fast scroll or a deep-link jump. Everything degrades under `prefers-reduced-motion: reduce`.

---

## Where things live

| I want to change… | File |
|---|---|
| All copy — nav, stats, schools, captions, footer | `src/lib/content.ts` |
| Which image is used where | `src/lib/assets.ts` |
| Brand colours, type, reveal timing | `src/app/globals.css` (`@theme` block) |
| The tour engine | `src/components/ScrollTour.tsx` |
| The video → frames pipeline | `scripts/build-tour.mjs` |
| The crest | `src/components/Crest.tsx` |
| The illustrated map | `src/components/MapSection.tsx` |
| Section order | `src/app/page.tsx` |

### Brand

```
crimson        #cd201f   JECRC red — the gold of the original
crimson-soft   #e05a4c   accent italic on dark
crimson-pale   #f3b3a6   eyebrow labels, links on dark
brick          #915229   JECRC brown, available as a secondary
ink            #0b0808   page black
maroon         #2a0d0c   footer
maroon-deep    #1a0807   facilities
paper          #f5f1ea   light sections
cream          #e8e0d3   map parchment
sand           #cdbfad   body text on dark
```

Type: **Cormorant Garamond** (display), **Jost** (uppercase labels). The Royal Palace used
Pinyon Script for the accent words; here `.script` maps to Cormorant *italic* instead — the
same two-tone headline device in a register that suits a university. **Pinyon Script is still
loaded**: to go back to the copperplate, change one line in `src/app/layout.tsx`:

```diff
- style={{ ["--font-script" as string]: "var(--font-display)" }}
+ style={{ ["--font-script" as string]: "var(--font-pinyon)" }}
```

### Where the facts come from

32 acres, 26,000+ students, 11,900+ placements over five years, 10,000+ alumni, 27 years of
academic legacy, and the eleven schools are from jecrcuniversity.edu.in. "Build Your World" is
the university's own tagline. The film credit in the footer is per the original post by
@jecrcuniversity. **Everything else — section copy, tour captions, the campus-life and
facilities blurbs, the programme lists — is written to fit and needs review before launch.**
The crest is a placeholder emblem, not JECRC's official logo.

---

## How the scroll animation works

The full write-up, including why it isn't a `<video>` and the measurements behind that
decision, is in **[TOUR.md](./TOUR.md)**.
