"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CountdownTimer from "./CountdownTimer";

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

function MobileEventCard({ event, index, total }: { event: any; index: number; total: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const displayDate = formatEventDate(event.date, event.endDate);
  const countdownTarget = event.date ? `${event.date}T09:00:00` : "";
  const posterRatio = event.posterRatio || 3 / 4;

  return (
    <div
      ref={cardRef}
      style={{
        marginBottom: "64px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      {/* Event Number */}
      <span
        className="font-outfit"
        style={{
          fontSize: "48px",
          fontWeight: 200,
          color: "var(--foreground)",
          opacity: 0.1,
          display: "block",
          lineHeight: 1,
          marginBottom: "8px",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Image */}
      {event.posterUrl && (
        <div
          style={{
            width: "100%",
            aspectRatio: posterRatio,
            position: "relative",
            overflow: "hidden",
            marginBottom: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Image
            src={event.posterUrl}
            fill
            style={{ objectFit: "cover" }}
            alt={event.title}
            unoptimized
          />
        </div>
      )}

      {/* Title */}
      <h2
        className="font-outfit"
        style={{
          fontSize: "32px",
          fontWeight: 500,
          lineHeight: 1.1,
          color: "var(--accent)",
          marginBottom: "12px",
        }}
      >
        {event.title}
      </h2>

      {/* Date */}
      <p
        className="font-space-grotesk"
        style={{
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--foreground)",
          opacity: 0.5,
          marginBottom: "16px",
        }}
      >
        {displayDate}
      </p>

      {/* Description */}
      <p
        className="font-outfit"
        style={{
          fontSize: "15px",
          fontWeight: 300,
          lineHeight: 1.6,
          color: "var(--foreground)",
          opacity: 0.8,
          marginBottom: "20px",
        }}
      >
        {event.description}
      </p>

      {/* Highlights */}
      {event.highlights && event.highlights.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          {event.highlights.map((h: string) => (
            <p
              key={h}
              className="font-space-grotesk"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground)",
                marginBottom: "4px",
                lineHeight: 1.5,
              }}
            >
              • {h}
            </p>
          ))}
        </div>
      )}

      {/* Countdown Timer */}
      {countdownTarget && (
        <CountdownTimer targetDate={countdownTarget} />
      )}

      {/* Divider */}
      {index < total - 1 && (
        <div
          style={{
            marginTop: "40px",
            height: "1px",
            background: "rgba(57, 57, 57, 0.08)",
          }}
        />
      )}
    </div>
  );
}

export default function MobileUpcoming() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/['"]/g, "");
        const res = await fetch(`${API_URL}/api/v1/events?eventType=upcoming`);
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

  if (isLoading) {
    return (
      <section style={{ backgroundColor: "#FFFDE2", paddingTop: "100px", paddingBottom: "60px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-space-grotesk)" }}>
        <p style={{ fontSize: "15px", color: "var(--foreground)", opacity: 0.6 }}>Loading upcoming events...</p>
      </section>
    );
  }

  if (error || events.length === 0) {
    return (
      <section style={{ backgroundColor: "#FFFDE2", paddingTop: "100px", paddingBottom: "60px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-space-grotesk)" }}>
        <p style={{ fontSize: "15px", color: "var(--foreground)", opacity: 0.6 }}>No upcoming events scheduled at the moment.</p>
      </section>
    );
  }

  return (
    <section
      className="relative w-full"
      style={{
        backgroundColor: "#FFFDE2",
        backgroundImage:
          "linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.08) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.08) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.08) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.08) 76%, transparent 77%, transparent)",
        backgroundSize: "55px 55px",
        paddingTop: "100px",
        paddingBottom: "60px",
        minHeight: "100vh",
      }}
    >
      {/* Page Heading */}
      <h1
        className="font-space-grotesk"
        style={{
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--foreground)",
          opacity: 0.4,
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        Upcoming Events
      </h1>

      {/* Event Cards */}
      {events.map((event, i) => (
        <MobileEventCard key={event.id} event={event} index={i} total={events.length} />
      ))}
    </section>
  );
}
