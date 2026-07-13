import React from "react";

type BadgeVariant = "verified" | "pending" | "rejected" | "info";

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

export default function StatusBadge({ variant, label, className = "" }: StatusBadgeProps) {
  let bg, color, border;

  switch (variant) {
    case "verified":
      bg = "rgba(122, 140, 94, 0.15)";
      border = "1px solid rgba(122, 140, 94, 0.28)";
      color = "#5A6E3A";
      break;
    case "pending":
      bg = "rgba(200, 160, 60, 0.12)";
      border = "1px solid rgba(200, 160, 60, 0.25)";
      color = "#9A7A20";
      break;
    case "rejected":
      bg = "rgba(180, 60, 60, 0.12)";
      border = "1px solid rgba(180, 60, 60, 0.22)";
      color = "#A04040";
      break;
    case "info":
      bg = "rgba(122, 140, 94, 0.15)";
      border = "1px solid rgba(122, 140, 94, 0.25)";
      color = "#5A6E3A";
      break;
  }

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 10px",
        borderRadius: "8px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        flexShrink: 0,
        textTransform: "uppercase",
        backgroundColor: bg,
        border: border,
        color: color,
        fontFamily: "var(--font-space-grotesk)",
      }}
    >
      {label}
    </span>
  );
}
