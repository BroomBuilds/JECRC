# JECRC — Build Your World

**A landing page for the JECRC Group of Institutions.**
Built by [BroomBuilds](https://broombuilds.com).

One page fronting all three institutions: JECRC University in Jaipur, JECRC
University's NCR campus in Alwar, and JECRC Foundation.

It opens on a scroll-driven film with no navigation. When the film plays out
the navbar drops in — a red utility strip over a white primary strip, with the
crest on a plate hanging through the seam. The rest of the page is light, with
the programmes band inverted to black and the footer to near-black.

Live at **www.jecrcinstitutions.com**, hosted on Hostinger.

---

## Contents

1. [Running it](#running-it)
2. [Where the content lives](#where-the-content-lives)
3. [Replacing images and film](#replacing-images-and-film)
4. [Deploying to Hostinger](#deploying-to-hostinger)
5. [Stack and layout](#stack-and-layout)
6. [Support](#support)

---

## Running it

**Node 20.9 or newer** — pinned in `engines`. Next 16 will not run on 18.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run start
npm run lint
```

---

## Where the content lives

**Every word and URL is in `src/lib/content/`.** Nothing is hardcoded in a
component, so changing copy never means reading JSX.

| To change | Edit |
| --- | --- |
| Phone, email, addresses, social links | `content/site.ts` |
| The eleven schools and their links | `content/schools.ts` |
| Placement figures and the recruiter list | `content/numbers.ts` |
| FAQ questions and answers | `content/faq.ts` |
| The Vikrant Massey band | `content/ambassador.ts` |
| Nav links and the footer directory | `content/navigation.ts` |
| Campus names and apply links | `content/universities.ts` |
| The "coming soon" band | `content/announcement.ts` — `live: false` to hide |
| Film captions and their timing | `content/tour.ts` |
| Colour, type scale, motion | the `@theme` block in `app/globals.css` |

---

## Replacing images and film

### School photographs

Put the file in `ref/images`, map its name to the slug in `SCHOOL_PHOTOS` in
`scripts/optimize-media.mjs`, then:

```bash
npm run media
```

It writes `public/media/schools/<slug>.webp`, which is the only path the site
knows about. JPEG, PNG and AVIF all work. **Portrait, ideally 2:3 or 3:4** —
the frame crops to 3:4. More in `public/media/schools/README.md`.

### The film

```bash
npm run tour
```

Reads the source videos from `ref/`. `TOUR.md` is the full write-up of how the
scroll film works and why it is built the way it is.

### Brand marks

```bash
npm run brand:reversed   # white lockup, for coloured grounds
npm run brand:social     # og:image and favicons
npm run media            # encodes brand-src/ into public/brand/
```

`brand-src/` holds the working PNGs and sits outside `public/` on purpose —
everything in `public/` deploys verbatim, so an intermediate nothing links is
bytes uploaded to the host for nothing.

`ref/` is gitignored. Sources are working assets; the encoded output under
`public/` is what ships and what is committed. **Keep originals outside the
repo.**

---

## Deploying to Hostinger

Every route is prerendered at build time — there is no per-request rendering,
no database and no API route.

> **If the build fails with a message about a `<hash>.next.config` file**, the
> host is on a Node older than 20.9. That file is a temporary artefact, not
> something in the repo — deleting it changes nothing. Raise the Node version.

### Node.js hosting (recommended)

hPanel → **Website → Node.js**. Point it at the repo, then:

| Setting | Value |
| --- | --- |
| Node version | **20.9 or newer** (18 will fail) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm run start` |
| Application port | whatever hPanel assigns (`next start` reads `PORT`) |

Set one environment variable:

```
NEXT_PUBLIC_SITE_URL=https://www.jecrcinstitutions.com
```

It feeds the canonical URL, the sitemap, `robots.txt`, the `og:image` URL and
every `@id` in the structured data. The same value is the fallback in
`content/site.ts`, so a build without it still resolves — but set it, and point
it at the preview domain on any staging deployment.

On this path the `headers()` block in `next.config.mjs` applies and
`public/.htaccess` is ignored.

### Shared hosting (static upload)

If the plan has no Node runtime, add one line to `next.config.mjs`:

```js
const nextConfig = {
  output: "export",
  // …everything else unchanged
};
```

Then `npm run build` writes a complete static site to `out/`. Upload the
**contents** of `out/` to `public_html`. `public/.htaccess` is copied into that
output and is what Apache/LiteSpeed reads for cache and security headers.

Note that `NEXT_PUBLIC_SITE_URL` is baked in at build time on this path, so the
domain has to be correct **before** you build.

### After the first deploy

Check exactly one `max-age` comes back per response — two is silent and makes
the browser revalidate the whole film on every visit:

```bash
curl -sI https://www.jecrcinstitutions.com/media/tour/h/avif/1920/f0400.avif | grep -i cache
curl -sI https://www.jecrcinstitutions.com/media/schools/law.webp            | grep -i cache
```

The first should be `max-age=31536000, immutable`, the second `max-age=2592000`.

If a CDN is enabled in front of the site, run the film through it once so the
first real visitor is not the one paying for a cold edge — from a machine near
the audience, not a CI runner elsewhere:

```bash
npm run tour:warm -- https://www.jecrcinstitutions.com
```

Without a CDN this does nothing and can be skipped.

### Handover checklist

- [ ] `NEXT_PUBLIC_SITE_URL` set on the host
- [ ] Domain and SSL pointed at the app in hPanel
- [ ] Exactly one `max-age` per response (above)
- [ ] `robots.txt` and `sitemap.xml` return the live domain, not a placeholder
- [ ] Confirm with JECRC: the Vikrant Massey announcement date in
      `content/ambassador.ts`, and the JECRC Foundation postcode in
      `lib/seo/schema.ts`

---

## Stack and layout

Next.js 16 · React 19 · Tailwind 4 · TypeScript. No UI library, no animation
library.

```
src/
  app/               layout, page, globals.css, robots.ts, sitemap.ts
  components/
    layout/          Navbar, Footer, ApplyBar, SmoothScroll, Reveal, Cursor
    sections/        one file per band of the page, in page order
    ui/              Eyebrow, ApplyMenu, Icons, VideoDialog, ScrollTopButton
  lib/
    content/         every word and URL on the page
    seo/             the JSON-LD graph
brand-src/           working PNGs for the brand marks — not served
public/
  brand/             the marks the page links
  media/tour/        the film, as AVIF frames at three widths per orientation
  media/schools/     one photograph per school
  llms.txt           the page's facts as plain text, for answer engines
  .htaccess          cache and security headers for Apache / LiteSpeed
```

**Type.** Two faces in fixed roles: Schibsted Grotesk carries every piece of
interface, Fraunces carries headlines and long statements. The headline is
always the serif and the lead always the grotesque, never the reverse.

**`globals.css`.** Element resets live in `@layer base` and the `.u-*` helpers
in `@layer components`, both deliberately. Unlayered CSS outranks every
Tailwind layer, so a plain `p { margin: 0 }` silently defeats `mt-8` on every
paragraph on the site. **Keep new rules inside a layer.**

**Mobile first.** Most traffic arrives on a phone, so the phone is designed and
the desktop inherits: the film costs less there, the scratch band works without
a hover pointer, tap targets are 44px.

**SEO.** Structured data in `lib/seo/schema.ts` is built from the same content
the page renders, so the two cannot drift. `robots.ts` names sixteen
answer-engine crawlers explicitly rather than leaving them to the wildcard, and
every FAQ answer is written to be quoted whole.

---

## Support

**BroomBuilds** — design, build and AI automation studio.

- [broombuilds.com](https://broombuilds.com)
- varun17593@gmail.com
- +91 95808 68588
