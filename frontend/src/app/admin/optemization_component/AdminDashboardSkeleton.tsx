"use client";
import React from "react";
import SkeletonPulse from "./SkeletonPulse";
import SkeletonStatCard from "./SkeletonStatCard";
import SkeletonChart from "./SkeletonChart";

/**
 * AdminDashboardSkeleton
 *
 * Full-page skeleton for the admin analytics dashboard.
 * Mimics: section title → stat cards grid → charts grid.
 *
 * Usage:
 *   if (isLoading) return <AdminDashboardSkeleton />;
 */

export default function AdminDashboardSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      {/* Dashboard title */}
      <div>
        <SkeletonPulse width="280px" height="42px" borderRadius="2px" />
        <SkeletonPulse
          width="180px"
          height="14px"
          borderRadius="2px"
          style={{ marginTop: "8px" }}
        />
      </div>

      {/* Tab group skeleton */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[120, 100, 90, 110].map((w, i) => (
          <SkeletonPulse
            key={i}
            width={`${w}px`}
            height="36px"
            borderRadius="2px"
          />
        ))}
      </div>

      {/* Stat cards row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts row — 2 column */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: "16px",
        }}
      >
        <SkeletonChart variant="bar" height="220px" />
        <SkeletonChart variant="pie" height="220px" />
      </div>

      {/* Second charts row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: "16px",
        }}
      >
        <SkeletonChart variant="bar" height="200px" />
        <SkeletonChart variant="bar" height="200px" />
      </div>
    </div>
  );
}
