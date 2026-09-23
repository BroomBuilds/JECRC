/**
 * The numbers, in one place.
 *
 * This replaces three separate sections that were each showing a row of stats.
 * Three rows of stats is not three arguments, it is one argument told badly, so
 * everything the group publishes now sits in a single ledger.
 *
 * `scale` sets how much room a figure gets in the grid: `lead` figures run
 * full-bleed across the band, `mid` take a half.
 *
 * There used to be a third, `unit`, holding six more figures at small-print
 * size. Nothing rendered them. `FIGURES` is read by exactly one caller —
 * `buildGraph()` in lib/seo/schema.ts — and that filters to lead and mid, so
 * those six were values restating what `CONTEXT` and `SEASON.pay` already
 * hold, free to drift quietly out of step with both.
 *
 * Every figure in this file is now as the group publishes it — the season and
 * the packages off jecrcuniversity.edu.in/placements, the rest off the group's
 * own pages. There used to be an exception: four packages in `SEASON.pay` that
 * came from the brief rather than from the placement cell and were carrying a
 * warning to that effect. They have been replaced by the published ones, so
 * the warning is gone with them. If a figure arrives from anywhere other than
 * a page the university publishes, mark it where it sits.
 */

export type Figure = {
  value: string;
  unit?: string;
  label: string;
  detail?: string;
  scale: "lead" | "mid";
};

export const LEDGER = {
  eyebrow: "The record",
  title: "Every offer from last season",
  lead: "Across the Jaipur and Alwar NCR campuses, in the 2025 to 2026 season.",
} as const;

export const FIGURES: Figure[] = [
  {
    value: "2,104",
    unit: "+",
    label: "Offers in one season",
    detail: "Over two hundred and thirty days of campus recruitment",
    scale: "lead",
  },
  {
    value: "30,000",
    unit: "+",
    label: "Alumni",
    detail: "Working across thirty-five countries",
    scale: "lead",
  },
  {
    value: "₹33",
    unit: " LPA",
    label: "Highest package",
    detail: "2025 to 2026, as published on the placements page",
    scale: "mid",
  },
  {
    value: "₹10.70",
    unit: " LPA",
    label: "Average of the top thirty percent",
    detail: "From the same season",
    scale: "mid",
  },
  {
    value: "856",
    label: "Fortune 500 offers",
    detail: "From the same season",
    scale: "mid",
  },
  {
    value: "205",
    label: "Recruiters on campus",
    detail: "Amazon, Microsoft, Google, TCS, Deloitte and the rest",
    scale: "mid",
  },
  {
    value: "200",
    unit: "+",
    label: "Ventures founded",
    detail: "Incubated by alumni and students at the JECRC Incubation Centre",
    scale: "mid",
  },
];

/**
 * The season, as numbers a chart can use.
 *
 * `FIGURES` above is display copy — "2,104", "₹33", " LPA" — and it stays that
 * way because the SEO schema reads it. Anything drawn to scale needs the
 * values themselves, so they are stated once more here as numbers. Same
 * figures, different form: if one changes, change it in both.
 *
 * Everything in this block is now as jecrcuniversity.edu.in/placements
 * publishes it. It did not used to be: `pay.marks` carried four figures from
 * the brief — ₹16L average, ₹54L highest in India, ₹1.02 Cr international —
 * that the university's own page did not support and that were flagged here
 * for the placement cell to sign off. They never were. They are gone.
 */
export const SEASON = {
  year: "2025 to 2026",
  /** Offers made across both campuses in the season. */
  offers: 2104,
  /** Of those, the ones from Fortune 500 companies. */
  fortune500: 856,
  /**
   * 205, not "200+".
   *
   * The placements page says both. Its season tile — the row that also
   * carries "2104+ Placements (2025-26)" and "230 Days! Placement Season
   * Duration" — reads "205 Recruiters! / Top Corporate Partners", and that is
   * the season figure. The "200+" appears twice elsewhere on the same page, in
   * the T&P cell's standing claim ("200+ Recruiters Visit Annually") and in
   * the 2025-26 headline sentence, both of which are the rounded version of
   * this one. The exact number is the better claim and it is the university's
   * own.
   */
  recruiters: "205",
  days: 230,
  /** Campus recruitment training and industry mentorship, per the same page. */
  trainingHours: "500+",

  /**
   * Packages, drawn from zero as a count of lakh.
   *
   * ---- why there is no axis ----
   *
   * This used to be three points pinned to one rail, with the highest package
   * at 100% and everything else placed as a fraction of it. That construction
   * only survives while the top and the bottom are the same order of
   * magnitude.
   *
   * So there is no axis. Each package is drawn as what it is — a run of marks,
   * one mark for every ₹1,00,000 — and the runs sit under each other.
   * Zero-based by construction rather than by choice, and nothing normalised
   * against anything.
   *
   * `lakh` is what gets drawn, `value` is what a reader sees. Short form —
   * ₹33L, not ₹33,00,000: at a glance the lakh is the unit the amount is
   * quoted in anyway, and the run beside it already carries the size.
   */
  pay: {
    unit: "a year",
    /** The longest run, and so the width of a full row. */
    scale: 33,
    marks: [
      { lakh: 6, value: "₹6L", label: "Average package" },
      { lakh: 10.7, value: "₹10.70L", label: "Average of the top thirty percent" },
      { lakh: 33, value: "₹33L", label: "Highest package" },
    ],
  },

  /**
   * The same season broken out by discipline, as the placements page gives it.
   *
   * This is what the single "average" above cannot say: a ₹6 LPA group average
   * across a university that teaches both B.Tech. CSE and hotel management is
   * an average of two different job markets. Set small and tabular for the
   * same reason `CONTEXT` is — it supports the headline figure rather than
   * competing with it.
   */
  byDiscipline: [
    { label: "Technical", average: "₹6.45 LPA", highest: "₹33 LPA" },
    { label: "Management", average: "₹7 LPA", highest: "₹11 LPA" },
    { label: "ME / CE / ECE", average: "₹5 LPA", highest: "₹13.8 LPA" },
    { label: "Skill Based Programs", average: "₹4 LPA", highest: "₹6.5 LPA" },
  ],
} as const;

/**
 * Everything that is true of the group rather than of one season.
 *
 * Set small and tabular on purpose. These are the figures that make the season
 * plausible — a place with 30,000 alumni and 29,643 on roll is a place that can
 * place 2,104 people — and a supporting fact blown up to display size stops
 * supporting anything.
 *
 * Six rows, not eight. The two campus acreages were here and are not any more:
 * they are facts about real estate, and the question this block answers is
 * whether the season above is the shape of the place or a good year.
 */
export const CONTEXT: { label: string; value: string }[] = [
  { label: "Alumni", value: "30,000+" },
  { label: "Students enrolled", value: "29,643" },
  { label: "Ventures founded", value: "200+" },
  { label: "Countries they work in", value: "35" },
  { label: "Placements in five years", value: "12,000+" },
  { label: "Research grants secured", value: "₹28+ Cr" },
];

/**
 * Named on the university's own placements page, with its own artwork.
 *
 * The list used to be twenty-five names typed out from memory of that page and
 * set in the site's own face. Two problems with that: half of them are no
 * longer the companies the page shows, and a row of set type is a list a
 * visitor has to READ. A mark is recognised before it is read, which is the
 * only reason a recruiter strip is worth the space it takes.
 *
 * So these twenty-one are exactly who the placements page shows today, and the
 * artwork is the university's own — pulled from its media library rather than
 * redrawn or fetched from an icon set, so what appears here is what the
 * university already publishes. Each mark remains the trademark of its owner
 * and is used to identify who came to campus, which is what it is for.
 *
 * `scale` is optical, not arithmetic. Set to one height, a square mark reads
 * about twice the size of a long wordmark, so the squarer a logo is the
 * shorter it is set: 0.6 for a tile, 0.78 for a stacked lockup, 1 for a
 * wordmark. Without it Blinkit and Zomato bully the row.
 *
 * `f500` says the company is ranked on the Fortune 500 or the Fortune Global
 * 500, which is what puts its mark under the crimson half of the season's run
 * rather than the ink half. It is a fact about the company, not a compliment,
 * and the two are easy to confuse: Deloitte and PwC are the size of anything
 * on the list and are not ON it, because Fortune ranks companies that publish
 * revenue and both are private partnerships. HCLTech and Wipro are the same
 * story from the other side — both sit on the Fortune India 500 and neither is
 * currently on the Global 500. They are all in the second group, which is why
 * that group is captioned by its count and not by any word implying it is the
 * lesser one.
 */
export type Recruiter = { name: string; slug: string; scale: number; f500?: true };

export const RECRUITERS: Recruiter[] = [
  { name: "Accenture", slug: "accenture", scale: 1, f500: true },
  { name: "Blinkit", slug: "blinkit", scale: 0.72 },
  { name: "Capgemini", slug: "capgemini", scale: 1, f500: true },
  { name: "Cognizant", slug: "cognizant", scale: 1, f500: true },
  { name: "Dabur", slug: "dabur", scale: 0.72 },
  { name: "Deloitte", slug: "deloitte", scale: 1 },
  { name: "Finastra", slug: "finastra", scale: 0.88 },
  { name: "Futures First", slug: "futures-first", scale: 0.88 },
  { name: "HCLTech", slug: "hcltech", scale: 1 },
  { name: "Hewlett Packard Enterprise", slug: "hpe", scale: 0.88, f500: true },
  { name: "Nestlé", slug: "nestle", scale: 0.72, f500: true },
  { name: "PwC", slug: "pwc", scale: 0.72 },
  { name: "ServiceNow", slug: "servicenow", scale: 1, f500: true },
  { name: "Tata Consultancy Services", slug: "tcs", scale: 0.72, f500: true },
  { name: "Tredence", slug: "tredence", scale: 1 },
  { name: "Vivnovation", slug: "vivnovation", scale: 0.88 },
  { name: "WatchGuard", slug: "watchguard", scale: 1 },
  { name: "Wipro", slug: "wipro", scale: 0.72 },
  { name: "WNS Global Services", slug: "wns", scale: 0.88 },
  { name: "Xebia", slug: "xebia", scale: 1 },
  { name: "Zomato", slug: "zomato", scale: 0.72 },
];
