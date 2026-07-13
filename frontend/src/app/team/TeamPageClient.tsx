"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Navbar from "@/app/homepage/Navbar";
import TeamFooter from "./TeamFooter";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

/* ─── DATA ─── */
const OIA_TEAM = [
  { name: "Dr. Ananya Sharma", role: "Director, OIA", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop&crop=face" },
  { name: "Prof. Rajesh Kumar", role: "Associate Director", img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=1200&fit=crop&crop=face" },
  { name: "Priya Mehta", role: "Program Coordinator", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1200&fit=crop&crop=face" },
  { name: "Arjun Desai", role: "International Relations Officer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&crop=face" },
];

const OIA_INTERNS = [
  { name: "Shrish", role: "Developer", img: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800&h=1200&fit=crop&crop=face" },
  { name: "Shivam", role: "Developer", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop&crop=face" },
  { name: "Anjali", role: "Design Intern", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop&crop=face" },
];

const CHAMPIONS = [
  { name: "Rohan Gupta", role: "Champion", department: "Computer Science", email: "rohan@bennett.edu.in", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&h=1200&fit=crop&crop=face" },
  { name: "Aisha Khan", role: "Champion", department: "Business Admin", email: "aisha@bennett.edu.in", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1200&fit=crop&crop=face" },
  { name: "Kunal Verma", role: "Champion", department: "Mechanical Engg", email: "kunal@bennett.edu.in", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&crop=face" },
  { name: "Pooja Singh", role: "Champion", department: "Law", email: "pooja@bennett.edu.in", img: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&h=1200&fit=crop&crop=face" },
];

/* ─── CARD COMPONENT ─── */
function ElegantTeamCard({ member, isChampion = false }: { member: any, isChampion?: boolean }) {
  return (
    <div className="team-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "300px", margin: "0 auto" }}>
      {/* Image Container */}
      <div style={{
        width: "100%",
        aspectRatio: "3/4",
        position: "relative",
        overflow: "hidden",
        borderRadius: "4px",
        marginBottom: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}>
        <Image
          src={member.img}
          alt={member.name}
          fill
          style={{ objectFit: "cover", filter: "grayscale(20%) contrast(110%)" }}
          className="hover:scale-105 hover:grayscale-0 transition-all duration-700 ease-out"
        />
      </div>
      
      {/* Text Info */}
      <div style={{ textAlign: "center" }}>
        <h3 style={{
          fontFamily: '"ktflux2", "ktflux2 Fallback", sans-serif',
          fontSize: "1.6rem",
          fontWeight: 400,
          color: "#1a1a1a",
          margin: "0 0 6px 0",
          letterSpacing: "-0.01em"
        }}>
          {member.name}
        </h3>
        <p style={{
          fontFamily: '"ktflux2", "ktflux2 Fallback", sans-serif',
          fontSize: "0.85rem",
          fontWeight: 400,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#5C6B3F",
          margin: 0,
        }}>
          {member.role}
        </p>
        
        {isChampion && (
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(92,107,63,0.15)" }}>
            <p style={{
              fontFamily: '"ktflux2", "ktflux2 Fallback", sans-serif',
              fontSize: "0.95rem",
              color: "rgba(26,26,26,0.6)",
              marginBottom: "4px",
            }}>
              {member.department}
            </p>
            <p style={{
              fontFamily: '"ktflux2", "ktflux2 Fallback", sans-serif',
              fontSize: "0.85rem",
              color: "rgba(26,26,26,0.4)",
            }}>
              {member.email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamPageClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (containerRef.current) {
      const sections = gsap.utils.toArray(".team-section", containerRef.current);
      
      sections.forEach((section: any) => {
        gsap.fromTo(
          section.querySelectorAll(".team-card"),
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "#f5f0e8", overflowX: "hidden", position: "relative" }}>
        
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
          height: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          position: "relative",
          paddingBottom: "80px",
          zIndex: 1,
        }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.22em", color: "#5C6B3F", marginBottom: "20px" }}>
            ( Meet The Team )
          </p>
          <h1 style={{ fontFamily: '"ktflux2", "ktflux2 Fallback", sans-serif', fontSize: "clamp(4rem, 10vw, 8rem)", fontWeight: 300, color: "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 0.9, textTransform: "uppercase" }}>
            OIA TEAM
          </h1>
        </section>

        {/* ── Main Content ── */}
        <div ref={containerRef} style={{ position: "relative", zIndex: 1, paddingBottom: "120px" }}>
          
          {/* Section 1: OIA TEAM */}
          <section className="team-section" style={{ padding: "80px 5% 120px", borderBottom: "1px solid rgba(92,107,63,0.12)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "80px 40px" }}>
              {OIA_TEAM.map((member, i) => (
                <ElegantTeamCard key={i} member={member} />
              ))}
            </div>
          </section>

          {/* Section 2: OIA INTERNS */}
          <section className="team-section" style={{ padding: "120px 5%", borderBottom: "1px solid rgba(92,107,63,0.12)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ fontFamily: '"ktflux2", "ktflux2 Fallback", sans-serif', fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 300, color: "#1a1a1a", letterSpacing: "-0.03em", marginBottom: "80px", textTransform: "uppercase" }}>
              OIA INTERNS
            </h2>
            <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "80px 40px", justifyContent: "center" }}>
              {OIA_INTERNS.map((member, i) => (
                <ElegantTeamCard key={i} member={member} />
              ))}
            </div>
          </section>

          {/* Section 3: CHAMPIONS OF OIA */}
          <section className="team-section" style={{ padding: "120px 5% 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ fontFamily: '"ktflux2", "ktflux2 Fallback", sans-serif', fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 300, color: "#1a1a1a", letterSpacing: "-0.03em", marginBottom: "80px", textTransform: "uppercase", textAlign: "center" }}>
              CHAMPIONS OF OIA
            </h2>
            <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "80px 40px" }}>
              {CHAMPIONS.map((member, i) => (
                <ElegantTeamCard key={i} member={member} isChampion={true} />
              ))}
            </div>
          </section>

        </div>
      </main>
      
      {/* Main Global Footer */}
      <TeamFooter />
    </>
  );
}
