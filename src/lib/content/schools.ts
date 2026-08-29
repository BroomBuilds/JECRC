/**
 * The eleven schools, shaped for the majors list.
 *
 * One entry per school, each with the degrees it awards, a one-paragraph
 * description and a portrait image. The list component reads nothing else, so
 * adding a school is one object here.
 *
 * `image` should be portrait (roughly 3:4). The figure crops to that ratio, and
 * a landscape source will letterbox.
 */

export type School = {
  slug: string;
  name: string;
  /** Degrees awarded, as one line. Sits under the name when the row opens. */
  degrees: string[];
  description: string;
  image: string;
  campuses: string[];
  href: string;
};

const APPLY_JAIPUR = "https://jecrcuapplication.jecrcuniversity.edu.in/application-form";

export const SCHOOLS: School[] = [
  {
    slug: "engineering-technology",
    name: "Engineering and Technology",
    degrees: ["B.Tech", "M.Tech", "Ph.D."],
    description:
      "Computer science, artificial intelligence and data science, mechanical, civil, electrical and electronics. Dedicated labs for AI, robotics and VLSI, and a coding ecosystem that runs the year round rather than the fortnight before placements.",
    image: "/media/school-engineering.jpg",
    campuses: ["Jaipur", "Alwar NCR", "Foundation"],
    href: "https://jecrcuniversity.edu.in/school-of-engineering-technology/",
  },
  {
    slug: "computer-applications",
    name: "Computer Applications",
    degrees: ["BCA", "MCA"],
    description:
      "Software written to be used by someone other than the person who wrote it. Cloud, mobile and data engineering, with a great deal of code review in between.",
    image: "/media/school-computing.jpg",
    campuses: ["Jaipur", "Alwar NCR"],
    href: "https://jecrcuniversity.edu.in/school-of-computer-applications/",
  },
  {
    slug: "jaipur-school-of-business",
    name: "Jaipur School of Business",
    degrees: ["BBA", "MBA", "Integrated MBA"],
    description:
      "Case method, live consulting briefs with Jaipur and NCR firms, and a placement season that opens in the penultimate year rather than the last one.",
    image: "/media/school-lecture.jpg",
    campuses: ["Jaipur", "Alwar NCR"],
    href: "https://jecrcuniversity.edu.in/jaipur-school-of-business/",
  },
  {
    slug: "sciences",
    name: "Sciences",
    degrees: ["B.Sc", "M.Sc", "Ph.D."],
    description:
      "Physics, chemistry, mathematics and biotechnology, with bench time from the first year and research groups that take undergraduates seriously.",
    image: "/media/school-sciences.jpg",
    campuses: ["Jaipur"],
    href: "https://jecrcuniversity.edu.in/school-of-sciences/",
  },
  {
    slug: "allied-health-sciences",
    name: "Allied Health Sciences",
    degrees: ["B.Sc", "M.Sc", "Diploma"],
    description:
      "Radiology, optometry, nutrition, physiotherapy and medical laboratory technology, taught alongside the JECRC Medical College Hospital and Research Centre.",
    image: "/media/stills/s5.jpg",
    campuses: ["Jaipur"],
    href: "https://jecrcuniversity.edu.in/school-of-allied-health-science/",
  },
  {
    slug: "law",
    name: "Law",
    degrees: ["BA LLB", "BBA LLB", "LLM"],
    description:
      "A moot court that runs like the real thing, legal aid clinics open to the public, and a curriculum built around drafting and advocacy rather than recitation.",
    image: "/media/stills/s3.jpg",
    campuses: ["Jaipur"],
    href: "https://jecrcuniversity.edu.in/school-of-law/",
  },
  {
    slug: "jaipur-school-of-design",
    name: "Jaipur School of Design",
    degrees: ["B.Des", "M.Des"],
    description:
      "Fashion, interior, jewellery and communication design, taught in studios that stay open late because the work does not fit inside a timetable.",
    image: "/media/school-robotics.jpg",
    campuses: ["Jaipur"],
    href: "https://jecrcuniversity.edu.in/jaipur-school-of-design/",
  },
  {
    slug: "mass-communication",
    name: "Jaipur School of Mass Communication",
    degrees: ["BA JMC", "MA JMC"],
    description:
      "Journalism, film, advertising and digital media, with a working newsroom, an edit suite and a broadcast studio students book for themselves.",
    image: "/media/stills/s7.jpg",
    campuses: ["Jaipur"],
    href: "https://jecrcuniversity.edu.in/jaipur-school-of-mass-communication/",
  },
  {
    slug: "humanities-social-sciences",
    name: "Humanities and Social Sciences",
    degrees: ["BA", "MA", "Ph.D."],
    description:
      "English, psychology, political science and sociology, taken seriously as disciplines in their own right and as the ground every other school stands on.",
    image: "/media/stills/s2.jpg",
    campuses: ["Jaipur"],
    href: "https://jecrcuniversity.edu.in/school-of-humanities-social-sciences/",
  },
  {
    slug: "jaipur-school-of-economics",
    name: "Jaipur School of Economics",
    degrees: ["BA Economics", "MA Economics"],
    description:
      "Econometrics, public policy and development economics, with the analytics training that sends graduates into policy and research roles rather than back to theory.",
    image: "/media/school-electronics.jpg",
    campuses: ["Jaipur"],
    href: "https://jecrcuniversity.edu.in/jaipur-school-of-economics/",
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    degrees: ["BHM", "Diploma"],
    description:
      "Front-of-house and kitchen training on working service floors, taught by people who have run them, with placements across hotel groups and event operators.",
    image: "/media/stills/s8.jpg",
    campuses: ["Jaipur"],
    href: "https://jecrcuniversity.edu.in/school-of-hospitality/",
  },
];

export const SCHOOLS_APPLY = APPLY_JAIPUR;

/** The things students do here that are not a degree. */
export const OPPORTUNITIES = [
  {
    name: "JU MakerSpace",
    body: "A student-run prototyping floor for IoT, robotics and 3D printing. Ideas in, working objects out.",
  },
  {
    name: "JECRC Incubation Centre",
    body: "Mentorship, seed support and desk space for student ventures. Two hundred have been incubated so far.",
  },
  {
    name: "National ISRO Science Exhibition",
    body: "A national space-science exhibition hosted on campus in collaboration with ISRO.",
  },
  {
    name: "National Healthcare Hackathon",
    body: "Clinicians set the brief, students build against it over a weekend, and the best builds get taken further.",
  },
  {
    name: "Office of International Affairs",
    body: "Exchange, semester-abroad and IAESTE placements through the Global Outreach Cell.",
  },
  {
    name: "Renaissance",
    body: "Three days, one main stage, booked and budgeted and lit and run end to end by students.",
  },
];
