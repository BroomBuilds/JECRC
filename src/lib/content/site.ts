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

export const LOGO = {
  /** Red artwork on a white plate. For light surfaces only. */
  lockup: "/brand/jecrc-lockup.png",
  /** White artwork on transparent, derived by `npm run brand:mono`. For dark ones. */
  lockupMono: "/brand/jecrc-lockup-mono.png",
  mark: "/brand/jecrc-mark.png",
} as const;
