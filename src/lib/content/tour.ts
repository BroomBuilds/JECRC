import type { ApplyBeat, Caption } from "@/components/sections/ScrollTour";

/**
 * Beats of the scroll film, as fractions of the tour's scroll length.
 * Retime these to match the cut; nothing else needs to change.
 *
 * Every window below lands on a shot boundary rather than on a round number.
 * Both cuts of the current film — horizontal and vertical, the same edit at
 * two aspects — run 29.36s and cut at the same eleven fractions:
 *
 *   .109 .168 .225 .305 .395 .459 .523 .607 .711 .783 .867
 *
 * That matters more than it sounds. A caption whose fade-out completes exactly
 * as the picture changes reads as edited: the line and the shot end together
 * and the film moves on. The same line fading two thirds of the way through a
 * shot reads as a caption someone dropped on top afterwards, and no amount of
 * easing fixes it. So every `at[1]` here IS a cut, and every `at[0]` is the
 * cut the new shot starts on, which lets the words arrive on the picture.
 *
 * Do not regenerate these by hand. `scripts/build-tour.mjs` detects the cuts
 * on every build and writes them into the manifest as `cuts`, which is also
 * what ScrollTour dissolves across — so the authoritative list is
 * `src/lib/tour-manifest-landscape.json`, and the build prints it. After a
 * re-cut, read the new fractions off that and move each window onto the
 * nearest one; `--cuts-only` re-detects without re-encoding.
 *
 * WHICH caption belongs on WHICH shot is not something the cut list can say.
 * These four were carried across from the previous film by ordinal position,
 * which keeps every boundary on a cut but assumes shot three of the new edit
 * is still about the method. Worth one pass against the actual footage.
 *
 * The last beat carries `variant: "apply"`, which is what brings all three
 * campus buttons up over the final frames. It is timed against the closing
 * sequence rather than against a cut: the film has no cuts left after .867.
 * See "The ending" in globals.css.
 */
export const TOUR_CAPTIONS: Caption[] = [
  {
    at: [0.0, 0.168],
    variant: "hero",
    eyebrow: "Jaipur · Alwar NCR · Rajasthan",
    title: "JECRC",
    tagline: "Build Your World",
  },
  {
    at: [0.225, 0.395],
    eyebrow: "Twenty-six years",
    title: "A campus that never quite closes",
    sub: "Labs open past midnight, studios that smell of solder and turpentine, a library nobody whispers in.",
  },
  {
    at: [0.459, 0.607],
    eyebrow: "The method",
    title: "Learn it, then build with it",
    sub: "Curriculum co-designed with L&T, Samatrix and Truechip. Project work from the first semester, not the final year.",
  },
  {
    at: [0.711, 0.867],
    eyebrow: "The outcome",
    title: "Two thousand offers a season",
    sub: "Two hundred recruiters, eight hundred and fifty-six Fortune 500 offers, thirty-four thousand alumni across thirty-five countries.",
  },
  {
    // Two things here are not the pattern the other beats follow.
    //
    // It opens at .962, after the mark has been cut out of the closing plate
    // rather than alongside it: the ending's one hero moment should not have
    // to share the screen with three buttons arriving.
    //
    // And it closes at 1.4, which is past the end of the tour and therefore
    // never. It used to close at 1.0, which meant `1 - smooth(p, .955, 1)`
    // drove the whole block to zero over the last four percent: the visitor
    // scrolled to the bottom of the film and watched the only ask on the
    // screen fade out as they arrived. An ending has to be held.
    at: [0.962, 1.4],
    ramp: 0.019,
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
  { at: [0.305, 0.395], campus: 0 },
  { at: [0.528, 0.607], campus: 1 },
  { at: [0.783, 0.867], campus: 2 },
];
