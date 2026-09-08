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
   * The founding entity's own published mark: navy roundel, "JECRC Foundation"
   * wordmark, on transparent. Unlike `juMark` this is NOT recoloured — it is a
   * published logo with its own brand colours, and a founding trust's mark is
   * not ours to repaint. Converted from `ref/JECRC Foundation Logo_.png` with
   * a plain trim + webp pass, nothing else.
   */
  foundationMark: "/brand/jecrc-foundation-mark.webp",
  /**
   * The same mark reversed to white, by `npm run brand:foundation`.
   *
   * Built when the navy went soft against a lightened film frame, then set
   * aside: the group wants the published navy on the opening frame, so
   * `foundationMark` above is what ships. Kept because the reverse is the
   * obvious thing to reach for the next time this mark has to sit on a dark
   * or coloured ground, and it is one command to regenerate either way.
   */
  foundationMarkReversed: "/brand/jecrc-foundation-mark-reversed.webp",
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
