import type { Caption } from "@/components/sections/ScrollTour";
import { INSTITUTIONS } from "@/lib/content/universities";
import { LOGO } from "@/lib/content/site";

const jaipur = INSTITUTIONS.find((i) => i.id === "jaipur")!;
const ncr = INSTITUTIONS.find((i) => i.id === "ncr")!;
const foundation = INSTITUTIONS.find((i) => i.id === "foundation")!;

/**
 * Beats of the scroll film, as fractions of the tour's scroll length.
 *
 * The film is one chronological story — 2001, 2012, 2026, 2026 — opening on the
 * group identity and closing on it again. Six beats: the mark, four
 * institutions, the mark. Nothing else is on screen at any point.
 *
 * Every window lands on a shot boundary rather than on a round number, AND on
 * the shot that actually shows the thing it names. `website-horizontal-new.mp4`
 * runs 22.20s, cuts at
 *
 *   .0937  .1838  .3027  .4216  .5658  .7261  .9063
 *
 * and those eight shots are:
 *
 *   S0  .000-.094   the JECRC letter monument and fountain   -> the mark
 *   S1  .094-.184   aerial, the original college block
 *   S2  .184-.303   wider aerial, same campus                -> 01, 2001
 *   S3  .303-.422   sunset aerial, the Jaipur campus
 *   S4  .422-.566   the Jaipur campus wide, across the lawn  -> 02, 2012
 *   S5  .566-.726   a campus gate, "Welcome Class of 2026"   -> 03, Alwar NCR
 *   S6  .726-.906   the medical college render, Block 2A     -> 04, the hospital
 *   S7  .906-1.00   the medical building render, ground level -> the closing mark
 *
 * Two of those pairings are worth knowing about:
 *
 *   - S5 carries JECRC UNIVERSITY banners and is most likely the JAIPUR gate,
 *     not Alwar. There is no shot in this edit that I can identify as the Alwar
 *     NCR campus. Beat 03 sits there because it is the only slot left in
 *     chronological order, not because the picture is right.
 *   - The vertical cut is the same edit at a different aspect and its cuts land
 *     within .0006 of these, so one set of windows serves both films. Check
 *     that still holds after any re-cut.
 *
 * A caption whose fade-out completes exactly as the picture changes reads as
 * edited: the line and the shot end together and the film moves on. The same
 * line fading two thirds of the way through a shot reads as a caption someone
 * dropped on top afterwards, and no amount of easing fixes it. So every `at[1]`
 * here IS a cut, and every `at[0]` is the cut the new shot starts on.
 *
 * At 22.20s the four institution frames run 4.6s, 5.8s, 3.6s and 4.0s. The
 * brief asked for 3-4s each; the first two run long because each spans two
 * shots of the same subject, and splitting them would put a caption change in
 * the middle of one institution. Shortening them means re-cutting the film,
 * not moving these numbers.
 *
 * After a re-cut, read the new cut list off `src/lib/tour-manifest-landscape.json`
 * (the build prints it, and `--cuts-only` re-detects without re-encoding), work
 * out what each new shot shows, and move each window onto the right one.
 */
export const TOUR_CAPTIONS: Caption[] = [
  {
    // The clean identity frame: the founding entity's mark, the group's name
    // as a headline, and where the group is. Nothing else — the marketing
    // sentence that used to run here is gone. The headline itself is not
    // driven from here: "JECRC" / "Group of institutions" is fixed text in
    // the component, because it names the frame rather than describing this
    // particular beat.
    at: [0.0, 0.0937],
    variant: "hero",
    title: "JECRC Group of Institutions",
  },
  {
    at: [0.0937, 0.3027],
    variant: "chapter",
    no: "01",
    title: "JECRC College",
    status: "Established 2001",
    actions: [
      { label: "Visit Website", href: foundation.site },
      { label: "Apply Now", href: foundation.apply },
    ],
  },
  {
    at: [0.3027, 0.5658],
    variant: "chapter",
    no: "02",
    title: "JECRC University, Jaipur",
    status: "Established 2012",
    descriptor: "Multidisciplinary UG & PG Programmes",
    actions: [
      { label: "Visit Website", href: jaipur.site },
      { label: "Apply Now", href: jaipur.apply },
    ],
  },
  {
    at: [0.5658, 0.7261],
    variant: "chapter",
    no: "03",
    title: "JECRC University — Alwar NCR Campus",
    status: "Launched 2026",
    actions: [
      { label: "Visit Website", href: ncr.site },
      { label: "Apply Now", href: ncr.apply },
    ],
  },
  {
    at: [0.7261, 0.9063],
    variant: "chapter",
    no: "04",
    title: "JECRC Hospital",
    status: "Launched 2026",
    mark: { src: LOGO.hospitalMarkReversed, alt: "JECRC Hospital", width: 704, height: 274 },
    actions: [
      // The hospital has no website yet — it is under construction, and the
      // group has not published one. Rather than label a link "Visit Website"
      // and send it somewhere that is not the hospital, this goes to the
      // section of this page that carries the architect's visualisations.
      // Swap this one string the moment a real address exists.
      { label: "Visit Website", href: "#whats-next" },
    ],
  },
  {
    // Two things here are not the pattern the other beats follow.
    //
    // It opens at .7261 and runs past the end of the tour. The ending's own
    // choreography starts at .906 — the film's last cut — and cuts the mark out
    // of a closing plate; this beat is the line above it and the portals below
    // it, and both have to be settled before that begins rather than still
    // arriving.
    //
    // `at[1]` is 1.4, which is past the end and therefore never. It used to
    // close at 1.0, which drove the whole block to zero over the last four
    // percent: the visitor reached the bottom of the film and watched the only
    // ask on screen fade out as they arrived. An ending has to be held.
    at: [0.9063, 1.4],
    ramp: 0.019,
    variant: "group",
    title: "JECRC Group",
    // The group's own sentence, moved here from the opening frame. It reads
    // better as a closing thought than as an opening one: at the end the
    // visitor has just watched the four institutions it describes, so it lands
    // as a summary rather than as a claim made before any evidence.
    thought:
      "One JECRC. A growing ecosystem across education, innovation and healthcare.",
  },
];
