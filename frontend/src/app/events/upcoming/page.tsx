import Navbar from "@/app/homepage/Navbar";
import EventsFooter from "./components/EventsFooter";
import UpcomingEventsCarousel from "./components/UpcomingEventsCarousel";
import MobileUpcoming from "./components/MobileUpcoming";
import styles from "./upcoming.module.css";

export const metadata = {
  title: "Upcoming Events | Office of International Affairs",
  description:
    "Explore upcoming events at Bennett University's Office of International Affairs — conferences, cultural exchanges, and global immersion programs.",
};

export default function UpcomingEventsPage() {
  return (
    <main style={{ backgroundColor: "#FFFDE2", color: "var(--foreground)", overflow: "hidden" }}>
      <Navbar />

      {/* Desktop — scroll-synced carousel */}
      <div className={styles.desktopOnly}>
        <UpcomingEventsCarousel />
      </div>

      {/* Mobile — stacked cards */}
      <div className={styles.mobileOnly}>
        <MobileUpcoming />
      </div>

      <EventsFooter />
    </main>
  );
}
