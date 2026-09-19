# JECRC, Build Your World

One landing page fronting all three JECRC institutions: JECRC University in Jaipur,
JECRC University's NCR campus in Alwar, and JECRC Foundation.

It opens on a scroll-driven film with no navigation at all. When the film plays out, the
navbar from [jecrcuniversity.edu.in](https://jecrcuniversity.edu.in/) drops in, rebuilt
rather than screenshotted: the same red utility strip over a white primary strip, the same
crest hanging through a notch between them, the same `#DE1819`.

The rest of the page is light: paper ground, black type, red as the single accent, with the
programmes band inverted to black and the footer to oxblood. Two sections are rebuilds of
[arts.vcu.edu](https://arts.vcu.edu/), measured off the live page rather than eyeballed:
the scratch-reveal band and the programmes list. The FAQ follows `ref/faq.png`. Each
carries a comment saying what was measured and why it is built that way.

The ask is not a section. A red tab rides the right edge, lifted from
jecrcuniversity.edu.in, so applying is half a click away from anywhere.

```
npm install
npm run dev          # http://localhost:3000
npm run build        # static, four routes
```

---

## Structure

```
src/
  app/               layout, page, globals.css, robots.ts, sitemap.ts, not-found
  components/
    layout/          Navbar, Footer, SmoothScroll, Reveal
    sections/        one file per band of the page, in page order
    ui/              Section/Eyebrow/SectionHeading, ApplyMenu, Icons
  lib/
    content/         every word and URL on the page
    seo/             the JSON-LD graph
    hooks/           useTourComplete
    utils/           cn
brand-src/           the brand marks' WORKING PNGs. Not served — see below
public/
  brand/             the marks the page actually links, lossless WebP
  media/tour/        the film, as AVIF frames at three widths plus a WebP
                     fallback tier, per orientation, and the poster
  media/stills/      s4-s6, lifted from the film to dress the sections
  llms.txt           the page's facts as plain text, for answer engines
  _headers           Cloudflare's copy of the cache and security headers
```

**`brand-src/` is deliberately outside `public/`.** Everything in `public/` is deployed
verbatim, so a PNG kept there for a build script to read is a PNG shipped to every edge for
nobody to fetch. The `brand:*` scripts read and write `brand-src/`; `npm run media` converts
it into `public/brand/`, and the page links only the WebP.

**All copy lives in `src/lib/content/`.** Nothing is hardcoded in a component, so a content
change never means reading JSX. The files are `site`, `universities`, `navigation`,
`tour`, `schools`, `outcomes`, `alumni`, `ambassador`, `announcement`, `faq`.

---

## Common edits

| To change | Edit |
| --- | --- |
| Any headline, stat or link | the matching file in `src/lib/content/` |
| The featured programmes and their photographs | `content/schools.ts` |
| Any figure in the record band | `content/numbers.ts` |
| The film's beats and their timing | `content/tour.ts` (fractions of the scroll, 0 to 1) |
| How long the film takes to scrub | `TOUR_VH` in `sections/ScrollTour.tsx` |
| The coming-soon banner, or removing it | `content/announcement.ts`, set `live: false` |
| The scratch band's collage | `SCRATCH_IMAGES` in `app/page.tsx` |
| The scratch brush | `HEAL`, `CORE`, `SATELLITES`, `SPREAD` in `sections/ScratchReveal.tsx` |
| Colour, type scale, motion | the `@theme` block at the top of `app/globals.css` |
| The film itself | `npm run tour:build <video>`, see `TOUR.md` |

## Type

Two faces, in fixed roles. **Schibsted Grotesk** is the newspaper grotesque and carries
every piece of interface: navigation, eyebrows, buttons, the programmes list, every figure.
**Fraunces** is the editorial voice and carries headlines and long statements. The headline
is always the serif and the lead is always the grotesque, never the reverse; keeping the
two in fixed roles is most of what makes a pairing read as deliberate.

Fraunces is requested as the fully variable cut with its non-weight axes, so one file
serves both ends of the range: `opsz` opens the counters as the size grows, `SOFT` controls
how far the terminals round off, `WONK` switches in the swashed forms that give the italic
its character. The `.u-serif`, `.u-serif-text` and `.u-serif-italic` helpers in
`globals.css` are the three settings actually used.

A note on `globals.css`: the element resets live in `@layer base` and the `.u-*` helpers in
`@layer components`, both deliberately. Unlayered CSS outranks every Tailwind layer, so a
plain `p { margin: 0 }` silently defeats `mt-8` and `mx-auto` on every paragraph on the
site, and a plain `.u-serif` defeats a `leading-*` utility sitting next to it. Keep new
rules inside a layer.

## The three rebuilt sections

**Scratch band** (`sections/ScratchReveal.tsx`). A collage sits at the bottom of the stack.
Over it lies a canvas whose CSS background is white and whose blend mode is `screen`.
Screen against white is white, so the band reads as blank paper; paint black into the
canvas and screen against black is the backdrop, so the collage shows through wherever the
brush has been. No masks, no clip paths, no second copy of the images. The brush is a core
disc of about 52px with a dozen satellites strung out vertically, which is what gives the
revealed shapes ragged top and bottom edges and clean horizontal sweeps.

It does not heal and it does not scratch itself. An earlier pass washed the canvas with a
low-alpha white each frame and ran an idle path across the band; both are gone. A coarse
occupancy grid keeps score instead, and once 42 percent of the band is open the rest of the
sheet drops in one move and the canvas retires.

**Programmes list** (`sections/Majors.tsx`). Black band. Rows sit at opacity 0.2 and come
to 1 when active; each row owns a portrait figure pinned to its right that fades in while
the image inside it slides 100px. Clicking opens the row as an accordion and drops the
figure to 0.2. The dimming is gated on `(hover: hover)` in CSS, so a touch device shows
every row at full strength rather than a list that looks disabled.

The content is deliberately not a list of school names. Every entry is a degree that
carries an industry partner in the award itself, taken verbatim from JECRC's application
portal. Do not invent partners.

**FAQ** (`sections/Faq.tsx`). Built to `ref/faq.png`: questions are dark sent-bubbles that
hug their text, answers arrive as white received-bubbles with the crest as the speaker. The
open and close animates `grid-template-rows` from 0fr to 1fr rather than a max-height
guess, so the panel travels to its exact height and a long answer never clips or snaps.

### Adding named alumni

`content/alumni.ts` exports `ALUMNI_PROFILES`, currently empty. Fill it and the Alumni
section grows a card grid; leave it empty and the section shows the network figures alone.
No component change either way. Named graduates need consent and licensed photographs, so
nothing is invented there.

### The ambassador portrait

`content/ambassador.ts` points at `/brand/vikrant-massey.webp`, which is JECRC's own
published campaign photograph from their application portal, shot on the Sitapura campus.
Swap it for the campaign master when the shoot assets arrive. Setting `portrait` back to
`undefined` returns the section to its branded placeholder frame, so pulling the image
never leaves a hole.

### Regenerating the white lockup

The published lockup is red artwork on an opaque white plate, which is right on the white
navbar and wrong anywhere dark. `npm run brand:mono` keys the plate out; pass a hex as the
third argument for a flat colour, which is how `jecrc-lockup-red.png` in the footer is
made. `npm run brand:crest` cuts the crest alone out of the red lockup, because the
`jecrc-mark.png` originally pulled off the live site turned out to be an unrelated white X.
Re-run both if the brand asset changes.

---

## Mobile first

Most of the traffic arrives on a phone, so the phone is the case that gets
designed and the desktop is the one that inherits.

- **The film costs half as much on a phone.** Every second frame is skipped
  (462 requests instead of 922) and the scroll length drops from fifteen screens
  to nine, so the pixels between frames barely change and it still reads as
  continuous motion. First load falls from roughly 16 MB to 7 MB, and the whole
  page from 22,600px to 17,800px at 320px wide.
- **The scratch band works without a hover pointer.** A finger dragged across it
  scrolls the page, and taking that away with `touch-action: none` would trap
  the visitor inside a decorative section. A coarse pointer gets the honest
  equivalent: the sheet opens top down as the band crosses the viewport.
- **Tap targets are 44px.** The icon keeps the size it looks; only the box
  around it grows, with a negative margin so rows do not get wider.
- **The eyebrow is 13px on phones**, 12px once there is room. Uppercase at 12px
  with that much tracking is fine on a desktop and marginal in a hand.

Verified at 320, 360, 390, 414, 430, 768, 834, 1024, 1280, 1440 and 1920: no
horizontal overflow anywhere, one h1, every image with alt, no dead anchors, no
console errors.

## SEO and GEO

- **Metadata** in `app/layout.tsx`: title template, canonical, Open Graph, Twitter card,
  `max-image-preview: large`, `en-IN`.
- **Structured data** in `lib/seo/schema.ts`, built from the same content the page renders,
  so the two cannot drift. One eighteen-node `@graph` where everything references everything
  else by `@id`, rather than a pile of unrelated blobs: the organisation, the three
  campuses, one `EducationalOccupationalProgram` per featured degree, the ambassador as a
  `Person`, the announcement as a `VideoObject`, the site, the page, a breadcrumb and the
  FAQ.
- **The programme nodes are the AEO play.** Each carries its award, its school and, where
  one exists, the industry partner as a second `provider`. "Which universities teach chip
  design with Truechip" is a question only that markup can answer.
- **The record is machine-readable too**, as `PropertyValue` entries on the organisation,
  so a model does not have to parse the figures out of prose.
- **`robots.ts` and `sitemap.ts`** are generated, not static files. Sixteen answer-engine
  crawlers are named and allowed rather than left to the wildcard: `Google-Extended` and
  `Applebot-Extended` are opt-outs some hosts and CDNs add by default, so saying yes
  explicitly is the only way to be sure the answer is yes.
- **The share card is drawn, not lifted.** `npm run brand:social` renders
  `public/opengraph-image.png` at 1200 by 630 plus the icon set from the crest. A frame
  from the tour film is a photograph with no name on it, which is not what a link preview
  is judged on.
- **`public/llms.txt`** states the same facts in plain text for models that fetch it.
- **The FAQ answers are written to be quoted.** Every one is self-contained: no
  back-references, no pronouns that need the previous entry. A model lifting a single entry
  comes away with a complete, correct sentence.

### Before going live

Set `NEXT_PUBLIC_SITE_URL` to the real origin. It feeds `metadataBase`, the canonical, the
sitemap, `robots.txt` and every `@id` in the graph. The fallback in `content/site.ts` is a
placeholder.

---

## Deploying

Nothing on the page is server-rendered per request, so it builds to static output and does
not care where it lands.

- **Cloudflare Pages or Workers** reads `public/_headers`.
- **Node-served hosts** read the `headers()` block in `next.config.ts`.

The two files carry the same rules and have to be kept in step. `images.unoptimized` is on
so `next/image` needs no platform image service: every image already ships at the size it
is used at.

Tour frames are served `immutable` for a year. A rebuild produces a new commit rather than
new contents at an old URL, so nothing goes stale, and only a visitor's very first load
pays for the film.

---

## Known placeholders

1. **The film is placeholder footage.** Real campus film goes through
   `npm run tour:build`; nothing else changes. The section imagery in `media/stills/` is
   lifted from whatever film is loaded, so it restyles with it.
2. **No named alumni**, for the reason above.
3. **Social links** in `content/site.ts` are the group's canonical handles. Confirm each
   against the client's live accounts before launch.
4. **The JECRC Foundation street address** in `lib/seo/schema.ts` is the published campus
   address; have the client confirm the postcode.

---

## Notes

- `TOUR.md` is the full write-up of the scroll film: why it is an image sequence on a
  canvas rather than a scrubbed `<video>`, with the frame-timing measurements behind that.
