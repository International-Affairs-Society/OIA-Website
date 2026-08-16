"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import ProgramImageSlider from "./ProgramImageSlider";
import { ProgramData } from "../mockData";

interface ProgramCardProps {
  program: ProgramData;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Link href={`/programs/other/${program.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="flex flex-col gap-4 group cursor-pointer">
        {/* Image Slider */}
        <ProgramImageSlider 
          images={program.images || [program.image]} 
          title={program.title} 
        />

        {/* Text Container */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-baseline">
            <h3 style={{ fontFamily: "var(--font-outfit)" }} className="text-xl font-medium text-[#1a1a1a] line-clamp-2 leading-tight">
              {program.title}
            </h3>
            <span style={{ fontFamily: "var(--font-outfit)" }} className="text-sm text-[#1a1a1a] shrink-0 ml-4">
              {program.date}
            </span>
          </div>
          <div className="flex justify-between items-baseline mt-1">
            <p style={{ fontFamily: "var(--font-outfit)" }} className="text-[15px] text-[#6b6b6b]">
              {program.category}
            </p>
            <span
              style={{ fontFamily: "var(--font-outfit)" }}
              className="text-[13px] uppercase tracking-wider font-semibold text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 group-hover:text-[#D12027] group-hover:border-[#D12027] transition-colors duration-300"
            >
              Explore More
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
