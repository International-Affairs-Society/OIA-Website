"use client";

import { useState, useEffect, createContext, useContext } from "react";

export type DeviceTier = "low" | "mid" | "high";

/**
 * Detects whether the device is running on an Integrated GPU or software renderer.
 * Checks for Intel HD/UHD/Iris, AMD APU Radeon(TM)/Vega, mobile SoCs (Mali, Adreno, PowerVR),
 * Apple unified GPUs, and software renderers (SwiftShader, llvmpipe).
 */
export function detectIsIntegratedGPU(): boolean {
  if (typeof window === "undefined") return false;

  // ── 0. Developer Override ──
  const override = localStorage.getItem("OIA_FORCE_INTEGRATED_GPU");
  if (override !== null) {
    return override === "true" || override === "1";
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) return true; // Fail safe: no WebGL = treat as integrated

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) {
      const cores = navigator.hardwareConcurrency || 4;
      return cores <= 6;
    }

    const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "").toLowerCase();

    // 1. Explicit discrete dedicated GPUs
    const isNvidiaDiscrete =
      renderer.includes("nvidia") ||
      renderer.includes("geforce") ||
      renderer.includes("quadro") ||
      renderer.includes("rtx") ||
      renderer.includes("gtx") ||
      renderer.includes("titan");

    const isAmdDiscrete =
      (renderer.includes("radeon rx") ||
        renderer.includes("radeon pro") ||
        renderer.includes("radeon hd")) &&
      !renderer.includes("radeon(tm) graphics") &&
      !renderer.includes("vega");

    const isIntelArcDiscrete =
      renderer.includes("arc(tm) a7") ||
      renderer.includes("arc(tm) a5") ||
      renderer.includes("arc(tm) b5");

    if (isNvidiaDiscrete || isAmdDiscrete || isIntelArcDiscrete) {
      return false; // Dedicated discrete GPU detected
    }

    // 2. Integrated / Software / Mobile GPUs
    const isIntelIntegrated =
      renderer.includes("intel") ||
      renderer.includes("hd graphics") ||
      renderer.includes("uhd graphics") ||
      renderer.includes("iris");

    const isAmdIntegrated =
      renderer.includes("radeon(tm) graphics") ||
      renderer.includes("vega") ||
      renderer.includes("apu") ||
      renderer.includes("amd custom");

    const isMobileOrSoftware =
      renderer.includes("mali") ||
      renderer.includes("adreno") ||
      renderer.includes("powervr") ||
      renderer.includes("apple") ||
      renderer.includes("swiftshader") ||
      renderer.includes("llvmpipe") ||
      renderer.includes("basic render");

    return isIntelIntegrated || isAmdIntegrated || isMobileOrSoftware;
  } catch {
    return false;
  }
}

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

  // ── 3. GPU Architecture ──
  const isIntegrated = detectIsIntegratedGPU();

  let finalTier: DeviceTier = "high";

  // ── Decision ──
  // LOW:  ≤4 cores OR ≤6GB RAM (budget / older devices)
  if (cores <= 4 || (memory !== undefined && memory <= 6)) {
    finalTier = "low";
  } 
  // MID:  4-6 cores OR <8GB RAM OR High-spec CPU/RAM with Integrated GPU (iGPU)
  else if (cores <= 6 || (memory !== undefined && memory < 8) || isIntegrated) {
    finalTier = "mid";
  } 
  // HIGH: ONLY devices with >6 cores, ≥8GB RAM, AND Dedicated/Discrete GPU (dGPU)
  else {
    finalTier = "high";
  }

  // Log to console so developer can see the detected specs
  console.log("🖥️ --- Hardware Detection ---");
  console.table({
    "CPU Cores": cores,
    "RAM (GB)": memory || "Unknown (Firefox/Safari)",
    "GPU Type": isIntegrated ? "Integrated / Mobile GPU (iGPU)" : "Dedicated / Discrete GPU (dGPU)",
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
