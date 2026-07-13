"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/app/homepage/Navbar";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

const TEAM_DATA: TeamMember[] = [
  {
    name: "Dr. Ananya Sharma",
    role: "Director, OIA",
    bio: "With over two decades of experience in international higher education, Dr. Sharma has been instrumental in establishing Bennett University's global footprint. She previously served as Associate Dean of Global Affairs at a leading Indian institute and has facilitated over 120 institutional partnerships across 35 countries. Her expertise lies in strategic academic diplomacy, cross-border curriculum design, and fostering sustainable exchange ecosystems.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop&crop=face",
  },
  {
    name: "Prof. Rajesh Kumar",
    role: "Associate Director",
    bio: "Prof. Kumar brings a rich background in comparative education policy and international student mobility. A Fulbright scholar and former visiting faculty at the University of Melbourne, he leads the strategic planning and partnership development vertical at OIA. His research on South-South academic cooperation has been published in leading international journals and presented at UNESCO forums.",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=1200&fit=crop&crop=face",
  },
  {
    name: "Priya Mehta",
    role: "Program Coordinator",
    bio: "Priya manages the day-to-day operations of all outbound exchange programs, summer schools, and international internships. With a Master's in International Relations from Jawaharlal Nehru University and prior experience at the British Council, she ensures seamless student experiences from application to alumni integration. She has successfully coordinated over 500 student exchanges across Europe, Asia, and North America.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1200&fit=crop&crop=face",
  },
  {
    name: "Arjun Desai",
    role: "International Relations Officer",
    bio: "Arjun serves as the primary liaison between Bennett University and its global partner institutions. He manages MOU negotiations, delegation visits, and compliance frameworks. Before joining OIA, he worked with the Ministry of External Affairs and the Indian Council for Cultural Relations (ICCR). His multilingual proficiency in English, Hindi, French, and German enables effective cross-cultural communication.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&crop=face",
  },
  {
    name: "Dr. Neha Gupta",
    role: "Head of Research & Partnerships",
    bio: "Dr. Gupta leads the research collaboration and joint-degree program initiatives at OIA. A PhD from the University of Edinburgh in International Development Studies, she has spearheaded joint research grants worth over ₹15 crore with institutions including TU Munich, NUS Singapore, and the University of Toronto. She also chairs the university's International Research Ethics Board.",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&h=1200&fit=crop&crop=face",
  },
];

export default function TeamPageClient() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    sectionRefs.current.forEach((section, i) => {
      if (!section) return;

      ["member-name", "member-bio", "member-footer"].forEach((cls, j) => {
        const el = section.querySelector(`.${cls}`);
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: j * 0.12,
            scrollTrigger: { trigger: section, start: "top 68%", toggleActions: "play none none reverse" },
          }
        );
      });

      const photoEl = section.querySelector(".member-photo");
      if (photoEl) {
        gsap.fromTo(photoEl,
          { opacity: 0, scale: 1.04 },
          {
            opacity: 1, scale: 1, duration: 1.3, ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 68%", toggleActions: "play none none reverse" },
          }
        );
      }

      ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => setActiveIndex(i),
        onEnterBack: () => setActiveIndex(i),
      });
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "#f5f0e8", fontFamily: "var(--font-outfit)", overflowX: "hidden", position: "relative" }}>
        {/* Unified Seamless Pattern Layer */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMTkuNSIgbnVtT2N0YXZlcz0iMTAiIHJlc3VsdD0idHVyYnVsZW5jZSIvPjxmZUNvbXBvc2l0ZSBvcGVyYXRvcj0iaW4iIGluPSJ0dXJidWxlbmNlIiBpbjI9IlNvdXJjZUFscGhhIiByZXN1bHQ9ImNvbXBvc2l0ZSIvPjxmZUNvbG9yTWF0cml4IGluPSJjb21wb3NpdGUiIHR5cGU9Imx1bWluYW5jZVRvQWxwaGEiLz48ZmVCbGVuZCBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJjb21wb3NpdGUiIG1vZGU9ImNvbG9yLWJ1cm4iLz48L2ZpbHRlcj48L2RlZnM+PGcgZmlsdGVyPSJ1cmwoI2EpIj48cGF0aCBmaWxsPSIjZjVmMGU4IiBkPSJNMCAwaDEwMHYxMDBIMHoiLz48cGF0aCBkPSJNMCAwdjEwMGgxMDBWMFoiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlPSIjNWM2YjNmIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIgZmlsbD0ibm9uZSIvPjxwYXRoIGZpbGw9IiM1YzZiM2YiIGZpbGwtb3BhY2l0eT0iMC4xIiBkPSJNNTAgMGgxdjEwMGgtMXoiLz48cGF0aCBmaWxsPSIjNWM2YjNmIiBmaWxsLW9wYWNpdHk9IjAuMSIgZD0iTTAgNTBoMTAwdjFIMHoiLz48L2c+PC9zdmc+")`,
          pointerEvents: "none",
          opacity: 0.4,
          zIndex: 0
        }} />

        {/* ── Hero ── */}
        <section style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderBottom: "1px solid rgba(92,107,63,0.12)",
        }}>

          <p style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.22em", color: "#5C6B3F", marginBottom: "20px" }}>
            ( About )
          </p>
          <h1 style={{ fontSize: "clamp(5.2rem, 14.3vw, 13rem)", fontWeight: 300, color: "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 0.9, textTransform: "uppercase" }}>
            TEAM
          </h1>
          <div style={{ position: "absolute", bottom: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#5C6B3F", textTransform: "uppercase", opacity: 0.7 }}>Scroll</span>
            <div style={{ width: "1px", height: "44px", backgroundColor: "rgba(92,107,63,0.15)", position: "relative", overflow: "hidden" }}>
              <div style={{ width: "1px", height: "44px", backgroundColor: "#D12027", position: "absolute", top: "-44px", animation: "scrollLine 1.8s ease-in-out infinite" }} />
            </div>
          </div>
        </section>

        {/* ── Team Members (With Custom SVG Pattern Background) ── */}
        <div style={{ position: "relative" }}>


          {/* Members Content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {TEAM_DATA.map((member, i) => {
              const isEven = i % 2 === 0;
          return (
            <section
              key={i}
              ref={(el) => { sectionRefs.current[i] = el; }}
              style={{
                height: "100vh",
                display: "flex",
                flexDirection: isEven ? "row" : "row-reverse",
                overflow: "hidden",
                borderBottom: "1px solid rgba(92,107,63,0.1)",
              }}
            >
              {/* ─── TEXT COLUMN ─── */}
              <div style={{
                width: "55%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                paddingTop: "120px",
                paddingLeft: "80px",
                paddingRight: "80px",
                paddingBottom: "0px",
                boxSizing: "border-box",
                position: "relative",
              }}>

                {/* NAME — centered */}
                <div className="member-name" style={{ marginBottom: "60px", textAlign: "center" }}>
                  <h2 style={{
                    fontSize: "clamp(2.8rem, 5vw, 5rem)",
                    fontWeight: 400,
                    color: "#1a1a1a",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.0,
                    fontFamily: '"ktflux2", "ktflux2 Fallback"',
                    margin: 0,
                    padding: 0,
                  }}>
                    {member.name}
                  </h2>
                </div>

                {/* BIO — centered, 20% bigger */}
                <div className="member-bio" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <p style={{
                    fontSize: "clamp(1rem, 1.25vw, 1.15rem)",
                    lineHeight: 1.9,
                    color: "rgba(26,26,26,0.52)",
                    fontWeight: 400,
                    fontFamily: '"ktflux2", "ktflux2 Fallback"',
                    margin: "0 auto",
                    maxWidth: "520px",
                    textAlign: "center",
                  }}>
                    {member.bio}
                  </p>
                </div>

                {/* FOOTER — same indentation, pinned to bottom */}
                <div className="member-footer" style={{ paddingBottom: "48px" }}>
                  <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(92,107,63,0.6)", marginBottom: "20px" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: "clamp(0.82rem, 1.05vw, 0.95rem)",
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}>
                      {member.role}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "clamp(0.82rem, 1.05vw, 0.95rem)", color: "rgba(26,26,26,0.4)", fontWeight: 500 }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#D12027", display: "inline-block" }} />
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(92,107,63,0.6)", marginTop: "20px" }} />
                </div>

              </div>

              {/* ─── PHOTO PANEL ─── */}
              <div
                className="member-photo"
                style={{
                  width: "45%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: "clamp(300px, 80%, 460px)",
                  height: "clamp(550px, 85vh, 760px)",
                  position: "relative",
                  borderRadius: "0px",
                  overflow: "hidden",
                  boxShadow: "0 40px 100px rgba(0,0,0,0.25), 0 12px 32px rgba(0,0,0,0.15)",
                }}>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                    unoptimized
                  />
                </div>
              </div>

            </section>
          );
        })}
        </div>
      </div>

        {/* ── Progress Dots ── */}
        <div style={{
          position: "fixed",
          right: "28px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 100,
        }}>
          {TEAM_DATA.map((_, i) => (
            <button
              key={i}
              onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" })}
              style={{
                width: activeIndex === i ? "22px" : "7px",
                height: "7px",
                borderRadius: "4px",
                backgroundColor: activeIndex === i ? "#5C6B3F" : "rgba(92,107,63,0.25)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
                padding: 0,
              }}
              aria-label={`Go to team member ${i + 1}`}
            />
          ))}
        </div>

      </main>

      <style jsx global>{`
        @keyframes scrollLine {
          0% { top: -44px; }
          100% { top: 44px; }
        }
      `}</style>
    </>
  );
}
