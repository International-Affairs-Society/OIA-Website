"use client";
import React from "react";
import SkeletonPulse from "./SkeletonPulse";

/**
 * SkeletonTable
 *
 * YouTube-style skeleton for AdminTable.
 * Renders a shimmer header row + N body rows with configurable column count.
 *
 * @param columns  — number of columns (default 5)
 * @param rows     — number of body rows (default 6)
 * @param showActions — adds an extra narrow column on the right (default true)
 */

export interface SkeletonTableProps {
  columns?: number;
  rows?: number;
  showActions?: boolean;
}

export default function SkeletonTable({
  columns = 5,
  rows = 6,
  showActions = true,
}: SkeletonTableProps) {
  const totalCols = columns + (showActions ? 1 : 0);

  return (
    <div
      style={{
        width: "100%",
        border: "1px solid #b5bda0",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
          gap: "16px",
          padding: "16px",
          borderBottom: "1px solid #b5bda0",
        }}
      >
        {Array.from({ length: totalCols }).map((_, i) => (
          <SkeletonPulse
            key={`hdr-${i}`}
            width={i === totalCols - 1 && showActions ? "60px" : "80%"}
            height="12px"
            borderRadius="2px"
            style={
              i === totalCols - 1 && showActions
                ? { marginLeft: "auto" }
                : undefined
            }
          />
        ))}
      </div>

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
            gap: "16px",
            padding: "14px 16px",
            borderBottom:
              rowIdx < rows - 1 ? "1px solid #b5bda0" : "none",
            alignItems: "center",
          }}
        >
          {Array.from({ length: totalCols }).map((_, colIdx) => {
            // Vary widths per column for a natural look
            const widths = ["90%", "60%", "75%", "50%", "45%", "40%"];
            const w =
              colIdx === totalCols - 1 && showActions
                ? "70px"
                : widths[colIdx % widths.length];

            return (
              <SkeletonPulse
                key={`cell-${rowIdx}-${colIdx}`}
                width={w}
                height="14px"
                borderRadius="2px"
                style={
                  colIdx === totalCols - 1 && showActions
                    ? { marginLeft: "auto" }
                    : undefined
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
