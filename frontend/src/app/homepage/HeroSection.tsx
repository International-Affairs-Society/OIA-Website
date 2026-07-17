"use client";

import { useState, useEffect, useRef } from "react";
import CrackedEarth from "./CrackedEarth";
import Globe from "./Globe";

// ============================================================
// DATA CONSTANTS — Replace with API calls when backend is ready
// ============================================================

interface HeroContent {
  headingLines: string[];
}

const HERO_CONTENT: HeroContent = {
  headingLines: ["Office of", "International Affairs"],
};

// ============================================================

export default function HeroSection() {
  const [isHeadingVisible, setIsHeadingVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Stagger animations: heading first
  useEffect(() => {
    const headingTimer = setTimeout(() => setIsHeadingVisible(true), 600);
    return () => {
      clearTimeout(headingTimer);
    };
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "var(--background)",
        minHeight: "100vh",
      }}
    >
      {/* Layer 1: Cracked earth pattern background */}
      <CrackedEarth />

      {/* Layer 2: Content — stacked vertically */}
      <div
        className="relative flex flex-col items-center w-full"
        style={{
          zIndex: 10,
          minHeight: "100vh",
        }}
      >
        {/* Heading — top center */}
        <h1
          style={{
            fontFamily: "var(--font-tan-pearl), serif",
            fontSize: "clamp(1.75rem, 6.2vw, 5.5rem)",
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            color: "#393939",
            textAlign: "center",
            opacity: isHeadingVisible ? 1 : 0,
            transform: isHeadingVisible
              ? "translateY(0)"
              : "translateY(30px)",
            transition:
              "transform 2s cubic-bezier(0.23, 1, 0.32, 1), opacity 1.5s ease-out",
            marginTop: "clamp(5rem, 10vh, 8rem)",
          }}
        >
          {HERO_CONTENT.headingLines.map((line, index) => (
            <span
              key={index}
              className="block"
              style={{
                transitionDelay: `${index * 0.3}s`,
              }}
            >
              {line}
            </span>
          ))}
        </h1>
      </div>

      {/* Layer 1.5: Globe — bottom-left quarter on mobile, centered on desktop */}
      <div
        className="absolute bottom-0 pointer-events-none"
        style={{
          left: isMobile ? "auto" : "50%",
          right: isMobile ? 0 : "auto",
          transform: isHeadingVisible
            ? (isMobile
              ? "translateX(30%) translateY(43%)"
              : "translateX(-50%) translateY(67%)")
            : (isMobile
              ? "translateX(30%) translateY(100%)"
              : "translateX(-50%) translateY(100%)"),
          opacity: isHeadingVisible ? 1 : 0,
          transition:
            "transform 1.2s cubic-bezier(0.23, 1, 0.32, 1), opacity 1.2s ease-out",
          zIndex: 20,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="pointer-events-auto">
          <Globe />
        </div>
      </div>

      {/* Bottom gradient fade */}
      {/* zIndex 30 places this OVER the globe (zIndex 20), making it look like the globe is emerging from the fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "10px",
          background:
            "linear-gradient(to top, var(--background), transparent)",
          zIndex: 30,
        }}
        aria-hidden="true"
      />
    </section>
  );
}
