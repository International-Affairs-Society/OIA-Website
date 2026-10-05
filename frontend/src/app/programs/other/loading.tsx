import React from "react";
import Navbar from "@/app/homepage/Navbar";
import Pattern from "./components/Pattern";
import BackgroundMap from "./components/BackgroundMap";
import { ProgramGridSkeleton } from "./components/ProgramSkeleton";
import ProgramsFooter from "./components/ProgramsFooter";

export default function ProgramsLoading() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#f5f0e8",
      }}
    >
      <Pattern />

      {/* Floating Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Hero Section Skeleton */}
      <section
        className="relative z-30 flex flex-col items-center justify-center min-h-screen"
        style={{ transform: "translateY(-10vh)" }}
      >
        <div className="hidden md:block">
          <BackgroundMap />
        </div>
        <div className="w-full flex flex-col items-center relative z-10">
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif)",
              position: "relative",
              zIndex: 2,
            }}
            className="text-[22vw] sm:text-[16vw] lg:text-[243px] leading-[0.9] tracking-tight text-[#1a1a1a]"
          >
            Programs
          </h1>
          {/* Skeleton Filter Bar Placeholder */}
          <div style={{ width: "100%", maxWidth: "1400px", padding: "0 clamp(24px, 4vw, 64px)", position: "relative", zIndex: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "14px",
                marginTop: "24px",
              }}
            >
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    border: "1px solid rgba(212, 207, 196, 0.6)",
                    background:
                      "linear-gradient(90deg, rgba(235, 229, 215, 0.55) 0%, rgba(252, 249, 242, 0.9) 50%, rgba(235, 229, 215, 0.55) 100%)",
                    backgroundSize: "200% 100%",
                    animation: "skeletonShimmer 2.2s infinite ease-in-out",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid Skeleton */}
      <section
        id="programs-grid"
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1400px",
          width: "100%",
          margin: "15vh auto 0",
          padding: "0 clamp(24px, 4vw, 64px) 128px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
            gap: "80px 40px",
          }}
        >
          <ProgramGridSkeleton count={6} />
        </div>
      </section>

      {/* Footer */}
      <ProgramsFooter />
    </div>
  );
}
