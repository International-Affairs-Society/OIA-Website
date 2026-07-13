"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CircuitPattern from "@/app/homepage/CircuitPattern";
import { MOCK_PAST_EVENTS } from "../../data/mockEvents";
import TimelineEvent from "./TimelineEvent";
import DateScroller from "./DateScroller";

export default function PastTimeline({ events = MOCK_PAST_EVENTS }: { events?: typeof MOCK_PAST_EVENTS }) {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate the central red line growing downwards as we scroll
      gsap.fromTo(
        lineRef.current,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 40%", // Start drawing slightly later when the section reaches 40% of the screen
            end: "bottom bottom", // Finish drawing when the end of the section hits the bottom of the screen
            scrub: 1.5, // Increase scrub for a much smoother, slightly lagging effect
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden flex flex-col pb-48"
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


      {/* Date Scroller — fixed on left */}
      <DateScroller events={events} />

      {/* Timeline Wrapper */}
      <div className="relative w-full z-10">

        {/* The Track (Faded Line) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-black/10" />

        {/* The Progress Line (Glowing Red) */}
        <div
          ref={lineRef}
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] bg-[#D12027]"
          style={{
            willChange: "height",
          }}
        />

        {/* Timeline Events */}
        {/* Massive top padding here pushes the events down but lets the line start at the top */}
        <div className="flex flex-col" style={{ paddingTop: "100px" }}>
          {events.map((event, i) => (
            <TimelineEvent key={event.id} event={event} index={i} />
          ))}
        </div>


      </div>
    </section>
  );
}
