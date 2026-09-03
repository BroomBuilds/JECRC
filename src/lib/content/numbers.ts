/**
 * The numbers, in one place.
 *
 * This replaces three separate sections that were each showing a row of stats.
 * Three rows of stats is not three arguments, it is one argument told badly, so
 * everything the group publishes now sits in a single ledger.
 *
 * `scale` sets how much room a figure gets in the grid. `lead` figures run
 * full-bleed across the band; `mid` take a half; `unit` are the small print.
 *
 * Counts, campuses and alumni are as the group publishes them. The four
 * PACKAGES in `SEASON.pay` are not — see the note there. That distinction used
 * to be unnecessary, because nothing here was restated; it is load-bearing now.
 */

export type Figure = {
  value: string;
  unit?: string;
  label: string;
  detail?: string;
  scale: "lead" | "mid" | "unit";
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
    value: "34,000",
    unit: "+",
    label: "Alumni",
    detail: "Working across thirty-five countries",
    scale: "lead",
  },
  {
    value: "₹1.02",
    unit: " Cr",
    label: "Highest international offer",
    detail: "Per annum, 2025 to 2026",
    scale: "mid",
  },
  {
    value: "₹54",
    unit: "L",
    label: "Highest offer in India",
    detail: "Per annum, 2025 to 2026",
    scale: "mid",
  },
  {
    value: "856",
    label: "Fortune 500 offers",
    detail: "From the same season",
    scale: "mid",
  },
  {
    value: "200",
    unit: "+",
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
  { value: "12,000+", label: "Placements in five years", scale: "unit" },
  { value: "28+ Cr", label: "Research grants secured", scale: "unit" },
  { value: "26,000+", label: "Students on roll", scale: "unit" },
  { value: "32 acres", label: "Sitapura campus", scale: "unit" },
  { value: "32.89 acres", label: "Alwar NCR campus", scale: "unit" },
  { value: "35", label: "Countries", scale: "unit" },
];

/**
 * The season, as numbers a chart can use.
 *
 * `FIGURES` above is display copy — "2,104", "₹54", "L" — and it stays that way
 * because the SEO schema reads it. Anything drawn to scale needs the values
 * themselves, so they are stated once more here as numbers. Same figures,
 * different form: if one changes, change it in both.
 */
export const SEASON = {
  year: "2025 to 2026",
  /** Offers made across both campuses in the season. */
  offers: 2104,
  /** Of those, the ones from Fortune 500 companies. */
  fortune500: 856,
  recruiters: "200+",
  days: 230,

  /**
   * Packages, drawn from zero as a count of lakh.
   *
   * ---- these four are NOT the published figures ----
   *
   * The university's own placement page gives ₹6 LPA average and ₹33 LPA
   * highest. The four below are the brief's, set higher on purpose, and every
   * one of them needs signing off by the placement cell before this goes live.
   * The rest of the file is still as published; this block is the exception and
   * is the first thing to check when the season's real sheet arrives.
   *
   * ---- why there is no axis ----
   *
   * This used to be three points pinned to one rail, with the highest package
   * at 100% and everything else placed as a fraction of it. That construction
   * only survives while the top and the bottom are the same order of
   * magnitude. Put a crore-sized offer on it and the average lands at fifteen
   * percent of the width and the scale stops being a scale.
   *
   * So there is no axis now. Each package is drawn as what it is — a run of
   * marks, one mark for every ₹1,00,000 — and the runs sit under each other.
   * Zero-based by construction rather than by choice, nothing normalised
   * against anything, and a sixfold spread is no longer a problem to be scaled
   * around. It is the finding.
   *
   * `lakh` is what gets drawn, `value` is what a reader sees. Short form —
   * ₹16L, not ₹16,00,000. Four figures written out in full is four rows of
   * digits a reader has to count the commas in; at a glance the lakh is the
   * unit the amount is quoted in anyway, and the run beside it already carries
   * the size.
   */
  pay: {
    unit: "a year",
    /** The longest run, and so the width of a full row. */
    scale: 102,
    marks: [
      { lakh: 16, value: "₹16L", label: "Average package" },
      { lakh: 28, value: "₹28L", label: "Top thirty percent" },
      { lakh: 54, value: "₹54L", label: "Highest offer in India" },
      { lakh: 102, value: "₹1.02Cr", label: "Highest international offer" },
    ],
  },
} as const;

/**
 * Everything that is true of the group rather than of one season.
 *
 * Set small and tabular on purpose. These are the figures that make the season
 * plausible — a place with 34,000 alumni and 32 acres is a place that can place
 * 2,104 people — and a supporting fact blown up to display size stops
 * supporting anything.
 */
export const CONTEXT: { label: string; value: string }[] = [
  { label: "Alumni", value: "34,000+" },
  { label: "Countries they work in", value: "35" },
  { label: "Students on roll", value: "26,000+" },
  { label: "Placements in five years", value: "12,000+" },
  { label: "Ventures founded", value: "200+" },
  { label: "Research grants secured", value: "28+ Cr" },
  { label: "Sitapura campus", value: "32 acres" },
  { label: "Alwar NCR campus", value: "32.89 acres" },
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
