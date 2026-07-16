"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Navbar from "@/app/homepage/Navbar";
import TeamFooter from "../team/TeamFooter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */

interface University {
  name: string;
  logo: string;
}

interface ContinentGroup {
  continent: string;
  universities: University[];
}

const PARTNERS: ContinentGroup[] = [
  {
    continent: "Europe",
    universities: [
      { name: "University of Essex", logo: "/homepage assets/logos/1.webp" },
      { name: "University of East London", logo: "/homepage assets/logos/2.webp" },
      { name: "Coventry University", logo: "/homepage assets/logos/3.webp" },
      { name: "Technical University of Munich", logo: "/homepage assets/logos/13.webp" },
      { name: "Hochschule Fresenius", logo: "/homepage assets/logos/14.webp" },
      { name: "ESSEC Business School", logo: "/homepage assets/logos/15.webp" },
      { name: "Sciences Po", logo: "/homepage assets/logos/16.webp" },
    ],
  },
  {
    continent: "North America",
    universities: [
      { name: "Yeshiva University", logo: "/homepage assets/logos/4.webp" },
      { name: "Babson College", logo: "/homepage assets/logos/5.webp" },
      { name: "Georgia Institute of Technology", logo: "/homepage assets/logos/6.webp" },
      { name: "San Jose State University", logo: "/homepage assets/logos/7.webp" },
      { name: "University of Toronto", logo: "/homepage assets/logos/20.webp" },
      { name: "University of British Columbia", logo: "/homepage assets/logos/21.webp" },
    ],
  },
  {
    continent: "Oceania",
    universities: [
      { name: "Western Sydney University", logo: "/homepage assets/logos/8.webp" },
      { name: "University of Wollongong", logo: "/homepage assets/logos/9.webp" },
      { name: "Monash University", logo: "/homepage assets/logos/10.webp" },
      { name: "University of Waikato", logo: "/homepage assets/logos/11.webp" },
      { name: "University of Waikato College", logo: "/homepage assets/logos/12.webp" },
    ],
  },
  {
    continent: "Asia",
    universities: [
      { name: "Kyoto University", logo: "/homepage assets/logos/17.webp" },
      { name: "National University of Singapore", logo: "/homepage assets/logos/18.webp" },
      { name: "Nanyang Technological University", logo: "/homepage assets/logos/19.webp" },
      { name: "Korea University", logo: "/homepage assets/logos/22.webp" },
      { name: "KAIST", logo: "/homepage assets/logos/23.webp" },
    ],
  },
];

const HERO_LOGOS = [
  "/homepage assets/logos/1.webp",
  "/homepage assets/logos/4.webp",
  "/homepage assets/logos/8.webp",
  "/homepage assets/logos/11.webp",
  "/homepage assets/logos/13.webp",
  "/homepage assets/logos/15.webp",
  "/homepage assets/logos/17.webp",
  "/homepage assets/logos/18.webp",
  "/homepage assets/logos/20.webp",
  "/homepage assets/logos/22.webp",
  "/homepage assets/logos/6.webp",
  "/homepage assets/logos/9.webp",
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function PartnersPage() {
  const orbitItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const countryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { 
    setIsVisible(true);
  }, []);

  // Character flip animation
  useEffect(() => {
    if (!heroRef.current) return;
    const chars = heroRef.current.querySelectorAll('.flip-char');
    
    const ctx = gsap.context(() => {
      gsap.set(chars, { 
        rotationX: 90, 
        opacity: 0, 
        transformOrigin: "bottom center",
        transformPerspective: 600 
      });

      gsap.to(chars, {
        rotationX: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.03,
        delay: 0.3,
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Country sections fade in
      countryRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  // Helper to split text into character spans
  const splitChars = (text: string) => {
    let globalIndex = 0;
    return text.split('').map((char, i) => {
      if (char === ' ') return <span key={i} style={{ display: 'inline-block', width: '0.3em' }}>&nbsp;</span>;
      return (
        <span 
          key={i} 
          className="flip-char" 
          style={{ 
            display: 'inline-block',
          }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#f5f0e8" }}>
      {/* ═══════════════════ EDITORIAL HERO CSS ═══════════════════ */}
      <style dangerouslySetInnerHTML={{ __html: `
        .editorial-hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 140px 40px 60px;
            position: relative;
            z-index: 10;
        }
        .editorial-hero__inner {
            position: relative;
            max-width: 1400px;
            width: 100%;
        }
        .editorial-hero__title {
            display: flex;
            flex-direction: column;
            margin: 0;
        }
        .editorial-hero__line {
            font-family: var(--font-instrument-serif), Georgia, serif;
            font-size: clamp(4.5rem, 13vw, 14.5rem);
            font-weight: 400;
            color: #141414;
            line-height: 0.92;
            margin: 0;
            letter-spacing: -0.03em;
            text-transform: uppercase;
            display: flex;
            perspective: 600px;
        }
        .editorial-hero__line--1 {
            justify-content: center;
        }
        .editorial-hero__line--2 {
            justify-content: flex-start;
            padding-left: 2%;
        }
        .editorial-hero__line--3 {
            justify-content: flex-end;
            padding-right: 5%;
        }
        .flip-char {
            will-change: transform, opacity;
            backface-visibility: hidden;
        }
        @media (max-width: 960px) {
            .editorial-hero {
                padding: 120px 20px 40px;
                align-items: flex-end;
                min-height: 85vh;
            }
            .editorial-hero__line {
                font-size: clamp(2.8rem, 11vw, 7rem);
            }
            .editorial-hero__line--1 { justify-content: flex-start; }
            .editorial-hero__line--2 { padding-left: 5%; }
            .editorial-hero__line--3 { padding-right: 0; justify-content: flex-start; padding-left: 10%; }
        }
      `}} />

      {/* Unified Seamless Pattern Layer */}
      <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMTkuNSIgbnVtT2N0YXZlcz0iMTAiIHJlc3VsdD0idHVyYnVsZW5jZSIvPjxmZUNvbXBvc2l0ZSBvcGVyYXRvcj0iaW4iIGluPSJ0dXJidWxlbmNlIiBpbjI9IlNvdXJjZUFscGhhIiByZXN1bHQ9ImNvbXBvc2l0ZSIvPjxmZUNvbG9yTWF0cml4IGluPSJjb21wb3NpdGUiIHR5cGU9Imx1bWluYW5jZVRvQWxwaGEiLz48ZmVCbGVuZCBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJjb21wb3NpdGUiIG1vZGU9ImNvbG9yLWJ1cm4iLz48L2ZpbHRlcj48L2RlZnM+PGcgZmlsdGVyPSJ1cmwoI2EpIj48cGF0aCBmaWxsPSIjZjVmMGU4IiBkPSJNMCAwaDEwMHYxMDBIMHoiLz48cGF0aCBkPSJNMCAwdjEwMGgxMDBWMFoiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlPSIjNWM2YjNmIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIgZmlsbD0ibm9uZSIvPjxwYXRoIGZpbGw9IiM1YzZiM2YiIGZpbGwtb3BhY2l0eT0iMC4xIiBkPSJNNTAgMGgxdjEwMGgtMXoiLz48cGF0aCBmaWxsPSIjNWM2YjNmIiBmaWxsLW9wYWNpdHk9IjAuMSIgZD0iTTAgNTBoMTAwdjFIMHoiLz48L2c+PC9zdmc+")`,
          pointerEvents: "none",
          opacity: 0.4,
          zIndex: 0
        }} />

      <div style={{ position: "relative", zIndex: 50 }}><Navbar /></div>

      {/* ═══════════════════ THESHIFT-STYLE HERO ═══════════════════ */}
      <div className="editorial-hero" ref={heroRef}>
        <div className="editorial-hero__inner">
          <h1 className="editorial-hero__title">
            <div className="editorial-hero__line editorial-hero__line--1">
              {splitChars("OUR")}
            </div>
            <div className="editorial-hero__line editorial-hero__line--2">
              {splitChars("PARTNERED")}
            </div>
            <div className="editorial-hero__line editorial-hero__line--3">
              {splitChars("UNIVERSITIES")}
            </div>
          </h1>
        </div>
      </div>

      {/* ═══════════════════ COUNTRY SECTIONS ═══════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: "20px 0 40px" }}>
        {PARTNERS.map((continentData, ci) => (
          <div
            key={ci}
            ref={(el) => { countryRefs.current[ci] = el; }}
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "0 40px",
              marginBottom: 80,
              position: "relative",
            }}
          >
            {/* Massive Solid Continent Name */}
            <h2
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontSize: "clamp(8rem, 16vw, 12rem)",
                fontWeight: 400,
                color: "#1a1a1a",
                margin: "0 0 15px 0",
                lineHeight: 1,
                borderBottom: "1px solid rgba(26,26,26,0.1)",
                paddingBottom: "20px",
                textAlign: "center",
              }}
            >
              {continentData.continent}
            </h2>

            {/* Big logo grid */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              {continentData.universities.map((uni, ui) => (
                <div
                  key={ui}
                  title={uni.name}
                  style={{
                    width: 342,
                    height: 342,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 10,
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05) translateY(-8px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                  }}
                >
                  <Image
                    src={uni.logo}
                    alt={uni.name}
                    width={324}
                    height={324}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "20px 24px 100px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-outfit), sans-serif",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#888",
            marginBottom: "14px",
          }}
        >
          Want to explore programs?
        </p>
        <h2
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 400,
            color: "#1a1a1a",
            margin: "0 0 28px 0",
          }}
        >
          Find your next <span style={{ color: "#d12027" }}>global opportunity</span>
        </h2>
        <a
          href="/programs/other"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "var(--font-outfit), sans-serif",
            fontSize: "0.85rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#f5f0e8",
            backgroundColor: "#1a1a1a",
            padding: "14px 36px",
            borderRadius: "50px",
            textDecoration: "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#d12027";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 40px -8px rgba(209,32,39,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1a1a1a";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Browse Programs
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </section>

      <TeamFooter />
    </div>
  );
}
