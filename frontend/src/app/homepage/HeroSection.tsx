"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import ParticleGlobe from "./ParticleGlobe";
import HeroBackground from "./HeroBackground";
import { LISTED_COUNTRIES, type CountryData } from "@/app/homepage/Globe";
import { useDeviceTierContext } from "@/hooks/useDeviceTier";

// Dynamically import Globe to avoid SSR issues with WebGL
const Globe = dynamic(() => import("@/app/homepage/Globe"), {
  ssr: false,
  loading: () => null,
});

type Phase = "loading" | "enter" | "morphing" | "globe-overlay" | "transitioning" | "hero";

export interface HeroSectionProps {
  onParticleComplete?: () => void;
}

interface LenisInstance {
  scrollTo: (target: number, opts?: { immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
}

const isHeroLoaderSeen = () => {
  if (typeof window === "undefined") return false;
  if (window.innerWidth < 768) return true; // Bypass loader completely on mobile
  try {
    return sessionStorage.getItem("hero_loader_seen") === "true";
  } catch {
    return false;
  }
};

export default function HeroSection({ onParticleComplete }: HeroSectionProps = {}) {
  const [alreadySeen] = useState(isHeroLoaderSeen);
  const [phase, setPhase] = useState<Phase>(() => (isHeroLoaderSeen() ? "hero" : "loading"));
  const [loadPercent, setLoadPercent] = useState(() => (isHeroLoaderSeen() ? 100 : 0));
  const [loaderFading, setLoaderFading] = useState(false);
  const [particleFading, setParticleFading] = useState(() => isHeroLoaderSeen());
  const [globeVisible, setGlobeVisible] = useState(() => isHeroLoaderSeen());
  const [bgVisible, setBgVisible] = useState(() => isHeroLoaderSeen());
  const [heroVisible, setHeroVisible] = useState(() => isHeroLoaderSeen());
  const [globePosition, setGlobePosition] = useState<"center" | "right">(() => (isHeroLoaderSeen() ? "right" : "center"));
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1440));
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));
  const deviceTier = useDeviceTierContext();
  const shouldDisableParticles = isMobile || deviceTier === "low" || deviceTier === "mid";
  const loadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If already seen in this session, immediately trigger navbar & parent completion
  useEffect(() => {
    if (alreadySeen) {
      onParticleComplete?.();
    }
  }, [alreadySeen, onParticleComplete]);

  // Detect responsive breakpoints (mobile, tablet, desktop)
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      setIsMobile(w < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isTablet = windowWidth >= 768 && windowWidth < 1280;
  const isDesktop = windowWidth >= 1280;

  // ─── Airtight Scroll Lock & Reset (Freeze scroll completely until hero appears) ───
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (phase !== "hero") {
      (window as unknown as { __scrollLocked?: boolean }).__scrollLocked = true;

      // Lock document & body overflow and height
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.height = "100vh";
      document.documentElement.style.height = "100vh";
      window.scrollTo(0, 0);

      const preventDefault = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };

      const preventScrollKeys = (e: KeyboardEvent) => {
        const blockedKeys = [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
          "Spacebar",
          "Tab",
        ];
        if (
          blockedKeys.includes(e.key) ||
          blockedKeys.includes(e.code) ||
          [32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const handleForcedScroll = () => {
        if (window.scrollY !== 0 || window.scrollX !== 0) {
          window.scrollTo(0, 0);
        }
      };

      window.addEventListener("wheel", preventDefault, { passive: false });
      window.addEventListener("touchmove", preventDefault, { passive: false });
      window.addEventListener("keydown", preventScrollKeys, { passive: false });
      window.addEventListener("scroll", handleForcedScroll, { passive: false });
      document.addEventListener("wheel", preventDefault, { passive: false });
      document.addEventListener("touchmove", preventDefault, { passive: false });

      // Polling interval to guarantee Lenis stays stopped as soon as it mounts and keep viewport at (0, 0)
      const intervalId = setInterval(() => {
        window.scrollTo(0, 0);
        const lenis = (window as unknown as { __lenis?: LenisInstance }).__lenis;
        if (lenis) {
          lenis.stop();
          lenis.scrollTo(0, { immediate: true });
        }
      }, 50);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener("wheel", preventDefault);
        window.removeEventListener("touchmove", preventDefault);
        window.removeEventListener("keydown", preventScrollKeys);
        window.removeEventListener("scroll", handleForcedScroll);
        document.removeEventListener("wheel", preventDefault);
        document.removeEventListener("touchmove", preventDefault);

        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        document.body.style.height = "";
        document.documentElement.style.height = "";
        (window as unknown as { __scrollLocked?: boolean }).__scrollLocked = false;

        const lenis = (window as unknown as { __lenis?: LenisInstance }).__lenis;
        if (lenis) {
          lenis.start();
        }
      };
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.height = "";
      (window as unknown as { __scrollLocked?: boolean }).__scrollLocked = false;

      const lenis = (window as unknown as { __lenis?: LenisInstance }).__lenis;
      if (lenis) {
        lenis.start();
      }
    }
  }, [phase]);

  // ─── Phase 1: Loading percentage 0 → 100 ───
  useEffect(() => {
    if (alreadySeen) return;

    let current = 0;
    loadIntervalRef.current = setInterval(() => {
      const speed = current < 30 ? 0.8 : current < 70 ? 1.4 : current < 90 ? 0.8 : 0.4;
      current = Math.min(current + speed, 100);
      setLoadPercent(Math.round(current));
      if (current >= 100) {
        if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
        setTimeout(() => {
          setLoaderFading(true);
          if (shouldDisableParticles) {
            // Direct clean transition to Hero without running heavy particle morph on mobile/low/mid tier
            setTimeout(() => {
              setBgVisible(true);
              setGlobeVisible(true);
              setGlobePosition("right");
              setPhase("hero");
              setHeroVisible(true);
              onParticleComplete?.();
              try {
                sessionStorage.setItem("hero_loader_seen", "true");
                document.documentElement.classList.add("hero-seen");
              } catch {}
            }, 500);
          } else {
            setTimeout(() => setPhase("morphing"), 500);
          }
        }, 200);
      }
    }, 50);

    return () => {
      if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
    };
  }, [alreadySeen, shouldDisableParticles, onParticleComplete]);

  const [morphToGrid, setMorphToGrid] = useState(false);

  // ─── Phase 3 → 4: Particle morph complete ───
  const handleMorphComplete = useCallback(() => {
    setPhase("globe-overlay");
    setGlobeVisible(true);
    setMorphToGrid(true); // Particles break into grid pattern

    // 1. As particles finish breaking into the grid (~1.4s), start fading them out
    setTimeout(() => {
      setParticleFading(true);
    }, 1400);

    // 2. Background, navbar & hero fade in at 1.2 seconds
    setTimeout(() => {
      setBgVisible(true);
      onParticleComplete?.();
      setPhase("transitioning");
      setGlobePosition("right");
      setPhase("hero");
      setHeroVisible(true);

      // Save flag in sessionStorage so loader doesn't re-run on refreshes within this browser session
      try {
        sessionStorage.setItem("hero_loader_seen", "true");
        document.documentElement.classList.add("hero-seen");
      } catch {}
    }, 1200);
  }, [onParticleComplete]);

  return (
    <div
      suppressHydrationWarning
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: "var(--background)",
        overflow: "hidden",
      }}
    >
      {/* ─── Textured Grid Background from pasted file (Beige Theme) ─── */}
      <div
        id="hero-bg-container"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: bgVisible ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      >
        <HeroBackground />
      </div>

      {/* ─── Background Particles (High-Tier Desktop Only) ─── */}
      {!alreadySeen && !shouldDisableParticles && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            opacity: particleFading ? 0 : 1,
            transition: "opacity 0.6s ease-out",
            pointerEvents: "none",
          }}
        >
          <ParticleGlobe
            active={phase === "morphing" || phase === "globe-overlay" || phase === "transitioning" || phase === "hero"}
            morphToGrid={morphToGrid}
            loadPercent={loadPercent}
            onComplete={handleMorphComplete}
          />
        </div>
      )}

      {/* ─── Phase 1: Loader ─── */}
      {!alreadySeen && (phase === "loading" || loaderFading) && (
        <div
          id="hero-loader-overlay"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            opacity: loaderFading ? 0 : 1,
            transition: "opacity 0.8s ease-out",
            pointerEvents: loaderFading ? "none" : "auto",
          }}
        >
          {/* Percentage counter */}
          <div
            style={{
              position: "absolute",
              bottom: isMobile ? 24 : 30,
              right: isMobile ? 24 : 44,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: isMobile ? "2rem" : "2.6rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              color: "#393939",
              opacity: 0.85,
            }}
          >
            {loadPercent}%
          </div>

          {/* Bottom progress line */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: 4,
              background: "rgba(196, 203, 183, 0.35)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                transform: `scaleX(${loadPercent / 100})`,
                transformOrigin: "left",
                background: "linear-gradient(90deg, #9CA38F, #e63946)",
                boxShadow: "0 0 10px rgba(156, 163, 143, 0.4)",
                transition: "transform 0.15s linear",
                willChange: "transform",
              }}
            />
          </div>
        </div>
      )}

      {/* ─── Hero Section Container ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        {/* 1. Left Content Component */}
        <div
          id="hero-content-container"
          style={{
            position: "absolute",
            left: 0,
            top: isMobile ? "26%" : "50%",
            transform: `translateY(-50%) ${heroVisible ? "translateX(0)" : "translateX(-30px)"}`,
            width: isMobile ? "100%" : isTablet ? "50vw" : "48vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: isMobile ? "20px" : isTablet ? "clamp(20px, 3.5vw, 36px)" : "clamp(24px, 3.5vw, 64px)",
            paddingRight: isMobile ? "20px" : isTablet ? "clamp(16px, 2.5vw, 28px)" : "clamp(20px, 3vw, 48px)",
            opacity: heroVisible ? 1 : 0,
            transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: heroVisible ? "auto" : "none",
            zIndex: 6,
          }}
        >
          <div style={{ maxWidth: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1
              style={{
                fontFamily: "var(--font-tan-pearl), serif",
                fontSize: isMobile
                  ? "clamp(2.1rem, 8vw, 3rem)"
                  : isTablet
                  ? "clamp(2.6rem, 4.4vw, 3.6rem)"
                  : "clamp(3.3rem, 5.5vw, 5.3rem)",
                fontWeight: 400,
                lineHeight: isMobile ? 1.22 : isTablet ? 1.25 : 1.28,
                letterSpacing: "0.01em",
                color: "#393939",
                textAlign: "center",
              }}
            >
              Office of<br />
              International<br />
              Affairs
            </h1>

            <p
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: isMobile
                  ? "clamp(0.9rem, 3.8vw, 1.02rem)"
                  : isTablet
                  ? "clamp(0.95rem, 1.25vw, 1.08rem)"
                  : "clamp(1.05rem, 1.25vw, 1.25rem)",
                lineHeight: isMobile ? 1.58 : isTablet ? 1.65 : 1.72,
                color: "rgba(57, 57, 57, 0.82)",
                maxWidth: isMobile ? "92%" : isTablet ? "420px" : "520px",
                margin: isMobile ? "18px auto 0 auto" : isTablet ? "26px auto 0 auto" : "40px auto 0 auto",
                textAlign: "center",
              }}
            >
              Empowering global learning, academic exchanges, strategic partner alliances, and international research collaborations across the globe.
            </p>
          </div>
        </div>

        {/* 2. Curved Country List Component (Desktop only: >= 1280px) */}
        {isDesktop && (
          <div
            id="hero-curved-list"
            style={{
              position: "absolute",
              right: "48vw",
              top: "50%",
              transform: "translateY(-50%)",
              height: "100vh",
              width: "10px",
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 1.5s ease-out 0.8s",
              pointerEvents: "none",
            }}
          >
            {/* Curved line (circle border) */}
            <div
              style={{
                position: "absolute",
                width: "140vh",
                height: "140vh",
                borderRadius: "50%",
                borderLeft: "2px solid rgba(57, 57, 57, 0.75)",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />

            {/* Country items positioned along the circle */}
            {LISTED_COUNTRIES.map((country: CountryData, index: number) => {
              const N = LISTED_COUNTRIES.length;
              const maxAngle = 35 * (Math.PI / 180);
              const angle = -maxAngle + (index / (N - 1)) * (2 * maxAngle);

              const R = 70;
              const y = R * Math.sin(angle);
              const x = R - R * Math.cos(angle);

              return (
                <div
                  key={country.name}
                  style={{
                    position: "absolute",
                    left: `${x}vh`,
                    top: `calc(50% + ${y}vh)`,
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "#393939",
                    whiteSpace: "nowrap",
                  }}
                >
                  {/* Time offset to left of line */}
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translate(-16px, -50%)",
                      opacity: 0.45,
                      fontSize: "0.76rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {country.time}
                  </div>

                  {/* Dot directly on the line */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "#9CA38F",
                      fontSize: "1.2rem",
                    }}
                  >
                    •
                  </div>

                  {/* Country Name offset to right of line */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translate(16px, -50%)",
                      opacity: 0.75,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {country.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Globe Container Component */}
        <div
          id="hero-globe-container"
          style={{
            position: "absolute",
            left: isMobile ? "50%" : "auto",
            right: isMobile ? "auto" : isTablet ? "-6vw" : "-4vw",
            top: isMobile ? "71%" : "50%",
            transform: isMobile
              ? "translate(-50%, -50%)"
              : globePosition === "center"
              ? "translateY(-50%) translateX(calc(-55vw + 50vh))"
              : "translateY(-50%) translateX(0)",
            width: isMobile ? "100vw" : isTablet ? "54vw" : "100vh",
            height: isMobile ? "55vh" : isTablet ? "54vw" : "100vh",
            maxWidth: isMobile ? "500px" : isTablet ? "576px" : "none",
            maxHeight: isMobile ? "500px" : isTablet ? "576px" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: globeVisible ? 1 : 0,
            transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1), opacity 2s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: isMobile ? "none" : globePosition === "right" ? "auto" : "none",
          }}
        >
          <Globe />
        </div>
      </div>
    </div>
  );
}
