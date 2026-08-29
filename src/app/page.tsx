import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollTour from "@/components/sections/ScrollTour";
import Campuses from "@/components/sections/Campuses";
import Ambassador from "@/components/sections/Ambassador";
import ComingSoon from "@/components/sections/ComingSoon";
import Programmes from "@/components/sections/Programmes";
import Opportunities from "@/components/sections/Opportunities";
import Outcomes from "@/components/sections/Outcomes";
import Alumni from "@/components/sections/Alumni";
import Faq from "@/components/sections/Faq";
import Admissions from "@/components/sections/Admissions";
import { TOUR_CAPTIONS } from "@/lib/content/tour";

/**
 * Section order is the argument the page makes:
 *
 *   film        establish the place
 *   campuses    which of the three, before anything else
 *   ambassador  the moment
 *   coming soon what is next
 *   programmes  what you would study
 *   life        what you would do besides study
 *   outcomes    what it is worth
 *   alumni      who else did it
 *   faq         the objections
 *   admissions  the ask
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <ScrollTour captions={TOUR_CAPTIONS} />
        <Campuses />
        <Ambassador />
        <ComingSoon />
        <Programmes />
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
