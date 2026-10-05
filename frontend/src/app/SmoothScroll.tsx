"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useDeviceTierContext, detectIsIntegratedGPU } from "@/hooks/useDeviceTier";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const deviceTier = useDeviceTierContext();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isLowEnd = deviceTier === "low";

    // Global GSAP optimizations for accessibility and low-end hardware
    if (isLowEnd || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.ticker.fps(30); // Cap GSAP at 30fps to save battery/CPU
      gsap.config({ force3D: false }); // Disable heavy 3D hardware acceleration for standard tweens
    }

    const isMobile = window.innerWidth <= 768;
    const isHomePage = pathname === "/" || pathname === "" || pathname === "/#home";
    const isIntegrated = detectIsIntegratedGPU();

    if (isLowEnd || isMobile || (isHomePage && isIntegrated)) {
      // Completely bypass smooth scrolling on low end devices, mobile, or on homepage with integrated graphics
      console.log(`🚀 [SmoothScroll] Lenis bypassed: ${isMobile ? "Mobile" : isLowEnd ? "Low Tier" : isIntegrated && isHomePage ? "Homepage with Integrated GPU" : "Active"}`);
      return;
    }

    const isMidEnd = deviceTier === "mid";

    const lenis = new Lenis({
      lerp: isMidEnd ? 0.15 : 0.08, // Lighter, faster lerp on Mid tier to save CPU cycles
      wheelMultiplier: 1.0,
      smoothWheel: true,
      syncTouch: false,
    });

    // Expose on window so other components (e.g. NotificationPanel) can pause/resume
    (window as any).__lenis = lenis;

    if (typeof window !== "undefined" && (window as any).__scrollLocked) {
      lenis.stop();
      lenis.scrollTo(0, { immediate: true });
    }

    lenis.on("scroll", ScrollTrigger.update);

    // Mid/High: full GSAP ticker integration for buttery-smooth scrolling
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      (window as any).__lenis = null;
      lenis.destroy();
      gsap.ticker.remove(update);
    };
  }, [pathname, deviceTier]);

  return <>{children}</>;
}

