/**
 * Brand ambassador.
 *
 * `portrait` is intentionally optional: the section renders a branded frame
 * until a licensed image is dropped into /public/brand/ and referenced here.
 * Do not substitute a press photograph, the shoot assets are the client's to
 * supply.
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
  /** Optional. e.g. "/brand/vikrant-massey.jpg" */
  portrait: undefined as string | undefined,
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
  watchHref: "https://www.youtube.com/watch?v=5JrMq6z2tNg",
  watchLabel: "Watch the announcement",
} as const;
