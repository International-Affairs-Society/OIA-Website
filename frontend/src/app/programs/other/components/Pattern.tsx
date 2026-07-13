"use client";

import React from "react";

export default function Pattern() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFBF2",
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, #e8e0d0 25%, #e8e0d0 26%, transparent 27%, transparent 74%, #e8e0d0 75%, #e8e0d0 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, #e8e0d0 25%, #e8e0d0 26%, transparent 27%, transparent 74%, #e8e0d0 75%, #e8e0d0 76%, transparent 77%, transparent)
        `,
        backgroundSize: "55px 55px",
      }}
    />
  );
}
