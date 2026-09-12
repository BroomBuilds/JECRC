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
 * the shot that actually shows the thing it names. `website update horizontal.mp4`
 * runs 20.12s, cuts at
 *
 *   .2286  .5209  .6978  .8966
 *
 * and those five shots are:
 *
 *   S0  .000-.229   sunset aerial over the original college  -> the mark, then 01
 *   S1  .229-.521   the Jaipur campus, red brick, from the road -> 02, 2012
 *   S2  .521-.698   a campus gate, "Welcome Class of 2026"   -> 03, Alwar NCR
 *   S3  .698-.897   the medical college render, Block 2A     -> 04, the hospital
 *   S4  .897-1.00   the medical building render, ground level -> the closing mark
 *
 * Three things about this edit are worth knowing:
 *
 *   - It is the only window here that does NOT open on a cut: S0 carries both
 *     the opening mark and beat 01, because this cut dropped the letter-monument
 *     shot the previous one opened on and there is no longer a separate picture
 *     for the identity frame. The mark holds the first 1.8s of the aerial and 01
 *     takes the rest of it. Give S0 a shot of its own in the next re-cut and
 *     beat 01 moves onto the cut like the others.
 *   - S2 carries JECRC UNIVERSITY banners and is most likely the JAIPUR gate,
 *     not Alwar. There is no shot in this edit that I can identify as the Alwar
 *     NCR campus. Beat 03 sits there because it is the only slot left in
 *     chronological order, not because the picture is right.
 *   - The vertical cut is the same edit at a different aspect and its cuts land
 *     within .0032 of these (.2318 .5215 .6987 .8974), so one set of windows
 *     serves both films. Check that still holds after any re-cut. It is also
 *     re-framed per shot at build time — the aerials lose their sky, the gate
 *     and the renders lose foreground — so a phone sees a tighter picture than
 *     these fractions suggest. See "Reframing the portrait cut" in TOUR.md.
 *
 * A caption whose fade-out completes exactly as the picture changes reads as
 * edited: the line and the shot end together and the film moves on. The same
 * line fading two thirds of the way through a shot reads as a caption someone
 * dropped on top afterwards, and no amount of easing fixes it. So every `at[1]`
 * here IS a cut, and every `at[0]` is the cut the new shot starts on — with the
 * one exception above.
 *
 * At 20.12s the four institution frames run 2.8s, 5.9s, 3.6s and 4.0s. The
 * brief asked for 3-4s each; 01 runs short because it shares its shot with the
 * opening mark, and 02 runs long because its single shot is the longest in the
 * film. Both are properties of the edit, not of these numbers.
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
    at: [0.0, 0.09],
    // A shorter ramp than the default .045, and only the fade-OUT uses it: a
    // beat anchored at zero skips its fade-in. The opening plate finishes
    // dissolving at .055 and the name has to be on a picture at full strength
    // for a moment before it leaves, or the two moves run into each other and
    // the reveal reads as the title simply fading.
    ramp: 0.025,
    variant: "hero",
    title: "JECRC Group of Institutions",
  },
  {
    at: [0.09, 0.2286],
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
    at: [0.2286, 0.5209],
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
    at: [0.5209, 0.6978],
    variant: "chapter",
    no: "03",
    title: "JECRC University — Alwar NCR Campus",
    status: "Established 2026",
    actions: [
      { label: "Visit Website", href: ncr.site },
      { label: "Apply Now", href: ncr.apply },
    ],
  },
  {
    at: [0.6978, 0.8966],
    variant: "chapter",
    no: "04",
    title: "JECRC Hospital",
    status: "Coming Soon",
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
    // It opens at .8966 and runs past the end of the tour. The ending's own
    // choreography starts at .897 — the film's last cut — and cuts the mark out
    // of a closing plate; this beat is the line above it and the portals below
    // it, and both have to be settled before that begins rather than still
    // arriving.
    //
    // `at[1]` is 1.4, which is past the end and therefore never. It used to
    // close at 1.0, which drove the whole block to zero over the last four
    // percent: the visitor reached the bottom of the film and watched the only
    // ask on screen fade out as they arrived. An ending has to be held.
    at: [0.8966, 1.4],
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
