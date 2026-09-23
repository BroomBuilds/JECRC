/**
 * Answer-shaped copy. Rendered on the page and mirrored into FAQPage JSON-LD,
 * which is what gives an answer engine something clean to quote.
 *
 * Keep every answer self-contained: no "as mentioned above", no pronoun that
 * needs the previous entry for context. A model lifting one entry should come
 * away with a complete, correct sentence.
 */
export const FAQS = [
  {
    q: "How many JECRC campuses are there, and where are they?",
    a: "Three. JECRC University's flagship campus sits on thirty-two acres at Sitapura, Jaipur. JECRC University's NCR campus covers 32.89 acres in the Matsya Industrial Area, Alwar, inside the National Capital Region. JECRC Foundation, the Jaipur Engineering College and Research Centre, is the group's founding engineering college in Jaipur.",
  },
  {
    q: "How do I apply to JECRC University?",
    a: "Applications are handled on the group's own portals, and each campus publishes the state of its current intake there. Apply to the Jaipur campus at jecrcuapplication.jecrcuniversity.edu.in and to the Alwar NCR campus at jecruncrapplication.jecrcuncr.edu.in. The online form takes about ten minutes, after which an admissions representative makes contact to complete the process. The Jaipur admissions desk is reachable toll-free on 1800 120 5616 or at admission@jecrcu.edu.in, the Alwar NCR desk on 1800 410 5616, and both are closed on Sundays.",
  },
  {
    q: "What are JECRC University's placement figures?",
    a: "For the 2025-26 season JECRC University recorded 2,104 or more offers from 205 recruiters, including 856 offers from Fortune 500 companies. The highest package was 33 lakh per annum, the average 6 lakh per annum, and the average across the top thirty percent of the cohort 10.7 lakh per annum. By discipline the averages were 6.45 lakh for technical programmes, 7 lakh for management, 5 lakh for mechanical, civil and electronics engineering, and 4 lakh for skill-based programmes. The placement season ran 230 days and was supported by more than 500 hours of campus recruitment training. Group-wide, more than 12,000 placements were made over the last five years.",
  },
  {
    q: "Which companies recruit from JECRC?",
    a: "Recruiters named on the university's placements page include Amazon, Microsoft, Google, TCS, Infosys, Wipro, IBM, Cisco, Deloitte, Capgemini, Cognizant, HCL Tech and L&T Technology Services on the technology side, and ITC Limited, Paytm, Zomato, Flipkart, Decathlon, HDFC Life, Bajaj Capital, Nestle, Tata AIG, IndiaMART, Blinkit and Unicharm beyond it.",
  },
  {
    q: "What courses does JECRC University offer?",
    a: "Eleven schools spanning engineering and technology, computer applications, business, sciences, humanities and social sciences, law, mass communication, design, economics, allied health sciences and hospitality. Programmes run at undergraduate, postgraduate and doctoral level, with more than fifty programmes offered at the Alwar NCR campus alone.",
  },
  {
    q: "Is JECRC University recognised by the UGC and AICTE?",
    a: "Yes. JECRC University is a private university established under an Act of the Rajasthan State Legislature and recognised by the University Grants Commission under sections 2(f) and 12(B) of the UGC Act 1956. Its technical programmes conform to AICTE directives. JECRC Foundation is approved by AICTE and affiliated to Rajasthan Technical University.",
  },
  {
    q: "Who is the brand ambassador of JECRC University?",
    a: "The actor Vikrant Massey became part of the JECRC story in April 2026, fronting the group's Build Your World campaign across the Jaipur and Alwar NCR campuses.",
  },
  {
    q: "What scholarships are available at JECRC?",
    a: "Scholarships are awarded on merit from the last qualifying examination and are assessed at the point of application, so no separate form is needed. At the Alwar NCR campus, tuition fee waivers of up to fifty percent are offered to JEE and Class 12 merit holders.",
  },
] as const;
