import Navbar from "./homepage/Navbar";
import HeroSection from "./homepage/HeroSection";
import PartnersSection from "./homepage/PartnersSection";
import ProgramsSection from "./homepage/ProgramsSection";
import UpcomingEventSection from "./homepage/UpcomingEventSection";
import EventsSection from "./homepage/EventsSection";
import Footer from "./homepage/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <PartnersSection />
      <ProgramsSection />
      <UpcomingEventSection />
      <EventsSection />
      <Footer />
    </main>
  );
}
