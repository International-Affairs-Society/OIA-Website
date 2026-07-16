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

  // ── 1. CPU Cores ──
  const cores = navigator.hardwareConcurrency || 4;

  // ── 2. RAM (Chrome/Edge only — returns undefined on Firefox/Safari) ──
  const memory = (navigator as any).deviceMemory as number | undefined;

  // ── 3. GPU via WebGL renderer string ──
  let gpuRenderer = "";
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension(
        "WEBGL_debug_renderer_info"
      );
      if (debugInfo) {
        gpuRenderer = (gl as WebGLRenderingContext)
          .getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          .toLowerCase();
      }
    }
    canvas.remove();
  } catch {
    // WebGL not available — assume low
  }

  // ── Classify GPU ──
  const LOW_GPU_PATTERNS = [
    "intel hd",
    "intel uhd",
    "intel(r) hd",
    "intel(r) uhd",
    "amd radeon(tm) vega 3",
    "amd radeon vega 3",
    "mali-",
    "adreno 5",
    "adreno 6",
    "powervr",
    "swiftshader", // software renderer
    "llvmpipe", // software renderer
    "mesa",
  ];

  const isLowGPU =
    gpuRenderer === "" ||
    LOW_GPU_PATTERNS.some((pattern) => gpuRenderer.includes(pattern));

  let finalTier: DeviceTier = "high";

  // ── Decision ──
  // A machine with 8+ cores and 12GB+ RAM is powerful enough to handle the 
  // WebGL effects via software/integrated graphics without dropping frames.
  const isPowerfulMachine = cores >= 8 && (memory === undefined || memory >= 12);

  // Classify as low if it has weak CPU, weak RAM, or a weak GPU
  // BUT override that if the machine is otherwise highly powerful
  if ((cores <= 4 || (memory !== undefined && memory <= 4) || isLowGPU) && !isPowerfulMachine) {
    finalTier = "low";
  } else if (cores <= 6 || (memory !== undefined && memory <= 8)) {
    finalTier = "mid";
  }

  // Log to console so developer can see the detected specs
  console.log("🖥️ --- Hardware Detection ---");
  console.table({
    "CPU Cores": cores,
    "RAM (GB)": memory || "Unknown (Firefox/Safari)",
    "GPU Model": gpuRenderer || "Unknown",
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
