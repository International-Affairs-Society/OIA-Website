"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useDeviceTierContext } from "@/hooks/useDeviceTier";

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

    if (isLowEnd || isMobile) {
      // Completely bypass smooth scrolling on low end devices and mobile to save CPU/GPU and optimize touch.
      return;
    }

    const isMidEnd = deviceTier === "mid";

    const lenis = new Lenis({
      lerp: isMidEnd ? 0.15 : 0.08, // Lighter, faster lerp on Mid tier to save CPU cycles
      wheelMultiplier: 1.0,
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: false,
    });

    // Expose on window so other components (e.g. NotificationPanel) can pause/resume
    (window as any).__lenis = lenis;

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

