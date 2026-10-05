"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

export interface FilterOption {
  label: string;
  value: string;
  isHeader?: boolean;
}

interface FilterDropdownProps {
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}

function FilterDropdown({ placeholder, options, value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Capture wheel events on the scroll area to prevent Lenis from hijacking them
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop <= 0 && e.deltaY < 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

    // Only stop propagation if there's room to scroll inside the dropdown
    if (!atTop && !atBottom) {
      e.stopPropagation();
    }
  }, []);

  const selectedOption = options.find((opt) => opt.value === value && !opt.isHeader);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      <div 
        className={`filter-dd-trigger ${isOpen ? "open" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="filter-dd-label">{displayLabel}</span>
        <svg viewBox="0 0 360 360" xmlSpace="preserve" className="filter-dd-chevron">
          <g>
            <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z" />
          </g>
        </svg>
      </div>

      <div className={`filter-dd-menu ${isOpen ? "open" : ""}`}>
        <div
          ref={scrollAreaRef}
          className="filter-dd-scroll"
          onWheel={handleWheel}
        >
          {/* "All" reset option */}
          <div className="filter-dd-option">
            <div 
              className="filter-dd-option-btn filter-dd-clear"
              onClick={() => { onChange(""); setIsOpen(false); }}
            >
              <span style={{ position: "relative", zIndex: 1 }}>All {placeholder}</span>
            </div>
          </div>

          {options.map((opt, idx) => {
            if (opt.isHeader) {
              return (
                <div key={`header-${idx}`} className="filter-dd-group-header">
                  <span>{opt.label}</span>
                </div>
              );
            }
            return (
              <div key={opt.value} className={`filter-dd-option ${opt.value === value ? "active" : ""}`}>
                <div 
                  className="filter-dd-option-btn"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                >
                  <span style={{ position: "relative", zIndex: 1 }}>{opt.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── DATA ───

const SCHOOL_OPTIONS: FilterOption[] = [
  { label: "SCSET – School of Computer Science Engineering & Technology", value: "SCSET" },
  { label: "SOAI – School of Artificial Intelligence", value: "SOAI" },
  { label: "SEAS – School of Engineering & Applied Sciences", value: "SEAS" },
  { label: "SOM – School of Management", value: "SOM" },
  { label: "SOL – School of Law", value: "SOL" },
  { label: "TSOM – Times School of Media", value: "TSOM" },
  { label: "SOLA – School of Liberal Arts", value: "SOLA" },
  { label: "SOD – School of Design", value: "SOD" },
];

const PROGRAM_OPTIONS: FilterOption[] = [
  { label: "Semester Exchange", value: "Semester Exchange" },
  { label: "Global Immersion", value: "Global Immersion" },
  { label: "Inbound Immersion", value: "Inbound Immersion" },
  { label: "Pathways Program", value: "Pathways Program" },
  { label: "Progression Arrangement", value: "Progression Arrangement" },
  { label: "International Internship", value: "International Internship" },
  { label: "Inbound Semester Exchange", value: "Inbound Semester Exchange" },
  { label: "Other", value: "Other" },
];

const SEMESTER_OPTIONS: FilterOption[] = Array.from({ length: 10 }, (_, i) => ({
  label: `Semester ${i + 1}`,
  value: `Semester ${i + 1}`,
}));

const COURSE_OPTIONS: FilterOption[] = [
  { label: "Undergraduate Programs", value: "header-ug", isHeader: true },
  { label: "B.Tech", value: "B.Tech" },
  { label: "BCA", value: "BCA" },
  { label: "BBA", value: "BBA" },
  { label: "B.Com", value: "B.Com" },
  { label: "B.A. Liberal Arts", value: "B.A. Liberal Arts" },
  { label: "B.A. Mass Communication", value: "B.A. Mass Communication" },
  { label: "B.A. Film, TV & Web Series", value: "B.A. Film, TV & Web Series" },
  { label: "B.Des", value: "B.Des" },
  { label: "B.A. LL.B. (Hons.)", value: "B.A. LL.B. (Hons.)" },
  { label: "BBA LL.B. (Hons.)", value: "BBA LL.B. (Hons.)" },

  { label: "Postgraduate Programs", value: "header-pg", isHeader: true },
  { label: "MBA", value: "MBA" },
  { label: "MCA", value: "MCA" },
  { label: "M.Tech", value: "M.Tech" },
  { label: "M.A. Mass Communication", value: "M.A. Mass Communication" },
  { label: "M.A. Economics", value: "M.A. Economics" },
  { label: "LL.M.", value: "LL.M." },
  { label: "PG Diploma in TV & Digital Journalism", value: "PG Diploma in TV & Digital Journalism" },

  { label: "Global Programs", value: "header-global", isHeader: true },
  { label: "B.Tech Global", value: "B.Tech Global" },
  { label: "BBA Global", value: "BBA Global" },
  { label: "B.A. Global Liberal Arts", value: "B.A. Global Liberal Arts" },
  { label: "B.A. Global Media", value: "B.A. Global Media" },
  { label: "B.Des Global", value: "B.Des Global" },
];

interface ProgramFiltersProps {
  school: string;
  setSchool: (val: string) => void;
  program: string;
  setProgram: (val: string) => void;
  semester: string;
  setSemester: (val: string) => void;
  course: string;
  setCourse: (val: string) => void;
}

export default function ProgramFilters({
  school,
  setSchool,
  program,
  setProgram,
  semester,
  setSemester,
  course,
  setCourse
}: ProgramFiltersProps) {
  return (
    <>
      <div className="program-filters-grid">
        <FilterDropdown placeholder="Schools" options={SCHOOL_OPTIONS} value={school} onChange={setSchool} />
        <FilterDropdown placeholder="Program" options={PROGRAM_OPTIONS} value={program} onChange={setProgram} />
        <FilterDropdown placeholder="Semester" options={SEMESTER_OPTIONS} value={semester} onChange={setSemester} />
        <FilterDropdown placeholder="Course" options={COURSE_OPTIONS} value={course} onChange={setCourse} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Grid Layout ── */
        .program-filters-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          width: 75%;
          margin-left: auto;
          margin-right: auto;
          margin-top: 15vh;
        }

        /* ── Container ── */
        .filter-dropdown-container {
          font-size: 14px;
          line-height: 1.6;
          color: #798264; /* Website Olive */
          position: relative;
          width: 100%;
          font-family: var(--font-space-grotesk), sans-serif;
        }

        /* ── Trigger Button ── */
        .filter-dd-trigger {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          border: 2px solid rgba(121, 130, 100, 0.8); /* Bold Olive Border */
          background-color: rgba(255, 251, 242, 0.7);
          backdrop-filter: blur(12px);
          overflow: hidden;
          cursor: pointer;
          font-weight: 500;
          letter-spacing: 0.04em;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .filter-dd-trigger::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #798264;
          z-index: 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .filter-dd-label {
          position: relative;
          z-index: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .filter-dd-chevron {
          position: relative;
          z-index: 1;
          width: 12px;
          height: 12px;
          flex-shrink: 0;
          fill: #798264; /* Website Olive */
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .filter-dd-trigger.open {
          color: #ffffff;
          border-color: #798264;
          border-radius: 12px 12px 4px 4px;
        }

        .filter-dd-trigger.open::after {
          transform: scaleX(1);
          transform-origin: right;
        }

        .filter-dd-trigger.open .filter-dd-chevron {
          fill: #ffffff;
          transform: rotate(-180deg);
        }

        /* ── Dropdown Menu ── */
        .filter-dd-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          width: 100%;
          min-width: 100%;
          border-radius: 4px 4px 12px 12px;
          overflow: hidden;
          border: 2px solid rgba(121, 130, 100, 0.8); /* Bold Olive Border */
          background-color: #f5f0e8;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-6px);
          transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
          z-index: 100;
          box-shadow: 0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04);
        }

        .filter-dd-menu.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
          border-color: #798264;
        }

        /* ── Scrollable Area ── */
        .filter-dd-scroll {
          max-height: 280px;
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(196, 203, 183, 0.8) transparent;
        }

        .filter-dd-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .filter-dd-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .filter-dd-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(196, 203, 183, 0.8);
          border-radius: 10px;
        }

        /* ── Category Header ── */
        .filter-dd-group-header {
          padding: 14px 16px 6px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
          color: #798264; /* Website Olive */
          opacity: 0.7;
          border-top: 1px solid rgba(196, 203, 183, 0.3);
        }

        .filter-dd-group-header:first-child {
          border-top: none;
        }

        /* ── Option Item ── */
        .filter-dd-option {
          width: 100%;
        }

        .filter-dd-option-btn {
          display: block;
          padding: 11px 16px;
          width: 100%;
          position: relative;
          text-align: left;
          cursor: pointer;
          color: #798264; /* Website Olive */
          font-weight: 500;
          font-size: 13px;
          transition: color 0.3s ease;
        }

        .filter-dd-option-btn.filter-dd-clear {
          font-style: italic;
          opacity: 0.6;
          border-bottom: 1px solid rgba(196, 203, 183, 0.3);
          font-size: 12px;
        }

        .filter-dd-option-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          transform: scaleX(0);
          width: 100%;
          height: 100%;
          background-color: #798264;
          z-index: 0;
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .filter-dd-option-btn:hover {
          color: #ffffff;
        }

        .filter-dd-option-btn:hover::before {
          transform: scaleX(1);
          transform-origin: right;
        }

        /* Active/selected state */
        .filter-dd-option.active .filter-dd-option-btn {
          background-color: rgba(121, 130, 100, 0.06);
          color: #798264;
        }
        .filter-dd-option.active .filter-dd-option-btn:hover {
          color: #ffffff;
        }

        @media (max-width: 1024px) {
          .program-filters-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            width: 90%;
          }
        }

        @media (max-width: 540px) {
          .program-filters-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            width: 90%;
          }
          .filter-dd-label {
            white-space: normal !important;
            word-wrap: break-word;
            text-align: left;
          }
        }
      ` }} />
    </>
  );
}
