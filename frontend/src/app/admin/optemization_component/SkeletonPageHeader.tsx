"use client";
import React from "react";
import SkeletonPulse from "./SkeletonPulse";

/**
 * SkeletonPageHeader
 *
 * Mimics the AdminPageHeader layout while data is loading.
 * Shows a wide title bar and an optional button placeholder.
 */

export interface SkeletonPageHeaderProps {
  showAction?: boolean;
}

export default function SkeletonPageHeader({
  showAction = true,
}: SkeletonPageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingBottom: "1rem",
        marginBottom: "1.5rem",
        borderBottom: "1px solid #b5bda0",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <SkeletonPulse width="220px" height="42px" borderRadius="2px" />
        <SkeletonPulse width="140px" height="14px" borderRadius="2px" />
      </div>
      {showAction && (
        <SkeletonPulse
          width="120px"
          height="36px"
          borderRadius="2px"
        />
      )}
    </div>
  );
}
