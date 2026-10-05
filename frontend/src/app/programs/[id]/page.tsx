"use client";
import React, { useState } from "react";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/app/homepage/Navbar";
import ProgramsFooter from "../components/ProgramsFooter";
import Pattern from "../components/Pattern";
import { ProgramDetailSkeleton } from "../components/ProgramSkeleton";
import { useAuth } from "@/app/admin/roles/AuthContext";

/* ─── Hero Image Slider (same style as past events) ─── */
function HeroImageSlider({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  if (!images || images.length <= 1) {
    return (
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", marginBottom: "4rem" }}>
        <Image src={images?.[0] || ""} alt={title} fill className="object-cover" sizes="(max-width: 1100px) 100vw, 1100px" priority />
      </div>
    );
  }

  const goLeft = () => setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1));
  const goRight = () => setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1));

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", marginBottom: "4rem", background: "#000" }}
    >
      <Image
        src={images[currentIndex]}
        alt={`${title} - Image ${currentIndex + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 1100px) 100vw, 1100px"
        priority
        style={{ transition: "opacity 0.4s ease" }}
      />
      {/* Left Arrow */}
      <button onClick={goLeft} aria-label="Previous Image" style={{ ...arrowBtnStyle, left: "16px", opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? "auto" : "none" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      {/* Right Arrow */}
      <button onClick={goRight} aria-label="Next Image" style={{ ...arrowBtnStyle, right: "16px", opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? "auto" : "none" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
      </button>
      {/* Dots */}
      <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 50 }}>
        {images.map((_, i) => (
          <div key={i} onClick={() => setCurrentIndex(i)} style={{ width: i === currentIndex ? "20px" : "8px", height: "8px", borderRadius: "4px", backgroundColor: i === currentIndex ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
        ))}
      </div>
    </div>
  );
}

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
      : ["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop"],
    schools: prog.schools_eligible || [],
    programType: prog.program_type,
    semesters: prog.semesters_eligible || [],
    courses: prog.courses_eligible || [],
    overview: prog.overview || "",
    highlights: prog.highlights || [],
    programFee: prog.fee_summary || "",
    feeBreakdownHtml: prog.fee_breakdown || "",
    livingCosts: prog.custom_fields?.livingCosts || [],
    estimatedStayCost: prog.estimated_stay_cost || "",
    lastDate: formatDate(prog.last_date_to_apply),
    ourPOCs: prog.poc ? [prog.poc] : [],
  };
};

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [program, setProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useAuth();
  
  React.useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/programs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProgram(mapToProgramData(data));
        } else {
          setProgram(null);
        }
      } catch (err) {
        console.error("Failed to fetch program:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgram();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#f5f0e8" }}>
        <Pattern />
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        <ProgramDetailSkeleton />
        <ProgramsFooter />
      </div>
    );
  }
  if (!program) return notFound();

  // Build eligibility tags from arrays
  const eligibilityTags: { label: string; values: string[] }[] = [];
  if (program.schools && program.schools.length > 0) eligibilityTags.push({ label: "Eligible Schools", values: program.schools });
  if (program.programType) eligibilityTags.push({ label: "Program", values: [program.programType] });
  if (program.semesters && program.semesters.length > 0) eligibilityTags.push({ label: "Semesters", values: program.semesters });
  if (program.courses && program.courses.length > 0) eligibilityTags.push({ label: "Courses", values: program.courses });

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#f5f0e8" }}>
      <Pattern />

      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main style={{ position: "relative", zIndex: 10, maxWidth: "1100px", width: "100%", margin: "0 auto", padding: "160px clamp(24px, 4vw, 64px) 100px", boxSizing: "border-box" }}>
        {/* Back link */}
        <Link href="/programs" style={{ display: "inline-block", marginBottom: "3rem", fontSize: "14px", color: "#6b6b6b", textDecoration: "none", fontFamily: "var(--font-outfit)" }}>
          ← Back to Programs
        </Link>

        {/* Hero heading */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-instrument-serif)", fontSize: "clamp(40px, 8vw, 100px)", lineHeight: 1, color: "#1a1a1a", letterSpacing: "-0.02em", margin: 0 }}>
            {program.title}
          </h1>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", color: "#6b6b6b", marginTop: "16px", letterSpacing: "0.05em" }}>
            {program.category}
          </p>
        </div>

        {/* Hero Image Slider */}
        <HeroImageSlider images={program.images || [program.image]} title={program.title} />

        {/* ── Eligibility Tags ── */}
        {eligibilityTags.length > 0 && (
          <div style={{ marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid #d4cfc4" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {eligibilityTags.map((group) => (
                <div key={group.label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: "var(--font-outfit)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6b6b", minWidth: "120px", fontWeight: 500 }}>
                    {group.label}
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {group.values.map((val) => (
                      <span
                        key={val}
                        style={{
                          fontFamily: "var(--font-outfit)",
                          fontSize: "13px",
                          padding: "6px 14px",
                          backgroundColor: "rgba(122, 140, 94, 0.1)",
                          border: "1.5px solid rgba(122, 140, 94, 0.35)",
                          borderRadius: "6px",
                          color: "#5C6B3F",
                          fontWeight: 500,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Overview ── */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={headingStyle}>Overview</h2>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", lineHeight: 1.8, color: "#393939" }}>
            {program.overview}
          </p>
        </section>

        {/* ── Highlights ── */}
        {program.highlights && program.highlights.length > 0 && (
          <section style={{ marginBottom: "4rem" }}>
            <h2 style={headingStyle}>Highlights</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {program.highlights.map((point: string, idx: number) => (
                <li key={idx} style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", color: "var(--foreground)", opacity: 0.85, lineHeight: 1.6, position: "relative", paddingLeft: "20px" }}>
                  <span style={{ position: "absolute", left: 0, top: "8px", width: "8px", height: "8px", backgroundColor: "#7A8C5E", borderRadius: "50%" }} />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Program Fees ── */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={headingStyle}>Program Fees</h2>
          <div className="program-fee-layout">
            {/* Fee Highlight Box — Beige & Olive */}
            <div
              style={{
                backgroundColor: "#F0EBD8",
                border: "2px solid rgba(122, 140, 94, 0.5)",
                padding: "2.5rem 2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                minHeight: "180px",
                borderRadius: "4px",
              }}
            >
              <span style={{ fontFamily: "var(--font-outfit)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#7A8C5E", marginBottom: "12px", fontWeight: 600 }}>
                Program Fee
              </span>
              <span style={{ fontFamily: "var(--font-instrument-serif)", fontSize: "clamp(22px, 3vw, 32px)", lineHeight: 1.2, color: "#1a1a1a" }}>
                {program.programFee}
              </span>
            </div>

            {/* Fee Breakdown — sanitised before rendering to prevent stored XSS (SEC-04) */}
            <div
              className="fee-breakdown-content"
              style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", lineHeight: 1.8, color: "#393939", padding: "1.5rem 0" }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(program.feeBreakdownHtml) }}
            />
          </div>
        </section>

        {/* ── Living Expenses (Optional) ── */}
        {program.livingCosts && program.livingCosts.length > 0 && (
          <section style={{ marginBottom: "4rem" }}>
            <h2 style={headingStyle}>Approximate Living Expenses</h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {program.livingCosts.map((lc: any, idx: number) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid #e8e0d0", fontFamily: "var(--font-outfit)", fontSize: "14px" }} className="living-cost-row">
                  <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{lc.item}</span>
                  <span style={{ color: "#6b6b6b" }}>{lc.cost}</span>
                  <span style={{ color: "#1a1a1a", textAlign: "right" }}>{lc.costINR}</span>
                </div>
              ))}
            </div>
            {program.estimatedStayCost && (
              <p style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", color: "#6b6b6b", marginTop: "1.5rem", fontStyle: "italic" }}>
                {program.estimatedStayCost}
              </p>
            )}
          </section>
        )}

        {/* ── POCs ── */}
        {program.ourPOCs && program.ourPOCs.length > 0 && (
          <section style={{ marginBottom: "4rem" }}>
            <h2 style={headingStyle}>University Points of Contact</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {program.ourPOCs.map((poc: any, idx: number) => (
                <div key={idx} style={{ padding: "20px", backgroundColor: "rgba(26, 26, 26, 0.03)", border: "1px solid #d4cfc4", borderRadius: "8px" }}>
                  <h4 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 4px 0" }}>{poc.name}</h4>
                  <p style={{ fontFamily: "var(--font-outfit)", fontSize: "13px", color: "#6b6b6b", margin: "0 0 12px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{poc.designation}</p>
                  <p style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", color: "#393939", margin: "0 0 4px 0" }}><strong>Email:</strong> {poc.email}</p>
                  <p style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", color: "#393939", margin: 0 }}><strong>Contact:</strong> {poc.contactNumber}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Last Date ── */}
        <section style={{ textAlign: "center", marginBottom: "3rem", padding: "2rem", backgroundColor: "rgba(26, 26, 26, 0.03)", border: "1px solid #d4cfc4" }}>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", color: "#6b6b6b", marginBottom: "8px" }}>LAST DATE TO REGISTER</p>
          <p style={{ fontFamily: "var(--font-instrument-serif)", fontSize: "32px", color: "#1a1a1a", margin: 0 }}>{program.lastDate}</p>
        </section>

        {/* Apply Now Button — only for student and editor */}
        {(role === 'student' || role === 'editor') && (
          <div style={{ textAlign: "center", paddingBottom: "2rem" }}>
            <Link href={`/programs/${id}/apply`}>
              <button
                style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "20px 64px", backgroundColor: "#1a1a1a", color: "#FFFBF2", border: "none", cursor: "pointer", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#7A8C5E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1a1a1a"; }}
              >
                Apply Now →
              </button>
            </Link>
          </div>
        )}
      </main>

      <ProgramsFooter />

      <style>{`
        .program-fee-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .program-fee-layout { grid-template-columns: 1fr !important; }
          .living-cost-row { grid-template-columns: 1fr !important; gap: 0.25rem !important; }
        }

        /* Render admin HTML perfectly */
        .fee-breakdown-content p { margin: 0 0 0.75rem 0; }
        .fee-breakdown-content strong { font-weight: 700; color: #1a1a1a; }
        .fee-breakdown-content em { font-style: italic; }
        .fee-breakdown-content ul { margin: 0.5rem 0 1rem 0; padding-left: 1.25rem; list-style-type: disc; }
        .fee-breakdown-content ul li { margin-bottom: 0.4rem; line-height: 1.7; }
        .fee-breakdown-content ol { margin: 0.5rem 0 1rem 0; padding-left: 1.25rem; }
        .fee-breakdown-content ol li { margin-bottom: 0.4rem; line-height: 1.7; }
        .fee-breakdown-content a { color: #7A8C5E; text-decoration: underline; }
        .fee-breakdown-content h1, .fee-breakdown-content h2, .fee-breakdown-content h3, .fee-breakdown-content h4 { font-family: var(--font-outfit); color: #1a1a1a; margin: 1rem 0 0.5rem 0; }
        .fee-breakdown-content table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; }
        .fee-breakdown-content th, .fee-breakdown-content td { padding: 8px 12px; border: 1px solid #e8e0d0; text-align: left; font-size: 14px; }
        .fee-breakdown-content th { background-color: rgba(122,140,94,0.08); font-weight: 600; }
        .fee-breakdown-content blockquote { border-left: 3px solid #7A8C5E; margin: 0.75rem 0; padding: 0.5rem 1rem; color: #6b6b6b; font-style: italic; }
        .fee-breakdown-content u { text-decoration: underline; }
        .fee-breakdown-content s, .fee-breakdown-content del { text-decoration: line-through; }
        .fee-breakdown-content sub { vertical-align: sub; font-size: 0.85em; }
        .fee-breakdown-content sup { vertical-align: super; font-size: 0.85em; }
        .fee-breakdown-content pre { background: rgba(26,26,26,0.04); padding: 1rem; overflow-x: auto; border-radius: 4px; font-size: 13px; }
        .fee-breakdown-content code { background: rgba(26,26,26,0.06); padding: 2px 6px; border-radius: 3px; font-size: 13px; }
        .fee-breakdown-content img { max-width: 100%; height: auto; }
        .fee-breakdown-content hr { border: none; border-top: 1px solid #e8e0d0; margin: 1rem 0; }
      `}</style>
    </div>
  );
}

/* ─── Shared styles ─── */
const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-instrument-serif)",
  fontSize: "28px",
  color: "#1a1a1a",
  marginBottom: "1.5rem",
  paddingBottom: "0.75rem",
  borderBottom: "2px solid #1a1a1a",
};

const arrowBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 50,
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "rgba(255,255,255,0.9)",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  transition: "transform 0.2s, background-color 0.2s, opacity 0.3s ease",
};
