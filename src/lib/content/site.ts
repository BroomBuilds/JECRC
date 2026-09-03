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
 * what `brand:mono` and `brand:crest` read and write. `npm run brand:webp` is
 * the last step of that chain and produces what the site links to, at 59% of
 * the bytes with nothing lost. The lockup is the largest paint on the page
 * over the film's first beat, so this is not a rounding error.
 */
export const LOGO = {
  /** Red artwork on a white plate. For light surfaces only. */
  lockup: "/brand/jecrc-lockup.webp",
  /** White artwork on transparent, derived by `npm run brand:mono`. For dark ones. */
  lockupMono: "/brand/jecrc-lockup-mono.webp",
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
