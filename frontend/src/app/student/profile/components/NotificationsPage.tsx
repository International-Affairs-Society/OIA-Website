"use client";

import React, { useState } from "react";
import { Notification } from "../types";
import GlassCard from "./GlassCard";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

interface Props {
  notifications: Notification[];
  onNotificationClick?: (applicationId: string) => void;
}

export default function NotificationsPage({ notifications: initialNotifications, onNotificationClick }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ display: "flex", flexDirection: "column", width: "100%" }}
    >
      <h1
        style={{
          fontSize: "clamp(36px, 4vw, 48px)",
          marginBottom: "32px",
          color: "#393939",
          fontFamily: "var(--font-display)",
        }}
      >
        Notifications
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
        {notifications.length === 0 ? (
          <GlassCard style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px", textAlign: "center" }}>
            <Inbox size={48} style={{ marginBottom: "16px", opacity: 0.4, color: "var(--foreground)" }} />
            <p
              style={{
                fontSize: "14px",
                color: "rgba(57, 57, 57, 0.6)",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              No new notifications
            </p>
          </GlassCard>
        ) : (
          notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
            >
              <div 
                onClick={() => {
                  if (notif.application_id && onNotificationClick) {
                    onNotificationClick(notif.application_id);
                  }
                }}
                className={notif.application_id ? "cursor-pointer" : ""}
              >
                <GlassCard
                  className={`transition-colors ${notif.application_id ? "hover:bg-[rgba(122,140,94,0.08)] transition-all" : ""}`}
                  style={{
                    width: "100%",
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor: !notif.read ? "rgba(122,140,94,0.05)" : "transparent",
                    borderLeft: !notif.read ? "4px solid #7A8C5E" : undefined,
                  }}
                >
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px" }}>
                  <div style={{ flex: 1, paddingRight: "16px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        marginBottom: "8px",
                        color: "var(--foreground)",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {notif.subject}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.625,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        color: "rgba(57, 57, 57, 0.7)",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {notif.body_html}
                    </p>
                  </div>

                  <div className="flex flex-row sm:flex-col justify-between sm:items-end flex-shrink-0">
                    <span
                      className="text-[11px]"
                      style={{
                        color: "rgba(57, 57, 57, 0.6)",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {new Date(notif.sent_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      &middot;{" "}
                      {new Date(notif.sent_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>

                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[10px] uppercase tracking-wider font-semibold transition-colors hover:text-[#404040] mt-2"
                        style={{
                          color: "rgba(57, 57, 57, 0.6)",
                          fontFamily: "var(--font-space-grotesk)",
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
