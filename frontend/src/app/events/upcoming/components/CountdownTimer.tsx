"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const blocks = [
    { value: pad(timeLeft.days), label: "DAYS" },
    { value: pad(timeLeft.hours), label: "HOURS" },
    { value: pad(timeLeft.minutes), label: "MIN" },
    { value: pad(timeLeft.seconds), label: "SEC" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", transform: "scale(0.75)" }}>
      {blocks.map((block, i) => (
        <div key={block.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Digit Block */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                minWidth: "52px",
                textAlign: "center",
              }}
            >
              <span
                className="font-space-mono"
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "var(--foreground)",
                  opacity: 1,
                  display: "block",
                  lineHeight: 1,
                }}
              >
                {block.value}
              </span>
            </div>
            <span
              className="font-space-grotesk"
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--foreground)",
                opacity: 0.6,
                display: "block",
                fontWeight: 600,
              }}
            >
              {block.label}
            </span>
          </div>

          {/* Colon separator */}
          {i < blocks.length - 1 && (
            <span
              className="font-space-mono"
              style={{
                fontSize: "24px",
                fontWeight: 300,
                color: "var(--foreground)",
                opacity: 0.4, // Increased colon visibility
                marginBottom: "20px", // Adjusted alignment
              }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
