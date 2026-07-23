"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import CircuitPattern from "./CircuitPattern";

// ============================================================
// DATA CONSTANTS — Replace with API calls when backend is ready
// ============================================================

interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  location: string;
  date: string;
  posterUrl: string;
}

const FALLBACK_EVENT: UpcomingEvent = {
  id: "1",
  title: "Inaugural Global Symposium",
  description:
    "Join us for the first annual IAS Global Symposium, bringing together student delegates from 20+ countries to debate and draft resolutions on climate diplomacy and international trade.",
  highlights: ["Panel discussions with diplomats", "Student-led MUN sessions"],
  location: "Bennett University, Greater Noida",
  date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
  posterUrl:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop",
};

// ============================================================

function useCountdown(targetDate: string) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, over: true });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const calcDiff = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        over: false,
      };
    };

    setTime(calcDiff());
    const id = setInterval(() => setTime(calcDiff()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return { ...time, isMounted };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span
        style={{
          fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
          fontWeight: 700,
          fontFamily: "var(--font-space-grotesk)",
          color: "var(--foreground)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          minWidth: "2.4ch",
          textAlign: "center",
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        style={{
          fontSize: "8px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(57,57,57,0.4)",
          marginTop: "4px",
          fontFamily: "var(--font-roboto-condensed)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function UpcomingEventSection() {
  const [event, setEvent] = useState<UpcomingEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const displayEvent = event ?? FALLBACK_EVENT;
  const countdown = useCountdown(displayEvent.date);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${API_URL}/api/v1/events`);
        if (res.ok) {
          const json = await res.json();
          const now = Date.now();
          const upcoming = (json.data || [])
            .filter(
              (e: any) =>
                !e.is_archived &&
                (e.event_type === "upcoming" ||
                  new Date(e.date || e.start_date).getTime() > now)
            )
            .sort(
              (a: any, b: any) =>
                new Date(a.date || a.start_date).getTime() -
                new Date(b.date || b.start_date).getTime()
            );
          if (upcoming.length > 0) {
            const e = upcoming[0];
            setEvent({
              id: e.id,
              title: e.title,
              description: e.description || "",
              highlights: e.highlights || [],
              location: e.location || "Bennett University",
              date: e.date || e.start_date,
              posterUrl:
                (e.poster_url ||
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop").replace("localhost", "127.0.0.1"),
            });
            return;
          }
        }
      } catch {
        // fall through to fallback
      }
      setEvent(FALLBACK_EVENT);
    };
    fetchEvent();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const formattedDate = (() => {
    try {
      return new Date(displayEvent.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch { return ""; }
  })();

  return (
    <section
      id="upcoming-event"
      ref={sectionRef}
      style={{
        backgroundColor: "var(--background)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "80px 0",
      }}
    >
      {/* Grid background */}
      <CircuitPattern />

      <div
        style={{
          position: "relative",
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "0 40px",
          width: "100%",
        }}
      >
        {/* ── Section label + heading row ── */}
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            marginBottom: "36px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(57,57,57,0.38)",
                fontFamily: "var(--font-roboto-condensed)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Don&apos;t miss out
            </span>
            <h2
              style={{
                fontFamily: "var(--font-zodiak), serif",
                fontSize: "clamp(2.5rem, 4.6vw, 3.7rem)",
                fontWeight: 400,
                color: "var(--foreground)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Upcoming Event
            </h2>
          </div>

        </div>

        {/* ── Main card ── */}
        <div
          className="uev-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.3fr",
            gap: "56px",
            alignItems: "start",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.85s ease 0.15s, transform 0.85s ease 0.15s",
          }}
        >
          {/* LEFT — Poster + Countdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Poster */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "0px",
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.15)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)",
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <Image
                src={displayEvent.posterUrl}
                alt={displayEvent.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 42vw"
                priority
                unoptimized={displayEvent.posterUrl.includes("127.0.0.1") || displayEvent.posterUrl.includes("localhost")}
              />
            </div>

          </div>

          {/* RIGHT — Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#D12027",
                fontFamily: "var(--font-roboto-condensed)",
              }}
            >
              {formattedDate}
            </span>

            <h3
              style={{
                fontFamily: "var(--font-zodiak), serif",
                fontSize: "clamp(2.4rem, 4.6vw, 4.1rem)",
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              {displayEvent.title}
            </h3>

            <div style={{ height: "1px", background: "rgba(0,0,0,0.07)" }} />

            <p
              style={{
                fontSize: "clamp(13px, 1.1vw, 15px)",
                lineHeight: 1.72,
                color: "rgba(57,57,57,0.6)",
                fontFamily: "var(--font-space-grotesk)",
                margin: 0,
              }}
            >
              {displayEvent.description}
            </p>

            {displayEvent.highlights.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {displayEvent.highlights.map((h, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      fontSize: "13px",
                      color: "rgba(57,57,57,0.68)",
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#D12027", flexShrink: 0 }} />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {displayEvent.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(57,57,57,0.36)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(57,57,57,0.36)", fontFamily: "var(--font-roboto-condensed)" }}>
                  {displayEvent.location}
                </span>
              </div>
            )}
            {/* Countdown moved below text */}
            <div style={{ marginTop: "12px", minHeight: "60px" }}>
              {!countdown.isMounted ? null : !countdown.over ? (
                <div
                  style={{
                    background: "rgba(0,0,0,0.03)",
                    border: "1px solid rgba(0,0,0,0.07)",
                    borderRadius: "0px",
                    padding: "14px 20px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    justifyContent: "flex-start",
                  }}
                >
                  <CountdownUnit value={countdown.days} label="Days" />
                  <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "rgba(57,57,57,0.22)", lineHeight: 1, paddingBottom: "12px" }}>:</span>
                  <CountdownUnit value={countdown.hours} label="Hours" />
                  <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "rgba(57,57,57,0.22)", lineHeight: 1, paddingBottom: "12px" }}>:</span>
                  <CountdownUnit value={countdown.minutes} label="Min" />
                  <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "rgba(57,57,57,0.22)", lineHeight: 1, paddingBottom: "12px" }}>:</span>
                  <CountdownUnit value={countdown.seconds} label="Sec" />
                </div>
              ) : (
                <div style={{ display: "inline-block", padding: "12px 24px", borderRadius: "0px", background: "rgba(209,32,39,0.06)", border: "1px solid rgba(209,32,39,0.12)", fontSize: "12px", fontWeight: 600, color: "#D12027", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-roboto-condensed)" }}>
                  Event is Live!
                </div>
              )}
            </div>

            {/* Explore More Button moved here */}
            <div style={{ marginTop: "12px" }}>
              <Link
                href="/events/upcoming"
                id="upcoming-event-explore-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "11px 24px",
                  backgroundColor: "var(--foreground)",
                  color: "var(--background)",
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                  transition: "background 0.22s ease, transform 0.18s ease",
                  fontFamily: "var(--font-space-grotesk)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#D12027";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--foreground)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                Explore More
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .uev-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </section>
  );
}
