/**
 * The eleven schools.
 *
 * This replaced a list of eight hand-picked degrees. That list was an argument
 * — "here are the degrees you could not take elsewhere" — and it was a good
 * one, but it answered a question nobody arriving on the page had yet. The
 * question is "do you teach the thing I want to study", and the only honest
 * answer to that is the school list with a way through to each one.
 *
 * So every row now leaves the page. `href` is the school's own page on
 * jecrcuniversity.edu.in, which is where the fee, the eligibility and the full
 * catalogue live and where they are kept current by people who are not us.
 *
 * `lead` is the school's OWN sentence, taken off that page, trimmed only for
 * punctuation. Where a school's page leads with its dean rather than with
 * itself, the dean's opening line is used and is marked as such below. Do not
 * write new ones: a sentence invented here is a claim the university has not
 * made.
 *
 * `programmes` is representative, not exhaustive — six or seven awards off
 * each page, partner named where the page names one. The full list is one
 * click away by construction.
 *
 * `image` is always `/media/schools/<slug>.webp`, so a photograph is swapped
 * by replacing a file and nothing here has to change. What is in that folder
 * today is eleven distinct CC0 photographs — StockSnap and Rawpixel, via the
 * Openverse API — which replaced a set of placeholders whose licence was
 * unknown and three of which repeated. They are stock, not JECRC: campus
 * photography beats all of them. public/media/schools/README.md records where
 * each one came from and how to swap it.
 *
 * Nothing was pulled from the school pages themselves: every image in their
 * served HTML is a lazy-loaded SVG placeholder, so there was no artwork to
 * take.
 *
 * The figure is `aria-hidden` with an empty alt, so these are decorative and
 * carry no information a screen reader needs. That is also why a wrong-ish
 * placeholder is survivable and a slow one is not — keep them light.
 */

export type School = {
  slug: string;
  /** The row label: the distinctive part, without the "School of". */
  name: string;
  /** The full name, as the university writes it. Shown in the open panel. */
  full: string;
  /** The school's own page. Every row leaves the site here. */
  href: string;
  /** The school's own sentence about itself, off that page. */
  lead: string;
  /** Award families, short form, for the panel's second column. */
  levels: string;
  /** Representative awards, as the page words them. Not the full catalogue. */
  programmes: string[];
  image: string;
};

export const SCHOOLS: School[] = [
  {
    slug: "engineering-technology",
    name: "Engineering & Technology",
    full: "School of Engineering & Technology",
    href: "https://jecrcuniversity.edu.in/program/school-of-engineering-technology/",
    // The dean's opening line; the page carries no separate description.
    lead: "A brilliant aggregate of carefully curated courses in the field of engineering.",
    levels: "B.Tech. · M.Tech. · Ph.D.",
    programmes: [
      "B.Tech. Computer Science and Engineering",
      "B.Tech. ECE — Semiconductor and Chip Design (Truechip)",
      "B.Tech. CSE — Generative AI (L&T EduTech)",
      "B.Tech. CSE — Cyber Security (EC-Council, USA)",
      "B.Tech. CSE — FinTech and AI (Paytm and Zell)",
      "B.Tech. Mechanical Engineering — Electric Vehicles",
      "B.Tech. Computer Science and Business Systems (TCS)",
    ],
    image: "/media/schools/engineering-technology.webp",
  },
  {
    slug: "computer-applications",
    name: "Computer Applications",
    full: "School of Computer Applications",
    href: "https://jecrcuniversity.edu.in/program/school-of-computer-applications/",
    lead: "At the forefront of integrating technology into education, preparing students to navigate the dynamic landscape of tech.",
    levels: "BCA · MCA",
    programmes: [
      "BCA (3 Years)",
      "BCA Health Informatics",
      "BCA Cyber Security (EC-Council, USA)",
      "BCA Cloud Computing (AWS)",
      "MCA (2 Years)",
      "MCA Artificial Intelligence and Data Science",
      "MCA Cloud Computing and Full Stack Development (IBM)",
    ],
    image: "/media/schools/computer-applications.webp",
  },
  {
    slug: "business",
    name: "Business",
    full: "Jaipur School of Business",
    href: "https://jecrcuniversity.edu.in/program/jaipur-school-of-business/",
    // The dean's opening line; the page carries no separate description.
    lead: "A metamorphosis of business has led to the increasing necessity of capable management professionals, able to adapt to fast-changing economic scenarios.",
    levels: "BBA · B.Com. · MBA",
    programmes: [
      "BBA (HR, Finance, Marketing, Business Analytics, IB, IT)",
      "BBA FinTech (Zell Education and Deloitte)",
      "BBA New Age Digital Marketing",
      "B.Com. Capital Market",
      "MBA Applied Finance (Deloitte and Zell)",
      "MBA FinTech (Imarticus)",
      "MBA Entrepreneurship and Family Business Management",
    ],
    image: "/media/schools/business.webp",
  },
  {
    slug: "sciences",
    name: "Sciences",
    full: "School of Sciences",
    href: "https://jecrcuniversity.edu.in/program/school-of-sciences/",
    lead: "Research and development in science plays an important role for better living of mankind.",
    levels: "B.Sc. (Hons.) · M.Sc. · Ph.D.",
    programmes: [
      "B.Sc. (Hons.) Forensic Science",
      "B.Sc. (Hons.) Biotechnology",
      "B.Sc. (Hons.) Microbiology",
      "M.Sc. Physics, Chemistry, Mathematics",
      "M.Sc. Botany, Zoology",
      "M.Sc. Biotechnology, Microbiology",
      "Ph.D. in Sciences",
    ],
    image: "/media/schools/sciences.webp",
  },
  {
    slug: "humanities-social-sciences",
    name: "Humanities & Social Sciences",
    full: "School of Humanities & Social Sciences",
    href: "https://jecrcuniversity.edu.in/program/school-of-humanities-social-sciences/",
    lead: "The School of Humanities and Social Sciences focuses on the holistic development of the students.",
    levels: "B.A. (Hons.) · M.A. · Ph.D.",
    programmes: [
      "B.A. (Hons.) English",
      "B.A. (Hons.) Political Science",
      "B.A. (Hons.) Psychology",
      "B.A. Liberal Studies — International Relations and Diplomacy",
      "B.A. Liberal Studies — Public Policy and Governance",
      "M.A. Psychology (Clinical)",
      "M.A. International Relations",
    ],
    image: "/media/schools/humanities-social-sciences.webp",
  },
  {
    slug: "law",
    name: "Law",
    full: "School of Law",
    href: "https://jecrcuniversity.edu.in/program/school-of-law/",
    // The dean's stated motto; the page carries no separate description.
    lead: "The School of Law should be a place of practice, precision, and progress.",
    levels: "Integrated LL.B. (Hons.) · LL.M. · Ph.D.",
    programmes: [
      "B.A. LL.B. (Hons.)",
      "B.Sc. LL.B. (Hons.)",
      "BBA LL.B. (Hons.)",
      "LL.M. Corporate and Commercial Laws",
      "LL.M. Intellectual Property Law",
      "LL.M. Personal Law",
      "Ph.D. in Law",
    ],
    image: "/media/schools/law.webp",
  },
  {
    slug: "mass-communication",
    name: "Mass Communication",
    full: "Jaipur School of Mass Communication",
    href: "https://jecrcuniversity.edu.in/program/jaipur-school-of-mass-communication/",
    lead: "Journalism and mass communication with tracks in print, television, cinema, advertising and public relations, digital media and radio.",
    levels: "B.A. · M.A. · PG Diploma · Ph.D.",
    programmes: [
      "B.A. Journalism and Mass Communication",
      "M.A. Journalism and Mass Communication",
      "M.A. Filmmaking (1 Year)",
      "PG Diploma Investigative Journalism",
      "PG Diploma Digital Media",
      "PG Diploma Crime Scene Photography and Forensics for Crime Reporting",
      "Ph.D. in Mass Communication",
    ],
    image: "/media/schools/mass-communication.webp",
  },
  {
    slug: "design",
    name: "Design",
    full: "Jaipur School of Design",
    href: "https://jecrcuniversity.edu.in/program/jaipur-school-of-design/",
    lead: "Four-year degree programmes in Bachelor of Design and Bachelor of Visual Arts, with master's degrees in both, across several specialisations.",
    levels: "B.Des. · BVA · M.Des. · M.V.A.",
    programmes: [
      "B.Des. Fashion Design",
      "B.Des. Interior Design",
      "B.Des. Jewellery Design and Manufacturing",
      "BVA Graphic Design",
      "BVA Painting",
      "M.Des. Fashion Design, Interior Design",
      "M.V.A. Graphic Design",
    ],
    image: "/media/schools/design.webp",
  },
  {
    slug: "economics",
    name: "Economics",
    full: "Jaipur School of Economics",
    href: "https://jecrcuniversity.edu.in/program/jaipur-school-of-economics/",
    lead: "Strives to develop a wide range of analytical and critical thinking skills, which opens up many diverse career opportunities for students.",
    levels: "B.A. (Hons.) · M.A. · Ph.D.",
    programmes: [
      "B.A. (Hons.) Economics (4 Years)",
      "B.A. Economics (3 Years)",
      "B.A. Liberal Education",
      "M.A. Economics",
      "Ph.D. Economics",
    ],
    image: "/media/schools/economics.webp",
  },
  {
    slug: "allied-health-sciences",
    name: "Allied Health Sciences",
    full: "School of Allied Health Sciences",
    href: "https://jecrcuniversity.edu.in/program/school-of-allied-health-sciences/",
    lead: "Established with the objective of producing skilled manpower in different areas of health sciences for better healthcare.",
    levels: "BPT · BMLT · BRT · MPT · M.Sc.",
    programmes: [
      "Bachelor of Physiotherapy (BPT), 4.5 Years",
      "Bachelor of Medical Laboratory Technology (BMLT)",
      "Bachelor of Radiation Technology (BRT)",
      "M.Sc. Clinical Embryology (Indira IVF)",
      "Master of Physiotherapy — Sports, Orthopaedics",
      "Master of Physiotherapy — Neurology, Cardiopulmonary",
    ],
    image: "/media/schools/allied-health-sciences.webp",
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    full: "School of Hospitality",
    href: "https://jecrcuniversity.edu.in/program/school-of-hospitality/",
    lead: "The objective is to recognise and prepare students to join the hotel and hospitality industry.",
    levels: "B.Sc. · BHMCT",
    programmes: [
      "B.Sc. Hospitality and Hotel Management (3 Years)",
      "BHMCT — Bachelor of Hotel Management and Catering Technology (4 Years)",
    ],
    image: "/media/schools/hospitality.webp",
  },
];
