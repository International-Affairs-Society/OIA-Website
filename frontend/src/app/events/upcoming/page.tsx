import Navbar from "@/app/homepage/Navbar";
import EventsFooter from "./components/EventsFooter";
import UpcomingEventsCarousel from "./components/UpcomingEventsCarousel";
import MobileUpcoming from "./components/MobileUpcoming";
import Pattern from "./components/Pattern";
import styles from "./upcoming.module.css";

export const metadata = {
  title: "Upcoming Events | Office of International Affairs",
  description:
    "Explore upcoming events at Bennett University's Office of International Affairs — conferences, cultural exchanges, and global immersion programs.",
};

export default function UpcomingEventsPage() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", backgroundColor: "#f5f0e8", color: "var(--foreground)", overflow: "hidden" }}>
      <Pattern />
      <Navbar />

      {/* Desktop — scroll-synced carousel */}
      <div className={styles.desktopOnly} style={{ position: "relative", zIndex: 10 }}>
        <UpcomingEventsCarousel />
      </div>

      {/* Mobile — stacked cards */}
      <div className={styles.mobileOnly} style={{ position: "relative", zIndex: 10 }}>
        <MobileUpcoming />
      </div>

      <EventsFooter />
    </main>
  );
}
