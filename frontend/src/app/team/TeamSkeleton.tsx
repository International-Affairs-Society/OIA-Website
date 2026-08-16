"use client";
import React from "react";

const teamShimmerStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(235, 229, 215, 0.55) 0%, rgba(252, 249, 242, 0.9) 50%, rgba(235, 229, 215, 0.55) 100%)",
  backgroundSize: "200% 100%",
  animation: "skeletonShimmer 2.2s infinite ease-in-out",
};

export function TeamCardSkeleton({ isChampion = false }: { isChampion?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "300px",
        margin: "0 auto",
      }}
    >
      {/* 3:4 Portrait Photo Skeleton */}
      <div
        style={{
          width: "100%",
          aspectRatio: "3 / 4",
          borderRadius: "4px",
          marginBottom: "24px",
          border: "1px solid rgba(92, 107, 63, 0.12)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          ...teamShimmerStyle,
        }}
      />

      {/* Name and Role Skeletons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "65%",
            height: "24px",
            borderRadius: "4px",
            ...teamShimmerStyle,
          }}
        />
        <div
          style={{
            width: "45%",
            height: "14px",
            borderRadius: "3px",
            ...teamShimmerStyle,
          }}
        />

        {isChampion && (
          <div
            style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(92,107,63,0.15)",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div style={{ width: "55%", height: "14px", borderRadius: "3px", ...teamShimmerStyle }} />
            <div style={{ width: "70%", height: "12px", borderRadius: "3px", ...teamShimmerStyle }} />
          </div>
        )}
      </div>
    </div>
  );
}

export function TeamPageSkeleton() {
  return (
    <main
      style={{
        backgroundColor: "#f5f0e8",
        overflowX: "hidden",
        position: "relative",
        minHeight: "100vh",
      }}
    >
      {/* ── Hero Skeleton ── */}
      <section
        style={{
          height: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: "80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "140px",
            height: "14px",
            borderRadius: "4px",
            marginBottom: "20px",
            ...teamShimmerStyle,
          }}
        />
        <div
          style={{
            width: "clamp(260px, 40vw, 440px)",
            height: "clamp(48px, 9vw, 84px)",
            borderRadius: "10px",
            ...teamShimmerStyle,
          }}
        />
      </section>

      {/* ── Main Content Skeleton ── */}
      <div style={{ position: "relative", zIndex: 1, paddingBottom: "120px" }}>
        {/* Section 1: OIA TEAM */}
        <section
          style={{
            padding: "80px 5% 120px",
            borderBottom: "1px solid rgba(92,107,63,0.12)",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "80px 40px",
            }}
          >
            {[1, 2, 3, 4].map((n) => (
              <TeamCardSkeleton key={n} />
            ))}
          </div>
        </section>

        {/* Section 2: OIA INTERNS */}
        <section
          style={{
            padding: "120px 5%",
            borderBottom: "1px solid rgba(92,107,63,0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "260px",
              height: "48px",
              borderRadius: "8px",
              marginBottom: "80px",
              ...teamShimmerStyle,
            }}
          />
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "80px 40px",
              justifyContent: "center",
            }}
          >
            {[1, 2, 3].map((n) => (
              <TeamCardSkeleton key={n} />
            ))}
          </div>
        </section>
      </div>

      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </main>
  );
}
