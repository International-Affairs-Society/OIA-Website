"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import Navbar from "./homepage/Navbar";
import PartnersSection from "./homepage/PartnersSection";
import ProgramsSection from "./homepage/ProgramsSection";
import UpcomingEventSection from "./homepage/UpcomingEventSection";
import EventsSection from "./homepage/EventsSection";
import Footer from "./homepage/Footer";

const HeroSection = dynamic(() => import("./homepage/HeroSection"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "var(--background)",
      }}
    />
  ),
});

export default function Home() {
  const [navbarVisible, setNavbarVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("hero_loader_seen") === "true") {
        setNavbarVisible(true);
      }
    } catch {}
  }, []);

  const handleParticleComplete = useCallback(() => {
    setNavbarVisible(true);
  }, []);

  return (
    <main style={{ backgroundColor: "var(--background)", position: "relative" }}>
      <Navbar visible={navbarVisible} />
      <HeroSection onParticleComplete={handleParticleComplete} />
      <PartnersSection />
      <ProgramsSection />
      <UpcomingEventSection />
      <EventsSection />
      <Footer />
    </main>
  );
}
