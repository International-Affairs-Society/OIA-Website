"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import CircuitPattern from "./CircuitPattern";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [showDevs, setShowDevs] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!footerRef.current) return;

    const elements = gsap.utils.toArray(".animate-footer");
    
    gsap.fromTo(
      elements,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.5,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
      }
    );
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-hidden flex flex-col items-center"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* ── Grid Background (same as Partners section) ── */}
      <CircuitPattern />

      {/* ── Main Content ── */}
      <div 
        className="relative z-10 px-6 md:px-12 lg:px-16 pb-8"
        style={{ width: "100%", maxWidth: "1400px" }}
      >
        {/* Spacer to push footer content down so it appears after Events section is fully scrolled */}
        <div style={{ height: "12vh", flexShrink: 0, width: "100%" }} aria-hidden="true" />

        {/* ── Top Row: Stay up to date + Write to ── */}
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8 mb-20 md:mb-28">

          {/* Left — Stay up to date */}
          <div className="flex flex-col gap-4">
            <p className="animate-footer font-sans text-[0.8rem] text-[#D12027] font-medium tracking-widest uppercase">
              Stay up to date
            </p>
            <div className="flex items-center gap-4">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/oia-bennettuniversity/"
                target="_blank"
                rel="noopener noreferrer"
                className="animate-footer w-11 h-11 rounded-full bg-[#D12027] flex items-center justify-center text-white hover:bg-[#a01020] transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right — Write to */}
          <div className="flex flex-col gap-3">
            <p className="animate-footer font-sans text-[0.8rem] text-[#D12027] font-medium tracking-widest uppercase">
              Write to
            </p>
            <a
              href="mailto:oia@bennett.edu.in"
              className="animate-footer font-sans text-2xl md:text-3xl lg:text-4xl font-medium text-foreground hover:text-[#D12027] transition-colors duration-300 tracking-tight"
            >
              oia@bennett.edu.in
            </a>
          </div>
        </div>

        {/* ── Middle Row: Copyright + Developers ── */}
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8 mb-20 md:mb-28">

          {/* Left — Copyright / OIA Info */}
          <div className="flex flex-col gap-2">
            <p className="animate-footer font-sans text-[0.8rem] text-[#D12027] font-semibold tracking-widest uppercase mb-2">
              Office of International Affairs
            </p>
            <p className="animate-footer font-sans text-sm text-foreground/70 leading-relaxed max-w-xs">
              Bennett University
            </p>
            <p className="animate-footer font-sans text-sm text-foreground/70 leading-relaxed max-w-xs">
              Plot Nos 8-11, TechZone II,
            </p>
            <p className="animate-footer font-sans text-sm text-foreground/70 leading-relaxed max-w-xs">
              Greater Noida, Uttar Pradesh
            </p>
            <p className="animate-footer font-sans text-sm text-foreground/70 leading-relaxed max-w-xs">
              India
            </p>
            <a
              href="/homepage%20assets/NEP_Final_English_0.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="animate-footer font-sans text-sm text-[#D12027] font-semibold hover:opacity-80 transition-opacity duration-300 mt-4 flex items-center gap-1.5"
            >
              Fully NEP 2020 Compliant
            </a>
          </div>

          {/* Right — Developers */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setShowDevs(!showDevs)}
              className="animate-footer text-left focus:outline-none flex items-center gap-2"
            >
              <p className="font-sans text-[0.8rem] text-[#D12027] font-semibold tracking-widest uppercase cursor-pointer hover:opacity-80 transition-opacity">
                Developers
              </p>
            </button>
            <div 
              className={`flex flex-col gap-2 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showDevs ? 'max-h-[200px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}
            >
              <p className="font-sans text-sm text-foreground/70 leading-relaxed max-w-xs">
                This website is designed
              </p>
              <p className="font-sans text-sm text-foreground/70 leading-relaxed max-w-xs">
                and developed by
              </p>
              <p className="font-sans text-sm text-foreground font-semibold leading-relaxed max-w-xs mt-1">
                Shrish & Shivam
              </p>
            </div>
          </div>
        </div>

        {/* ── Let's Talk SVG ── */}
        <div className="animate-footer w-full overflow-hidden mt-8 md:mt-0">
          <Image
            src="/homepage assets/lets talk.svg"
            alt="Let's Talk"
            width={1563}
            height={383}
            className="w-full h-auto"
            style={{
              maskImage: "linear-gradient(to top, transparent 0%, black 40%)",
              WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 40%)",
            }}
            priority
          />
        </div>

        {/* ── Bottom Copyright Bar ── */}
        <div className="animate-footer w-full flex flex-col items-center justify-center pt-6 pb-4 border-t border-foreground/10">
          <p className="font-sans text-xs text-foreground/40 tracking-wide text-center">
            © {new Date().getFullYear()} Office of International Affairs, Bennett University. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
