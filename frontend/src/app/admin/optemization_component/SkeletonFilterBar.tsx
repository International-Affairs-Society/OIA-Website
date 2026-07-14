"use client";
import React from "react";
import SkeletonPulse from "./SkeletonPulse";

/**
 * SkeletonFilterBar
 *
 * Mimics the FilterBar component — search box + dropdown filters on the right.
 *
 * @param filterCount — number of filter dropdowns to show (default 2)
 */

export interface SkeletonFilterBarProps {
  filterCount?: number;
}

export default function SkeletonFilterBar({
  filterCount = 2,
}: SkeletonFilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        paddingBottom: "12px",
        marginBottom: "16px",
        borderBottom: "1px solid #b5bda0",
      }}
    >
      {/* Search bar */}
      <SkeletonPulse width="260px" height="32px" borderRadius="2px" />

      {/* Filter dropdowns */}
      <div style={{ display: "flex", gap: "12px" }}>
        {Array.from({ length: filterCount }).map((_, i) => (
          <SkeletonPulse
            key={i}
            width="110px"
            height="32px"
            borderRadius="2px"
          />
        ))}
      </div>
    </div>
  );
}
