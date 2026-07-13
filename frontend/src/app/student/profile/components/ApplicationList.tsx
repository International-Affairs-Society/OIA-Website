"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import StatusBadge from "./StatusBadge";

interface AppListItem {
  id: string;
  program_title: string;
  status: string;
  applied_at: string;
}

interface Props {
  applications: AppListItem[];
  onSelect: (id: string) => void;
}

type TabType = "All" | "In Process" | "Accepted" | "Completed";

export default function ApplicationList({ applications, onSelect }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("All");

  const tabs: TabType[] = ["All", "In Process", "Accepted", "Completed"];

  const filteredApps = applications.filter((app) => {
    if (activeTab === "All") return true;
    return app.status === activeTab;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ display: "flex", flexDirection: "column", width: "100%" }}
    >
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "clamp(32px, 4vw, 48px)",
            marginBottom: "24px",
            lineHeight: 1,
            color: "#393939",
            fontFamily: "var(--font-display)",
          }}
        >
          My Applications
        </h1>
        <p
          style={{
            fontSize: "clamp(10px, 1.2vw, 12px)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(57, 57, 57, 0.6)",
            fontFamily: "var(--font-roboto-condensed)",
          }}
        >
          Track the status of your program applications
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "var(--font-space-grotesk)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                border: isActive ? "1px solid rgba(122, 140, 94, 0.5)" : "1px solid rgba(255, 255, 255, 0.4)",
                background: isActive ? "rgba(122, 140, 94, 0.1)" : "rgba(255, 251, 242, 0.4)",
                color: isActive ? "#7A8C5E" : "rgba(57, 57, 57, 0.7)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredApps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "rgba(57, 57, 57, 0.5)", fontFamily: "var(--font-space-grotesk)" }}>
            No applications found for this status.
          </div>
        ) : (
          filteredApps.map((app) => {
            let variant: any = "default";
            if (app.status === "In Process") variant = "pending";
            else if (app.status === "Accepted" || app.status === "Completed") variant = "verified";

            return (
              <GlassCard
                key={app.id}
                onClick={() => onSelect(app.id)}
                className="group cursor-pointer hover:bg-[rgba(255,251,242,0.8)] transition-all"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontFamily: "var(--font-space-grotesk)",
                      lineHeight: 1.4,
                    }}
                  >
                    {app.program_title}
                  </h3>
                  <div style={{ flexShrink: 0 }}>
                    <StatusBadge variant={variant} label={app.status} />
                  </div>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgba(57, 57, 57, 0.6)",
                      fontFamily: "var(--font-space-grotesk)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}
                  >
                    Applied: {new Date(app.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  
                  <span
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      fontSize: "12px",
                      color: "#7A8C5E",
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 600,
                    }}
                  >
                    View Details &rarr;
                  </span>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
