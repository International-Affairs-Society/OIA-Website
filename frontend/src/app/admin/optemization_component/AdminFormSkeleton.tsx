"use client";
import React from "react";
import SkeletonPageHeader from "./SkeletonPageHeader";
import SkeletonFormField from "./SkeletonFormField";
import SkeletonPulse from "./SkeletonPulse";

/**
 * AdminFormSkeleton
 *
 * Skeleton for admin create/edit form pages.
 * Shows a page header + a grid of form field placeholders.
 *
 * @param fields — number of form fields to show (default 6)
 */

export interface AdminFormSkeletonProps {
  fields?: number;
}

export default function AdminFormSkeleton({
  fields = 6,
}: AdminFormSkeletonProps) {
  const labelWidths = ["80px", "120px", "100px", "140px", "90px", "110px", "130px", "70px"];

  return (
    <div style={{ width: "100%", maxWidth: "800px" }}>
      <SkeletonPageHeader showAction={false} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {Array.from({ length: fields }).map((_, i) => (
          <SkeletonFormField
            key={i}
            labelWidth={labelWidths[i % labelWidths.length]}
            inputHeight={i === fields - 1 ? "80px" : "38px"}
          />
        ))}
      </div>

      {/* Submit button */}
      <SkeletonPulse width="160px" height="40px" borderRadius="2px" />
    </div>
  );
}
