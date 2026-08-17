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
import { ProgramGridSkeleton } from "./components/ProgramSkeleton";

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
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#FFFBF2" }}>
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

      {/* Programs Grid */}
      <section
        id="programs-grid"
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1400px",
          width: "100%",
          margin: "15vh auto 0",
          padding: "0 clamp(24px, 4vw, 64px) 128px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
            gap: "80px 40px",
          }}
        >
          {isLoading ? (
            <ProgramGridSkeleton count={6} />
          ) : filteredPrograms.length === 0 ? (
            <div className="col-span-full text-center py-20 text-[#6b6b6b]">No programs found.</div>
          ) : (
            filteredPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <ProgramsFooter />
    </div>
  );
}
