"use client";
import React from "react";

export interface StatusBadgeProps {
  status: string;
  variant: "active" | "archived" | "pending" | "approved" | "rejected" | "expired" | "draft" | "dormant";
}

export default function StatusBadge({ status, variant }: StatusBadgeProps) {
  let color = "";
  let border = "";

  switch (variant) {
    case "active":
    case "approved":
      color = "#4a6741";
      border = "1px solid #4a6741";
      break;
    case "pending":
      color = "#6b6b6b";
      border = "1px solid #6b6b6b";
      break;
    case "archived":
    case "dormant":
      color = "#6b6b6b";
      border = "1px dashed #6b6b6b";
      break;
    case "rejected":
      color = "#c0392b";
      border = "1px solid #c0392b";
      break;
    case "expired":
      color = "#c0392b";
      border = "1px dashed #c0392b";
      break;
    case "draft":
      color = "#1a1a1a";
      border = "1px dashed #1a1a1a";
      break;
    default:
      color = "#1a1a1a";
      border = "1px solid #1a1a1a";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color,
        border,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}
