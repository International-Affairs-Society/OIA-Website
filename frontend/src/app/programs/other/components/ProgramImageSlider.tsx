"use client";

import React, { useState } from "react";
import Image from "next/image";

type ProgramImageSliderProps = {
  images: string[];
  title: string;
};

export default function ProgramImageSlider({ images, title }: ProgramImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // If only one image, just render it normally without arrows
  if (!images || images.length <= 1) {
    return (
      <div className="relative w-full overflow-hidden bg-gray-200" style={{ aspectRatio: "16 / 10" }}>
        <Image
          src={images?.[0] || ""}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
    );
  }

  const goLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goRight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full overflow-hidden bg-gray-200"
      style={{ aspectRatio: "16 / 10" }}
    >
      {/* Current Image */}
      <Image
        src={images[currentIndex]}
        alt={`${title} - Image ${currentIndex + 1}`}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      />

      {/* Left Arrow */}
      <button
        onClick={goLeft}
        aria-label="Previous Image"
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 50,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.9)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? "auto" : "none",
          transition: "transform 0.2s, background-color 0.2s, opacity 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          e.currentTarget.style.backgroundColor = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={goRight}
        aria-label="Next Image"
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 50,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.9)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? "auto" : "none",
          transition: "transform 0.2s, background-color 0.2s, opacity 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          e.currentTarget.style.backgroundColor = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "6px",
          zIndex: 50,
        }}
      >
        {images.map((_, i) => (
          <div
            key={i}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(i);
            }}
            style={{
              width: i === currentIndex ? "16px" : "6px",
              height: "6px",
              borderRadius: "3px",
              backgroundColor: i === currentIndex ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
