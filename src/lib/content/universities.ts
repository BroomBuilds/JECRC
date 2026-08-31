/**
 * The three institutions this landing page fronts. Order is deliberate:
 * flagship, NCR campus, founding college.
 */

export type Institution = {
  id: string;
  /** Short label used in tabs, chips and the apply rail. */
  short: string;
  name: string;
  place: string;
  /** One line, sentence case, no full stop. Used as the card sub-head. */
  positioning: string;
  body: string;
  established: string;
  facts: { value: string; label: string }[];
  site: string;
  apply: string;
  accent: "crimson" | "ember" | "slate";
};

export const INSTITUTIONS: Institution[] = [
  {
    id: "jaipur",
    short: "Jaipur",
    name: "JECRC University",
    place: "Sitapura, Jaipur",
    positioning: "The flagship campus",
    body:
      "Eleven schools on thirty-two acres, from engineering and computer applications to design, law, mass communication and allied health sciences. Twenty-six thousand students, a placement season that runs two hundred and thirty days, and labs that stay open long after the timetable says they should.",
    established: "Established 2012 under the Rajasthan State Legislature Act",
    facts: [
      { value: "26,000+", label: "Students" },
      { value: "32 acres", label: "Campus" },
      { value: "11", label: "Schools" },
    ],
    site: "https://jecrcuniversity.edu.in/",
    apply: "https://jecrcuapplication.jecrcuniversity.edu.in/application-form",
    accent: "crimson",
  },
  {
    id: "ncr",
    short: "Alwar NCR",
    name: "JECRC University, NCR Campus",
    place: "Matsya Industrial Area, Alwar",
    positioning: "Inside the National Capital Region",
    body:
      "A 32.89-acre campus built for proximity: the Matsya industrial belt on the doorstep, Gurgaon, Neemrana and Bhiwadi an expressway away. Curriculum co-designed with L&T, Samatrix and Truechip, and dedicated labs for AI, robotics and VLSI.",
    established: "NEP 2020 aligned, UGC recognised, AICTE approved",
    facts: [
      { value: "50+", label: "Programmes" },
      { value: "32.89 acres", label: "Green campus" },
      { value: "500+", label: "Recruiting firms" },
    ],
    site: "https://jecrcuncr.edu.in/",
    apply: "https://jecruncrapplication.jecrcuncr.edu.in/",
    accent: "ember",
  },
  {
    id: "foundation",
    short: "Foundation",
    name: "JECRC Foundation",
    place: "Jaipur Engineering College and Research Centre",
    positioning: "Where the group started",
    body:
      "The engineering college the whole group grew out of. AICTE approved, affiliated to RTU, NBA accredited across departments, and still the most research-dense address in the family: thirty crore in external grants and two hundred incubated ventures.",
    established: "Founded 2000, AICTE approved and affiliated to RTU",
    facts: [
      { value: "9", label: "Departments" },
      { value: "200+", label: "Incubated startups" },
      { value: "28+ Cr", label: "Research grants" },
    ],
    site: "https://jecrcfoundation.com/",
    apply: "https://jecrcfoundation.com/",
    accent: "slate",
  },
];

/** Convenience lookups used by the nav rail and the apply sheet. */
export const APPLY_LINKS = INSTITUTIONS.map((i) => ({
  id: i.id,
  label: i.short,
  name: i.name,
  href: i.apply,
}));
