import type { ApplyBeat, Caption } from "@/components/sections/ScrollTour";

/**
 * Beats of the scroll film, as fractions of the tour's scroll length.
 * Retime these to match the cut; nothing else needs to change.
 *
 * The last beat carries `variant: "apply"`, which is what brings all three
 * campus buttons up over the final frames.
 */
export const TOUR_CAPTIONS: Caption[] = [
  {
    at: [0.0, 0.15],
    variant: "hero",
    eyebrow: "Jaipur · Alwar NCR · Rajasthan",
    title: "JECRC",
    tagline: "Build Your World",
  },
  {
    at: [0.2, 0.37],
    eyebrow: "Twenty-six years",
    title: "A campus that never quite closes",
    sub: "Labs open past midnight, studios that smell of solder and turpentine, a library nobody whispers in.",
  },
  {
    at: [0.42, 0.59],
    eyebrow: "The method",
    title: "Learn it, then build with it",
    sub: "Curriculum co-designed with L&T, Samatrix and Truechip. Project work from the first semester, not the final year.",
  },
  {
    at: [0.64, 0.81],
    eyebrow: "The outcome",
    title: "Two thousand offers a season",
    sub: "Two hundred recruiters, eight hundred and fifty-six Fortune 500 offers, thirty-four thousand alumni across thirty-five countries.",
  },
  {
    at: [0.86, 1.0],
    variant: "apply",
    eyebrow: "Admissions 2026 are open",
    title: "So, what will you build?",
  },
];

/**
 * The ask, recurring through the film rather than saved for the end.
 *
 * Someone who decides to apply forty percent of the way through should not
 * have to reach the finish to act on it, and the closing beat only catches the
 * people who watch the whole thing.
 *
 * One campus each, rotating, so the three get equal billing. Not the
 * three-button block: that belongs to the ending, and repeating it would spend
 * the ending early.
 *
 * What varies is the moment, never the place. An earlier pass moved the stamp
 * between corners and heights on each appearance, which looked considered and
 * behaved badly: a control that lands somewhere new every time is one the
 * visitor has to find again every time. Fixed to a single anchor it is learned
 * once, and the recurrence is the interesting part.
 *
 * The windows sit inside the caption windows on purpose: a caption is centred
 * and the stamp is not, so they share the screen rather than queueing, and the
 * visitor gets the claim and the ask together.
 */
export const TOUR_APPLY_BEATS: ApplyBeat[] = [
  { at: [0.23, 0.37], campus: 0 },
  { at: [0.45, 0.58], campus: 1 },
  { at: [0.67, 0.8], campus: 2 },
];
