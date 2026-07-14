"use client";
import React from "react";

/**
 * SkeletonPulse
 * 
 * Base building block for all skeleton loaders.
 * Renders a shimmer-animated rectangle that mimics YouTube's skeleton loading pattern.
 * 
 * @param width   — CSS width (default "100%")
 * @param height  — CSS height (default "16px")
 * @param borderRadius — CSS border-radius (default "4px")
 * @param style   — Additional inline styles
 */

export interface SkeletonPulseProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export default function SkeletonPulse({
  width = "100%",
  height = "16px",
  borderRadius = "4px",
  style,
  className,
}: SkeletonPulseProps) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes skeleton-shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
        `,
        }}
      />
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius,
          background:
            "linear-gradient(90deg, #e8e2d6 25%, #ded8cc 37%, #e8e2d6 63%)",
          backgroundSize: "800px 100%",
          animation: "skeleton-shimmer 1.6s ease-in-out infinite",
          ...style,
        }}
      />
    </>
  );
}
