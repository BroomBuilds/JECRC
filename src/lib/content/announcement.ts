/**
 * The coming-soon band: two new universities joining the group.
 *
 * Names, cities and intake dates are not public yet, so nothing here invents
 * them. Every unknown reads "To be announced" on purpose, and the section is
 * built around that rather than around a blank. Fill `name`, `place` and the
 * `facts` values as each is confirmed; the layout does not change.
 *
 * Set `live: false` and the band stops rendering, so it can be pulled without
 * touching a component.
 */

export type NewCampus = {
  no: string;
  /** Working label until the name is public. */
  name: string;
  place: string;
  facts: { label: string; value: string }[];
};

export const ANNOUNCEMENT = {
  live: true,
  eyebrow: "Coming soon",
  marquee: "Two more coming",
  kicker: "Two new universities",
  title: "The group is",
  titleAccent: "getting bigger",
  detail:
    "Two more universities join JECRC. Names, cities and the first intake are announced shortly. Everything below fills in as each one is confirmed.",
  cta: { label: "Get told first", href: "#apply" },
  /**
   * The medical college is the one part of "what is next" that is not a
   * placeholder — it is designed and there are renders — so it gets the
   * pictures while the two universities keep plain plates.
   *
   * No bed count and no first intake until the group confirms them, and the
   * renders stay labelled as architectural visualisations rather than
   * photographs.
   */
  medical: {
    eyebrow: "Coming soon",
    name: "JECRC Medical College and Hospital",
    place: "Jaipur",
    detail:
      "A teaching hospital and medical college on the group's own campus, drawn and under way. Programmes and first intake are announced when they are confirmed.",
    /** Architect's visualisations, not photographs. Said out loud in the caption. */
    credit: "Architectural visualisation",
    views: [
      { src: "/media/medical/elevation.webp", label: "Front elevation" },
      { src: "/media/medical/arrival.webp", label: "The drop-off, evening" },
      { src: "/media/medical/entrance.webp", label: "Lower ground entry" },
    ],
  },
  campuses: [
    {
      no: "01",
      name: "The third university",
      place: "To be announced",
      facts: [
        { label: "Campus", value: "To be announced" },
        { label: "Programmes", value: "To be announced" },
        { label: "First intake", value: "To be announced" },
      ],
    },
    {
      no: "02",
      name: "The fourth university",
      place: "To be announced",
      facts: [
        { label: "Campus", value: "To be announced" },
        { label: "Programmes", value: "To be announced" },
        { label: "First intake", value: "To be announced" },
      ],
    },
  ] satisfies NewCampus[],
} as const;
