"use client";

import { useState, useEffect, createContext, useContext } from "react";

export type DeviceTier = "low" | "mid" | "high";

/**
 * Detects device capability tier based on:
 * - navigator.hardwareConcurrency (CPU cores)
 * - navigator.deviceMemory (RAM in GB, Chrome/Edge only)
 * - WebGL renderer string (GPU model)
 *
 * LOW:  ≤4 cores OR ≤4GB RAM OR Intel HD/UHD integrated (i3, Celeron — pre-2020)
 * MID:  4-6 cores, 8GB RAM, Intel Iris/AMD Vega (i5, Ryzen 5 — 2020-2023)
 * HIGH: >6 cores OR >8GB RAM OR discrete GPU (i7+, RTX, M2+ — 2022+)
 *
 * Mid and High have nearly identical settings — only Low gets reduced effects.
 */
function detectDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "mid"; // SSR fallback

  // ── 0. Developer Override ──
  const override = localStorage.getItem("OIA_FORCE_DEVICE_TIER");
  if (override === "low" || override === "mid" || override === "high") {
    console.log(`🛠️ Forcing Device Tier to: ${override.toUpperCase()}`);
    return override as DeviceTier;
  }

  // ── 1. CPU Cores ──
  const cores = navigator.hardwareConcurrency || 4;

  // ── 2. RAM (Chrome/Edge only — returns undefined on Firefox/Safari) ──
  const memory = (navigator as any).deviceMemory as number | undefined;

  let finalTier: DeviceTier = "high";

  // ── Decision ──
  // IMPORTANT: The browser caps `navigator.deviceMemory` at 8 for privacy reasons.
  // This means 8GB, 16GB, 32GB, and 64GB all return `8`.
  // If we say `memory <= 8` is Mid, then ALL high-end computers will be classified as Mid!
  // Therefore, if memory is 8, we must rely entirely on CPU cores to determine High vs Mid.

  if (cores <= 4 || (memory !== undefined && memory <= 4)) {
    finalTier = "low";
  } 
  else if (cores <= 6 || (memory !== undefined && memory < 8)) {
    finalTier = "mid";
  }

  // Log to console so developer can see the detected specs
  console.log("🖥️ --- Hardware Detection ---");
  console.table({
    "CPU Cores": cores,
    "RAM (GB)": memory || "Unknown (Firefox/Safari)",
    "Assigned Tier": finalTier.toUpperCase(),
  });

  return finalTier;
}

// ── React Hook ──
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("mid"); // safe default

  useEffect(() => {
    setTier(detectDeviceTier());
  }, []);

  return tier;
}

// ── React Context (so we detect once, share everywhere) ──
const DeviceTierContext = createContext<DeviceTier>("mid");

export function DeviceTierProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const tier = useDeviceTier();
  return (
    <DeviceTierContext.Provider value={tier}>
      {children}
    </DeviceTierContext.Provider>
  );
}

export function useDeviceTierContext(): DeviceTier {
  return useContext(DeviceTierContext);
}
