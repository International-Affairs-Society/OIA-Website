"use client";

import Auralis from "@/components/forgeui/auralis";
import { motion } from "framer-motion";

export default function PastEventHero() {
  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Background Aurora */}
      <div className="absolute inset-0">
        <Auralis
          height="100%"
          colors={["#ef4444", "#dc2626", "#b91c1c"]}
          speed={0.3}
          grain={0.6}
        />
      </div>

      {/* Orbit & Text Container */}
      <div className="relative z-10 w-full max-w-7xl flex items-center justify-center h-full px-4 pt-16">
        {/* Rotating Dotted Orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 90,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute flex items-center justify-center pointer-events-none opacity-60 mix-blend-plus-lighter"
        >
          <svg
            width="800"
            height="800"
            viewBox="0 0 800 800"
            className="w-[120vw] h-[120vw] md:w-[800px] md:h-[800px] overflow-visible"
          >
            {/* Reduced radius to 240 (20% smaller than 300) to give the navbar plenty of breathing room */}
            <circle
              cx="400"
              cy="400"
              r="298"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="2 12"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Heading Text Layout - Centered Stacked */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >

            <h1
              className="text-[20vw] sm:text-[8rem] md:text-[12rem] lg:text-[14rem] leading-[0.85] tracking-tighter text-white drop-shadow-2xl"
              style={{ fontFamily: "var(--font-outfit)", fontWeight: 500 }}
            >
              PAST
            </h1>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-[14vw] sm:text-[8rem] md:text-[12rem] lg:text-[14rem] leading-[0.85] tracking-tighter text-white italic drop-shadow-2xl ml-4 md:ml-12"
            style={{ fontFamily: "var(--font-outfit)", fontWeight: 300 }}
          >
            JOURNEY
          </motion.h1>
        </div>
      </div>
    </section>
  );
}
