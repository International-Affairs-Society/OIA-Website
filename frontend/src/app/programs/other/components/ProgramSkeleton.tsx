"use client";
import React from "react";

const programShimmerStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(235, 229, 215, 0.55) 0%, rgba(252, 249, 242, 0.9) 50%, rgba(235, 229, 215, 0.55) 100%)",
  backgroundSize: "200% 100%",
  animation: "skeletonShimmer 2.2s infinite ease-in-out",
};

export function ProgramCardSkeleton({ index = 0 }: { index?: number }) {
  const titleWidths = ["85%", "70%", "92%", "78%", "65%", "88%"];
  const titleW = titleWidths[index % titleWidths.length];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
      }}
    >
      {/* 1. Image Container Skeleton */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid rgba(212, 207, 196, 0.45)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
          ...programShimmerStyle,
        }}
      >
        {/* Decorative inner badge placeholder */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "rgba(220, 213, 196, 0.5)",
          }}
        />
        {/* Bottom slider dots placeholder */}
        <div
          style={{
            position: "absolute",
            bottom: "14px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div style={{ width: "16px", height: "6px", borderRadius: "3px", backgroundColor: "rgba(255, 255, 255, 0.7)" }} />
          <div style={{ width: "6px", height: "6px", borderRadius: "3px", backgroundColor: "rgba(255, 255, 255, 0.4)" }} />
          <div style={{ width: "6px", height: "6px", borderRadius: "3px", backgroundColor: "rgba(255, 255, 255, 0.4)" }} />
        </div>
      </div>

      {/* 2. Text Container Skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Title + Date Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div
              style={{
                width: titleW,
                height: "22px",
                borderRadius: "6px",
                ...programShimmerStyle,
              }}
            />
            {index % 2 === 0 && (
              <div
                style={{
                  width: "48%",
                  height: "22px",
                  borderRadius: "6px",
                  ...programShimmerStyle,
                }}
              />
            )}
          </div>
          <div
            style={{
              width: "80px",
              height: "16px",
              borderRadius: "4px",
              flexShrink: 0,
              marginTop: "2px",
              ...programShimmerStyle,
            }}
          />
        </div>

        {/* Category + Explore More Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <div
            style={{
              width: "110px",
              height: "14px",
              borderRadius: "4px",
              ...programShimmerStyle,
            }}
          />
          <div
            style={{
              width: "70px",
              height: "14px",
              borderRadius: "4px",
              ...programShimmerStyle,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProgramGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProgramCardSkeleton key={i} index={i} />
      ))}
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );
}

export function ProgramDetailSkeleton() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "1100px",
        width: "100%",
        margin: "0 auto",
        padding: "160px clamp(24px, 4vw, 64px) 100px",
        boxSizing: "border-box",
      }}
    >
      {/* Back button */}
      <div
        style={{
          width: "130px",
          height: "16px",
          borderRadius: "4px",
          marginBottom: "48px",
          ...programShimmerStyle,
        }}
      />

      {/* Heading Skeleton */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "clamp(280px, 60vw, 700px)",
            height: "clamp(48px, 8vw, 80px)",
            borderRadius: "10px",
            ...programShimmerStyle,
          }}
        />
        <div
          style={{
            width: "160px",
            height: "20px",
            borderRadius: "4px",
            marginTop: "8px",
            ...programShimmerStyle,
          }}
        />
      </div>

      {/* Hero 16:9 Image Slider Skeleton */}
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(212, 207, 196, 0.45)",
          marginBottom: "56px",
          boxShadow: "0 14px 40px rgba(0,0,0,0.04)",
          ...programShimmerStyle,
        }}
      />

      {/* Eligibility Tags Skeleton */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          paddingBottom: "32px",
          marginBottom: "40px",
          borderBottom: "1px solid #d4cfc4",
        }}
      >
        <div style={{ width: "110px", height: "28px", borderRadius: "14px", ...programShimmerStyle }} />
        <div style={{ width: "140px", height: "28px", borderRadius: "14px", ...programShimmerStyle }} />
        <div style={{ width: "95px", height: "28px", borderRadius: "14px", ...programShimmerStyle }} />
        <div style={{ width: "125px", height: "28px", borderRadius: "14px", ...programShimmerStyle }} />
      </div>

      {/* Content Columns Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "40px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "140px", height: "24px", borderRadius: "6px", ...programShimmerStyle }} />
          <div style={{ width: "100%", height: "16px", borderRadius: "4px", ...programShimmerStyle }} />
          <div style={{ width: "88%", height: "16px", borderRadius: "4px", ...programShimmerStyle }} />
          <div style={{ width: "92%", height: "16px", borderRadius: "4px", ...programShimmerStyle }} />
          <div style={{ width: "70%", height: "16px", borderRadius: "4px", ...programShimmerStyle }} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid rgba(212, 207, 196, 0.5)",
            backgroundColor: "rgba(247, 243, 236, 0.6)",
          }}
        >
          <div style={{ width: "110px", height: "20px", borderRadius: "4px", ...programShimmerStyle }} />
          <div style={{ width: "150px", height: "32px", borderRadius: "6px", ...programShimmerStyle }} />
          <div style={{ width: "100%", height: "14px", borderRadius: "4px", ...programShimmerStyle }} />
          <div style={{ width: "100%", height: "42px", borderRadius: "8px", marginTop: "16px", ...programShimmerStyle }} />
        </div>
      </div>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
