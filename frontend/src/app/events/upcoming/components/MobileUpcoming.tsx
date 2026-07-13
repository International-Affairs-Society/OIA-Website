"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOCK_UPCOMING_EVENTS } from "../data/mockUpcomingEvents";
import CountdownTimer from "./CountdownTimer";

const events = MOCK_UPCOMING_EVENTS;

function MobileEventCard({ event, index }: { event: (typeof events)[0]; index: number }) {
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
        {event.id}
      </span>

      {/* Image */}
      <div
        style={{
          width: "100%",
          aspectRatio: event.posterRatio || 3 / 4,
          position: "relative",
          overflow: "hidden",
          marginBottom: "20px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Image
          src={event.thumbnail}
          fill
          style={{ objectFit: "cover" }}
          alt={event.title}
          unoptimized
        />
      </div>

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
        {event.date}
      </p>

      {/* Highlights */}
      <div style={{ marginBottom: "20px" }}>
        {event.highlights.map((h) => (
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
            {h}
          </p>
        ))}
      </div>

      {/* Countdown Timer */}
      <CountdownTimer targetDate={event.eventDate} />

      {/* Divider */}
      {index < events.length - 1 && (
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
  return (
    <section
      className="relative w-full"
      style={{
        backgroundColor: "#FFFDE2",
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
        <MobileEventCard key={event.id} event={event} index={i} />
      ))}
    </section>
  );
}
