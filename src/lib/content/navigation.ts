/**
 * The navigation.
 *
 * The chrome from jecrcuniversity.edu.in, cut down. Their bar carries a full
 * site's information architecture because it fronts a full site; this is one
 * page, so a copy of that menu would be eleven links pointing at four places.
 *
 * What is left is the shape, not the contents: a red utility strip carrying the
 * social marks, and a white primary strip with a handful of in-page jumps and
 * the apply button. Everything else lives in the footer, where a directory
 * belongs.
 */

export type NavItem = { label: string; href: string; external?: boolean };

/** Red strip. Anything that leaves the page. */
export const UTILITY: NavItem[] = [
  { label: "jecrcuniversity.edu.in", href: "https://jecrcuniversity.edu.in/", external: true },
  { label: "Alwar NCR", href: "https://jecrcuncr.edu.in/", external: true },
];

/** White strip. In-page only, in the order the sections appear. */
export const PRIMARY: NavItem[] = [
  { label: "Programmes", href: "#schools" },
  { label: "The record", href: "#numbers" },
  { label: "Questions", href: "#faq" },
];

/** Flattened, in reading order, for the mobile drawer. */
export const MOBILE_NAV: NavItem[] = [...PRIMARY, ...UTILITY];

export const FOOTER_NAV = {
  study: [
    { label: "Programmes", href: "#schools" },
    { label: "The record", href: "#numbers" },
    { label: "Questions", href: "#faq" },
    { label: "Scholarships", href: "https://jecrcuniversity.edu.in/scholarship/", external: true },
    { label: "Fee structure", href: "https://jecrcuncr.edu.in/fee-structure", external: true },
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
    { label: "Campus life", href: "https://jecrcuniversity.edu.in/clubs-communities/", external: true },
    { label: "Anti-ragging", href: "https://jecrcuniversity.edu.in/anti-ragging/", external: true },
  ],
} satisfies Record<string, NavItem[]>;
