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
import { TOUR_APPLY_BEATS, TOUR_CAPTIONS } from "@/lib/content/tour";
import { PROGRAMMES } from "@/lib/content/schools";

/** The collage the scratch band reveals: all eight, as two rows of four. */
const SCRATCH_IMAGES = PROGRAMMES.map((p) => p.image);

/**
 * Section order is the argument the page makes:
 *
 *   film        establish the place
 *   scratch     the promise, and the only place the visitor plays with it
 *   ambassador  the moment
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
        <ScrollTour captions={TOUR_CAPTIONS} applyBeats={TOUR_APPLY_BEATS} />
        <ScratchReveal images={SCRATCH_IMAGES} />
        <Ambassador />
        <Majors />
        <Ledger />
        <ComingSoon />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
