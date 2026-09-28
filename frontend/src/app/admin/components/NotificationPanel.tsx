"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReviewItem } from "@/app/admin/data/mockReviews";
import { useAuth } from "@/app/admin/roles/AuthContext";
import LiquidGlass from "@/components/LiquidGlass";
import { sanitizeHtml } from "@/lib/sanitize";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: ReviewItem[];
  systemAlerts?: any[];
  isDarkTheme?: boolean;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "program": return "Program";
    case "upcoming_event": return "Upcoming Event";
    case "past_event": return "Past Event";
    case "mou": return "MOU";
    default: return type;
  }
}

function getTypeBadgeColor(type: string): string {
  switch (type) {
    case "program": return "#5C6B3F";
    case "upcoming_event": return "#2563EB";
    case "past_event": return "#7C3AED";
    case "mou": return "#D97706";
    default: return "#6b6b6b";
  }
}

export default function NotificationPanel({ isOpen, onClose, reviews, systemAlerts = [], isDarkTheme = false }: NotificationPanelProps) {
  const router = useRouter();
  const { role } = useAuth();

  const theme = isDarkTheme ? {
    glassBg: "rgba(15, 15, 15, 0.8)",
    glassBorder: "rgba(255, 255, 255, 0.1)",
    textPrimary: "#ffffff",
    textSecondary: "#a1a1a1",
    borderPrimary: "#333333",
    itemBg: "#1a1a1a",
    itemBorder: "#333333",
    itemBorderHover: "#555555",
    btnBg: "#ffffff",
    btnText: "#1a1a1a",
    btnBgHover: "#cccccc"
  } : {
    glassBg: "rgba(245, 240, 232, 0.65)",
    glassBorder: "rgba(255, 255, 255, 0.4)",
    textPrimary: "#1a1a1a",
    textSecondary: "#6b6b6b",
    borderPrimary: "#b5bda0",
    itemBg: "#FFFBF2",
    itemBorder: "#d4cfc4",
    itemBorderHover: "#7A8C5E",
    btnBg: "#1a1a1a",
    btnText: "#f5f0e8",
    btnBgHover: "#7A8C5E"
  };

  // Super admin sees pending reviews; editor/admin sees changes_requested items
  const isSuperAdmin = role === "super_admin";
  const relevantReviews = isSuperAdmin
    ? reviews.filter((r) => r.status === "pending")
    : reviews.filter((r) => r.status === "changes_requested");

  const headerSubtext = isSuperAdmin
    ? `${relevantReviews.length} pending approval${relevantReviews.length !== 1 ? "s" : ""}`
    : `${relevantReviews.length} item${relevantReviews.length !== 1 ? "s" : ""} need${relevantReviews.length === 1 ? "s" : ""} your attention`;

  const emptyText = isSuperAdmin ? "No pending approvals" : "No changes requested — you're all caught up!";

  const handleClick = (reviewId: string) => {
    onClose();
    if (isSuperAdmin) {
      router.push(`/admin/reviews?id=${reviewId}`);
    } else {
      router.push(`/admin/submissions?id=${reviewId}`);
    }
  };

  // Lock Lenis smooth scroll when panel is open so it doesn't
  // intercept wheel events meant for the notification list.
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Access Lenis instance if available on window (set by the layout)
    const lenis = (window as any).__lenis;
    if (isOpen) {
      if (lenis) lenis.stop();
      document.body.style.overflow = "hidden";
    } else {
      if (lenis) lenis.start();
      document.body.style.overflow = "";
    }
    return () => {
      if (lenis) lenis.start();
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            zIndex: 1099,
          }}
        />
      )}

      {/* Slide Panel */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          width: "420px",
          maxWidth: "85vw",
          height: "100vh",
          zIndex: 1100,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isOpen ? "-8px 0 32px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <LiquidGlass 
          backgroundColor={theme.glassBg}
          borderColor={theme.glassBorder}
        />

        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: `1px solid ${theme.borderPrimary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
                color: theme.textPrimary,
                fontFamily: "var(--font-instrument-serif)",
                letterSpacing: "-0.01em",
              }}
            >
              Notifications
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: theme.textSecondary }}>
              {headerSubtext}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "22px",
              color: theme.textSecondary,
              lineHeight: 1,
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkTheme ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
              e.currentTarget.style.color = theme.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.textSecondary;
            }}
          >
            &times;
          </button>
        </div>

        <div
          data-lenis-prevent
          style={{ flex: 1, overflowY: "auto", padding: "16px" }}
        >
          {relevantReviews.length === 0 && systemAlerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: theme.textSecondary }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <p style={{ fontSize: "14px", margin: 0 }}>{emptyText}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Render System Alerts First */}
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: "16px",
                    backgroundColor: theme.itemBg,
                    border: `1px solid ${theme.itemBorder}`,
                    borderRadius: "8px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.itemBorderHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = theme.itemBorder)}
                >
                  <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        backgroundColor: "#c0392b",
                        color: "#fff",
                        borderRadius: "2px",
                      }}
                    >
                      System Alert
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: theme.textPrimary,
                      margin: "0 0 8px",
                      fontFamily: "var(--font-outfit)",
                    }}
                  >
                    {alert.subject}
                  </p>
                  <div style={{
                      fontSize: "12px", color: theme.textSecondary, margin: "0 0 8px", lineHeight: 1.5,
                    }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(alert.bodyHtml || alert.body_html) }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "12px",
                      paddingTop: "10px",
                      borderTop: `1px solid ${theme.itemBorder}`,
                    }}
                  >
                    <span style={{ fontSize: "11px", color: theme.textSecondary }}>
                      {formatTimeAgo(alert.sentAt || alert.sent_at)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Render Relevant Reviews */}
              {relevantReviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: "16px",
                    backgroundColor: theme.itemBg,
                    border: `1px solid ${theme.itemBorder}`,
                    borderRadius: "8px",
                    transition: "border-color 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.itemBorderHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = theme.itemBorder)}
                >
                  {/* Type badge */}
                  <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        backgroundColor: getTypeBadgeColor(review.type),
                        color: "#fff",
                        borderRadius: "2px",
                      }}
                    >
                      {getTypeLabel(review.type)}
                    </span>
                    {!isSuperAdmin && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          backgroundColor: "#c0392b",
                          color: "#fff",
                          borderRadius: "2px",
                        }}
                      >
                        Changes Requested
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: theme.textPrimary,
                      margin: "0 0 8px",
                      fontFamily: "var(--font-outfit)",
                    }}
                  >
                    {review.title}
                  </p>

                  {/* For editor/admin: show latest comment preview */}
                  {!isSuperAdmin && review.comments.length > 0 && (
                    <p style={{
                      fontSize: "12px", color: theme.textSecondary, margin: "0 0 8px", lineHeight: 1.5,
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                    }}>
                      &quot;{review.comments[review.comments.length - 1].text}&quot;
                    </p>
                  )}

                  {/* Submitter info (for super admin) */}
                  {isSuperAdmin && (
                    <div style={{ fontSize: "12px", color: theme.textSecondary, lineHeight: 1.7 }}>
                      <div>
                        <strong style={{ color: theme.textPrimary }}>{review.submittedBy.name}</strong>
                      </div>
                      <div>{review.submittedBy.email}</div>
                      <div>
                        Role:{" "}
                        <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                          {review.submittedBy.role}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "12px",
                      paddingTop: "10px",
                      borderTop: `1px solid ${theme.itemBorder}`,
                    }}
                  >
                    <span style={{ fontSize: "11px", color: theme.textSecondary }}>
                      {formatTimeAgo(review.submittedAt)}
                    </span>
                    <button
                      onClick={() => handleClick(review.id)}
                      style={{
                        padding: "6px 16px",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        backgroundColor: theme.btnBg,
                        color: theme.btnText,
                        border: "none",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnBgHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnBg)}
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
