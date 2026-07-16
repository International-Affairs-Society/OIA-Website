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

    const lenis = new Lenis({
      lerp: isLowEnd ? 0.15 : 0.08,           // Faster convergence on low-end = fewer frames
      wheelMultiplier: 1.0,
      touchMultiplier: isLowEnd ? 1.2 : 1.6,
      smoothWheel: true,
      syncTouch: !isLowEnd,                     // Disable syncTouch on low-end (saves CPU)
    });

    // Expose on window so other components (e.g. NotificationPanel) can pause/resume
    (window as any).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    if (isLowEnd) {
      // Low-end: use native requestAnimationFrame instead of GSAP ticker (30% less CPU)
      let rafId: number;
      const update = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(update);
      };
      rafId = requestAnimationFrame(update);

      return () => {
        cancelAnimationFrame(rafId);
        (window as any).__lenis = null;
        lenis.destroy();
      };
    } else {
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
    }
  }, [pathname, deviceTier]);

  return <>{children}</>;
}

