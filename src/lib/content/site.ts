/**
 * Identity, contact details and outbound URLs.
 *
 * Every value is published by the group on jecrcuniversity.edu.in,
 * jecrcuncr.edu.in or jecrcfoundation.com. Change one here and it changes in
 * the page, the footer, the JSON-LD and the sitemap at once.
 */

/** Canonical origin. Override with NEXT_PUBLIC_SITE_URL for previews. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.jecrcinstitutions.com";

export const BRAND = {
  group: "JECRC",
  name: "JECRC University",
  legalName: "JECRC University",
  tagline: "Build Your World",
  promise: "Driven by a Culture of Excellence, Research and Innovation",
  foundedYear: 2000,
  copyrightYear: 2026,
  /**
   * Group-wide, on the tour's opening frame. Same figure `CONTEXT` in
   * content/numbers.ts carries as "Students enrolled"; the per-campus counts
   * in content/universities.ts are a different figure. Update both together.
   */
  enrolled: "29,643",
  /** Rounded because an alumni body going back to 2001 cannot be counted exactly. */
  alumni: "30,000+",
} as const;

export const CONTACT = {
  admissionsPhone: "1800 120 5616",
  admissionsPhoneHref: "tel:18001205616",
  altPhone: "+91 98294 68152",
  altPhoneHref: "tel:+919829468152",
  ncrPhone: "1800 410 5616",
  ncrPhoneHref: "tel:18004105616",
  email: "admission@jecrcu.edu.in",
  emailHref: "mailto:admission@jecrcu.edu.in",
  ncrEmail: "director.admission.ncr@jecrcu.edu.in",
  ncrEmailHref: "mailto:director.admission.ncr@jecrcu.edu.in",
  note: "Admissions desk closed on Sunday",
} as const;

/**
 * The accounts the group links from its own footer.
 *
 * LinkedIn is the numeric school ID rather than a vanity slug, because that is
 * the form the university publishes. The NCR site is a client-rendered app, so
 * its details have to be read with a browser rather than from the served HTML.
 */
export const SOCIAL = [
  { label: "Facebook", href: "https://www.facebook.com/jecrcuniversity" },
  { label: "Instagram", href: "https://www.instagram.com/jecrcuniversity" },
  { label: "LinkedIn", href: "https://www.linkedin.com/school/2782627/" },
  { label: "YouTube", href: "https://www.youtube.com/user/jecrcuvideo" },
  { label: "X", href: "https://x.com/jecrcuniversity" },
] as const;

/**
 * The brand marks the page links, all WebP.
 *
 * The working PNGs live in `brand-src/`, outside `public/` so they are never
 * deployed. The `brand:*` scripts read and write those; `npm run media`
 * converts them into `public/brand/`.
 */
export const LOGO = {
  /** Red crest with the wordmark in graphite, on transparent. The navbar mark. */
  lockup: "/brand/jecrc-lockup-university.webp",
  /** The same lockup in white, for coloured grounds. `npm run brand:reversed`. */
  lockupReversed: "/brand/jecrc-lockup-reversed.webp",
  /** The published two-up plate. What `brand:mono` and `brand:crest` derive from. */
  lockupTwoUp: "/brand/jecrc-lockup.webp",
  /** White on transparent, from `npm run brand:mono`. */
  lockupMono: "/brand/jecrc-lockup-mono.webp",
  /**
   * The group mark for the tour's opening frame, flat #df1919.
   *
   * Built by `npm run brand:ju`, NOT `brand:mono` — that script re-derives
   * alpha from darkness, which softens the ™ and greys the wordmark here.
   */
  juMark: "/brand/ju-mark.webp",
  /**
   * The foundation mark as published, navy. What the film closes on.
   *
   * It only holds on the near-black ending because the closing sequence washes
   * the mark's silhouette with white first. Check this frame before shipping
   * any change to that lift.
   */
  foundationMark: "/brand/jecrc-foundation-mark.webp",
  /** Reversed to white, from `npm run brand:foundation`. Lights the closing cut-out. */
  foundationMarkReversed: "/brand/jecrc-foundation-mark-reversed.webp",
  /**
   * The same mark in black — the luminance mask the closing sequence punches
   * the plate with. Each colour is its own file because the artwork is raster.
   * From `scripts/make-reversed-mark.mjs --ink 000000`.
   */
  foundationMarkBlack: "/brand/jecrc-foundation-mark-black.webp",
  /** The hospital mark as delivered, for light grounds. */
  hospitalMark: "/brand/jecrc-hospital-mark.webp",
  /** Reversed for dark and coloured grounds. `npm run brand:hospital`. */
  hospitalMarkReversed: "/brand/jecrc-hospital-mark-reversed.webp",
  /** Brand red on transparent, for the oxblood footer. */
  lockupRed: "/brand/jecrc-lockup-red.webp",
  /** The crest alone, from `npm run brand:crest`. Favicon-sized. */
  crest: "/brand/jecrc-crest.webp",
  /** The crest at 402x464, with the detail the small one loses. */
  crestLarge: "/brand/jecrc-crest-lg.webp",
} as const;
