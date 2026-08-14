"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BlurText from "./BlurText";
import CountUp from "./CountUp";
import CircuitPattern from "./CircuitPattern";
import dynamic from 'next/dynamic';
const WorldMapSVG = dynamic(() => import("./WorldMapSVG"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const FLOATING_IMAGES = Array.from({ length: 23 }, (_, i) => ({
  src: `/homepage assets/logos/${i + 1}.webp`,
  label: "",
  isLogo: true,
  scale: 1.95,
}));

// Full circle dimensions — the wrapper is now tall enough to show the entire circle
function getOrbitDims(w: number) {
  if (w < 480) return { size: 900, radius: 450, imgW: 80, imgH: 80 };
  if (w < 768) return { size: 1300, radius: 650, imgW: 100, imgH: 100 };
  return { size: 1600, radius: 800, imgW: 140, imgH: 140 };
}

export default function PartnersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const textBelowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const [dims, setDims] = useState({ size: 1600, radius: 800, imgW: 140, imgH: 140 });

  useEffect(() => {
    const update = () => setDims(getOrbitDims(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: -50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 70%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      }

      if (wheelRef.current) {
        gsap.fromTo(
          wheelRef.current,
          { rotation: -80 },
          {
            rotation: 90,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          }
        );
      }

      if (textBelowRef.current) {
        gsap.fromTo(
          textBelowRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: textBelowRef.current,
              start: "top bottom",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Stats entrance via IntersectionObserver ── */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="partners"
      ref={sectionRef}
      className="relative w-full bg-background overflow-hidden"
    >
      {/* ── Background Circuit Pattern ── */}
      <CircuitPattern />

      {/* ── Heading Block ── */}
      <div
        ref={headingRef}
        className="relative w-full min-h-[50vh] z-20 flex flex-col items-center overflow-hidden"
        style={{ paddingTop: "30vh" }}
      >
        <div className="w-full flex flex-col items-center justify-center text-center">
          <p className="w-full text-center font-sans text-[0.85rem] text-foreground/50 mb-6 font-medium tracking-wide uppercase">
            OUR PARTNERS
          </p>

          <div
            className="w-full flex flex-col items-center justify-center"
            style={{ gap: "0px" }}
          >
            <BlurText
              text="The international partnered"
              delay={50}
              animateBy="words"
              direction="bottom"
              className="w-full text-center font-sans font-medium leading-[1.1] tracking-tight text-foreground text-3xl md:text-5xl lg:text-[4.5rem]"
            />
            <BlurText
              text="universities"
              delay={50}
              animateBy="words"
              direction="bottom"
              className="w-full text-center font-sans font-medium leading-[1.1] tracking-tight text-foreground text-3xl md:text-5xl lg:text-[4.5rem]"
            />
            <div className="w-full flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1 text-3xl md:text-5xl lg:text-[4.5rem] font-sans font-medium leading-[1.1] tracking-tight">
              <BlurText
                text="of"
                delay={50}
                animateBy="words"
                direction="bottom"
                className="text-foreground"
              />
              <BlurText
                text="Bennett University"
                delay={50}
                animateBy="words"
                direction="bottom"
                className="text-[#D12027] font-semibold"
              />
              <BlurText
                text="to reach"
                delay={50}
                animateBy="words"
                direction="bottom"
                className="text-foreground"
              />
            </div>
            <BlurText
              text="horizons globally"
              delay={50}
              animateBy="words"
              direction="bottom"
              className="w-full text-center font-sans font-medium leading-[1.1] tracking-tight text-foreground text-3xl md:text-5xl lg:text-[4.5rem]"
            />
          </div>
        </div>
      </div>

      {/* ── Full Circle Wheel with World Map in Center ── */}
      <div
        className="relative w-full pointer-events-none flex items-center justify-center"
        style={{
          height: `${dims.size + dims.imgH}px`,
          marginTop: "50px",
        }}
      >
        {/* ── Paragraph Text at the Inner Top of the Circle ── */}
        <p
          ref={textBelowRef}
          className="absolute z-20 text-center font-sans text-[1.1rem] md:text-xl lg:text-[2rem] text-foreground/70 leading-relaxed font-light px-4 left-1/2 -translate-x-1/2 pointer-events-auto max-w-[90vw] md:max-w-xl lg:max-w-2xl"
          style={{
            top: `${dims.imgH + (dims.radius * 0.2)}px`,
            width: "100%",
          }}
        >
          Through our global partnerships, Bennett University students gain access
          to world-class education, research opportunities, and cultural exchange
          programs across five continents.
        </p>

        {/* ── Interactive World Map in the CENTER of the circle ── */}
        <div
          className="absolute z-20 top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto px-4 md:px-6"
          style={{
            width: `${dims.radius * 1.5}px`,
            maxWidth: "90vw",
          }}
        >
          <div
            className="w-full"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)'
            }}
          >
            <WorldMapSVG />
          </div>

          {/* ── Explore More Link (Under the Map) ── */}
          <div className="w-full flex items-center justify-center mt-20 sm:mt-24 md:mt-12 translate-y-24 sm:translate-y-28 md:translate-y-0 z-50">
            <a
              href="/partners"
              className="group flex items-center gap-3.5 md:gap-4 text-foreground/70 hover:text-[#D12027] transition-colors duration-300 uppercase tracking-widest text-base sm:text-lg md:text-lg lg:text-xl font-semibold"
            >
              Explore More
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 transition-transform duration-300 group-hover:translate-x-2"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>

        {/* The spinning circle track */}
        <div
          ref={wheelRef}
          className="absolute origin-center will-change-transform"
          style={{
            width: `${dims.size}px`,
            height: `${dims.size}px`,
          }}
        >
          {FLOATING_IMAGES.map((img, i) => {
            const angleDeg = i * (360 / FLOATING_IMAGES.length);
            const angleRad = (angleDeg * Math.PI) / 180;

            const half = dims.radius;
            const x = half + half * Math.sin(angleRad) - dims.imgW / 2;
            const y = half - half * Math.cos(angleRad) - dims.imgH / 2;

            return (
              <div
                key={i}
                className="absolute origin-center pointer-events-auto"
                style={{
                  left: `${x.toFixed(2)}px`,
                  top: `${y.toFixed(2)}px`,
                  width: `${dims.imgW}px`,
                  height: `${dims.imgH}px`,
                  transform: `rotate(${angleDeg}deg)`,
                }}
              >
                {/* Image Box */}
                <div
                  className={`w-full h-full flex items-center justify-center ${img.isLogo
                      ? "overflow-visible"
                      : "overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white"
                    }`}
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    width={dims.imgW}
                    height={dims.imgH}
                    className={`block w-full h-full ${img.isLogo ? "object-contain" : "object-cover"}`}
                    style={img.scale ? { transform: `scale(${img.scale})` } : undefined}
                    unoptimized
                  />
                </div>
                {/* Rotating Label */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-sans text-[0.85rem] text-foreground/60 whitespace-nowrap pointer-events-none">
                  {img.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Edge Fade Overlays — make images "cut" at the edges and reappear ── */}
        <div className="absolute top-0 left-0 w-[15vw] h-full bg-gradient-to-r from-background to-transparent z-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[15vw] h-full bg-gradient-to-l from-background to-transparent z-30 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[15vh] bg-gradient-to-b from-background to-transparent z-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[15vh] bg-gradient-to-t from-background to-transparent z-30 pointer-events-none" />
      </div>

      {/* ── Bottom Spacer ── */}
      <div className="w-full h-[10vh]" />

      {/* ── Stats Section ── */}
      <div
        ref={statsRef}
        className="relative z-20 w-full px-6 pb-32 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 lg:gap-32 flex-wrap"
        style={{
          opacity: statsVisible ? 1 : 0,
          transform: statsVisible ? "translateY(0)" : "translateY(60px)",
          transition: "opacity 1s ease-out, transform 1s ease-out",
        }}
      >
        {[
          { num: 120, label: "Partnered Universities" },
          { num: 35, label: "Countries" },
          { num: 5, label: "Continents" },
          { num: 250, label: "Programs Offered" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div
              className="text-[#D12027] text-7xl md:text-8xl lg:text-[7rem] leading-none flex items-center font-outfit font-normal"
            >
              <CountUp from={0} to={stat.num} duration={2} separator="," />
              <span className="ml-2">+</span>
            </div>
            <p
              className="text-foreground/80 mt-4 text-base md:text-xl lg:text-2xl uppercase tracking-widest font-bold"
              style={{ fontFamily: "var(--font-roboto)" }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      
      {/* ── Additional Bottom Spacer to prevent white gap ── */}
      <div className="w-full h-[10vh]" />
    </section>
  );
}
