/**
 * Brand ambassador.
 *
 * `portrait` stays optional: the section renders a branded frame when it is
 * unset, so pulling the image never leaves a hole. The one in place is JECRC's
 * own published campaign photograph, not a press agency frame.
 *
 * No line here is attributed to Vikrant Massey. The pull quote is the
 * university's own framing of the partnership; if an approved quote from him
 * arrives, move it into `quote` and change `quoteBy`.
 */
export const AMBASSADOR = {
  eyebrow: "Brand ambassador",
  name: "Vikrant Massey",
  role: "Actor · The face of JECRC University",
  announced: "April 2026",
  /**
   * Published by JECRC on their own application portal
   * (jecrcuapplication.jecrcuniversity.edu.in), shot on the Sitapura campus.
   * Replace with the campaign master when the shoot assets arrive.
   */
  portrait: "/brand/vikrant-massey.webp" as string | undefined,
  portraitAlt: "Vikrant Massey, brand ambassador for JECRC University",
  body:
    "An actor who built a career the long way round: small parts, then better parts, then the ones nobody else could have played. The partnership works because it is the same arc the university asks of its students. Start with the work, stay with the work, and let the recognition arrive second.",
  quote: "Dream big. Stay grounded. Build your world.",
  quoteBy: "The spirit of the partnership",
  notes: [
    { label: "Announced", value: "April 2026" },
    { label: "Represents", value: "Jaipur and Alwar NCR campuses" },
    { label: "Campaign", value: "Build Your World" },
  ],
  /** JECRC's own upload. `watchVideoId` drives the in-page player; `watchHref`
      is the escape hatch for anyone who would rather watch it on YouTube. */
  watchVideoId: "5JrMq6z2tNg",
  watchHref: "https://www.youtube.com/watch?v=5JrMq6z2tNg",
  watchLabel: "Watch the announcement",
  watchTitle: "JECRC welcomes Vikrant Massey",
} as const;
