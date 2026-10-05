"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CountdownTimer from "./CountdownTimer";
import { UpcomingCarouselSkeleton } from "./UpcomingSkeleton";
import { apiFetch } from "@/lib/apiFetch";

/* ── Word cap for description ── */
const DESC_WORD_LIMIT = 35;

function truncate(text: string, limit: number) {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return { short: text, truncated: false };
  return { short: words.slice(0, limit).join(" ") + "…", truncated: true };
}

/* ── Easing ── */
function smoothstep(t: number) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

function formatEventDate(startDateStr: string, endDateStr?: string | null) {
  if (!startDateStr) return "";
  const start = new Date(startDateStr);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const startMonth = months[start.getMonth()];
  const startDay = start.getDate();
  const startYear = start.getFullYear();

  if (!endDateStr) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const end = new Date(endDateStr);
  const endMonth = months[end.getMonth()];
  const endDay = end.getDate();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }
  if (startDay !== endDay) {
    return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear}`;
}

/* ── Single event slide ── */
function EventSlide({
  event,
  isActive,
  isPrev,
}: {
  event: any;
  isActive: boolean;
  isPrev: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { short, truncated } = truncate(event.description || "", DESC_WORD_LIMIT);

  // Reset read-more when switching events
  useEffect(() => { setExpanded(false); }, [event.id]);

  const displayDate = formatEventDate(event.date, event.endDate);
  const countdownTarget = event.date ? `${event.date}T09:00:00` : "";
  const posterRatio = event.posterRatio || (3 / 4);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? "auto" : "none",
        transition: "opacity 0.55s ease",
      }}
    >
      {/* ── Inner Row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "88%",
          maxWidth: "1100px",
          gap: "clamp(32px, 5vw, 70px)",
          paddingLeft: "clamp(40px, 5vw, 80px)",
        }}
      >
        {/* ── LEFT: Image card ── */}
        <div
          style={{
            flexShrink: 0,
            width: "clamp(230px, 27.6vw, 380px)",
            maxHeight: "65vh",
            aspectRatio: String(posterRatio),
            position: "relative",
            overflow: "hidden",
            borderRadius: "0px",
            boxShadow: "8px 12px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          {event.posterUrl && (
            <Image
              src={event.posterUrl}
              alt={event.title}
              fill
              className="object-cover"
              unoptimized
              priority={isActive}
            />
          )}
        </div>

        {/* ── RIGHT: Text block ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* ── Date ── */}
          <p
            className="font-space-grotesk"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "18px",
            }}
          >
            {displayDate}
          </p>

          {/* ── Title ── */}
          <h2
            className="font-outfit"
            style={{
              fontSize: "clamp(38px, 5.5vw, 78px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
              marginBottom: "clamp(18px, 3vh, 32px)",
            }}
          >
            {event.title}
          </h2>

          {/* ── Description with read more ── */}
          <div>
            <p
              className="font-outfit"
              style={{
                fontSize: "clamp(14px, 1.4vw, 17px)",
                fontWeight: 300,
                lineHeight: 1.7,
                color: "var(--foreground)",
                opacity: 0.75,
                maxWidth: "520px",
              }}
            >
              {expanded || !truncated ? event.description : short}
            </p>
            {truncated && (
              <button
                onClick={() => setExpanded((p) => !p)}
                style={{
                  marginTop: "10px",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "var(--font-space-grotesk)",
                  letterSpacing: "0.08em",
                  textDecoration: "underline",
                  color: "var(--accent)",
                  textTransform: "uppercase",
                }}
              >
                {expanded ? "Read Less ↑" : "Read More →"}
              </button>
            )}
          </div>

          {/* ── Highlights ── */}
          {event.highlights && event.highlights.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              {event.highlights.map((h: string) => (
                <p
                  key={h}
                  className="font-space-grotesk"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: "6px",
                    lineHeight: 1.5,
                  }}
                >
                  • {h}
                </p>
              ))}
            </div>
          )}

          {/* ── Location tag ── */}
          {event.location && (
            <span
              className="font-space-grotesk"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "22px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--foreground)",
                opacity: 0.5,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {event.location}
            </span>
          )}

          {/* ── Countdown timer ── */}
          {countdownTarget && (
            <div style={{ marginTop: "28px" }}>
              <CountdownTimer targetDate={countdownTarget} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UpcomingEventsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Number indicator refs ── */
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dialRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  /* ── Thumbnail strip on the right ── */
  const [thumbActive, setThumbActive] = useState(0);

  // Fetch events from backend API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/['"]/g, "");
        const res = await apiFetch(`/api/v1/events?eventType=upcoming`);
        if (res.ok) {
          const json = await res.json();
          setEvents(json.data || []);
        } else {
          setError("Failed to load events");
        }
      } catch (err) {
        console.error("Error loading upcoming events:", err);
        setError("Error loading upcoming events");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  /* ── GSAP ScrollTrigger: pin + scrub ── */
  useEffect(() => {
    if (isLoading || events.length === 0) return;

    const NUM = events.length;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${NUM * 450}vh`,
        pin: true,
        scrub: 1.2,
        id: "upcoming-carousel",
        onUpdate: (self) => {
          const progress = self.progress;
          const segmentSize = 1 / NUM;
          const rawSegment = progress / segmentSize;
          const segIdx = Math.min(Math.floor(rawSegment), NUM - 1);
          const segProgress = rawSegment - segIdx;
          const holdRatio = 0.7;

          let fromIdx = segIdx;
          let toIdx = Math.min(segIdx + 1, NUM - 1);
          let t = 0;

          if (segIdx >= NUM - 1) {
            fromIdx = NUM - 1;
            toIdx = NUM - 1;
            t = 0;
          } else if (segProgress <= holdRatio) {
            t = 0;
          } else {
            t = smoothstep((segProgress - holdRatio) / (1 - holdRatio));
          }

          /* Indicator position */
          if (indicatorRef.current) {
            gsap.set(indicatorRef.current, { top: `${(fromIdx + t) * 52 + 20}px` });
          }

          /* Dial rotation */
          const currentRotation = -(fromIdx + t) * 30;
          if (dialRef.current) {
            gsap.set(dialRef.current, { rotation: currentRotation });
          }

          numberRefs.current.forEach((el, i) => {
            if (!el) return;
            const dist = Math.abs(i - (fromIdx + t));
            let opacity = 1 - dist * 0.7;
            if (opacity < 0.4) opacity = 0.4;
            const scale = 1 + (1 - Math.min(dist, 1)) * 0.2;
            gsap.set(el, { rotation: -currentRotation, opacity, scale, transformOrigin: "center center" });
          });

          const newIdx = Math.max(0, Math.min(Math.round(rawSegment), NUM - 1));
          if (newIdx !== activeIndexRef.current) {
            setPrevIndex(activeIndexRef.current);
            activeIndexRef.current = newIdx;
            setActiveIndex(newIdx);
            setThumbActive(newIdx);
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoading, events]);

  /* ── Scroll to specific event on thumbnail click ── */
  const scrollToEvent = (targetIdx: number) => {
    const st = ScrollTrigger.getAll().find((t) => t.vars.id === "upcoming-carousel");
    if (!st) return;
    const NUM = events.length;
    const targetProgress = targetIdx / NUM + 0.01;
    const targetScroll = st.start + (st.end - st.start) * targetProgress;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  if (isLoading) {
    return <UpcomingCarouselSkeleton />;
  }

  if (error || events.length === 0) {
    return (
      <section style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", fontFamily: "var(--font-space-grotesk)" }}>
        <p style={{ fontSize: "16px", color: "var(--foreground)", opacity: 0.6 }}>No upcoming events scheduled at the moment.</p>
      </section>
    );
  }

  const NUM = events.length;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        height: "100vh",
        backgroundColor: "transparent",
      }}
    >
      {/* ── Decorative dial (left edge) ── */}
      <div style={{ position: "absolute", left: 0, top: 0, width: "200px", height: "100%", pointerEvents: "none", zIndex: 20 }}>
        <div style={{ position: "absolute", left: "-120px", top: "50%", marginTop: "-150px", width: "300px", height: "300px", borderRadius: "50%", border: "1px dashed rgba(57,57,57,0.6)", pointerEvents: "none" }} />
        <div ref={dialRef} style={{ position: "absolute", left: "-120px", top: "50%", marginTop: "-150px", width: "300px", height: "300px", borderRadius: "50%", pointerEvents: "none" }}>
          {events.map((event, i) => {
            const angle = i * 30;
            const rad = (angle * Math.PI) / 180;
            const r = 150;
            const x = r + r * Math.cos(rad);
            const y = r + r * Math.sin(rad);
            
            // Extract month and day safely using the start date object
            const start = new Date(event.date);
            const monthShort = start.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const dayFirst = start.getDate().toString();
            const shortDate = `${monthShort} ${dayFirst}`;

            return (
              <div
                key={event.id}
                onClick={() => scrollToEvent(i)}
                style={{ position: "absolute", left: `${x}px`, top: `${y}px`, width: "52px", height: "36px", marginLeft: "-26px", marginTop: "-18px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", pointerEvents: "auto", zIndex: 21 }}
              >
                <span
                  ref={(el) => { numberRefs.current[i] = el; }}
                  className="font-space-grotesk"
                  style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.3 }}
                >
                  {shortDate}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: "40px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
          <span style={{ width: "20px", height: "1px", background: "var(--foreground)", opacity: 0.3 }} />
          <span className="font-space-grotesk" style={{ fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--foreground)", opacity: 0.5 }}>
            Upcoming Events
          </span>
        </div>
      </div>

      {/* ── Slides container ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        {events.map((event, i) => (
          <EventSlide
            key={event.id}
            event={event}
            isActive={i === activeIndex}
            isPrev={i === prevIndex}
          />
        ))}
      </div>

      {/* ── Thumbnail strip (right edge) ── */}
      <div style={{ position: "absolute", right: "28px", top: "50%", transform: "translateY(-50%)", zIndex: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
          <div ref={indicatorRef} style={{ position: "absolute", left: "-20px", width: "12px", height: "1px", background: "var(--foreground)", top: "20px", transform: "translateY(-50%)", zIndex: 11 }} />
          {events.map((event, i) => (
            <div
              key={event.id}
              onClick={() => scrollToEvent(i)}
              style={{ width: "40px", height: "40px", overflow: "hidden", opacity: thumbActive === i ? 1 : 0.4, transition: "opacity 0.4s ease", cursor: "pointer" }}
            >
              {event.posterUrl && (
                <Image src={event.posterUrl} width={40} height={40} style={{ objectFit: "cover", width: "100%", height: "100%" }} alt={event.title} unoptimized />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll prompt ── */}
      <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10 }}>
        <p className="font-space-grotesk" style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--foreground)", opacity: 0.3, fontWeight: 500 }}>
          scroll to know more events ↓
        </p>
      </div>
    </section>
  );
}
