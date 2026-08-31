import { IMG, STILL } from "./assets";

export const BRAND = {
  name: "JECRC University",
  wordmark: "JECRC UNIVERSITY",
  tagline: "Build Your World",
  established: "27 Years of Academic Legacy · Jaipur",
  address: ["Plot No. IS-2036 to IS-2039,", "Ramchandrapura, Sitapura Extension,", "Jaipur, Rajasthan 303905, India"],
  phone: "+91 141 799 5555",
  phoneHref: "tel:+911417995555",
  email: "info@jecrcu.edu.in",
  year: 2026,
};

export const NAV = [
  { label: "The University", href: "#university" },
  { label: "Schools", href: "#schools" },
  { label: "Campus Life", href: "#campus" },
  { label: "Facilities", href: "#facilities" },
  { label: "Visit", href: "#visit" },
];

/** Beats of the tour, as fractions of the scroll. Retime to match your cut. */
export const TOUR_CAPTIONS = [
  { at: [0.0, 0.16] as [number, number], variant: "hero" as const, eyebrow: "Jaipur · Rajasthan", title: "JECRC UNIVERSITY", tagline: "Build Your World" },
  { at: [0.22, 0.4] as [number, number], eyebrow: "The campus", title: "Everything here is a workshop", sub: "Labs that stay open past midnight, studios that smell of solder and turpentine, a library nobody whispers in." },
  { at: [0.46, 0.64] as [number, number], eyebrow: "The work", title: "Learn it, then build with it", sub: "Students here don't wait for permission to use the tools of their field. They ship, break, and ship again." },
  { at: [0.7, 0.88] as [number, number], eyebrow: "The proof", title: "You leave having made something", sub: "11,900 placements in five years is the by-product. The work itself is the point." },
  { at: [0.93, 1.0] as [number, number], title: "So — what will you build?" },
];

export const LEGACY = {
  eyebrow: "27 Years of Academic Legacy",
  headline: "Where you learn it,",
  headlineScript: "then build with it.",
  body:
    "JECRC University was founded on a straightforward premise: that a university's job is not to hand students a syllabus, but to hand them the tools, the room and the deadline. Twenty-seven years on, that premise holds across eleven schools, thirty-two acres and twenty-six thousand people who came here to make something.",
  cta: "Read our story",
};

export const INTERLUDE = {
  eyebrow: "Driven by a Culture of Excellence",
  headline: "Twenty-six thousand people,",
  script: "one campus.",
};

export const STATS = [
  { value: "32", unit: "acres", label: "Campus at Sitapura, Jaipur" },
  { value: "26,000", unit: "+", label: "Students on roll" },
  { value: "11,900", unit: "+", label: "Placements in five years" },
  { value: "10,000", unit: "+", label: "Alumni worldwide" },
];

export const SCHOOLS = [
  {
    index: "01",
    name: "Engineering & Technology",
    eyebrow: "The largest school",
    meta: "B.Tech · M.Tech · Ph.D.",
    image: IMG.engineering,
    body: "Computer science, artificial intelligence and data science, mechanical, civil, electrical, electronics. Project work from the first semester, not the final year.",
  },
  {
    index: "02",
    name: "Computer Applications",
    eyebrow: "Applied computing",
    meta: "BCA · MCA",
    image: IMG.computing,
    body: "Software built to be used by someone other than the person who wrote it. Cloud, mobile, data engineering, and a great deal of code review.",
  },
  {
    index: "03",
    name: "Jaipur School of Business",
    eyebrow: "Management",
    meta: "BBA · MBA · Integrated",
    image: IMG.lecture,
    body: "Case method, live consulting briefs with Jaipur firms, and a placement season that starts in the penultimate year.",
  },
  {
    index: "04",
    name: "Sciences & Allied Health",
    eyebrow: "Research-led",
    meta: "B.Sc · M.Sc · Ph.D.",
    image: IMG.sciences,
    body: "Physics, chemistry, mathematics, biotechnology; radiology, optometry, nutrition and physiotherapy next door. Bench time from year one.",
  },
  {
    index: "05",
    name: "Design, Media & Law",
    eyebrow: "Studio & chamber",
    meta: "B.Des · BA JMC · BA LLB",
    image: IMG.robotics,
    body: "Fashion, interior and communication design; journalism, film and digital media; a moot court that runs like the real thing.",
  },
];

export const ALL_SCHOOLS = [
  "Engineering & Technology", "Computer Applications", "Jaipur School of Business",
  "Sciences", "Humanities & Social Sciences", "Law", "Jaipur School of Mass Communication",
  "Jaipur School of Design", "Jaipur School of Economics", "Allied Health Sciences", "Hospitality",
];

export const CAMPUS = [
  {
    eyebrow: "The festival",
    name: "Renaissance",
    image: STILL.six,
    body: "Three days, one main stage, pyros that set off every car alarm in Sitapura. Booked, budgeted, lit and run end-to-end by students.",
    cta: "See the line-up",
  },
  {
    eyebrow: "Where the day actually happens",
    name: "The Food Court",
    image: STILL.four,
    body: "Glass on two sides, table tennis at the far end, and the unbroken hum of eleven schools arguing about deadlines over cold coffee.",
    cta: "Take a look",
  },
  {
    eyebrow: "Open late",
    name: "Studios & Labs",
    image: STILL.seven,
    body: "Maker space, media studios, moot court, incubation cell. Booked out most evenings — which is exactly the point of building them.",
    cta: "Explore facilities",
  },
];

export const FACILITIES = [
  { title: "The Library", body: "Four floors, 90,000 volumes, and every major journal database. Open until midnight in exam season.", image: IMG.library },
  { title: "Sport", body: "Cricket ground, athletics track, indoor courts and a gym that fills up at six in the morning.", image: STILL.three },
  { title: "Incubation Cell", body: "Desks, mentors and seed support for student ventures. Several have outlived their founders' degrees.", image: STILL.eight },
];

export const LANDMARKS = [
  { label: "Jaipur International Airport", detail: "9 km" },
  { label: "Jaipur Junction Railway Station", detail: "16 km" },
  { label: "City centre (MI Road)", detail: "15 km" },
  { label: "Sitapura Industrial Area", detail: "2 km" },
];

export const FOOTER_LINKS = {
  study: ["Schools & programmes", "Admissions", "Scholarships", "Fees", "International students", "NCR Campus, Alwar"],
  campus: ["Campus life", "Hostels", "Sport", "Clubs & societies", "Renaissance"],
  about: ["Leadership", "Research", "Placements", "News & events", "Contact"],
};

export const ADMISSIONS = {
  eyebrow: "Admissions",
  title: "Applications are open",
  body: "Undergraduate and postgraduate programmes across all eleven schools. Scholarships assessed on merit at the point of application.",
  primary: "Start an application",
  secondary: "Download the prospectus",
};
