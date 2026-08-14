"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CircuitPattern from "./CircuitPattern";
import { useDeviceTierContext } from "@/hooks/useDeviceTier";

gsap.registerPlugin(ScrollTrigger);

import CardFlip from "@/components/ui/card-flip";

// Mock data removed in favor of backend API
// Fan layout: 5 visible positions + 2 off-screen positions for enter/exit
const FAN_SLOTS: Record<number, { left: string; top: string; width: string; height: string; rotate: number; zIndex: number; opacity: number }> = {
  [-2]: { left: "-30%", top: "30%", width: "22%", height: "40%", rotate: -10, zIndex: 0, opacity: 0 },  // off-screen left (entering)
  [-1]: { left: "-15%", top: "25%", width: "24%", height: "45%", rotate: -5,  zIndex: 0, opacity: 0 },  // off-screen far left
  0:    { left: "2%",   top: "22%", width: "26%", height: "50%", rotate: 0,   zIndex: 1, opacity: 1 },  // left outer
  1:    { left: "14%",  top: "17%", width: "30%", height: "55%", rotate: -15, zIndex: 2, opacity: 1 },  // left inner
  2:    { left: "27%",  top: "8%",  width: "46%", height: "70%", rotate: 0,   zIndex: 3, opacity: 1 },  // CENTER
  3:    { left: "54%",  top: "17%", width: "30%", height: "55%", rotate: 15,  zIndex: 2, opacity: 1 },  // right inner
  4:    { left: "72%",  top: "22%", width: "28%", height: "50%", rotate: 0,   zIndex: 1, opacity: 1 },  // right outer
  5:    { left: "105%", top: "25%", width: "24%", height: "45%", rotate: 5,   zIndex: 0, opacity: 0 },  // off-screen far right
  6:    { left: "120%", top: "30%", width: "22%", height: "40%", rotate: 10,  zIndex: 0, opacity: 0 },  // off-screen right (exiting)
};

// Get slot style, clamping to nearest off-screen slot if out of range
function getSlotStyle(slotIndex: number) {
  if (slotIndex <= -2) return FAN_SLOTS[-2];
  if (slotIndex >= 6)  return FAN_SLOTS[6];
  return FAN_SLOTS[slotIndex] || FAN_SLOTS[-2];
}

export default function EventsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const fanRef = useRef<HTMLDivElement>(null);
  const deviceTier = useDeviceTierContext();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const MAX_RETRIES = 3;
      const RETRY_DELAYS = [1000, 2000, 4000]; // exponential backoff (ms)

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (cancelled) return;
        try {
          const res = await fetch(`${API_URL}/api/v1/events?eventType=past`);
          if (res.ok) {
            const json = await res.json();
            if (cancelled) return;
            const validEvents = (json.data || [])
              .filter((e: any) => !e.is_archived)
              .slice(0, 5)
              .map((e: any) => ({
                id: e.id,
                title: e.title,
                subtitle: e.event_type === "upcoming" ? "Upcoming Event" : "Past Event",
                description: e.description || "",
                features: e.highlights || [],
                posterUrl: e.poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"
              }));

            setEvents(validEvents);
            setIsLoading(false);
            return; // success — stop retrying
          }
        } catch {
          // Network error (backend cold-starting) — retry after delay
          if (attempt < MAX_RETRIES) {
            await new Promise((res) => setTimeout(res, RETRY_DELAYS[attempt]));
            continue;
          }
        }
      }

      // All retries exhausted
      if (!cancelled) setIsLoading(false);
    };

    fetchEvents();
    return () => { cancelled = true; };
  }, []);

  // centerIndex: which event index is currently in the center slot (position 2)
  const [centerIndex, setCenterIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotate every 4 seconds
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % events.length);
    }, 4000);
  }, [events.length]);

  useEffect(() => {
    if (!isPaused && events.length > 0) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, startTimer, events.length]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Click a card → make it the center
  const handleCardClick = (eventIndex: number) => {
    if (eventIndex === centerIndex) return;
    setCenterIndex(eventIndex);
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  };

  // For each event, calculate its slot position relative to the center
  const getSlotForEvent = (eventIndex: number): number => {
    let diff = eventIndex - centerIndex;
    // Wrap around for circular behavior
    const half = Math.floor(events.length / 2);
    if (diff > half) diff -= events.length;
    if (diff < -half) diff += events.length;
    // diff = 0 → slot 2 (center), diff = -1 → slot 1, diff = 1 → slot 3, etc.
    return diff + 2;
  };

  // GSAP scroll animations
  useEffect(() => {
    if (isLoading || events.length === 0) return;

    const ctx = gsap.context(() => {
      const elementsToAnimate = gsap.utils.toArray(".animate-heading");

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
            force3D: true,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (fanRef.current) {
        gsap.fromTo(
          fanRef.current,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.4,
            delay: 0.8,
            ease: "power3.out",
            force3D: true,
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
      className="relative w-full min-h-0 md:min-h-screen overflow-hidden flex flex-col items-center pt-12 pb-6 md:py-24"
      style={{
        backgroundColor: "var(--background)",
      }}
    >
      {/* ── Background Elements ── */}
      <CircuitPattern />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[1400px] px-6 mx-auto flex flex-col items-center">

        {/* Top Spacer */}
        <div className="events-top-spacer" style={{ flexShrink: 0, width: "100%" }} aria-hidden="true" />

        {/* Section Header */}
        <div className="w-full text-center animate-heading">
          <p className="font-sans text-[0.85rem] text-foreground/50 font-medium tracking-wide uppercase events-label-mb">
            LATEST EVENTS
          </p>
        </div>

        <div className="w-full text-center px-4 animate-heading">
          <h2 className="events-heading font-zodiak font-medium leading-[1.1] tracking-tight text-foreground">
            Relive our recent <span className="text-[#D12027]">global engagements</span>
          </h2>
        </div>

        {/* Spacer */}
        <div className="events-mid-spacer" style={{ flexShrink: 0, width: "100%" }} aria-hidden="true" />

        {/* ── Fan Layout ── */}
        {isLoading ? (
          <div className="w-full text-center py-12 text-foreground/50 font-medium font-sans">
            Loading engagements...
          </div>
        ) : events.length === 0 ? (
          <div className="w-full max-w-[800px] h-[450px] mx-auto py-12 px-4">
            <div className="relative w-full h-full">
              <CardFlip
                key="fallback-event"
                title="Global Engagements"
                subtitle="Stay Tuned"
                description="We are currently planning our next series of global engagements and international partnerships. Check back soon for new announcements and opportunities."
                features={["Global Partnerships", "International Programs", "Student Exchange"]}
                posterUrl="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"
                isCenter={true}
              />
            </div>
          </div>
        ) : (
          <>
            {/* ── DESKTOP: Fan Layout ── */}
            <div
              ref={fanRef}
              className="relative w-[95%] select-none hidden md:block"
              style={{
                aspectRatio: "2.58",
                touchAction: "pan-y",
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {events.map((event, eventIndex) => {
                const slot = getSlotForEvent(eventIndex);
                const style = getSlotStyle(slot);
                const isCenter = slot === 2;
                const isVisible = slot >= 0 && slot <= 4;

                return (
                  <div
                    key={event.id}
                    style={{
                      position: "absolute",
                      left: style.left,
                      top: style.top,
                      width: style.width,
                      height: style.height,
                      transform: `rotate(${style.rotate}deg) scale(${isCenter ? 1 : 0.98})`,
                      zIndex: style.zIndex,
                      opacity: style.opacity,
                      cursor: isCenter ? "default" : "pointer",
                      transition: "all 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      pointerEvents: isVisible ? "auto" : "none",
                      willChange: "left, top, width, height, transform, opacity",
                    }}
                    onClick={() => handleCardClick(eventIndex)}
                  >
                    {isCenter ? (
                      /* ═══ CENTER CARD: Full CardFlip ═══ */
                      <CardFlip
                        title={event.title}
                        subtitle={event.subtitle || "Global Event"}
                        description={event.description}
                        features={event.features || []}
                        imageUrl={event.posterUrl}
                        fillContainer
                      />
                    ) : (
                      /* ═══ SIDE CARDS: Simple image cards ═══ */
                      <div
                        className="relative w-full h-full overflow-hidden"
                        style={{
                          borderRadius: "12px",
                          backgroundColor: "#FFFBF2",
                          border: "1px solid rgba(230, 57, 70, 0.15)",
                          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                        }}
                      >
                        {event.posterUrl ? (
                          <img
                            alt={event.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            draggable="false"
                            src={event.posterUrl}
                            style={{ userSelect: "none" }}
                          />
                        ) : (
                          <div
                            className="absolute inset-0"
                            style={{
                              background: "linear-gradient(135deg, #e63946 0%, #780000 100%)",
                            }}
                          />
                        )}

                        {/* Dark gradient overlay */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 40%, transparent 70%)",
                          }}
                        />

                        {/* Text at bottom */}
                        <div
                          className="absolute bottom-0 left-0 right-0"
                          style={{ padding: "14px" }}
                        >
                          <h3
                            style={{
                              fontWeight: 600,
                              fontSize: "14px",
                              lineHeight: 1.3,
                              letterSpacing: "-0.02em",
                              color: "white",
                              margin: 0,
                            }}
                          >
                            {event.title}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ── Dot Indicators ── */}
              <div
                style={{
                  position: "absolute",
                  top: "82%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                {events.map((_, i) => {
                  const isActive = i === centerIndex;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCenterIndex(i);
                        if (timerRef.current) clearInterval(timerRef.current);
                        startTimer();
                      }}
                      style={{
                        width: isActive ? "28px" : "8px",
                        height: "8px",
                        borderRadius: "100px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: isActive ? "#D12027" : "rgba(0,0,0,0.15)",
                        transition: "all 400ms ease",
                        padding: 0,
                      }}
                      aria-label={`Go to event ${i + 1}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* ── MOBILE: Horizontal Sliding Flip Cards ── */}
            <div className="w-full flex md:hidden overflow-x-auto snap-x snap-mandatory gap-6 px-4 pb-12 pt-4 hide-scrollbar">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="snap-center flex-shrink-0"
                  style={{ width: "81vw", height: "430px" }}
                >
                  <CardFlip
                    title={event.title}
                    subtitle={event.subtitle || "Global Event"}
                    description={event.description}
                    features={event.features || []}
                    imageUrl={event.posterUrl}
                    fillContainer
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Spacer */}
        <div className="events-bottom-spacer" style={{ flexShrink: 0, width: "100%" }} aria-hidden="true" />

        {/* ── Explore More Link ── */}
        <div className="relative z-50">
          <a
            href="/events/past"
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
      <style>{`
        /* Mobile defaults */
        .events-top-spacer    { height: 5vh; }
        .events-label-mb      { margin-bottom: 12px; }
        .events-heading       { font-size: clamp(1.6rem, 7.5vw, 2.2rem); }
        .events-mid-spacer    { height: 20px; }
        .events-bottom-spacer { height: 20px; }

        /* Desktop overrides */
        @media (min-width: 768px) {
          .events-top-spacer    { height: 10vh; }
          .events-label-mb      { margin-bottom: 16px; }
          .events-heading       { font-size: clamp(2.6rem, 6.1vw, 6.1rem); }
          .events-mid-spacer    { height: 18px; }
          .events-bottom-spacer { height: 0px; margin-top: -40px; }
        }
        @media (min-width: 1024px) {
          .events-heading { font-size: 5.7rem; }
        }
      `}</style>
    </section>
  );
}
