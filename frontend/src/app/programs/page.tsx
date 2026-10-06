"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/app/homepage/Navbar";
import ProgramsFooter from "./components/ProgramsFooter";
import Pattern from "./components/Pattern";
import BackgroundMap from "./components/BackgroundMap";
import ProgramCard from "./components/ProgramCard";
import ProgramFilters from "./components/ProgramFilters";
import LeadCaptureModal from "./components/LeadCaptureModal";
import Link from "next/link";
import { ProgramGridSkeleton } from "./components/ProgramSkeleton";
import { Calendar, RefreshCw } from "lucide-react";

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// Map backend response to ProgramData structure expected by components
const mapToProgramData = (prog: any) => {
  return {
    id: prog.id,
    title: prog.title || prog.name,
    category: prog.program_type,
    date: formatDate(prog.start_date),
    image: prog.custom_fields?.posterUrl || "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop",
    images: (prog.custom_fields?.galleryUrls && prog.custom_fields.galleryUrls.length > 0)
      ? prog.custom_fields.galleryUrls
      : [prog.custom_fields?.posterUrl || "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop"],
    schools: prog.schools_eligible || [],
    programType: prog.program_type,
    semesters: prog.semesters_eligible || [],
    courses: prog.courses_eligible || [],
    overview: prog.overview || "",
    highlights: prog.highlights || [],
    programFee: prog.fee_summary || "",
    feeBreakdownHtml: prog.fee_breakdown || "",
    livingCosts: [], // Not supported as array in DB, handled separately if needed
    estimatedStayCost: prog.estimated_stay_cost || "",
    lastDate: formatDate(prog.last_date_to_apply),
    ourPOCs: prog.poc ? [prog.poc] : [],
  };
};

export default function OtherProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [schoolFilter, setSchoolFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/programs`);
        if (res.ok) {
          const data = await res.json();
          // Filter out archived programs and only show published ones
          const activeProgs = (data.data || []).filter((p: any) => !p.is_archived && p.status === 'published');
          setPrograms(activeProgs.map(mapToProgramData));
        }
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const filteredPrograms = React.useMemo(() => {
    return programs.filter(prog => {
      if (schoolFilter) {
        const schools = prog.schools || [];
        if (!schools.includes(schoolFilter) && !schools.includes("All")) {
          return false;
        }
      }
      if (programFilter) {
        if (prog.programType !== programFilter) {
          return false;
        }
      }
      if (semFilter) {
        const sems = prog.semesters || [];
        if (!sems.includes(semFilter) && !sems.includes("All")) {
          return false;
        }
      }
      if (courseFilter) {
        const courses = prog.courses || [];
        if (!courses.includes(courseFilter) && !courses.includes("All")) {
          return false;
        }
      }
      return true;
    });
  }, [programs, schoolFilter, programFilter, semFilter, courseFilter]);

  const scrollToPrograms = () => {
    const element = document.getElementById("programs-grid");
    if (element) {
      const yOffset = -100; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#f5f0e8" }}>
      <LeadCaptureModal />
      <Pattern />


      {/* Floating Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Hero Section — full viewport height, heading shifted up by 10vh */}
      <section className="relative z-30 flex flex-col items-center justify-center min-h-screen" style={{ transform: "translateY(-10vh)" }}>
        {/* World Map background behind heading (Hidden on mobile) */}
        <div className="hidden md:block">
          <BackgroundMap />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full flex flex-col items-center relative z-10"
        >
          <h1
            style={{ fontFamily: "var(--font-instrument-serif)", position: "relative", zIndex: 2 }}
            className="text-[22vw] sm:text-[16vw] lg:text-[243px] leading-[0.9] tracking-tight text-[#1a1a1a]"
          >
            Programs
          </h1>
          <div className="w-full max-w-[1400px] px-[clamp(24px,4vw,64px)] z-20 relative">
            <ProgramFilters 
              school={schoolFilter}
              setSchool={setSchoolFilter}
              program={programFilter}
              setProgram={setProgramFilter}
              semester={semFilter}
              setSemester={setSemFilter}
              course={courseFilter}
              setCourse={setCourseFilter}
            />
          </div>
        </motion.div>
        
        {/* Subtle explore text at bottom */}
        <button 
          onClick={scrollToPrograms}
          className="absolute bottom-[2vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer group"
          style={{ color: "#1a1a1a" }}
        >
          <span style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "13.2px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            Explore All Programs
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:translate-y-1 transition-transform duration-300"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </section>

      {/* Programs Grid / Empty State */}
      <section
        id="programs-grid"
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1400px",
          width: "100%",
          margin: filteredPrograms.length === 0 && !isLoading ? "22vh auto 20vh" : "15vh auto 0",
          padding: "0 clamp(24px, 4vw, 64px)",
          minHeight: filteredPrograms.length === 0 && !isLoading ? "70vh" : "auto",
          display: filteredPrograms.length === 0 && !isLoading ? "flex" : "block",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
              gap: "80px 40px",
              paddingBottom: "100px",
            }}
          >
            <ProgramGridSkeleton count={6} />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="w-full flex items-center justify-center py-6 px-4">
            <div
              className="relative w-full max-w-[780px] lg:max-w-[830px] min-h-[500px] md:min-h-[560px] rounded-[36px] md:rounded-[44px] overflow-hidden flex flex-col items-center justify-center py-20 sm:py-24 md:py-28 px-8 sm:px-14 md:px-20 text-center select-none transition-all duration-500 hover:shadow-2xl"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 35px 80px -20px rgba(0, 0, 0, 0.09), 0 0 0 1px rgba(255, 255, 255, 0.95) inset",
              }}
            >
              {/* Subtle background glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 50% 25%, rgba(209, 32, 39, 0.06) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />

              {/* Icon Container */}
              <div
                className="relative flex items-center justify-center w-24 h-24 md:w-26 md:h-26 rounded-full mb-8"
                style={{
                  backgroundColor: "rgba(209, 32, 39, 0.07)",
                  border: "2px solid rgba(209, 32, 39, 0.18)",
                  boxShadow: "0 14px 32px -6px rgba(209, 32, 39, 0.22)",
                }}
              >
                <Calendar
                  className="w-11 h-11 md:w-12 md:h-12 text-[#D12027]"
                  strokeWidth={1.8}
                />
              </div>

              {/* Status Badge */}
              <span
                className="inline-block px-5 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold tracking-[0.22em] uppercase mb-7"
                style={{
                  backgroundColor: "rgba(209, 32, 39, 0.06)",
                  color: "#D12027",
                  border: "1px solid rgba(209, 32, 39, 0.15)",
                }}
              >
                Stay Tuned
              </span>

              {/* Main Title */}
              <h3
                className="font-sans text-3xl sm:text-4xl md:text-[2.65rem] lg:text-[2.9rem] font-medium leading-tight text-[#1a1a1a] mb-5"
                style={{ fontFamily: "var(--font-space-grotesk), sans-serif", letterSpacing: "-0.03em" }}
              >
                No programs found
              </h3>

              {/* Subtitle / Description */}
              <p className="font-sans text-base sm:text-lg md:text-[1.12rem] text-[#555] max-w-[560px] leading-relaxed mb-4">
                Past global engagements, exchange opportunities, and program listings will appear here once published.
              </p>

              {/* Action Buttons if filters or quick navigation */}
              {(schoolFilter || programFilter || semFilter || courseFilter) ? (
                <button
                  onClick={() => {
                    setSchoolFilter("");
                    setProgramFilter("");
                    setSemFilter("");
                    setCourseFilter("");
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm md:text-[15px] font-medium text-white bg-[#D12027] hover:bg-[#b01b21] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
              gap: "80px 40px",
              paddingBottom: "100px",
            }}
          >
            {filteredPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <ProgramsFooter />
    </div>
  );
}
