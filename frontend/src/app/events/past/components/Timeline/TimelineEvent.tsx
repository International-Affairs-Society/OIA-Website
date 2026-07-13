"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PastEvent } from "../../data/mockEvents";
import EventGallery from "./EventGallery";

export default function TimelineEvent({ event, index }: { event: PastEvent; index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const isEven = index % 2 === 0;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate the dot when reached
      gsap.to(dotRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          toggleActions: "play none none reverse",
        },
        backgroundColor: "#D12027",
        scale: 1.2,
        duration: 0.4,
      });

      // Animate content sliding in
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: isEven ? -50 : 50, y: 30 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate gallery sliding in
      gsap.fromTo(
        galleryRef.current,
        { opacity: 0, x: isEven ? 50 : -50, y: 30 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1,
          delay: 0.2, // slightly delayed after content
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isEven]);

  return (
    <div ref={containerRef} data-event-index={index} className="relative w-full flex items-center justify-center" style={{ paddingTop: "64px", paddingBottom: "64px", marginBottom: "48px" }}>

      {/* Central Node / Dot */}
      <div className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
        <div
          ref={dotRef}
          className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-[#D12027]/40 transition-colors duration-300"
          style={{ backgroundColor: "var(--background)" }}
        />
      </div>

      {/* Grid Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-24 items-center">

        {isEven ? (
          <>
            {/* Detail Column (Left side) */}
            <div
              ref={contentRef}
              className="flex flex-col gap-4 text-left md:text-right items-start md:items-end"
              style={{ willChange: "transform, opacity" }}
            >
              <span className="font-space-grotesk text-[#D12027] font-semibold tracking-widest text-sm uppercase">
                {event.date}
              </span>
              <a 
                href={event.link || "https://www.bennett.edu.in/"}
                target="_blank"
                rel="noopener noreferrer"
                className="font-outfit text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-tight transition-colors duration-300 hover:text-[#D12027] cursor-pointer" 
                style={{ color: "var(--foreground)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D12027")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground)")}
              >
                {event.title}
              </a>
              <p className="opacity-70 leading-relaxed font-sans mt-2 max-w-md" style={{ color: "var(--foreground)" }}>
                {event.description}
              </p>
              {event.location && (
                <span className="font-space-grotesk text-xs tracking-wider uppercase flex items-center gap-1.5 mt-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {event.location}
                </span>
              )}
            </div>

            {/* Gallery Column (Right side) */}
            <div
              ref={galleryRef}
              className="w-full relative"
              style={{ willChange: "transform, opacity", minHeight: "350px" }}
            >
              <EventGallery images={event.images} eventTitle={event.title} />
            </div>
          </>
        ) : (
          <>
            {/* Gallery Column (Left side) */}
            <div
              ref={galleryRef}
              className="w-full order-2 md:order-none relative"
              style={{ willChange: "transform, opacity", minHeight: "350px" }}
            >
              <EventGallery images={event.images} eventTitle={event.title} />
            </div>

            {/* Detail Column (Right side) */}
            <div
              ref={contentRef}
              className="flex flex-col gap-4 text-left items-start order-1 md:order-none"
              style={{ willChange: "transform, opacity" }}
            >
              <span className="font-space-grotesk text-[#D12027] font-semibold tracking-widest text-sm uppercase">
                {event.date}
              </span>
              <a 
                href={event.link || "https://www.bennett.edu.in/"}
                target="_blank"
                rel="noopener noreferrer"
                className="font-outfit text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-tight transition-colors duration-300 hover:text-[#D12027] cursor-pointer" 
                style={{ color: "var(--foreground)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D12027")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground)")}
              >
                {event.title}
              </a>
              <p className="opacity-70 leading-relaxed font-sans mt-2 max-w-md" style={{ color: "var(--foreground)" }}>
                {event.description}
              </p>
              {event.location && (
                <span className="font-space-grotesk text-xs tracking-wider uppercase flex items-center gap-1.5 mt-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {event.location}
                </span>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
