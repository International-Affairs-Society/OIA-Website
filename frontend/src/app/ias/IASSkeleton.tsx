"use client";
import React from "react";

const iasShimmerStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(235, 229, 215, 0.08) 0%, rgba(250, 246, 238, 0.25) 50%, rgba(235, 229, 215, 0.08) 100%)",
  backgroundSize: "200% 100%",
  animation: "skeletonShimmer 2.2s infinite ease-in-out",
};

export function IASHeroSkeleton() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
      {/* Globe Placeholder Circle Outline */}
      <div
        style={{
          position: "absolute",
          width: "clamp(300px, 50vw, 550px)",
          height: "clamp(300px, 50vw, 550px)",
          borderRadius: "50%",
          border: "1px dashed rgba(235, 229, 215, 0.15)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      {/* Main Headline Skeleton */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          textAlign: "center",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "clamp(260px, 60vw, 650px)",
            height: "clamp(42px, 8vw, 78px)",
            borderRadius: "10px",
            ...iasShimmerStyle,
          }}
        />
        <div
          style={{
            width: "clamp(200px, 45vw, 480px)",
            height: "clamp(42px, 8vw, 78px)",
            borderRadius: "10px",
            ...iasShimmerStyle,
          }}
        />
        <div
          style={{
            width: "160px",
            height: "18px",
            borderRadius: "4px",
            marginTop: "12px",
            ...iasShimmerStyle,
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

export function IASAboutSkeleton() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "#0a0a0a",
        padding: "120px 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* Label */}
        <div style={{ width: "120px", height: "16px", borderRadius: "4px", ...iasShimmerStyle }} />

        {/* Heading */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ width: "100%", height: "48px", borderRadius: "8px", ...iasShimmerStyle }} />
          <div style={{ width: "85%", height: "48px", borderRadius: "8px", ...iasShimmerStyle }} />
          <div style={{ width: "65%", height: "48px", borderRadius: "8px", ...iasShimmerStyle }} />
        </div>

        {/* Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          <div style={{ width: "95%", height: "16px", borderRadius: "4px", ...iasShimmerStyle }} />
          <div style={{ width: "90%", height: "16px", borderRadius: "4px", ...iasShimmerStyle }} />
          <div style={{ width: "70%", height: "16px", borderRadius: "4px", ...iasShimmerStyle }} />
        </div>
      </div>
    </section>
  );
}

export function IASTeamsSkeleton() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "#0a0a0a",
        padding: "80px 24px 140px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section Heading */}
        <div style={{ width: "220px", height: "42px", borderRadius: "8px", marginBottom: "48px", ...iasShimmerStyle }} />

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "56px", flexWrap: "wrap" }}>
          {[1, 2, 3, 4].map((tab) => (
            <div
              key={tab}
              style={{
                width: "110px",
                height: "38px",
                borderRadius: "20px",
                border: "1px solid rgba(235, 229, 215, 0.12)",
                ...iasShimmerStyle,
              }}
            />
          ))}
        </div>

        {/* Member Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "40px 30px",
          }}
        >
          {[1, 2, 3, 4].map((card) => (
            <div
              key={card}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(235, 229, 215, 0.08)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "3 / 4",
                  borderRadius: "8px",
                  ...iasShimmerStyle,
                }}
              />
              <div style={{ width: "70%", height: "20px", borderRadius: "4px", ...iasShimmerStyle }} />
              <div style={{ width: "45%", height: "14px", borderRadius: "3px", ...iasShimmerStyle }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IASPageSkeleton() {
  return (
    <main style={{ backgroundColor: "#0a0a0a", color: "#ffffff", overflow: "hidden" }}>
      <IASHeroSkeleton />
      <IASAboutSkeleton />
      <IASTeamsSkeleton />
    </main>
  );
}
