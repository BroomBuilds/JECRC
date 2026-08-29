import type { Caption } from "@/components/sections/ScrollTour";

/**
 * Beats of the scroll film, as fractions of the tour's scroll length.
 * Retime these to match the cut; nothing else needs to change.
 *
 * The last beat carries `apply: true`, which is what brings the three campus
 * apply buttons up over the final frames.
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
