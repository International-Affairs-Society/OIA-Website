"use client";
import React from "react";
import SkeletonPulse from "./SkeletonPulse";

/**
 * SkeletonStatCard
 *
 * Mimics the dashboard stat-card layout (big number + label + mini chart).
 * Renders as the same bordered box used across the admin analytics dashboard.
 */

export default function SkeletonStatCard() {
  return (
    <div
      style={{
        border: "1px solid #b5bda0",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minHeight: "120px",
      }}
    >
      {/* Label */}
      <SkeletonPulse width="60%" height="12px" borderRadius="2px" />
      {/* Big number */}
      <SkeletonPulse width="40%" height="32px" borderRadius="2px" />
      {/* Mini trend bar */}
      <SkeletonPulse width="80%" height="8px" borderRadius="2px" />
    </div>
  );
}
