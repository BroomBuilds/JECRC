/**
 * The navigation, mirroring jecrcuniversity.edu.in exactly: a red utility strip
 * over a white primary strip, with the crest sitting in the notch between them.
 */

export type NavItem = { label: string; href: string; external?: boolean };

/** Red strip, left of the crest. */
export const UTILITY_LEFT: NavItem[] = [
  { label: "About", href: "https://jecrcuniversity.edu.in/overview/", external: true },
  { label: "JU Initiatives", href: "https://jecrcuniversity.edu.in/ju-creators/", external: true },
  { label: "Life at JU", href: "https://jecrcuniversity.edu.in/clubs-communities/", external: true },
  { label: "Career at JU", href: "https://jecrcuniversity.edu.in/careers/", external: true },
];

/** Red strip, right of the crest. */
export const UTILITY_RIGHT: NavItem[] = [
  { label: "About JMCH", href: "https://jecrcuniversity.edu.in/jmch/", external: true },
  { label: "Contact", href: "#admissions" },
];

/** White strip, left of the crest. */
export const PRIMARY_LEFT: NavItem[] = [
  { label: "Admissions", href: "#admissions" },
  { label: "Campuses", href: "#campuses" },
  { label: "Programmes", href: "#programmes" },
  { label: "Placements", href: "#outcomes" },
];

/** White strip, right of the crest. */
export const PRIMARY_RIGHT: NavItem[] = [
  { label: "Campus Life", href: "#life" },
  { label: "Alumni", href: "#alumni" },
  { label: "NCR Campus Alwar", href: "https://jecrcuncr.edu.in/", external: true },
];

/** Flattened, in reading order, for the mobile drawer. */
export const MOBILE_NAV: NavItem[] = [
  ...PRIMARY_LEFT,
  ...PRIMARY_RIGHT,
  ...UTILITY_LEFT,
  ...UTILITY_RIGHT,
];

export const FOOTER_NAV = {
  study: [
    { label: "Programmes", href: "#programmes" },
    { label: "Admissions", href: "#admissions" },
    { label: "Scholarships", href: "https://jecrcuniversity.edu.in/scholarship/", external: true },
    { label: "Fee structure", href: "https://jecrcuncr.edu.in/fee-structure", external: true },
    { label: "Placements", href: "#outcomes" },
  ],
  campuses: [
    { label: "Jaipur campus", href: "https://jecrcuniversity.edu.in/", external: true },
    { label: "Alwar NCR campus", href: "https://jecrcuncr.edu.in/", external: true },
    { label: "JECRC Foundation", href: "https://jecrcfoundation.com/", external: true },
    { label: "Hostels", href: "https://jecrcuniversity.edu.in/hostel-facility/", external: true },
    { label: "Central library", href: "https://jecrcuniversity.edu.in/central-library/", external: true },
  ],
  institute: [
    { label: "Leadership", href: "https://jecrcuniversity.edu.in/leadership/", external: true },
    { label: "Research", href: "https://jecrcuniversity.edu.in/research-at-jecrc-university/", external: true },
    { label: "Incubation centre", href: "https://jecrcincubation.com/", external: true },
    { label: "Anti-ragging", href: "https://jecrcuniversity.edu.in/anti-ragging/", external: true },
    { label: "Approvals and compliance", href: "https://jecrcuncr.edu.in/", external: true },
  ],
} satisfies Record<string, NavItem[]>;
