/**
 * The numbers, in one place.
 *
 * This replaces three separate sections that were each showing a row of stats.
 * Three rows of stats is not three arguments, it is one argument told badly, so
 * everything the group publishes now sits in a single ledger.
 *
 * `scale` sets how much room a figure gets in the grid. `lead` figures run
 * full-bleed across the band; `mid` take a half; `unit` are the small print.
 * Nothing here is rounded up or restated: every value is as published.
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
  title: "What twenty-six years adds up to",
  lead: "Placements are for the 2025 to 2026 season, group figures across the Jaipur and Alwar NCR campuses. Nothing here is an estimate.",
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
    value: "₹33",
    unit: "L",
    label: "Highest package",
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
  { value: "₹6L", label: "Average package", scale: "unit" },
  { value: "₹10.7L", label: "Top thirty percent average", scale: "unit" },
  { value: "12,000+", label: "Placements in five years", scale: "unit" },
  { value: "28+ Cr", label: "Research grants secured", scale: "unit" },
  { value: "26,000+", label: "Students on roll", scale: "unit" },
  { value: "32 acres", label: "Sitapura campus", scale: "unit" },
  { value: "32.89 acres", label: "Alwar NCR campus", scale: "unit" },
  { value: "35", label: "Countries", scale: "unit" },
];

/** Named on the university's own placements page. */
export const RECRUITERS = [
  "Amazon", "Microsoft", "Google", "TCS", "Infosys", "Wipro", "IBM", "Cisco",
  "Deloitte", "Capgemini", "Cognizant", "HCL Tech", "L&T Technology Services",
  "ITC Limited", "Paytm", "Zomato", "Flipkart", "Decathlon", "HDFC Life",
  "Bajaj Capital", "Nestle", "Tata AIG", "IndiaMART", "Blinkit", "Unicharm",
] as const;
