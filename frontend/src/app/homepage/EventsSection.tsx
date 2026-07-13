"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CircuitPattern from "./CircuitPattern";
import Plasma from "./Plasma";

gsap.registerPlugin(ScrollTrigger);

export default function EventsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/events?eventType=past&addToHomepage=true`);
        if (res.ok) {
          const json = await res.json();
          setEvents(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch homepage events:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (isLoading || events.length === 0) return;

    const ctx = gsap.context(() => {
      // Select the heading elements and cards
      const elementsToAnimate = gsap.utils.toArray(".animate-heading").concat(cardsRef.current.filter(Boolean));

      if (elementsToAnimate.length > 0) {
        gsap.fromTo(
          elementsToAnimate,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            delay: 0.5,
            stagger: 0.15,
            ease: "power3.out",
            force3D: true, // Force GPU hardware acceleration
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoading, events]);

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-center py-24"
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      {/* ── Background Elements ── */}
      <CircuitPattern />

      {/* Plasma Effect behind cards */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-multiply">
        <Plasma
          color="#D12027"
          speed={1.5}
          direction="forward"
          scale={1.2}
          opacity={0.8}
          mouseInteractive={false}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[1400px] px-6 mx-auto flex flex-col items-center">

        {/* Top 10% Spacer */}
        <div style={{ height: "10vh", flexShrink: 0, width: "100%" }} aria-hidden="true" />

        {/* Section Header */}
        <div className="w-full text-center animate-heading">
          <p className="font-sans text-[0.85rem] text-foreground/50 font-medium tracking-wide uppercase mb-16">
            LATEST EVENTS
          </p>
        </div>

        <div className="w-full text-center px-4 animate-heading">
          <h2 className="font-sans font-medium leading-[1.1] tracking-tight text-foreground text-3xl md:text-5xl lg:text-[5rem]">
            Relive our recent <span className="text-[#D12027] font-semibold">global engagements</span>
          </h2>
        </div>

        {/* Indestructible Spacer */}
        <div style={{ height: "75px", flexShrink: 0, width: "100%" }} aria-hidden="true" />

        {/* ── Cards Grid (Horizontal swipe on mobile, Grid on desktop) ── */}
        <div
          className="w-full flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 shrink-0 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            <div className="w-full text-center py-12 text-foreground/50 font-medium font-sans">
              Loading engagements...
            </div>
          ) : events.length === 0 ? (
            <div className="w-full text-center py-12 text-foreground/50 font-medium font-sans">
              No recent engagements found.
            </div>
          ) : (
            events.map((event, i) => (
              <div
                key={event.id}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className="group relative w-[80vw] sm:w-[60vw] md:w-full flex-shrink-0 snap-center aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer will-change-transform"
                style={{
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                {/* Background Image */}
                {event.posterUrl && (
                  <Image
                    src={event.posterUrl}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    unoptimized // Use unoptimized for R2 URLs
                  />
                )}

                {/* Dark Gradient Overlay for text readability and sleek aesthetic */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 transition-opacity duration-500 group-hover:opacity-90" />

                {/* Card Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                  {/* Top Number */}
                  <span className="font-sans text-white/90 text-5xl md:text-6xl font-light tracking-tighter">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Bottom Text */}
                  <h3 className="font-sans text-white text-xl md:text-2xl font-medium text-right uppercase tracking-wider leading-snug">
                    {event.title}
                  </h3>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Indestructible Spacer */}
        <div style={{ height: "50px", flexShrink: 0, width: "100%" }} aria-hidden="true" />

        {/* ── Explore More Link ── */}
        <div>
          <a
            href="/events"
            className="group flex items-center gap-3 text-foreground/70 hover:text-[#D12027] transition-colors duration-300 uppercase tracking-widest text-sm font-semibold"
          >
            Explore More
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transform transition-transform duration-300 group-hover:translate-x-2"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}
