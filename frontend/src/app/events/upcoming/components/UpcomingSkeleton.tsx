"use client";
import React from "react";

// Reusable inline shimmer style generator
const shimmerStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, rgba(235, 229, 215, 0.55) 0%, rgba(252, 249, 242, 0.9) 50%, rgba(235, 229, 215, 0.55) 100%)",
  backgroundSize: "200% 100%",
  animation: "skeletonShimmer 2.2s infinite ease-in-out",
};

export function UpcomingCarouselSkeleton() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      {/* Left Dial Skeleton */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "200px",
          height: "100%",
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-120px",
            top: "50%",
            marginTop: "-150px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            border: "1px dashed rgba(57,57,57,0.25)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "40px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <span style={{ width: "20px", height: "1px", background: "rgba(57,57,57,0.3)" }} />
          <div
            style={{
              width: "90px",
              height: "12px",
              borderRadius: "4px",
              ...shimmerStyle,
            }}
          />
        </div>
      </div>

      {/* Center Slide Skeleton */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
          {/* Left: Poster Skeleton */}
          <div
            style={{
              width: "clamp(260px, 28vw, 360px)",
              aspectRatio: "3 / 4",
              borderRadius: "10px",
              border: "1px solid rgba(212, 207, 196, 0.4)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.06)",
              flexShrink: 0,
              ...shimmerStyle,
            }}
          />

          {/* Right: Content Column Skeleton */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Category Tag */}
            <div
              style={{
                width: "110px",
                height: "22px",
                borderRadius: "4px",
                ...shimmerStyle,
              }}
            />

            {/* Title Lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  width: "85%",
                  height: "44px",
                  borderRadius: "8px",
                  ...shimmerStyle,
                }}
              />
              <div
                style={{
                  width: "55%",
                  height: "44px",
                  borderRadius: "8px",
                  ...shimmerStyle,
                }}
              />
            </div>

            {/* Date and Location */}
            <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
              <div
                style={{
                  width: "130px",
                  height: "18px",
                  borderRadius: "4px",
                  ...shimmerStyle,
                }}
              />
              <div
                style={{
                  width: "100px",
                  height: "18px",
                  borderRadius: "4px",
                  ...shimmerStyle,
                }}
              />
            </div>

            {/* Description Paragraph */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
              <div style={{ width: "95%", height: "14px", borderRadius: "4px", ...shimmerStyle }} />
              <div style={{ width: "88%", height: "14px", borderRadius: "4px", ...shimmerStyle }} />
              <div style={{ width: "65%", height: "14px", borderRadius: "4px", ...shimmerStyle }} />
            </div>

            {/* Countdown Timer Blocks */}
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "8px",
                    border: "1px solid rgba(212, 207, 196, 0.4)",
                    ...shimmerStyle,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Thumbnail Strip Skeleton */}
      <div
        style={{
          position: "absolute",
          right: "28px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "4px",
              border: "1px solid rgba(212, 207, 196, 0.4)",
              ...shimmerStyle,
            }}
          />
        ))}
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

export function UpcomingMobileSkeleton() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "transparent",
        paddingTop: "100px",
        paddingBottom: "60px",
        minHeight: "100vh",
      }}
    >
      {/* Page Heading Skeleton */}
      <div style={{ padding: "0 20px 32px 20px" }}>
        <div
          style={{
            width: "200px",
            height: "36px",
            borderRadius: "6px",
            ...shimmerStyle,
          }}
        />
      </div>

      {/* Mobile Card Skeletons */}
      {[1, 2].map((n) => (
        <div
          key={n}
          style={{
            marginBottom: "48px",
            paddingLeft: "20px",
            paddingRight: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ width: "40px", height: "30px", borderRadius: "4px", ...shimmerStyle }} />
          <div
            style={{
              width: "100%",
              aspectRatio: "3 / 4",
              borderRadius: "8px",
              border: "1px solid rgba(212, 207, 196, 0.4)",
              ...shimmerStyle,
            }}
          />
          <div style={{ width: "90%", height: "26px", borderRadius: "6px", ...shimmerStyle }} />
          <div style={{ width: "50%", height: "16px", borderRadius: "4px", ...shimmerStyle }} />
          <div style={{ width: "100%", height: "14px", borderRadius: "4px", ...shimmerStyle }} />
          <div style={{ width: "75%", height: "14px", borderRadius: "4px", ...shimmerStyle }} />
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            {[1, 2, 3, 4].map((box) => (
              <div
                key={box}
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "6px",
                  ...shimmerStyle,
                }}
              />
            ))}
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
