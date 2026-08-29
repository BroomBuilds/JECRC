/**
 * The coming-soon banner.
 *
 * Everything is data: change `title`, `detail` or `items` and the banner
 * restates itself. Set `live: false` and the section stops rendering, so the
 * banner can be pulled without touching a component.
 */
export const ANNOUNCEMENT = {
  live: true,
  eyebrow: "Coming soon",
  title: "A new chapter for the JECRC group",
  detail:
    "One address for all three institutions, with the 2026-27 admissions journey, the campus films and a programme finder in one place. The first pieces land shortly.",
  items: [
    { label: "Unified admissions journey", state: "In build" },
    { label: "Programme finder across campuses", state: "In build" },
    { label: "Campus films, Jaipur and Alwar", state: "Shooting" },
    { label: "Alumni network directory", state: "Next" },
  ],
  cta: { label: "Start an application now", href: "#admissions" },
} as const;
