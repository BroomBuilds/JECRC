# JECRC, Build Your World

One landing page fronting all three JECRC institutions: JECRC University in Jaipur,
JECRC University's NCR campus in Alwar, and JECRC Foundation.

It opens on a scroll-driven film with no navigation at all. When the film plays out, the
navbar from [jecrcuniversity.edu.in](https://jecrcuniversity.edu.in/) drops in, rebuilt
rather than screenshotted: the same red utility strip over a white primary strip, the same
crest hanging through a notch between them, the same `#DE1819`.

The rest of the page is light: paper ground, black type, red as the single accent, with
two bands inverted to true black. Three sections are rebuilds of
[arts.vcu.edu](https://arts.vcu.edu/), measured off the live page rather than eyeballed:
the scratch-reveal band, the schools list and the footer. Each carries a comment saying
what was measured and why it is built that way.

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
public/
  brand/             the lockup, and the keyed white version of it
  media/tour/        922 WebP frames at two widths, plus the poster
  media/stills/      frames lifted from the film, used to dress the sections
  llms.txt           the page's facts as plain text, for answer engines
  _headers           Cloudflare's copy of the cache and security headers
legacy/              the previous build, frozen. Not compiled. Delete when signed off.
```

**All copy lives in `src/lib/content/`.** Nothing is hardcoded in a component, so a content
change never means reading JSX. The files are `site`, `universities`, `navigation`,
`tour`, `schools`, `outcomes`, `alumni`, `ambassador`, `announcement`, `faq`.

---

## Common edits

| To change | Edit |
| --- | --- |
| Any headline, stat or link | the matching file in `src/lib/content/` |
| The schools list and its photographs | `content/schools.ts` |
| The film's beats and their timing | `content/tour.ts` (fractions of the scroll, 0 to 1) |
| How long the film takes to scrub | `TOUR_VH` in `sections/ScrollTour.tsx` |
| The coming-soon banner, or removing it | `content/announcement.ts`, set `live: false` |
| The scratch band's collage | `SCRATCH_IMAGES` in `app/page.tsx` |
| The scratch brush | `HEAL`, `CORE`, `SATELLITES`, `SPREAD` in `sections/ScratchReveal.tsx` |
| Colour, type scale, motion | the `@theme` block at the top of `app/globals.css` |
| The film itself | `npm run tour:build <video>`, see `TOUR.md` |

## Type

Two faces, in fixed roles. **Archivo** is the grotesque and carries every piece of
interface: navigation, eyebrows, buttons, the schools list, every figure. **Newsreader** is
the editorial voice and carries headlines and long statements. The headline is always the
serif and the lead is always the grotesque, never the reverse; keeping the two in fixed
roles is most of what makes a pairing read as deliberate.

They stand in for the commercial pair on arts.vcu.edu, Aktiv Grotesk and Mercury. Both are
variable Google fonts, so the weight range costs one file each.

## The three rebuilt sections

**Scratch band** (`sections/ScratchReveal.tsx`). A collage sits at the bottom of the stack.
Over it lies a canvas whose CSS background is white and whose blend mode is `screen`.
Screen against white is white, so the band reads as blank paper; paint black into the
canvas and screen against black is the backdrop, so the collage shows through wherever the
brush has been. No masks, no clip paths, no second copy of the images. The brush is a core
disc of about 52px with a dozen satellites strung out vertically, which is what gives the
revealed shapes ragged top and bottom edges and clean horizontal sweeps.

**Schools list** (`sections/Majors.tsx`). Black band. Rows sit at opacity 0.2 and come to 1
when active; each row owns a portrait figure pinned to its right that fades in while the
image inside it slides 100px. Clicking opens the row as an accordion and drops the figure
to 0.2. The dimming is gated on `(hover: hover)` in CSS, so a touch device shows every row
at full strength rather than a list that looks disabled.

**Footer** (`layout/Footer.tsx`). Five bands in one black block: identity and social marks,
three full-width pills, four link columns with the first set noticeably heavier, the
statutory paragraph, then the ribbon.

### Adding named alumni

`content/alumni.ts` exports `ALUMNI_PROFILES`, currently empty. Fill it and the Alumni
section grows a card grid; leave it empty and the section shows the network figures alone.
No component change either way. Named graduates need consent and licensed photographs, so
nothing is invented there.

### Adding the ambassador portrait

`content/ambassador.ts` has `portrait: undefined`. Point it at a licensed image in
`public/brand/` and the section swaps the placeholder frame for it. Do not substitute a
press photograph.

### Regenerating the white lockup

The published lockup is red artwork on an opaque white plate, which is right on the white
navbar and wrong over the film. `npm run brand:mono` keys the plate out into
`public/brand/jecrc-lockup-mono.png`. Re-run it if the brand asset changes.

---

## SEO and GEO

- **Metadata** in `app/layout.tsx`: title template, canonical, Open Graph, Twitter card,
  `max-image-preview: large`, `en-IN`.
- **Structured data** in `lib/seo/schema.ts`, built from the same content the page renders,
  so the two cannot drift. One `@graph` where the organisation, the three campuses, the
  ambassador, the site, the page and the FAQ all reference each other by `@id`, rather than
  a pile of unrelated blobs.
- **`robots.ts` and `sitemap.ts`** are generated, not static files. Answer engines are
  allowed in deliberately.
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
2. **No named alumni and no ambassador portrait**, for the reasons above.
3. **Social links** in `content/site.ts` are the group's canonical handles. Confirm each
   against the client's live accounts before launch.
4. **The JECRC Foundation street address** in `lib/seo/schema.ts` is the published campus
   address; have the client confirm the postcode.

---

## Notes

- `TOUR.md` is the full write-up of the scroll film: why it is an image sequence on a
  canvas rather than a scrubbed `<video>`, with the frame-timing measurements behind that.
- `legacy/` is the previous build, kept for reference. It is excluded from `tsconfig.json`,
  `eslint.config.mjs` and the route tree, so it costs nothing. Delete it once this build is
  signed off.
