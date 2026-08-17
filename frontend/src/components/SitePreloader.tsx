"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

function checkShouldPlayPreloader(): boolean {
  if (typeof window === "undefined") return false;

  try {
    // 1. Check if the page was refreshed / reloaded via browser refresh or F5
    const navEntries = performance.getEntriesByType("navigation");
    const isReload =
      (navEntries.length > 0 &&
        (navEntries[0] as PerformanceNavigationTiming).type === "reload") ||
      (window.performance &&
        (window.performance as any).navigation &&
        (window.performance as any).navigation.type === 1);

    if (isReload) {
      return true; // Always play on browser reload
    }

    // 2. Check if this is the initial landing in this tab session
    const hasSeen = sessionStorage.getItem("oia_preloader_seen");
    if (!hasSeen) {
      return true; // First visit!
    }

    // 3. User is navigating between internal links (e.g. Navbar Home) -> do NOT show
    return false;
  } catch {
    return false;
  }
}

export default function SitePreloader() {
  const [active, setActive] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const percentRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Initialize session check on mount
  useEffect(() => {
    const shouldPlay = checkShouldPlayPreloader();
    if (!shouldPlay) {
      setIsMounted(false);
      setActive(false);
      return;
    }

    // Mark as seen for subsequent client-side navigations
    try {
      sessionStorage.setItem("oia_preloader_seen", "true");
    } catch {}

    setIsMounted(true);
    setActive(true);
  }, []);

  // Staggered entrances: logo first, then split heading
  useEffect(() => {
    if (!active) return;
    const t1 = setTimeout(() => setLogoVisible(true), 80);
    const t2 = setTimeout(() => setTextVisible(true), 240);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  // Lock scroll while preloader is active
  useEffect(() => {
    if (!active) return;
    if (!isWiping) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isWiping, active]);

  // Sync engine & zero-re-render compositor animation
  useEffect(() => {
    if (!active) return;

    let animId: number;
    const startTime = performance.now();
    const DURATION = 4000; // 4.0 seconds duration
    let backendReady = false;
    let frontendReady = false;

    // 1. Check Frontend readiness
    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        frontendReady = true;
      } else {
        const handleLoad = () => {
          frontendReady = true;
        };
        window.addEventListener("load", handleLoad);
        if (document.fonts) {
          document.fonts.ready.then(() => {
            frontendReady = true;
          });
        }
      }
    }

    // 2. Ping Backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${apiUrl}/health`, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeoutId);
        if (res.ok || res.status < 500) {
          backendReady = true;
        } else {
          backendReady = true;
        }
      } catch {
        backendReady = true;
      }
    };
    checkBackend();

    // 3. Ultra-smooth direct DOM frame updater
    const updateCounter = () => {
      const elapsed = performance.now() - startTime;
      const timeRatio = Math.min(1, elapsed / DURATION);
      
      const easedRatio = 1 - Math.pow(1 - timeRatio, 1.8);

      if (elapsed < DURATION || !backendReady || !frontendReady) {
        const currentPercent = Math.min(99, Math.floor(easedRatio * 100));
        if (percentRef.current) {
          percentRef.current.textContent = String(currentPercent).padStart(2, "0");
        }
        animId = requestAnimationFrame(updateCounter);
      } else {
        if (percentRef.current) {
          percentRef.current.textContent = "100";
        }

        // Trigger upward wipe transition
        setTimeout(() => {
          setIsWiping(true);
        }, 220);

        // Unmount from DOM after wipe completes
        setTimeout(() => {
          setIsMounted(false);
          setActive(false);
        }, 1250);
      }
    };

    animId = requestAnimationFrame(updateCounter);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [active]);

  if (!isMounted || !active) return null;

  return (
    <div
      id="site-preloader"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#FFFBF2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        width: "100vw",
        height: "100vh",
        pointerEvents: isWiping ? "none" : "auto",
        transform: isWiping ? "translateY(-100%)" : "translateY(0%)",
        transition: "transform 0.95s cubic-bezier(0.77, 0, 0.175, 1)",
        willChange: "transform",
        boxShadow: isWiping ? "0 25px 60px rgba(0,0,0,0.25)" : "none",
      }}
    >
      {/* ── Center Content: Logo on Top + Heading Below ── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        {/* 1. Bennett University Logo on Top */}
        <div
          style={{
            position: "relative",
            width: "clamp(190px, 32vw, 290px)",
            height: "clamp(55px, 9vw, 85px)",
            marginBottom: "clamp(24px, 4.5vh, 44px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: logoVisible
              ? "scale(1) translateY(0)"
              : "scale(0.9) translateY(-20px)",
            opacity: logoVisible ? 1 : 0,
            transition:
              "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.75s ease-out",
            willChange: "transform, opacity",
          }}
        >
          <Image
            src="/homepage assets/bennett logo .png"
            alt="Bennett University"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* 2. Desktop View (2 Lines) */}
        <div className="preloader-desktop-text">
          {/* Line 1: Office of (from Left) */}
          <div style={{ overflow: "hidden", padding: "4px 24px" }}>
            <span
              style={{
                display: "inline-block",
                transform: textVisible ? "translateX(0)" : "translateX(-110vw)",
                opacity: textVisible ? 1 : 0,
                transition:
                  "transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out",
                willChange: "transform, opacity",
              }}
            >
              Office of
            </span>
          </div>

          {/* Line 2: International Affairs (from Right) */}
          <div style={{ overflow: "hidden", padding: "4px 24px" }}>
            <span
              style={{
                display: "inline-block",
                transform: textVisible ? "translateX(0)" : "translateX(110vw)",
                opacity: textVisible ? 1 : 0,
                transition:
                  "transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, opacity 0.6s ease-out 0.08s",
                willChange: "transform, opacity",
              }}
            >
              International Affairs
            </span>
          </div>
        </div>

        {/* 3. Mobile View (3-Line Zig-Zag) */}
        <div className="preloader-mobile-text">
          {/* Line 1: Office of (from Left) */}
          <div style={{ overflow: "hidden", padding: "2px 12px" }}>
            <span
              style={{
                display: "inline-block",
                transform: textVisible ? "translateX(0)" : "translateX(-110vw)",
                opacity: textVisible ? 1 : 0,
                transition:
                  "transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out",
                willChange: "transform, opacity",
              }}
            >
              Office of
            </span>
          </div>

          {/* Line 2: International (from Right) */}
          <div style={{ overflow: "hidden", padding: "2px 12px" }}>
            <span
              style={{
                display: "inline-block",
                transform: textVisible ? "translateX(0)" : "translateX(110vw)",
                opacity: textVisible ? 1 : 0,
                transition:
                  "transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.06s, opacity 0.5s ease-out 0.06s",
                willChange: "transform, opacity",
              }}
            >
              International
            </span>
          </div>

          {/* Line 3: Affairs (from Left) */}
          <div style={{ overflow: "hidden", padding: "2px 12px" }}>
            <span
              style={{
                display: "inline-block",
                transform: textVisible ? "translateX(0)" : "translateX(-110vw)",
                opacity: textVisible ? 1 : 0,
                transition:
                  "transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.12s, opacity 0.5s ease-out 0.12s",
                willChange: "transform, opacity",
              }}
            >
              Affairs
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom Loading Line (Native GPU Compositor Animation) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "3.5px",
          backgroundColor: "rgba(57, 57, 57, 0.08)",
          overflow: "hidden",
        }}
      >
        <div
          ref={barRef}
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "#D12027",
            boxShadow: "0 0 14px rgba(209, 32, 39, 0.7)",
            transformOrigin: "left",
            animation: "preloaderLineSmooth 4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
            willChange: "transform",
          }}
        />
      </div>

      {/* ── Bottom Right Percentage Counter (Direct DOM Ref) ── */}
      <div
        style={{
          position: "absolute",
          bottom: "18px",
          right: "24px",
          display: "flex",
          alignItems: "baseline",
          gap: "4px",
          fontFamily: "var(--font-space-grotesk), monospace",
          fontSize: "14px",
          fontWeight: 600,
          color: "#393939",
          letterSpacing: "0.08em",
          userSelect: "none",
        }}
      >
        <span
          ref={percentRef}
          style={{
            fontSize: "20px",
            color: "#D12027",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          00
        </span>
        <span style={{ fontSize: "13px", opacity: 0.6 }}>%</span>
      </div>

      <style>{`
        @keyframes preloaderLineSmooth {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        .preloader-desktop-text {
          font-family: var(--font-tan-pearl), "Times New Roman", Times, serif;
          font-size: clamp(2.8rem, 5.2vw, 4.8rem);
          color: #393939;
          line-height: 1.15;
          letter-spacing: -0.01em;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
        }

        .preloader-mobile-text {
          display: none;
          font-family: var(--font-tan-pearl), "Times New Roman", Times, serif;
          font-size: clamp(2.2rem, 9.5vw, 3.1rem);
          color: #393939;
          line-height: 1.15;
          letter-spacing: -0.02em;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
        }

        @media (max-width: 767px) {
          .preloader-desktop-text {
            display: none !important;
          }
          .preloader-mobile-text {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
