"use client";
import React from "react";

export interface TabGroupProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onChange: (key: string) => void;
}

export default function TabGroup({ tabs, activeTab, onChange }: TabGroupProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        borderBottom: "1px solid #b5bda0",
        paddingBottom: "12px",
        marginBottom: "24px",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              background: "none",
              border: "none",
              padding: "0",
              paddingBottom: "10px", // space for underline
              marginBottom: "-12px", // pull down to overlap the container's bottom border
              fontSize: "14px",
              fontWeight: isActive ? 500 : 400,
              color: isActive ? "#1a1a1a" : "#6b6b6b",
              borderBottom: isActive ? "2px solid #1a1a1a" : "2px solid transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = "#1a1a1a";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = "#6b6b6b";
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
