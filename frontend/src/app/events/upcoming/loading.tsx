import React from "react";
import Navbar from "@/app/homepage/Navbar";
import EventsFooter from "./components/EventsFooter";
import Pattern from "./components/Pattern";
import { UpcomingCarouselSkeleton, UpcomingMobileSkeleton } from "./components/UpcomingSkeleton";
import styles from "./upcoming.module.css";

export default function UpcomingEventsLoading() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", backgroundColor: "#f5f0e8", color: "var(--foreground)", overflow: "hidden" }}>
      <Pattern />
      <Navbar />

      {/* Desktop Skeleton */}
      <div className={styles.desktopOnly} style={{ position: "relative", zIndex: 10 }}>
        <UpcomingCarouselSkeleton />
      </div>

      {/* Mobile Skeleton */}
      <div className={styles.mobileOnly} style={{ position: "relative", zIndex: 10 }}>
        <UpcomingMobileSkeleton />
      </div>

      <EventsFooter />
    </main>
  );
}
