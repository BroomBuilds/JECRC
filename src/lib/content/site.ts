/**
 * Single source of truth for identity, contact details and outbound URLs.
 *
 * Everything here is taken from the three live properties
 * (jecrcuniversity.edu.in, jecrcuncr.edu.in, jecrcfoundation.com). Change a
 * value here and it changes in the page, the footer, the JSON-LD and the
 * sitemap at once.
 */

/** Canonical origin. Override per environment for preview deployments. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://jecrc.edu.in";

export const BRAND = {
  group: "JECRC",
  name: "JECRC University",
  legalName: "JECRC University",
  tagline: "Build Your World",
  promise: "Driven by a Culture of Excellence, Research and Innovation",
  foundedYear: 2000,
  copyrightYear: 2026,
  /**
   * Heads the scroll tour's opening frame under the group name. Given by the
   * group as an exact roll rather than a rounded one, which is why it is not
   * the "26,000+" that NUMBERS carries — that figure is the two universities
   * only, this one is the whole group. Update both when the group does.
   */
  enrolled: "29,643",
} as const;

export const CONTACT = {
  admissionsPhone: "+91 97733 68851",
  admissionsPhoneHref: "tel:+919773368851",
  altPhone: "+91 91166 42285",
  altPhoneHref: "tel:+919116642285",
  ncrPhone: "1800 410 5616",
  ncrPhoneHref: "tel:18004105616",
  email: "info@jecrcu.edu.in",
  emailHref: "mailto:info@jecrcu.edu.in",
  ncrEmail: "director.admission.ncr@jecrcu.edu.in",
  ncrEmailHref: "mailto:director.admission.ncr@jecrcu.edu.in",
  note: "Admissions desk closed on Sunday",
} as const;

export const SOCIAL = [
  { label: "Facebook", href: "https://www.facebook.com/jecrcuniversity" },
  { label: "Instagram", href: "https://www.instagram.com/jecrcuniversity" },
  { label: "LinkedIn", href: "https://www.linkedin.com/school/jecrcuniversity" },
  { label: "YouTube", href: "https://www.youtube.com/@JECRCUniversityJaipur" },
  { label: "X", href: "https://x.com/jecrcuniversity" },
] as const;

/**
 * Lossless WebP, not the PNGs beside them.
 *
 * The `.png` in public/brand are the working format: the published artwork and
 * what `brand:mono` and `brand:crest` read and write. `npm run media` is the
 * last step of that chain and produces what the site links to, at 59% of the
 * bytes with nothing lost. The lockup is the largest paint on the page
 * over the film's first beat, so this is not a rounding error.
 */
export const LOGO = {
  /** Red artwork on a white plate. For light surfaces only. */
  lockup: "/brand/jecrc-lockup.webp",
  /** White artwork on transparent, derived by `npm run brand:mono`. For dark ones. */
  lockupMono: "/brand/jecrc-lockup-mono.webp",
  /**
   * The group mark for the tour's opening frame, in brand red.
   *
   * `ref/JU logo.png` as published, repainted to one flat #df1919 and nothing
   * else: same shapes, same alpha, the crest hairlines and the trademark glyph
   * intact. Built by `npm run brand:ju`, NOT by `brand:mono` — that script
   * re-derives alpha from darkness, which is right for artwork on a white plate
   * and wrong here, where it softened the ™ and rendered the wordmark grey.
   */
  juMark: "/brand/ju-mark.webp",
  /**
   * The published mark, unaltered, and what the film closes on.
   *
   * Navy on a near-black plate should not work, and the only reason it does is
   * the lift: the ending washes the mark's own silhouette with white before the
   * fill arrives, so the navy lands on a lifted ground rather than straight on
   * the plate. Measured on the built page it reads cleanly at every size. If
   * that lift is ever turned down, check this frame before shipping.
   */
  foundationMark: "/brand/jecrc-foundation-mark.webp",
  /**
   * The same mark reversed to white, by `npm run brand:foundation`.
   *
   * Used by the closing sequence to light the hole it cuts in the plate. It
   * was built for the opening frame, where the published navy went soft
   * against the film, then set aside when the group asked for the navy back —
   * and the ending, which is very nearly black, turned out to be the dark
   * ground it was always the right answer for.
   */
  foundationMarkReversed: "/brand/jecrc-foundation-mark-reversed.webp",
  /**
   * The same mark in black, for the closing sequence.
   *
   * The ending does three things to one piece of artwork: cuts it out of the
   * plate, lights the hole, then fills it solid. The Cinzel wordmark this
   * replaced was SVG <text> and could be recoloured per copy for nothing; a
   * raster cannot, so each colour is its own file — this one is the luminance
   * mask that punches the hole, `Reversed` above lights it, and the mark that
   * settles in last is `foundationMark`, the published navy, unaltered.
   *
   * From `scripts/make-reversed-mark.mjs --ink 000000`.
   */
  foundationMarkBlack: "/brand/jecrc-foundation-mark-black.webp",
  /**
   * The hospital's published mark as given, for LIGHT surfaces. Nothing on the
   * site uses it today — the film and the crimson band both need the reversed
   * variant below — but it is the artwork as delivered, kept for any light
   * ground that wants it.
   *
   * Maroon-and-tan shield, black wordmark,
   * "Infinite Care". Same treatment as the foundation mark — trimmed and
   * converted, ink untouched. Measured on the site's own crimson (#df1919):
   * the black wordmark and the shield's dark maroon both hold contrast, so it
   * needs no recolouring to sit on the "what's next" band.
   */
  hospitalMark: "/brand/jecrc-hospital-mark.webp",
  /**
   * The same mark reversed for dark and coloured grounds: white wordmark,
   * white knot, the shield's flanking curves held back to half alpha so it
   * keeps its shape. Built by `npm run brand:hospital`. This is the one the
   * site actually uses — over the film and on the crimson band, both of which
   * the published black-on-white version cannot sit on.
   */
  hospitalMarkReversed: "/brand/jecrc-hospital-mark-reversed.webp",
  /** Brand red on transparent, for the oxblood footer. Same script, `#de1819`. */
  lockupRed: "/brand/jecrc-lockup-red.webp",
  /** The crest alone, cut out of the red lockup by `npm run brand:crest`. */
  crest: "/brand/jecrc-crest.webp",
  /**
   * The crest at 402 by 464, for the tour's closing lockup.
   *
   * Cut from `ref/JU logo.png`, the university's own 1500px lockup, on its
   * alpha bounding box. `crest` above it is a different animal: that one is
   * derived from the 557px two-up artwork and tops out at 80 by 89, which is
   * fine at favicon size and mush at the size the ending sets the mark. This
   * is the same crest with the detail still in it.
   */
  crestLarge: "/brand/jecrc-crest-lg.webp",
} as const;
