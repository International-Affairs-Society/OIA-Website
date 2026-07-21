"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import CircuitPattern from "./CircuitPattern";
import { useDeviceTierContext } from "@/hooks/useDeviceTier";

// Dynamically import SplashCursor so low-end devices don't download 37KB of WebGL code
const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

interface ProgramNode {
  id?: string;
  label: string;
  baseX: number;      // base position (% of section width)
  baseY: number;      // base position (% of section height)
  speedX: number;     // X oscillation speed
  speedY: number;     // Y oscillation speed
  ampX: number;       // X drift amplitude (px)
  ampY: number;       // Y drift amplitude (px)
  phaseX: number;     // X phase offset (radians)
  phaseY: number;     // Y phase offset (radians)
}

const DEFAULT_NODE_PARAMS = [
  { baseX: 16, baseY: 14, speedX: 0.4, speedY: 0.3, ampX: 41, ampY: 36, phaseX: 0, phaseY: 0.5 },
  { baseX: 60, baseY: 9, speedX: 0.3, speedY: 0.5, ampX: 48, ampY: 30, phaseX: 1.2, phaseY: 0.3 },
  { baseX: 88, baseY: 30, speedX: 0.5, speedY: 0.4, ampX: 36, ampY: 48, phaseX: 2.1, phaseY: 1.0 },
  { baseX: 85, baseY: 64, speedX: 0.35, speedY: 0.45, ampX: 45, ampY: 39, phaseX: 0.8, phaseY: 2.0 },
  { baseX: 68, baseY: 84, speedX: 0.45, speedY: 0.35, ampX: 39, ampY: 45, phaseX: 3.0, phaseY: 0.7 },
  { baseX: 14, baseY: 78, speedX: 0.3, speedY: 0.5, ampX: 48, ampY: 32, phaseX: 1.5, phaseY: 2.5 },
  { baseX: 5, baseY: 46, speedX: 0.5, speedY: 0.3, ampX: 30, ampY: 53, phaseX: 0.3, phaseY: 1.8 },
];

// ============================================================

export default function ProgramsSection() {
  const router = useRouter();
  const deviceTier = useDeviceTierContext();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoveredRef = useRef<number | null>(null);
  const animRef = useRef<number>(0);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [programs, setPrograms] = useState<ProgramNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Keep hoveredRef in sync with state (avoids stale closure in rAF)
  useEffect(() => {
    hoveredRef.current = hoveredIndex;
  }, [hoveredIndex]);

  /* ── Load static programs ── */
  useEffect(() => {
    const STATIC_PROGRAMS = [
      "Semester Exchange",
      "Summer School",
      "Immersion Program",
      "Progression Program",
      "Articulation Program",
      "Joint Degree",
      "Dual Degree"
    ];
    
    const mapped = STATIC_PROGRAMS.map((name, i) => ({
      id: `static-${i}`,
      label: name,
      ...DEFAULT_NODE_PARAMS[i]
    }));
    
    setPrograms(mapped);
    setIsLoading(false);
  }, []);

  /* ── Track section dimensions ── */
  useEffect(() => {
    const update = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setDims({ w: rect.width, h: rect.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ── Animation loop — moves nodes AND SVG lines in lockstep ── */
  useEffect(() => {
    if (dims.w === 0 || dims.h === 0 || programs.length === 0) return;

    const cx = dims.w / 2;
    const cy = dims.h / 2;

    const animate = (time: number) => {
      const t = time / 1000;

      programs.forEach((prog, i) => {
        // Compute float offset using sine/cosine for organic motion
        const ox = Math.sin(t * (prog.speedX || 0.4) + (prog.phaseX || 0)) * (prog.ampX || 40);
        const oy = Math.cos(t * (prog.speedY || 0.3) + (prog.phaseY || 0)) * (prog.ampY || 35);

        // Current pixel position of this node
        const nx = (prog.baseX / 100) * dims.w + ox;
        const ny = (prog.baseY / 100) * dims.h + oy;

        // Move the node div
        const nodeEl = nodeRefs.current[i];
        if (nodeEl) {
          nodeEl.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
        }

        // Move the SVG line to track the node → center
        const lineEl = lineRefs.current[i];
        if (lineEl) {
          lineEl.setAttribute("x1", String(nx));
          lineEl.setAttribute("y1", String(ny));
          lineEl.setAttribute("x2", String(cx));
          lineEl.setAttribute("y2", String(cy));

          // Hover styling (imperative to avoid React re-render flicker)
          const isHovered = hoveredRef.current === i;
          lineEl.style.stroke = isHovered
            ? "rgba(57, 57, 57, 0.75)"
            : "rgba(57, 57, 57, 0.3)";
          lineEl.style.strokeWidth = isHovered ? "2.5" : "1";
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [dims, programs]);

  /* ── Simple bottom-to-top entrance via IntersectionObserver ── */
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    // Only run on client
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setIsVisible(entry.isIntersecting); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="programs-section"
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "var(--background)",
        height: "100vh",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-60px)",
        transition: "opacity 1s ease-out, transform 1s ease-out",
        maskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
      }}
    >
      {/* ── Fluid Cursor Effect (Disabled on mobile & low-end devices) ── */}
      {isDesktop && deviceTier !== "low" && (
        <SplashCursor
          COLOR="#D12027"
          RAINBOW_MODE={false}
          SPLAT_FORCE={deviceTier === "mid" ? 2000 : 4000}
          DENSITY_DISSIPATION={2.5}
          SIM_RESOLUTION={deviceTier === "mid" ? 64 : 128}
          DYE_RESOLUTION={deviceTier === "mid" ? 512 : 1440}
          CURL={deviceTier === "mid" ? 10 : 50}
          PRESSURE_ITERATIONS={deviceTier === "mid" ? 10 : 20}
        />
      )}

      {/* ── Grid Background ── */}
      <CircuitPattern />

      {/* ── SVG Lines — radiate from each floating node to center ── */}
      <svg className="programs-lines absolute inset-0 w-full h-full z-10 pointer-events-none">
        {programs.map((_, i) => (
          <line
            key={i}
            ref={(el) => { lineRefs.current[i] = el; }}
            style={{
              stroke: "rgba(57, 57, 57, 0.45)",
              strokeWidth: 1.5,
              transition: "stroke 0.3s ease, stroke-width 0.3s ease",
            }}
          />
        ))}
      </svg>

      {/* ── Central PROGRAMS Text ── */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <h2
          className="programs-title"
          style={{
            fontFamily: "var(--font-roboto-condensed), sans-serif",
            fontSize: "clamp(3rem, 11vw, 11rem)",
            fontWeight: 900,
            color: "#393939",
            letterSpacing: "-0.03em",
            lineHeight: 0.9,
            textTransform: "uppercase",
          }}
        >
          Programs
        </h2>
      </div>

      {/* ── Floating Node Labels ── */}
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <span className="font-sans text-foreground/50 text-sm font-semibold tracking-widest uppercase">Loading programs...</span>
        </div>
      ) : programs.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <span className="font-sans text-foreground/50 text-sm font-semibold tracking-widest uppercase">No programs found.</span>
        </div>
      ) : (
        programs.map((prog, i) => (
          <div
            key={i}
            className="program-node absolute z-30"
            style={{ left: `${prog.baseX}%`, top: `${prog.baseY}%` }}
          >
            <div
              ref={(el) => { nodeRefs.current[i] = el; }}
              className="cursor-pointer relative flex items-center justify-center"
              style={{ transform: "translate(-50%, -50%)", width: "16px", height: "16px" }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => router.push(`/programs`)}
            >
              {/* Small square marker */}
              <span
                className="inline-block rounded-sm transition-all duration-300"
                style={{
                  width: hoveredIndex === i ? 8 : 5,
                  height: hoveredIndex === i ? 8 : 5,
                  backgroundColor:
                    hoveredIndex === i ? "#393939" : "rgba(57, 57, 57, 0.6)",
                }}
              />
              {/* Label text */}
              <span
                className="absolute left-full ml-1 italic whitespace-nowrap transition-all duration-300"
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: hoveredIndex === i ? "1.2rem" : "0.95rem",
                  color:
                    hoveredIndex === i ? "#393939" : "rgba(57, 57, 57, 0.75)",
                  fontWeight: hoveredIndex === i ? 600 : 500,
                  transform: "translateY(-50%)",
                  top: "50%"
                }}
              >
                {prog.label}
              </span>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
