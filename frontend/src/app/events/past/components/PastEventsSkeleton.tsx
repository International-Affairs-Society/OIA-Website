"use client";
import React from "react";

// Translucent beige shimmer for past events dark theme
const pastShimmerStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(235, 229, 215, 0.12) 0%, rgba(250, 246, 238, 0.32) 50%, rgba(235, 229, 215, 0.12) 100%)",
  backgroundSize: "200% 100%",
  animation: "skeletonShimmer 2.2s infinite ease-in-out",
};

export function PastEventsHeroSkeleton() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#000000",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Orbit Circle Skeleton */}
      <div
        style={{
          position: "absolute",
          width: "clamp(300px, 60vw, 600px)",
          height: "clamp(300px, 60vw, 600px)",
          borderRadius: "50%",
          border: "1.5px dashed rgba(235, 229, 215, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      />

      {/* Heading Text Skeleton */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            width: "clamp(240px, 45vw, 480px)",
            height: "clamp(48px, 9vw, 84px)",
            borderRadius: "12px",
            ...pastShimmerStyle,
          }}
        />
        <div
          style={{
            width: "clamp(180px, 30vw, 320px)",
            height: "18px",
            borderRadius: "6px",
            ...pastShimmerStyle,
          }}
        />
      </div>

      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
}

export function PastTimelineSkeleton() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "60px 24px 140px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "90px",
      }}
    >
      {[1, 2].map((item, idx) => (
        <div
          key={item}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "40px",
            alignItems: "center",
          }}
        >
          {/* Card Image Skeleton */}
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: "12px",
              border: "1px solid rgba(235, 229, 215, 0.15)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              order: idx % 2 === 0 ? 1 : 2,
              ...pastShimmerStyle,
            }}
          />

          {/* Card Details Skeleton */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              order: idx % 2 === 0 ? 2 : 1,
            }}
          >
            <div
              style={{
                width: "90px",
                height: "20px",
                borderRadius: "4px",
                ...pastShimmerStyle,
              }}
            />
            <div
              style={{
                width: "80%",
                height: "36px",
                borderRadius: "8px",
                ...pastShimmerStyle,
              }}
            />
            <div
              style={{
                width: "100%",
                height: "14px",
                borderRadius: "4px",
                ...pastShimmerStyle,
              }}
            />
            <div
              style={{
                width: "90%",
                height: "14px",
                borderRadius: "4px",
                ...pastShimmerStyle,
              }}
            />
            <div
              style={{
                width: "60%",
                height: "14px",
                borderRadius: "4px",
                ...pastShimmerStyle,
              }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
}
