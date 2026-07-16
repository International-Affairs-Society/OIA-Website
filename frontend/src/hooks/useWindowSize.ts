"use client";

import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean; // < 768px
}

/**
 * Shared debounced window size hook.
 * Replaces 6+ individual resize listeners scattered across components.
 * Uses 150ms debounce to avoid layout thrashing.
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 768,
        });
      }, 150);
    };

    // Set initial values
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
}
