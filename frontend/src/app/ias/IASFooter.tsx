"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function IASFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const [showDevs, setShowDevs] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!footerRef.current) return;

    const elements = gsap.utils.toArray(".animate-footer-ias");
    
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
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(114,114,114,0.3) 25%, rgba(114,114,114,0.3) 26%, transparent 27%,
            transparent 74%, rgba(114,114,114,0.3) 75%, rgba(114,114,114,0.3) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(114,114,114,0.3) 25%, rgba(114,114,114,0.3) 26%, transparent 27%,
            transparent 74%, rgba(114,114,114,0.3) 75%, rgba(114,114,114,0.3) 76%, transparent 77%, transparent)
        `,
        backgroundSize: "55px 55px",
        color: "#fff",
      }}
    >
      {/* ── Main Content ── */}
      <div 
        className="relative z-10 px-6 md:px-12 lg:px-16 pb-8 pt-20"
        style={{ width: "100%", maxWidth: "1400px" }}
      >

        {/* ── Top Row: Stay up to date + Write to ── */}
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-8 mb-12 md:mb-28">

          {/* Left — Stay up to date */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <p className="animate-footer-ias font-sans text-[0.8rem] text-[#D12027] font-medium tracking-widest uppercase text-center md:text-left">
              Stay up to date
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/international-affairs-society-bu/"
                target="_blank"
                rel="noopener noreferrer"
                className="animate-footer-ias w-11 h-11 rounded-full bg-[#D12027] flex items-center justify-center text-white hover:bg-[#a01020] transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right — Write to */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="animate-footer-ias font-sans text-[0.8rem] text-[#D12027] font-medium tracking-widest uppercase text-center md:text-left">
              Write to
            </p>
            <a
              href="mailto:ias@bennett.edu.in"
              className="animate-footer-ias font-sans text-2xl md:text-3xl lg:text-4xl font-medium text-white hover:text-[#D12027] transition-colors duration-300 tracking-tight break-all md:break-normal"
            >
              ias@bennett.edu.in
            </a>
          </div>
        </div>

        {/* ── Middle Row: Copyright + Developers ── */}
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-8 mb-12 md:mb-28">

          {/* Left — Copyright / IAS Info */}
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <p className="animate-footer-ias font-sans text-[0.8rem] text-[#D12027] font-semibold tracking-widest uppercase mb-2">
              International Affairs Society
            </p>
            <p className="animate-footer-ias font-sans text-sm text-gray-400 leading-relaxed max-w-xs">
              Bennett University
            </p>
            <p className="animate-footer-ias font-sans text-sm text-gray-400 leading-relaxed max-w-xs">
              Plot Nos 8-11, TechZone II,
            </p>
            <p className="animate-footer-ias font-sans text-sm text-gray-400 leading-relaxed max-w-xs">
              Greater Noida, Uttar Pradesh
            </p>
            <p className="animate-footer-ias font-sans text-sm text-gray-400 leading-relaxed max-w-xs">
              India
            </p>
          </div>

          {/* Right — Developers */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <button 
              onClick={() => setShowDevs(!showDevs)}
              className="animate-footer-ias focus:outline-none flex items-center justify-center md:justify-start gap-2 cursor-pointer group"
              style={{ background: "none", border: "none", padding: 0 }}
              aria-expanded={showDevs}
            >
              <span className="font-sans text-[0.8rem] text-[#D12027] font-semibold tracking-widest uppercase group-hover:opacity-80 transition-opacity">
                See Developers
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D12027"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: showDevs ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div 
              className={`flex flex-col items-center md:items-start gap-1.5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] text-center md:text-left ${
                showDevs ? "max-h-[200px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
              }`}
            >
              <p className="font-sans text-sm text-gray-400 leading-relaxed max-w-xs">
                This website is designed
              </p>
              <p className="font-sans text-sm text-gray-400 leading-relaxed max-w-xs">
                and developed by
              </p>
              <p className="font-sans text-sm text-white font-semibold leading-relaxed max-w-xs mt-0.5">
                Shrish & Shivam
              </p>
            </div>
          </div>
        </div>

        {/* ── Let's Talk SVG ── */}
        <div
          className="animate-footer-ias w-full overflow-hidden mt-8 md:mt-0 opacity-80"
          style={{
            paddingLeft: "clamp(18px, 6vw, 0px)",
            paddingRight: "clamp(18px, 6vw, 0px)",
          }}
        >
          <Image
            src="/homepage assets/lets talk.svg"
            alt="Let's Talk"
            width={1563}
            height={383}
            className="w-full h-auto brightness-200 contrast-200"
            style={{
              maskImage: "linear-gradient(to top, transparent 0%, black 40%)",
              WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 40%)",
              filter: "invert(1) grayscale(100%)", // make it white
            }}
            priority
          />
        </div>

        {/* ── Bottom Copyright Bar ── */}
        <div className="animate-footer-ias w-full flex flex-col items-center justify-center pt-8 pb-4 border-t border-gray-800 mt-4 md:mt-0 relative z-20 bg-[#0a0a0a]">
          <p className="font-sans text-xs text-gray-500 tracking-wide text-center uppercase px-4">
            © {new Date().getFullYear()} International Affairs Society, Bennett University. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
