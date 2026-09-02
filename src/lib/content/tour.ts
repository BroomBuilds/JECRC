import type { ApplyBeat, Caption } from "@/components/sections/ScrollTour";

/**
 * Beats of the scroll film, as fractions of the tour's scroll length.
 * Retime these to match the cut; nothing else needs to change.
 *
 * Every window below lands on a shot boundary rather than on a round number.
 * `ref/website-video.mp4` runs 33.12s and cuts at
 *
 *   3.20  4.92  6.60  8.96  11.60  13.20  15.36
 *   17.84  20.88  23.00  25.48  28.04  30.00
 *
 * which as fractions of the film are
 *
 *   .0966 .1485 .1993 .2705 .3502 .3986 .4638
 *   .5386 .6304 .6944 .7693 .8466 .9058
 *
 * That matters more than it sounds. A caption whose fade-out completes exactly
 * as the picture changes reads as edited: the line and the shot end together
 * and the film moves on. The same line fading two thirds of the way through a
 * shot reads as a caption someone dropped on top afterwards, and no amount of
 * easing fixes it. So every `at[1]` here IS a cut, and every `at[0]` is the
 * cut the new shot starts on, which lets the words arrive on the picture.
 *
 * Regenerate the list after a re-cut with:
 *   ffprobe -v error -f lavfi "movie=ref/website-video.mp4,select=gt(scene\,0.3)"  *     -show_entries frame=pkt_pts_time -of csv=p=0
 *
 * The last beat carries `variant: "apply"`, which is what brings all three
 * campus buttons up over the final frames. It is timed against the closing
 * sequence rather than against a cut: the film has no cuts left after .9058.
 * See "The ending" in globals.css.
 */
export const TOUR_CAPTIONS: Caption[] = [
  {
    at: [0.0, 0.1485],
    variant: "hero",
    eyebrow: "Jaipur · Alwar NCR · Rajasthan",
    title: "JECRC",
    tagline: "Build Your World",
  },
  {
    at: [0.1993, 0.3502],
    eyebrow: "Twenty-six years",
    title: "A campus that never quite closes",
    sub: "Labs open past midnight, studios that smell of solder and turpentine, a library nobody whispers in.",
  },
  {
    at: [0.3986, 0.5386],
    eyebrow: "The method",
    title: "Learn it, then build with it",
    sub: "Curriculum co-designed with L&T, Samatrix and Truechip. Project work from the first semester, not the final year.",
  },
  {
    at: [0.6304, 0.7693],
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
  { at: [0.2705, 0.3502], campus: 0 },
  { at: [0.4638, 0.5386], campus: 1 },
  { at: [0.6944, 0.7693], campus: 2 },
];
