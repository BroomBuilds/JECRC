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
