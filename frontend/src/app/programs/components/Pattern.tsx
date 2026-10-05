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
        backgroundColor: "#f5f0e8",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Unified Seamless Grid & Paper Texture — same as Homepage */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMTkuNSIgbnVtT2N0YXZlcz0iMTAiIHJlc3VsdD0idHVyYnVsZW5jZSIvPjxmZUNvbXBvc2l0ZSBvcGVyYXRvcj0iaW4iIGluPSJ0dXJidWxlbmNlIiBpbjI9IlNvdXJjZUFscGhhIiByZXN1bHQ9ImNvbXBvc2l0ZSIvPjxmZUNvbG9yTWF0cml4IGluPSJjb21wb3NpdGUiIHR5cGU9Imx1bWluYW5jZVRvQWxwaGEiLz48ZmVCbGVuZCBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJjb21wb3NpdGUiIG1vZGU9ImNvbG9yLWJ1cm4iLz48L2ZpbHRlcj48L2RlZnM+PGcgZmlsdGVyPSJ1cmwoI2EpIj48cGF0aCBmaWxsPSIjZjVmMGU4IiBkPSJNMCAwaDEwMHYxMDBIMHoiLz48cGF0aCBkPSJNMCAwdjEwMGgxMDBWMFoiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlPSIjNWM2YjNmIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIgZmlsbD0ibm9uZSIvPjxwYXRoIGZpbGw9IiM1YzZiM2YiIGZpbGwtb3BhY2l0eT0iMC4xIiBkPSJNNTAgMGgxdjEwMGgtMXoiLz48cGF0aCBmaWxsPSIjNWM2YjNmIiBmaWxsLW9wYWNpdHk9IjAuMSIgZD0iTTAgNTBoMTAwdjFIMHoiLz48L2c+PC9zdmc+")`,
          opacity: 0.4,
        }}
      />
    </div>
  );
}
