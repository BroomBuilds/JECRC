/**
 * Alumni.
 *
 * Two halves. The network numbers below are published by the group and are safe
 * to show today. `ALUMNI_PROFILES` is deliberately empty: named alumni with
 * photographs need the client's consent and assets, and the card grid does not
 * render until entries exist. Fill the array and the section grows the grid
 * with no component change.
 */

export type AlumniProfile = {
  name: string;
  cohort: string;
  school: string;
  /** Current role, e.g. "Software Engineer, Amazon" */
  now: string;
  portrait?: string;
  line?: string;
};

export const ALUMNI_PROFILES: AlumniProfile[] = [];

export const ALUMNI_NETWORK = {
  eyebrow: "The network",
  title: "Thirty-four thousand people who were here first",
  body:
    "Twenty-six years of graduates, working across thirty-five countries. Two hundred of them did not take a job at all and started something instead, most of it out of the incubation centre on campus.",
  pillars: [
    {
      value: "34,000+",
      label: "Alumni",
      detail: "Across engineering, business, design, law, media and health sciences.",
    },
    {
      value: "35",
      label: "Countries",
      detail: "From the Sitapura campus to teams in Europe, North America and the Gulf.",
    },
    {
      value: "200+",
      label: "Ventures founded",
      detail: "Startups incubated by alumni and students at the JECRC Incubation Centre.",
    },
    {
      value: "12,000+",
      label: "Placements in five years",
      detail: "Group-wide, across the Jaipur and Alwar NCR campuses.",
    },
  ],
} as const;
