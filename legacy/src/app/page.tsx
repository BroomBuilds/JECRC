import Nav from "@/components/Nav";
import ScrollTour from "@/components/ScrollTour";
import Legacy from "@/components/Legacy";
import Interlude from "@/components/Interlude";
import Schools from "@/components/Schools";
import CampusRows from "@/components/CampusRows";
import Facilities from "@/components/Facilities";
import MapSection from "@/components/MapSection";
import Footer from "@/components/Footer";
import { TOUR_CAPTIONS } from "@/lib/content";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <ScrollTour captions={TOUR_CAPTIONS} />
        <Legacy />
        <Interlude />
        <Schools />
        <CampusRows />
        <Facilities />
        <MapSection />
      </main>
      <Footer />
    </>
  );
}
