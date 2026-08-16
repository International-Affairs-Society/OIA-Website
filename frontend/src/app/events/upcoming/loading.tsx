import React from "react";
import Navbar from "@/app/homepage/Navbar";
import EventsFooter from "./components/EventsFooter";
import { UpcomingCarouselSkeleton, UpcomingMobileSkeleton } from "./components/UpcomingSkeleton";
import styles from "./upcoming.module.css";

export default function UpcomingEventsLoading() {
  return (
    <main style={{ backgroundColor: "#FFFDE2", color: "var(--foreground)", overflow: "hidden" }}>
      <Navbar />

      {/* Desktop Skeleton */}
      <div className={styles.desktopOnly}>
        <UpcomingCarouselSkeleton />
      </div>

      {/* Mobile Skeleton */}
      <div className={styles.mobileOnly}>
        <UpcomingMobileSkeleton />
      </div>

      <EventsFooter />
    </main>
  );
}
