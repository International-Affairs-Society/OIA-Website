"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.08, // 20% smoother/slower than 0.1
      wheelMultiplier: 1.0, // 20% slower wheel speed than 1.2
      touchMultiplier: 1.6, // 20% slower touch speed than 2.0
      smoothWheel: true,
      syncTouch: true, // Sync touch across browsers like Safari
    });

    // Expose on window so other components (e.g. NotificationPanel) can pause/resume
    (window as any).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

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
  }, [pathname]);

  return <>{children}</>;
}
