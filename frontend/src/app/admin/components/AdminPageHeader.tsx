"use client";
import React from "react";

import AdminButton from "./AdminButton";

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  onBack?: () => void;
}

export default function AdminPageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: AdminPageHeaderProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "flex-end",
        gap: isMobile ? "12px" : "0",
        paddingBottom: "1rem",
        marginBottom: "1.5rem",
        borderBottom: "1px solid #b5bda0",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? "2.6rem" : "4.2rem",
            fontWeight: 400,
            fontFamily: "var(--font-gaston-honey), serif",
            color: "#1a1a1a",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "14px",
              color: "#6b6b6b",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <AdminButton onClick={onAction}>
          {actionLabel}
        </AdminButton>
      )}
    </div>
  );
}
