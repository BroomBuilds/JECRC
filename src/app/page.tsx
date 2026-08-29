import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollTour from "@/components/sections/ScrollTour";
import Campuses from "@/components/sections/Campuses";
import ScratchReveal from "@/components/sections/ScratchReveal";
import Ambassador from "@/components/sections/Ambassador";
import ComingSoon from "@/components/sections/ComingSoon";
import Majors from "@/components/sections/Majors";
import Opportunities from "@/components/sections/Opportunities";
import Outcomes from "@/components/sections/Outcomes";
import Alumni from "@/components/sections/Alumni";
import Faq from "@/components/sections/Faq";
import Admissions from "@/components/sections/Admissions";
import { TOUR_CAPTIONS } from "@/lib/content/tour";
import { SCHOOLS } from "@/lib/content/schools";

/** The collage the scratch band reveals. Ten reads as a wall; five reads as a grid. */
const SCRATCH_IMAGES = SCHOOLS.slice(0, 10).map((s) => s.image);

/**
 * Section order is the argument the page makes:
 *
 *   film        establish the place
 *   campuses    which of the three, before anything else
 *   scratch     the promise, and the only place the visitor plays with it
 *   ambassador  the moment
 *   coming soon what is next
 *   schools     what you would study
 *   life        what you would do besides study
 *   outcomes    what it is worth
 *   alumni      who else did it
 *   faq         the objections
 *   admissions  the ask
 *
 * The grounds alternate paper, bone, paper so nothing runs together, and the
 * two black bands, the schools list and the footer, bracket the bottom half.
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <ScrollTour captions={TOUR_CAPTIONS} />
        <Campuses />
        <ScratchReveal images={SCRATCH_IMAGES} />
        <Ambassador />
        <ComingSoon />
        <Majors />
        <Opportunities />
        <Outcomes />
        <Alumni />
        <Faq />
        <Admissions />
      </main>
      <Footer />
    </>
  );
}
