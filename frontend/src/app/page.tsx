import Navbar from "./homepage/Navbar";
import HeroSection from "./homepage/HeroSection";
import PartnersSection from "./homepage/PartnersSection";
import ProgramsSection from "./homepage/ProgramsSection";
import EventsSection from "./homepage/EventsSection";
import Footer from "./homepage/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <PartnersSection />
      <ProgramsSection />
      <EventsSection />
      <Footer />
    </main>
  );
}
