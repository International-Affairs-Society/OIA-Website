"use client";
import React from "react";
import SkeletonPulse from "./SkeletonPulse";

/**
 * SkeletonChart
 *
 * Mimics a chart container (bar chart, pie chart, etc.) while data loads.
 * Renders a title shimmer + a tall placeholder area with decorative bars.
 *
 * @param height — container height (default "260px")
 * @param variant — "bar" shows vertical bars, "pie" shows a circle (default "bar")
 */

export interface SkeletonChartProps {
  height?: string | number;
  variant?: "bar" | "pie";
}

export default function SkeletonChart({
  height = "260px",
  variant = "bar",
}: SkeletonChartProps) {
  return (
    <div
      style={{
        border: "1px solid #b5bda0",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Chart title */}
      <SkeletonPulse width="140px" height="14px" borderRadius="2px" />

      {/* Chart area */}
      <div
        style={{
          height,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: variant === "pie" ? "center" : "space-around",
          gap: variant === "pie" ? 0 : "12px",
          padding: variant === "pie" ? "20px" : "0 8px",
        }}
      >
        {variant === "bar" ? (
          // Vertical bars at varying heights
          <>
            {[65, 40, 80, 55, 70, 35, 90, 50].map((pct, i) => (
              <SkeletonPulse
                key={i}
                width="100%"
                height={`${pct}%`}
                borderRadius="2px 2px 0 0"
              />
            ))}
          </>
        ) : (
          // Circular placeholder for pie charts
          <SkeletonPulse
            width="160px"
            height="160px"
            borderRadius="50%"
          />
        )}
      </div>
    </div>
  );
}
