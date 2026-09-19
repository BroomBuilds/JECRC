import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ApplyBar from "@/components/layout/ApplyBar";
import ScrollTour from "@/components/sections/ScrollTour";
import ScratchReveal from "@/components/sections/ScratchReveal";
import Ambassador from "@/components/sections/Ambassador";
import ComingSoon from "@/components/sections/ComingSoon";
import Majors from "@/components/sections/Majors";
import Ledger from "@/components/sections/Ledger";
import Faq from "@/components/sections/Faq";
import { TOUR_CAPTIONS } from "@/lib/content/tour";

/**
 * The board the scratch band reveals. Swap the files, not the code.
 *
 * Two crops rather than one. The landscape board puts its photographs across
 * the left two thirds, which is exactly where a phone's `object-cover` throws
 * them away; the portrait poster is the same board reset for a tall frame.
 */
const SCRATCH_IMAGE = "/media/scratch-bg.webp";
const SCRATCH_IMAGE_PORTRAIT = "/media/scratch-bg-portrait.webp";

/**
 * Section order is the argument the page makes:
 *
 *   film        establish the place
 *   ambassador  the moment
 *   scratch     the promise, and the only place the visitor plays with it
 *   schools     what you would study that you could not study elsewhere
 *   numbers     what it is worth
 *   coming soon what is next, once the case for today is made
 *   faq         the objections
 *
 * The ask is not a section. It rides along as a capsule pinned to the bottom
 * centre, so it is half a click away from anywhere, and it stands down once the
 * footer arrives with the same three portals laid out full width.
 *
 * Grounds alternate paper, bone, paper so nothing runs together; the black
 * programmes band and the oxblood footer bracket the second half.
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <ApplyBar />
      <main>
        {/* The image sequence on a canvas: one scroll position, one frame,
            drawn from memory on the animation frame.

            Two video engines were built and both came back choppy. A `<video>`
            scrubbed with `currentTime` costs a seek per picture (p95 69.5ms).
            WebCodecs removes the seek and got it to p95 45.6ms, still behind
            the sequence's 36.6ms, because a decode has to happen somewhere and
            the sequence has already done it. "Two engines" in TOUR.md has both
            sets of measurements.

            The quality complaint that started it was never the engine. The
            display tier was picked with a 15% slack, so a 1440x900 desktop
            asked for 1600px and was handed the 1400 tier to ENLARGE; and it
            was encoded at crf 36. Both are fixed: TIER_SLACK in
            ScrollTour.tsx, and `--crf 30` in `tour:h`. SSIM at the drawn size
            went 0.9717 to 0.9811 — past what the crf-20 video managed per
            byte, because the two formats sit on the same curve. */}
        <ScrollTour captions={TOUR_CAPTIONS} />
        <Ambassador />
        <ScratchReveal image={SCRATCH_IMAGE} imagePortrait={SCRATCH_IMAGE_PORTRAIT} />
        <Majors />
        <Ledger />
        <ComingSoon />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
