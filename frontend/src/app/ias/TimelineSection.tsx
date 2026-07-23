"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

/* ── Timeline Data ── */
const timelineEvents = [
  {
    phase: "Inception",
    date: "August 2024",
    time: "The Beginning",
    title: "Foundation of IAS",
    description:
      "The Office of International Affairs at Bennett University established the International Affairs Society to foster global awareness, cross-cultural dialogue, and diplomatic thinking among students.",
    image: "/events assets/1.jpeg",
    imageAlt: "IAS Foundation ceremony",
  },
  {
    phase: "First Steps",
    date: "October 2024",
    time: "Guest Lecture Series",
    title: "International Guest Lectures",
    description:
      "Inaugurated the International Guest Lecture Series, bringing distinguished scholars and diplomats from across the globe to engage with students on pressing geopolitical issues.",
    image: "/events assets/2.jpeg",
    imageAlt: "Guest Lecture event",
  },
  {
    phase: "Growth",
    date: "January 2025",
    time: "Model Diplomacy",
    title: "Diplomatic Simulations",
    description:
      "Launched immersive Model United Nations and diplomatic simulation exercises, training students in negotiation, policy drafting, and international conflict resolution.",
    image: "/events assets/3.jpeg",
    imageAlt: "Model Diplomacy simulation",
  },
  {
    phase: "Expansion",
    date: "April 2025",
    time: "Global Outreach",
    title: "International Partnerships",
    description:
      "Forged strategic partnerships with universities and organizations worldwide, creating exchange opportunities and collaborative research programs for IAS members.",
    image: "/events assets/4.jpeg",
    imageAlt: "International partnership signing",
  },
  {
    phase: "Impact",
    date: "August 2026",
    time: "Global Symposium",
    title: "Inaugural Global Symposium",
    description:
      "Hosted the first annual IAS Global Symposium, bringing together student delegates from 20+ countries to debate and draft resolutions on climate diplomacy and international trade.",
    image: "/events assets/1.jpeg",
    imageAlt: "Global Symposium",
  },
  {
    phase: "Future",
    date: "November 2026",
    time: "Research Hub",
    title: "Policy Research Initiative",
    description:
      "Established the IAS Policy Think Tank, publishing student-led research papers on emerging geopolitical trends and digital diplomacy.",
    imageAlt: "Policy Research",
  },
];

export default function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const mobileLineRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !pathRef.current) return;

    let ctx: gsap.Context;
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        const path = pathRef.current!;
        const pathLength = path.getTotalLength();

        gsap.set(path, {
          strokeDasharray: `${pathLength}px`,
          strokeDashoffset: `${pathLength}px`,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 100%",
            end: "bottom bottom",
            scrub: 2,
          },
        });

        if (mobileLineRef.current) {
          gsap.fromTo(
            mobileLineRef.current,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 50%",
                end: "bottom 50%",
                scrub: 1,
              },
            }
          );
        }

        // Animate each event entry
        eventsRef.current.forEach((el, i) => {
          if (!el) return;
          gsap.fromTo(
            el,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                end: "top 55%",
                scrub: 1.5,
              },
            }
          );
        });
      }, sectionRef);
    }, 2500); // Wait for IASPageClient hero pin spacing to be calculated

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, []);

  /* ── SVG wavy path that winds through the timeline ── */
  // The path goes from left → right, dipping and rising, with 4 anchor points
  const svgW = 1200;
  const svgH = 2400;
  const wavePath = `
    M 0,100
    C 300,80 400,180 600,160
    S 900,60 1200,120
    C 900,200 1000,350 600,400
    S 200,360 0,500
    C 300,560 400,620 600,580
    S 900,500 1200,560
    C 900,660 1000,780 600,820
    S 200,760 0,900
    C 300,960 400,1050 600,1000
    S 900,920 1200,980
    C 900,1060 1000,1200 600,1240
    S 200,1180 0,1320
    C 300,1380 400,1460 600,1420
    S 900,1340 1200,1400
    C 900,1500 1000,1600 600,1640
    S 200,1580 0,1720
    C 300,1780 400,1860 600,1840
    S 900,1760 1200,1820
    C 900,1900 1000,2000 600,2040
    S 200,1980 0,2100
    L 0,2400
  `;

  // Node positions along the curve (approximate Y positions for each event)
  const nodePositions = [
    { x: 580, y: 165, side: "right" as const },
    { x: 620, y: 580, side: "left" as const },
    { x: 580, y: 1000, side: "right" as const },
    { x: 620, y: 1420, side: "left" as const },
    { x: 580, y: 1840, side: "right" as const },
    { x: 620, y: 2150, side: "left" as const },
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        backgroundColor: "#0a0a0a",
        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(114, 114, 114, 0.3) 25%, rgba(114, 114, 114, 0.3) 26%, transparent 27%, transparent 74%, rgba(114, 114, 114, 0.3) 75%, rgba(114, 114, 114, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(114, 114, 114, 0.3) 25%, rgba(114, 114, 114, 0.3) 26%, transparent 27%, transparent 74%, rgba(114, 114, 114, 0.3) 75%, rgba(114, 114, 114, 0.3) 76%, transparent 77%, transparent)`,
        backgroundSize: "55px 55px",
        overflow: "hidden",
        padding: "0 0 120px 0",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .timeline-svg {
            display: none !important;
          }
          .timeline-container {
            min-height: auto !important;
            padding: 0 20px !important;
          }
          .timeline-mobile-group {
            position: relative !important;
            border-left: none !important;
            padding-left: 24px !important;
            padding-bottom: 80px !important;
            margin-bottom: 0 !important;
            margin-left: 0 !important;
          }
          .timeline-mobile-group::before {
            content: '';
            position: absolute;
            left: -6px;
            top: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #D12027;
            box-shadow: 0 0 10px rgba(209,32,39,0.8);
            z-index: 3;
          }
          .timeline-event-wrapper {
            position: relative !important;
            top: auto !important;
            left: 0 !important;
            right: auto !important;
            width: 100% !important;
            transform: none !important;
          }
          .timeline-phase {
            position: relative !important;
            top: auto !important;
            left: 0 !important;
            right: auto !important;
            text-align: left !important;
            margin-bottom: 10px !important;
          }
          .timeline-phase span {
            font-size: 2.5rem !important;
          }
          .timeline-mobile-line-bg, .timeline-mobile-line-active {
            display: block !important;
          }
          .timeline-image {
            position: relative !important;
            top: auto !important;
            left: 0 !important;
            right: auto !important;
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 16/9 !important;
            margin-top: 24px !important;
            border-radius: 4px !important;
          }
        }
      `}</style>
      {/* ── Top Fade Overlay to blend the grid ── */}
      <div 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: "250px", 
          background: "linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)",
          zIndex: 0,
          pointerEvents: "none"
        }} 
      />

      {/* ── Section Title ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          paddingTop: "100px",
          paddingBottom: "40px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "var(--font-roboto-condensed)",
            fontWeight: 400,
          }}
        >
          (Our Journey)
        </span>
      </div>

      {/* ── Timeline Container ── */}
      <div
        className="timeline-container"
        style={{
          position: "relative",
          maxWidth: "1200px",
          margin: "0 auto",
          minHeight: `${svgH}px`,
        }}
      >
        <style>{`
          .timeline-mobile-line-bg, .timeline-mobile-line-active {
            display: none;
          }
        `}</style>
        
        {/* Mobile vertical line (hidden on desktop) */}
        <div 
          className="timeline-mobile-line-bg"
          style={{ position: "absolute", top: "0", bottom: "0", left: "19px", width: "2px", backgroundColor: "rgba(255,255,255,0.08)", zIndex: 1 }}
        />
        <div 
          ref={mobileLineRef}
          className="timeline-mobile-line-active"
          style={{ position: "absolute", top: "0", bottom: "0", left: "19px", width: "2px", backgroundColor: "#D12027", zIndex: 2, transformOrigin: "top", transform: "scaleY(0)" }}
        />

        {/* SVG wavy line */}
        <svg
          className="timeline-svg"
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            overflow: "visible",
          }}
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Background track path (always visible) */}
          <path
            d={wavePath}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Overlay path for the animated draw */}
          <path
            ref={pathRef}
            d={wavePath}
            stroke="#D12027"
            strokeWidth="2.5"
            fill="none"
            style={{ willChange: "stroke-dashoffset" }}
          />

          {/* Node dots */}
          {nodePositions.map((node, i) => (
            i !== 5 && (
              <g key={i}>
                {/* Glow ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="12"
                  fill="none"
                  stroke="rgba(209,32,39,0.2)"
                  strokeWidth="1"
                />
                {/* Solid dot */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="5"
                  fill="#D12027"
                />
              </g>
            )
          ))}
        </svg>

        {/* ── Event Cards and Images ── */}
        {timelineEvents.map((event, i) => {
          const node = nodePositions[i];
          const isRight = node.side === "right";

          return (
            <div key={i} className="timeline-mobile-group">
              <div
                ref={(el) => { eventsRef.current[i] = el; }}
              className="timeline-event-wrapper"
              style={{
                position: "absolute",
                top: `${node.y + 90}px`,
                left: isRight ? "55%" : "5%",
                right: isRight ? "5%" : undefined,
                width: isRight ? "40%" : "40%",
                zIndex: 2,
                willChange: "transform, opacity",
              }}
            >
              {/* Phase label */}
              <div
                className="timeline-phase"
                style={{
                  position: "absolute",
                  top: "-100px",
                  left: isRight ? "0" : undefined,
                  right: isRight ? undefined : "0",
                  textAlign: isRight ? "left" : "right",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 5rem)",
                    fontFamily: "var(--font-libre-bodoni)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.15)",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {event.phase}
                </span>
              </div>

              {/* Date / Time */}
              <div style={{ marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-roboto-condensed)",
                    fontWeight: 400,
                  }}
                >
                  {event.date}
                </span>
                <br />
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(209,32,39,0.5)",
                    letterSpacing: "0.08em",
                    fontFamily: "var(--font-roboto-condensed)",
                    fontWeight: 400,
                  }}
                >
                  {event.time}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  fontFamily: "var(--font-libre-bodoni)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "0 0 16px 0",
                  lineHeight: 1.2,
                }}
              >
                {event.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                  fontFamily: "var(--font-outfit)",
                  fontWeight: 300,
                  maxWidth: "380px",
                  margin: 0,
                }}
              >
                {event.description}
              </p>


              </div>

              {/* ── Floating image on the opposite side of text ── */}
              {event.image && (
                <div
                  className="timeline-image"
                  style={{
                    position: "absolute",
                    top: `${node.y - 30}px`,
                    left: isRight ? "5%" : undefined,
                    right: isRight ? undefined : "5%",
                    width: "354px",
                    height: "253px",
                    borderRadius: "0px",
                    overflow: "hidden",
                    boxShadow: "0 40px 80px rgba(0,0,0,1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    zIndex: 2,
                  }}
                >
                  <Image
                    src={event.image}
                    alt={event.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 354px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
