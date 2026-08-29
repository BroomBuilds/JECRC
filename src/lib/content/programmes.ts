/** Schools and the opportunities attached to them. */

export type Programme = {
  index: string;
  school: string;
  levels: string;
  body: string;
  image: string;
  campuses: string[];
};

export const PROGRAMMES: Programme[] = [
  {
    index: "01",
    school: "Engineering and Technology",
    levels: "B.Tech · M.Tech · Ph.D.",
    body:
      "Computer science, artificial intelligence and data science, mechanical, civil, electrical and electronics. Dedicated labs for AI, robotics and VLSI, and a coding ecosystem that runs year round.",
    image: "/media/stills/s1.jpg",
    campuses: ["Jaipur", "Alwar NCR", "Foundation"],
  },
  {
    index: "02",
    school: "Computer Applications",
    levels: "BCA · MCA",
    body:
      "Software written to be used by someone other than the person who wrote it. Cloud, mobile and data engineering, with a great deal of code review in between.",
    image: "/media/stills/s2.jpg",
    campuses: ["Jaipur", "Alwar NCR"],
  },
  {
    index: "03",
    school: "Jaipur School of Business",
    levels: "BBA · MBA · Integrated",
    body:
      "Case method, live consulting briefs with Jaipur and NCR firms, and a placement season that opens in the penultimate year rather than the last one.",
    image: "/media/stills/s3.jpg",
    campuses: ["Jaipur", "Alwar NCR"],
  },
  {
    index: "04",
    school: "Sciences and Allied Health",
    levels: "B.Sc · M.Sc · Ph.D.",
    body:
      "Physics, chemistry, mathematics and biotechnology, with radiology, optometry, nutrition and physiotherapy next door. Bench time from year one.",
    image: "/media/stills/s5.jpg",
    campuses: ["Jaipur"],
  },
  {
    index: "05",
    school: "Design, Media and Law",
    levels: "B.Des · BA JMC · BA LLB",
    body:
      "Fashion, interior and communication design; journalism, film and digital media; and a moot court that runs like the real thing.",
    image: "/media/stills/s7.jpg",
    campuses: ["Jaipur"],
  },
  {
    index: "06",
    school: "Hospitality and Economics",
    levels: "BHM · BA · M.A.",
    body:
      "Front-of-house training in working kitchens and service floors, alongside an economics school that sends students into policy and analytics roles.",
    image: "/media/stills/s8.jpg",
    campuses: ["Jaipur"],
  },
];

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
