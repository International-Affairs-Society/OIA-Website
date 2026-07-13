"use client";

import React, { useRef, useState, useCallback } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", style, onClick }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`liquid-glass-card ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: onClick ? "pointer" : "default",
        transform: isHovered ? "translateY(-3px) scale(1.005)" : "translateY(0) scale(1)",
        transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease",
        boxShadow: isHovered
          ? "0 20px 60px rgba(57,57,57,0.12), 0 4px 16px rgba(57,57,57,0.06)"
          : "0 8px 32px rgba(57,57,57,0.07), 0 2px 8px rgba(57,57,57,0.04)",
        willChange: "transform",
        ...style,
      }}
    >
      {/* Cursor-tracking specular shimmer */}
      <div
        className="liquid-glass-card-shine"
        style={{
          background: `radial-gradient(ellipse 260px 160px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.42) 0%, rgba(255,248,230,0.12) 50%, transparent 75%)`,
          opacity: isHovered ? 1 : 0.35,
        }}
      />

      {/* Prismatic ambient tint — fixed rainbow dispersion */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          borderRadius: "inherit",
          pointerEvents: "none",
          opacity: 0.18,
          background:
            "linear-gradient(135deg, rgba(255,220,180,0.4) 0%, rgba(220,235,255,0.2) 40%, rgba(200,255,220,0.15) 70%, rgba(255,200,235,0.2) 100%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Top-edge specular streak — glass catching overhead light */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "8%",
          right: "8%",
          height: "1.5px",
          zIndex: 3,
          borderRadius: "2px",
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.0) 5%, rgba(255,255,255,0.9) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 65%, rgba(255,255,255,0.0) 95%, transparent 100%)",
          opacity: isHovered ? 1 : 0.65,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Bottom golden chromatic shimmer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "20%",
          right: "20%",
          height: "1px",
          zIndex: 3,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, transparent, rgba(163,130,26,0.22) 30%, rgba(122,140,94,0.18) 60%, transparent)",
          opacity: isHovered ? 0.9 : 0.4,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Content */}
      <div className="liquid-glass-card-content">
        {children}
      </div>
    </div>
  );
}
