"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CircuitPattern from "@/app/homepage/CircuitPattern";
import { MOCK_PAST_EVENTS, PastEvent } from "../../data/mockEvents";
import EventGallery from "./EventGallery";

function MobileTimelineEvent({ event }: { event: PastEvent }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Dot animation (no glow)
      gsap.to(dotRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          toggleActions: "play none none reverse",
        },
        backgroundColor: "#D12027",
        scale: 1.3,
        duration: 0.4,
      });

      // Content fade in
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative py-6 w-full box-border"
      style={{ paddingLeft: "44px", paddingRight: "24px", marginTop: "48px", marginBottom: "48px", maxWidth: "100vw" }}
    >
      {/* Dot on the line */}
      <div className="absolute left-[20px] top-8 -translate-x-1/2 z-20">
        <div
          ref={dotRef}
          className="w-2.5 h-2.5 rounded-full border-2 border-[#D12027]/40 transition-colors duration-300"
          style={{ backgroundColor: "var(--background)" }}
        />
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex flex-col gap-3">
        <span className="font-space-grotesk text-[#D12027] font-semibold tracking-widest text-xs uppercase">
          {event.date}
        </span>
        <a
          href={event.link || "https://www.bennett.edu.in/"}
          target="_blank"
          rel="noopener noreferrer"
          className="font-outfit text-xl font-medium tracking-tight leading-tight transition-colors duration-300 hover:text-[#D12027] cursor-pointer"
          style={{ color: "var(--foreground)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#D12027")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground)")}
        >
          {event.title}
        </a>
        <p
          className="opacity-70 leading-relaxed font-sans text-sm"
          style={{ color: "var(--foreground)" }}
        >
          {event.description}
        </p>
        {event.location && (
          <span className="font-space-grotesk text-xs tracking-wider uppercase flex items-center gap-1.5 mt-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.location}
          </span>
        )}

        {/* Gallery */}
        <div className="mt-2" style={{ width: "90%", borderRadius: "12px", overflow: "hidden" }}>
          <EventGallery images={event.images} eventTitle={event.title} />
        </div>
      </div>
    </div>
  );
}

export default function MobileTimeline({ events = MOCK_PAST_EVENTS }: { events?: typeof MOCK_PAST_EVENTS }) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1.5,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden flex flex-col pb-24"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <CircuitPattern />
      </div>

      {/* Black fade transition to blend with the Hero section */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: "30px", background: "linear-gradient(to bottom, black, transparent)" }}
      />

      {/* Timeline Wrapper */}
      <div className="relative w-full z-10">

        {/* The Track (Faded Line) — on the left */}
        <div className="absolute left-[20px] top-0 bottom-0 w-[1px] bg-black/10" />

        {/* The Progress Line (Glowing Red) — on the left */}
        <div
          ref={lineRef}
          className="absolute left-[20px] top-0 w-[2px] bg-[#D12027]"
          style={{
            willChange: "height",
          }}
        />

        {/* Timeline Events */}
        <div className="flex flex-col" style={{ paddingTop: "40px" }}>
          {events.map((event, i) => (
            <MobileTimelineEvent key={event.id} event={event} />
          ))}
        </div>


      </div>
    </section>
  );
}
