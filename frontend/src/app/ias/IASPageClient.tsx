"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "../homepage/Navbar";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import GlobeDark from "./GlobeDark";
import TimelineSection from "./TimelineSection";
import TeamsSection from "./TeamsSection";
import IASFooter from "./IASFooter";


gsap.registerPlugin(ScrollTrigger);

export default function IASPageClient() {
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const aboutLabelRef = useRef<HTMLDivElement>(null);
  const aboutHeadingRef = useRef<HTMLDivElement>(null);
  const aboutDescRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.3,
      });

      tl.fromTo(
        globeWrapRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" }
      )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.8"
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // GSAP ScrollTrigger — pinned hero transition
  useEffect(() => {
    // Wait for entrance animation to finish
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 0.8,
            pinSpacing: true,
          },
        });

        // Phase 1 (0–55%): Heading + sub slide up and fade out — longer transition
        scrollTl.to(
          [headlineRef.current, subRef.current],
          {
            y: -120,
            opacity: 0,
            duration: 0.55,
            ease: "power2.in",
            stagger: 0.06,
          },
          0
        );

        // Phase 2 (30–85%): Globe scales up dramatically and fades — longer expansion
        scrollTl.to(
          globeWrapRef.current,
          {
            scale: 3.2,
            opacity: 0,
            duration: 0.55,
            ease: "power2.inOut",
          },
          0.3
        );

      }, heroRef);

      // About section entrance animation
      if (aboutRef.current) {
        gsap.context(() => {
          const aboutTl = gsap.timeline({
            scrollTrigger: {
              trigger: aboutRef.current,
              start: "top 85%",
              end: "top 30%",
              scrub: 0.6,
            },
          });

          aboutTl.fromTo(
            aboutLabelRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.3 }
          );

          aboutTl.fromTo(
            aboutHeadingRef.current,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.4 },
            0.1
          );

          aboutTl.fromTo(
            aboutDescRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.3 },
            0.25
          );
        }, aboutRef);
      }

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }, 2200); // delay for entrance animation

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "#0a0a0a", color: "#ffffff", fontFamily: "var(--font-outfit)" }}>
        {/* ═══ HERO — Globe + Centered Title ═══ */}
        <section
          ref={heroRef}
          style={{
            position: "relative",
            height: "100vh",
            width: "100%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
          }}
        >
          {/* ── Globe Background (centered, behind text) ── */}
          <div
            ref={globeWrapRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <GlobeDark />
          </div>

          {/* ── Edge vignette overlay ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.5) 70%, #0a0a0a 95%)",
              pointerEvents: "none",
            }}
          />

          {/* ── Subtle grain ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
              pointerEvents: "none",
            }}
          />

          {/* ═══ Centered Content ═══ */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "0 24px",
            }}
          >
            {/* Headline */}
            <div ref={headlineRef} style={{ opacity: 0 }}>
              <h1
                style={{
                  fontSize: "clamp(3.3rem, 7.7vw, 8.25rem)",
                  fontWeight: 700,
                  lineHeight: 1.0,
                  letterSpacing: "-0.02em",
                  color: "#d4d4d4",
                  fontFamily: "var(--font-gmarket-sans)",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                International
                <br />
                Affairs Society
              </h1>
            </div>

            {/* Sub-info — just a thin red rule accent */}
            <div ref={subRef} style={{ opacity: 0, marginTop: "36px", display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ display: "block", width: "40px", height: "1px", background: "rgba(209,32,39,0.5)" }} />
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-roboto-condensed)",
                }}
              >
                IAS
              </span>
              <span style={{ display: "block", width: "40px", height: "1px", background: "rgba(209,32,39,0.5)" }} />
            </div>
          </div>


        </section>

        {/* ═══ ABOUT SECTION — Cinetica-inspired, dark theme ═══ */}
        <section
          ref={aboutRef}
          style={{
            position: "relative",
            minHeight: "100vh",
            width: "100%",
            backgroundColor: "#0a0a0a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "120px 24px",
            overflow: "hidden",
          }}
        >
          {/* Topological SVG Background Pattern */}
          <TopographicBackground />

          {/* Content wrapper */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", width: "100%", textAlign: "center" }}>

            {/* (WHO WE ARE) label */}
            <div
              ref={aboutLabelRef}
              style={{
                opacity: 0,
                marginBottom: "48px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-roboto-condensed)",
                  fontWeight: 400,
                }}
              >
                (Who We Are)
              </span>
            </div>

            {/* Bold stacked heading */}
            <div
              ref={aboutHeadingRef}
              style={{
                opacity: 0,
                marginBottom: "56px",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(3rem, 7vw, 7.5rem)",
                  fontWeight: 700,
                  lineHeight: 1.0,
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                  fontFamily: "var(--font-gmarket-sans)",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Diplomacy
                <br />
                <span style={{
                  color: "#D12027",
                  textShadow: "0 0 80px rgba(209,32,39,0.35)",
                }}>Driven</span>
                <br />
                Global Minds
                <br />
                <span style={{
                  color: "#D12027",
                  textShadow: "0 0 80px rgba(209,32,39,0.35)",
                }}>Built</span>
              </h2>
            </div>

            {/* Description paragraph */}
            <div
              ref={aboutDescRef}
              style={{
                opacity: 0,
                maxWidth: "680px",
                margin: "0 auto",
              }}
            >
              <p
                style={{
                  fontSize: "clamp(16px, 1.4vw, 20px)",
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.55)",
                  fontFamily: "var(--font-outfit)",
                  fontWeight: 300,
                  letterSpacing: "0.01em",
                }}
              >
                We cultivate future leaders in international affairs through
                diplomacy simulations, cross-cultural dialogue, and global
                policy workshops — turning bold ideas into actionable change
                through cutting-edge discourse and fearless collaboration.
              </p>


            </div>
          </div>
        </section>

        {/* ═══ TIMELINE SECTION ═══ */}
        <TimelineSection />

        {/* ═══ TEAMS SECTION ═══ */}
        <TeamsSection />

        {/* ═══ FOOTER ═══ */}
        <IASFooter />
      </main>
    </>
  );
}

/* ── Reusable sub-components ── */

function NavLink({ href, label, muted }: { href: string; label: string; muted?: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: "14px",
        fontWeight: 400,
        color: hovered ? "#ffffff" : "rgba(255,255,255,0.65)",
        textDecoration: "none",
        transition: "color 0.25s ease",
        fontFamily: "var(--font-outfit)",
      }}
    >
      {label}
      {muted && (
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginLeft: "6px", fontStyle: "italic" }}>
          (Coming Soon)
        </span>
      )}
    </a>
  );
}

function ContactPill() {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href="#contact"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 28px",
        border: `1px solid ${hovered ? "#D12027" : "rgba(255,255,255,0.25)"}`,
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 500,
        color: "#fff",
        textDecoration: "none",
        letterSpacing: "0.04em",
        transition: "all 0.3s ease",
        whiteSpace: "nowrap",
        backgroundColor: hovered ? "#D12027" : "transparent",
      }}
    >
      Contact
    </a>
  );
}

function TopographicBackground() {
  return (
    <div style={{ 
      position: "absolute", 
      inset: 0, 
      zIndex: 0, 
      pointerEvents: "none", 
      overflow: "hidden",
      maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
      WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)"
    }}>
      <style>{`
        .island {
          position: absolute;
          opacity: 0.65;
          width: 100%;
          height: 100%;
          transform: scale(1);
          background: rgb(52, 65, 73);
          filter: url(#octave1) brightness(20) contrast(1);
        }

        .islandt {
          position: absolute;
          opacity: 0.5;
          width: 100%;
          height: 100%;
          transform: scale(1);
          background: rgb(52, 65, 73);
          filter: url(#octave2) brightness(20) contrast(1);
        }
      `}</style>
      <div className="island"></div>
      <div className="islandt"></div>
      <div className="hatch"></div>

      <svg height="0" width="0" style={{ position: "absolute" }}>
        <filter id="octave1">
          <feTurbulence type="fractalNoise" baseFrequency="0.0004" numOctaves={8} seed={4} result="o1" />
          <feTurbulence type="fractalNoise" baseFrequency="0.0008" numOctaves={8} seed={4} result="o2" />
          <feTurbulence type="fractalNoise" baseFrequency="0.0001" numOctaves={8} seed={4} result="o3" />
          <feTurbulence type="fractalNoise" baseFrequency="0.0018" numOctaves={8} seed={4} result="o4" />

          <feMerge result="finalIsland">
            <feMergeNode in="o1" />
            <feMergeNode in="o3" />
            <feMergeNode in="o1" />
            <feMergeNode in="o3" />
          </feMerge>

          <feGaussianBlur in="finalIsland" stdDeviation={5} result="noiseo" />

          <feTurbulence type="fractalNoise" baseFrequency="0.0008" numOctaves={8} seed={4} result="o1" />
          <feTurbulence type="fractalNoise" baseFrequency="0.0016" numOctaves={8} seed={4} result="o2" />

          <feMerge result="noiseo">
            <feMergeNode in="o2" />
            <feMergeNode in="o4" />
            <feMergeNode in="noiseo" />
          </feMerge>

          <feGaussianBlur in="noiseo" stdDeviation={5} result="noiseo" />

          <feTurbulence type="fractalNoise" baseFrequency="0.0016" numOctaves={8} seed={4} result="o1" />
          <feTurbulence type="fractalNoise" baseFrequency="0.002" numOctaves={8} seed={4} result="o2" />

          <feMerge result="noiseo">
            <feMergeNode in="o1" />
            <feMergeNode in="o1" />
            <feMergeNode in="noiseo" />
          </feMerge>

          <feGaussianBlur in="noiseo" stdDeviation={5} result="noiseo" />

          <feDiffuseLighting in="noiseo" surfaceScale={12} diffuseConstant={1} lightingColor="#d7bb98" result="lit">
            <feDistantLight azimuth={90} elevation={0} />
          </feDiffuseLighting>

          <feBlend in="lit" in2="SourceGraphic" mode="normal" />
        </filter>

        <filter id="octave2">
          <feTurbulence type="fractalNoise" baseFrequency="0.0004" numOctaves={8} seed={4} result="o1" />
          <feTurbulence type="fractalNoise" baseFrequency="0.0008" numOctaves={8} seed={4} result="o2" />
          <feTurbulence type="fractalNoise" baseFrequency="0.0001" numOctaves={8} seed={4} result="o3" />
          <feTurbulence type="fractalNoise" baseFrequency="0.0018" numOctaves={8} seed={4} result="o4" />

          <feMerge result="finalIsland">
            <feMergeNode in="o1" />
            <feMergeNode in="o3" />
            <feMergeNode in="o1" />
            <feMergeNode in="o3" />
          </feMerge>

          <feGaussianBlur in="finalIsland" stdDeviation={5} result="noiseo" />

          <feTurbulence type="fractalNoise" baseFrequency="0.0008" numOctaves={8} seed={4} result="o1" />
          <feTurbulence type="fractalNoise" baseFrequency="0.0016" numOctaves={8} seed={4} result="o2" />

          <feMerge result="noiseo">
            <feMergeNode in="o2" />
            <feMergeNode in="o4" />
            <feMergeNode in="noiseo" />
          </feMerge>

          <feGaussianBlur in="noiseo" stdDeviation={5} result="noiseo" />

          <feTurbulence type="fractalNoise" baseFrequency="0.0016" numOctaves={8} seed={4} result="o1" />
          <feTurbulence type="fractalNoise" baseFrequency="0.002" numOctaves={8} seed={4} result="o2" />

          <feMerge result="noiseo">
            <feMergeNode in="o1" />
            <feMergeNode in="o1" />
            <feMergeNode in="noiseo" />
          </feMerge>

          <feGaussianBlur in="noiseo" stdDeviation={5} result="noiseo" />

          <feDiffuseLighting in="noiseo" surfaceScale={12} diffuseConstant={1} lightingColor="#d1bf96" result="lit">
            <feDistantLight azimuth={-90} elevation={0} />
          </feDiffuseLighting>

          <feBlend in="lit" in2="SourceGraphic" mode="normal" />
        </filter>
      </svg>
    </div>
  );
}
