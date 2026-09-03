/**
 * Featured programmes.
 *
 * Not the school list. Anyone can find "B.Tech Computer Science" by opening
 * jecrcuniversity.edu.in, and a list of eleven school names says nothing a
 * hundred other universities could not say. These are the degrees that exist
 * here and largely nowhere else in the state: the ones co-designed with, and
 * co-branded by, the firms that go on to hire from them.
 *
 * Every entry below is taken verbatim from the programme list on JECRC's own
 * application portal. Do not invent partners.
 *
 * Eight, not fourteen. The list is an argument, not an index: past about
 * eight rows a visitor stops reading names and starts scrolling past them,
 * and the full catalogue is one click away on the portal anyway.
 *
 * `image` should be portrait, roughly 3:4. The figure crops to that ratio.
 */

export type Programme = {
  slug: string;
  /** The short name shown in the list. */
  name: string;
  /** The full award, as the portal words it. */
  award: string;
  /** Industry partner, if the degree carries one. Rendered as the badge. */
  partner?: string;
  school: string;
  /** Why this one and not a generic equivalent. One sentence, no adjectives. */
  why: string;
  image: string;
};

export const PROGRAMMES: Programme[] = [
  {
    slug: "semiconductor-chip-design",
    name: "Semiconductor and Chip Design",
    award: "B.Tech. Electronics and Communication Engineering",
    partner: "Truechip",
    school: "Engineering and Technology",
    why: "Verification IP is written here on the same tooling the industry ships with, in a country that is building its fabs now rather than later.",
    image: "/media/school-electronics.webp",
  },
  {
    slug: "generative-ai",
    name: "Generative AI",
    award: "B.Tech. Computer Science and Engineering",
    partner: "L&T EduTech",
    school: "Engineering and Technology",
    why: "The syllabus is set by the engineering firm that will interview you, and it is revised on their release cycle rather than a five-year academic one.",
    image: "/media/school-computing.webp",
  },
  {
    slug: "cyber-security",
    name: "Cyber Security",
    award: "B.Tech. Computer Science and Engineering",
    partner: "EC-Council, USA",
    school: "Engineering and Technology",
    why: "You graduate with the international certifications recruiters actually screen for, sat during the degree rather than after it.",
    image: "/media/stills/s7.webp",
  },
  {
    slug: "fintech-ai",
    name: "FinTech and AI",
    award: "B.Tech. Computer Science and Engineering",
    partner: "Paytm and Zell",
    school: "Engineering and Technology",
    why: "Payments infrastructure taught by the company that built India's, with the accounting rigour bolted on rather than assumed.",
    image: "/media/school-engineering.webp",
  },
  {
    slug: "electric-vehicles",
    name: "Electric Vehicles",
    award: "B.Tech. Mechanical Engineering",
    school: "Engineering and Technology",
    why: "Battery packs, motors and thermal management on a bench, in the decade the entire Indian drivetrain is being replaced.",
    image: "/media/school-robotics.webp",
  },
  {
    slug: "health-informatics",
    name: "Health Informatics",
    award: "BCA Health Informatics",
    school: "Computer Applications",
    why: "Clinical systems taught next door to a working medical college and hospital, which is the part nobody else in Jaipur can offer.",
    image: "/media/stills/s5.webp",
  },
  {
    slug: "forensic-science",
    name: "Forensic Science",
    award: "B.Sc. (Hons.) Forensic Science",
    school: "Sciences",
    why: "Wet lab, evidence handling and courtroom procedure, taught alongside a law school that runs a real moot court.",
    image: "/media/school-sciences.webp",
  },
  {
    slug: "game-art-animation",
    name: "Game Art and Animation",
    award: "B.Des. Game Art and Animation",
    school: "Jaipur School of Design",
    why: "A design degree pointed at a studio pipeline, in a city with a jewellery and craft tradition to steal from.",
    image: "/media/stills/s6.webp",
  },
];
