"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOCK_PAST_EVENTS } from "../../data/mockEvents";

function parseDateInfo(dateStr: string) {
  const parts = dateStr.trim().split(/[\s,]+/);
  const month = (parts[0] || "").slice(0, 3).toUpperCase();
  const year = parts[parts.length - 1] || "";
  const dayPart = parts[1] || "";
  const day = dayPart.replace(/[^0-9].*/, "");
  return { month, day, year };
}

/* ─── Generate pseudo-random bar heights for each event ─── */
function generateBars(seed: number, count: number): number[] {
  const bars: number[] = [];
  let val = seed;
  for (let i = 0; i < count; i++) {
    val = (val * 9301 + 49297) % 233280;
    const norm = val / 233280;
    // Create a bell curve-ish shape with some randomness
    const center = count / 2;
    const dist = Math.abs(i - center) / center;
    const base = 1 - dist * 0.6;
    bars.push(0.2 + base * norm * 0.8);
  }
  return bars;
}

export default function DateScroller({ events: rawEvents = MOCK_PAST_EVENTS }: { events?: typeof MOCK_PAST_EVENTS }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  const events = rawEvents.map((ev, i) => {
    const { month, day, year } = parseDateInfo(ev.date);
    return { ...ev, month, day, year, index: i, bars: generateBars(i * 137 + 42, 9) };
  });


  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const timer = setTimeout(() => {
      const sec = document.querySelector("[data-event-index]")?.closest("section");
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: "top 80%", end: "bottom 20%",
        onEnter: () => setIsVisible(true), onLeave: () => setIsVisible(false),
        onEnterBack: () => setIsVisible(true), onLeaveBack: () => setIsVisible(false),
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const triggers: ScrollTrigger[] = [];
    const timer = setTimeout(() => {
      events.forEach((_, i) => {
        const el = document.querySelectorAll("[data-event-index]")[i] as HTMLElement;
        if (!el) return;
        triggers.push(ScrollTrigger.create({
          trigger: el, start: "top center", end: "bottom center",
          onEnter: () => setActiveIndex(i), onEnterBack: () => setActiveIndex(i),
        }));
      });
    }, 600);
    return () => { clearTimeout(timer); triggers.forEach((t) => t.kill()); };
  }, []);

  /* ─── Animate active bars ─── */
  useEffect(() => {
    events.forEach((ev) => {
      const container = barsRef.current[ev.index];
      if (!container) return;
      const barEls = container.querySelectorAll<HTMLElement>("[data-bar]");
      const isActive = activeIndex === ev.index;

      barEls.forEach((bar, bi) => {
        const baseHeight = ev.bars[bi] || 0.3;
        gsap.to(bar, {
          height: isActive ? `${baseHeight * 32}px` : `${baseHeight * 13}px`,
          backgroundColor: isActive ? "#7A8C5E" : "rgba(57,57,57,0.18)",
          duration: 0.5,
          delay: bi * 0.04,
          ease: "power3.out",
        });
      });
    });
  }, [activeIndex]);

  const scrollToEvent = useCallback((idx: number) => {
    const t = document.querySelectorAll("[data-event-index]")[idx] as HTMLElement;
    if (!t) return;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - window.innerHeight / 3, behavior: "smooth" });
  }, []);

  const showYear = (i: number) => i === 0 || events[i].year !== events[i - 1].year;

  return (
    <div
      ref={scrollerRef}
      className="fixed z-40 hidden md:flex items-end justify-center"
      style={{
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition: "opacity 0.5s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "0",
          padding: "7px 20px 5px",
          borderRadius: "14px",
          background: "rgba(255, 251, 242, 0.88)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          border: "1px solid rgba(122, 140, 94, 0.18)",
          boxShadow: "0 6px 32px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {events.map((ev, i) => {
          const isActive = activeIndex === i;
          const isHovered = hoveredIndex === i;

          return (
            <React.Fragment key={ev.id}>
              {/* Year divider */}
              {showYear(i) && i > 0 && (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "flex-end", margin: "0 10px", paddingBottom: "2px",
                }}>
                  <div style={{
                    width: "1px", height: "24px",
                    background: "linear-gradient(to bottom, transparent, rgba(122,140,94,0.25))",
                  }} />
                </div>
              )}

              <button
                onClick={() => scrollToEvent(i)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative cursor-pointer flex flex-col items-center"
                style={{ background: "none", border: "none", padding: "0 6px" }}
                title={ev.title}
              >
                {/* Year label above first event of year */}
                {showYear(i) && (
                  <span style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "8px", fontWeight: 600, letterSpacing: "0.12em",
                    color: "rgba(90,110,60,0.7)", marginBottom: "6px",
                    textTransform: "uppercase",
                  }}>
                    {ev.year}
                  </span>
                )}

                {/* ── Soundwave bars ── */}
                <div
                  ref={(el) => { barsRef.current[i] = el; }}
                  className="flex items-end justify-center"
                  style={{
                    gap: "2px", height: "32px",
                    transition: "transform 0.3s ease",
                    transform: isHovered && !isActive ? "scaleY(1.3)" : "scaleY(1)",
                    transformOrigin: "bottom",
                  }}
                >
                  {ev.bars.map((h, bi) => (
                    <div
                      key={bi}
                      data-bar
                      style={{
                        width: "3px",
                        height: `${h * 13}px`,
                        borderRadius: "1.5px",
                        backgroundColor: "rgba(57,57,57,0.18)",
                        transition: "background-color 0.3s ease",
                      }}
                    />
                  ))}
                </div>

                {/* Date label */}
                <div className="flex items-baseline gap-0.5" style={{ marginTop: "5px" }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "8px", fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    color: isActive ? "#3a4d14" : isHovered ? "rgba(57,57,57,0.95)" : "rgba(57,57,57,0.85)",
                    transition: "color 0.3s ease",
                  }}>
                    {ev.month}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-instrument-serif)",
                    fontSize: "11px",
                    color: isActive ? "#5a7a2a" : isHovered ? "rgba(57,57,57,0.85)" : "rgba(57,57,57,0.75)",
                    transition: "color 0.3s ease", lineHeight: 1,
                  }}>
                    {ev.day}
                  </span>
                </div>

                {/* Tooltip */}
                <div style={{
                  position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
                  transform: "translateX(-50%)", whiteSpace: "nowrap",
                  fontFamily: "var(--font-outfit)", fontSize: "9px", fontWeight: 500,
                  color: "#4a5e1a", background: "rgba(255,251,242,0.95)",
                  padding: "3px 8px", borderRadius: "4px",
                  border: "1px solid rgba(122,140,94,0.15)",
                  opacity: isHovered ? 1 : 0, pointerEvents: "none",
                  transition: "opacity 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  {ev.title}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
