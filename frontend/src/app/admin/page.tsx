"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList,
} from "recharts";
import * as d3 from "d3";
import { AdminDashboardSkeleton } from "@/app/admin/optemization_component";

const WorldMapSVG = dynamic(() => import("@/app/homepage/WorldMapSVG"), { ssr: false });

import {
  UNIVERSITY_COORDS,
  MOCK_MOUS,
  MOCK_TREND_DATA,
  MOCK_STATUS_DATA,
  MOCK_SCHOOL_DATA,
  MOCK_BOTTLENECK_DATA,
  MOCK_MOU_YEAR_DATA,
  MOCK_MOU_TYPE_DATA,
  MOCK_MOU_STATUS_SUMMARY,
  MOCK_APP_PROGRAM_BREAKDOWN,
  MOCK_APP_SEMESTER_DATA,
  MOCK_APP_GENDER_DATA,
  MOCK_PROGRAM_TYPE_DATA,
  MOCK_PROGRAM_YEAR_DATA,
  MOCK_PROGRAM_SCHOOL_COVERAGE,
  MOCK_PROGRAM_STATUS_SUMMARY,
} from "./data/mockData";

// ─── CUSTOM TOOLTIP ───
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1a1a", color: "#f5f0e8", padding: "8px 12px", borderRadius: 0, fontSize: 12, lineHeight: 1.6 }}>
      <div style={{ fontWeight: 500, marginBottom: 2 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: p.color, display: "inline-block" }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

// ─── ANIMATED COUNTER ───
function AnimatedCounter({ value, prefix = "", suffix = "", color }: { value: number; prefix?: string; suffix?: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    const interpolator = d3.interpolateNumber(0, value);
    const ease = d3.easeCubicOut;
    const duration = 1200;
    let start: number | null = null;
    let raf: number;

    function step(ts: number) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const v = interpolator(ease(t));
      setDisplayed(
        Number.isInteger(value) ? Math.round(v).toString() : v.toFixed(1)
      );
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span ref={ref} style={{ color }}>{prefix}{displayed}{suffix}</span>;
}

// ─── CONTINENT GAUGE ───
function ContinentGauge({ count, total, label }: { count: number; total: number; label: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const data = [
    { value: pct, fill: "#5c6b47" },
    { value: 100 - pct, fill: "#b5bda066" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ width: "100%", height: 90, position: "relative" }}>
        <ResponsiveContainer width="100%" height={90}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={28}
              outerRadius={38}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              isAnimationActive={false}
            >
              {data.map((d, i) => <Cell key={i} fill={d.fill} stroke="none" />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          fontSize: "1.4rem", fontWeight: 300, color: "#1a1a1a"
        }}>
          {count}
        </div>
      </div>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b", textAlign: "center" }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: "#6b6b6b" }}>{count} MOUs</div>
    </div>
  );
}

// ─── PANEL WRAPPER ───
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: 12,
      border: "1px solid #b5bda0",
      background: "#ede8de",
      padding: "1.5rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── STAT CARD ───
function StatCard({ label, value, delta, positive, forceRed, isMobile }: {
  label: string; value: string; delta: string; positive: boolean; forceRed?: boolean; isMobile: boolean;
}) {
  return (
    <Panel style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b" }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color: "#6b6b6b" }}>↗</span>
      </div>
      <div style={{
        fontSize: isMobile ? "1.6rem" : "2.2rem", fontWeight: 300,
        color: forceRed && value !== "0" ? "#c0392b" : "#1a1a1a",
        marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#6b6b6b" }}>
        <span style={{
          display: "inline-block", width: 6, height: 6, borderRadius: "50%", marginRight: 6,
          background: positive ? "#5c6b47" : "#c0392b",
        }} />
        {delta} vs last period
      </div>
    </Panel>
  );
}

// ─── FILTER CHIP ───
function FilterChip({ label, options, value, onChange }: {
  label: string; options: { label: string; value: string; isHeader?: boolean }[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find(o => o.value === value && !o.isHeader)?.label || label;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: "999px",
          border: value ? "1px solid #1a1a1a" : "1px solid #b5bda0",
          background: value ? "#1a1a1a" : "transparent",
          color: value ? "#f5f0e8" : "#6b6b6b",
          fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
          transition: "all 0.2s",
        }}
      >
        {selectedLabel}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke={value ? "#f5f0e8" : "#6b6b6b"} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div data-lenis-prevent style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100,
          background: "#f5f0e8", border: "1px solid #b5bda0", borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)", minWidth: 180,
          maxHeight: 220, overflowY: "auto",
        }}>
          {options.map((opt, i) => {
            if (opt.isHeader) {
              return (
                <div key={`header-${i}`} style={{
                  padding: "10px 14px 4px", fontSize: 11, fontWeight: 600,
                  color: "#a89b7a", textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {opt.label}
                </div>
              );
            }
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value === value ? "" : opt.value); setOpen(false); }}
                style={{
                  display: "block", width: "100%", padding: "8px 14px",
                  background: opt.value === value ? "rgba(92, 107, 71, 0.1)" : "none",
                  border: "none", textAlign: "left", fontSize: 12,
                  color: "#1a1a1a", cursor: "pointer",
                  fontWeight: opt.value === value ? 600 : 400,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(181, 189, 160, 0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = opt.value === value ? "rgba(92, 107, 71, 0.1)" : "transparent"}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SECTION TITLE ───
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: "#6b6b6b" }}>{subtitle}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ═══════════════════════════════════════════
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"mou" | "applications" | "programs">("mou");
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // MOU Filters
  const [mouStatusFilter, setMouStatusFilter] = useState("");
  const [mouTypeFilter, setMouTypeFilter] = useState("");
  const [mouYearFilter, setMouYearFilter] = useState("");

  // Application Filters
  const [appStatusFilter, setAppStatusFilter] = useState("");
  const [appProgramFilter, setAppProgramFilter] = useState("");
  const [appSchoolFilter, setAppSchoolFilter] = useState("");
  const [appSemesterFilter, setAppSemesterFilter] = useState("");
  const [appCourseFilter, setAppCourseFilter] = useState("");

  // Options matching the Programs section exactly
  const SCHOOL_OPTIONS = [
    { label: "SCSET – School of Computer Science Engineering & Technology", value: "SCSET" },
    { label: "SOAI – School of Artificial Intelligence", value: "SOAI" },
    { label: "SEAS – School of Engineering & Applied Sciences", value: "SEAS" },
    { label: "SOM – School of Management", value: "SOM" },
    { label: "SOL – School of Law", value: "SOL" },
    { label: "TSOM – Times School of Media", value: "TSOM" },
    { label: "SOLA – School of Liberal Arts", value: "SOLA" },
    { label: "SOD – School of Design", value: "SOD" },
  ];

  const PROGRAM_OPTIONS = [
    { label: "Semester Exchange", value: "Semester Exchange" },
    { label: "Global Immersion", value: "Global Immersion" },
    { label: "Inbound Immersion", value: "Inbound Immersion" },
    { label: "Pathways Program", value: "Pathways Program" },
    { label: "Progression Arrangement", value: "Progression Arrangement" },
    { label: "International Internship", value: "International Internship" },
    { label: "Inbound Semester Exchange", value: "Inbound Semester Exchange" },
    { label: "Other", value: "Other" },
  ];

  const SEMESTER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
    label: `Semester ${i + 1}`,
    value: `Semester ${i + 1}`,
  }));

  const COURSE_OPTIONS = [
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

  // Program Filters
  const [progStatusFilter, setProgStatusFilter] = useState("");
  const [progTypeFilter, setProgTypeFilter] = useState("");

  const [mousList, setMousList] = useState<any[]>([]);
  const [applicationsList, setApplicationsList] = useState<any[]>([]);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        const [mousRes, appsRes, progsRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/mous`, { headers }),
          fetch(`${API_URL}/api/v1/applications`, { headers }),
          fetch(`${API_URL}/api/v1/programs`, { headers })
        ]);

        if (mousRes.ok) {
          const res = await mousRes.json();
          setMousList(res.data || []);
        }
        if (appsRes.ok) {
          const res = await appsRes.json();
          setApplicationsList(res.data || []);
        }
        if (progsRes.ok) {
          const res = await progsRes.json();
          setProgramsList(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered lists
  const filteredMous = useMemo(() => {
    return mousList.filter(m => {
      if (mouStatusFilter && (m.status || "").toLowerCase() !== mouStatusFilter.toLowerCase()) return false;
      if (mouTypeFilter && m.type !== mouTypeFilter) return false;
      if (mouYearFilter && m.start_date && new Date(m.start_date).getFullYear().toString() !== mouYearFilter) return false;
      return true;
    });
  }, [mousList, mouStatusFilter, mouTypeFilter, mouYearFilter]);

  const filteredApps = useMemo(() => {
    return applicationsList.filter(a => {
      if (appStatusFilter && (a.status || "").toLowerCase() !== appStatusFilter.toLowerCase()) return false;
      if (appProgramFilter && a.programName !== appProgramFilter) return false;
      // Database/Supabase fields check
      return true;
    });
  }, [applicationsList, appStatusFilter, appProgramFilter]);

  const filteredPrograms = useMemo(() => {
    return programsList.filter(p => {
      if (progStatusFilter) {
        const isArchived = p.is_archived || false;
        if (progStatusFilter === "archived" && !isArchived) return false;
        if (progStatusFilter === "active" && isArchived) return false;
      }
      if (progTypeFilter && p.type !== progTypeFilter) return false;
      return true;
    });
  }, [programsList, progStatusFilter, progTypeFilter]);

  // Globe markers
  const mouMarkers = useMemo(() => {
    const list = filteredMous.length > 0 ? filteredMous : mousList;
    return list
      .filter((m) => UNIVERSITY_COORDS[m.partner_university])
      .map((m) => ({
        name: m.partner_university,
        coords: UNIVERSITY_COORDS[m.partner_university].coords as [number, number],
        status: (m.status || "Active").toLowerCase() as "active" | "expired" | "draft" | "dormant",
        country: UNIVERSITY_COORDS[m.partner_university].country,
      }));
  }, [filteredMous, mousList]);

  // Continent counts
  const continentCounts = useMemo(() => {
    const counts: Record<string, number> = { Europe: 0, Americas: 0, Asia: 0, Oceania: 0 };
    mousList.forEach((m) => {
      const info = UNIVERSITY_COORDS[m.partner_university];
      if (info) counts[info.continent] = (counts[info.continent] || 0) + 1;
    });
    return counts;
  }, [mousList]);

  const totalMOUs = mousList.length;

  const mouStatusSummary = useMemo(() => {
    const total = mousList.length;
    const active = mousList.filter(m => (m.status || "").toLowerCase() === "active").length;
    const expired = mousList.filter(m => (m.status || "").toLowerCase() === "expired").length;
    const draft = mousList.filter(m => (m.status || "").toLowerCase() === "draft").length;
    
    const expiringIn90Days = mousList.filter(m => {
      if (!m.expiry_date) return false;
      const diffTime = new Date(m.expiry_date).getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 90;
    }).length;

    return {
      total,
      active,
      expired,
      draft,
      expiringIn90Days,
    };
  }, [mousList]);

  // Status donut total
  const statusTotal = useMemo(() => {
    return applicationsList.length;
  }, [applicationsList]);

  const appStatusSummary = useMemo(() => {
    const total = applicationsList.length;
    const approved = applicationsList.filter(a => (a.status || "").toLowerCase() === "approved" || a.pipelineStage === "completed").length;
    const pending = applicationsList.filter(a => (a.status || "").toLowerCase() === "pending" || a.pipelineStage === "received" || a.pipelineStage === "under_review").length;
    const rejected = applicationsList.filter(a => (a.status || "").toLowerCase() === "rejected" || a.pipelineStage === "rejected").length;
    return { total, approved, pending, rejected };
  }, [applicationsList]);

  const appStatusData = useMemo(() => {
    return [
      { name: "Approved", value: appStatusSummary.approved, color: "#5c6b47" },
      { name: "Pending", value: appStatusSummary.pending, color: "#a89b7a" },
      { name: "Rejected", value: appStatusSummary.rejected, color: "#c0392b" }
    ];
  }, [appStatusSummary]);

  // School bar max
  const schoolCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applicationsList.forEach(app => {
      const sch = app.school || "Other";
      counts[sch] = (counts[sch] || 0) + 1;
    });
    return Object.keys(counts).map(school => ({ school, count: counts[school] }));
  }, [applicationsList]);

  const schoolMax = useMemo(() => {
    if (schoolCounts.length === 0) return 1;
    return Math.max(...schoolCounts.map((d) => d.count));
  }, [schoolCounts]);

  // Growth strip
  const thisYearApps = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return applicationsList.filter(app => {
      if (!app.submittedAt) return false;
      return new Date(app.submittedAt).getFullYear() === currentYear;
    }).length;
  }, [applicationsList]);

  const lastYearApps = useMemo(() => {
    const lastYear = new Date().getFullYear() - 1;
    return applicationsList.filter(app => {
      if (!app.submittedAt) return false;
      return new Date(app.submittedAt).getFullYear() === lastYear;
    }).length;
  }, [applicationsList]);

  const appGrowth = useMemo(() => {
    if (lastYearApps === 0) return thisYearApps > 0 ? 100 : 0;
    return ((thisYearApps - lastYearApps) / lastYearApps) * 100;
  }, [thisYearApps, lastYearApps]);

  // Program type max
  const programSchoolCoverage = useMemo(() => {
    const counts: Record<string, number> = {};
    programsList.forEach(p => {
      const schools = Array.isArray(p.eligible_schools) ? p.eligible_schools : [];
      schools.forEach((s: string) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return Object.keys(counts).map(school => ({ school, programs: counts[school] }));
  }, [programsList]);

  const progSchoolMax = useMemo(() => {
    if (programSchoolCoverage.length === 0) return 1;
    return Math.max(...programSchoolCoverage.map((d) => d.programs));
  }, [programSchoolCoverage]);

  // Chart data generators
  const mouYearData = useMemo(() => {
    const yearCounts: Record<string, number> = {};
    mousList.forEach((m) => {
      if (m.start_date) {
        const year = new Date(m.start_date).getFullYear().toString();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    const years = Object.keys(yearCounts).sort();
    if (years.length === 0) return [{ year: new Date().getFullYear().toString(), signed: 0 }];
    return years.map(yr => ({ year: yr, signed: yearCounts[yr] }));
  }, [mousList]);

  const mouTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    mousList.forEach((m) => {
      if (m.type) {
        typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
      }
    });
    const types = Object.keys(typeCounts);
    if (types.length === 0) return [{ type: "None", count: 0 }];
    return types.map(t => ({ type: t, count: typeCounts[t] }));
  }, [mousList]);

  const appTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trend = months.map(m => ({ month: m, thisYear: 0, lastYear: 0 }));
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    applicationsList.forEach(app => {
      if (app.submittedAt) {
        const date = new Date(app.submittedAt);
        const y = date.getFullYear();
        const mIdx = date.getMonth();
        if (y === currentYear) {
          trend[mIdx].thisYear += 1;
        } else if (y === lastYear) {
          trend[mIdx].lastYear += 1;
        }
      }
    });
    return trend;
  }, [applicationsList]);

  const appProgramBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    applicationsList.forEach(app => {
      const pName = app.programName || "Other";
      counts[pName] = (counts[pName] || 0) + 1;
    });
    const entries = Object.keys(counts);
    if (entries.length === 0) return [{ program: "None", applications: 0 }];
    return entries.map(name => ({ program: name, applications: counts[name] }));
  }, [applicationsList]);

  const appSemesterData = useMemo(() => {
    const counts: Record<string, number> = {};
    applicationsList.forEach(app => {
      const sem = app.semester || "Sem 1";
      counts[sem] = (counts[sem] || 0) + 1;
    });
    const entries = Object.keys(counts).sort();
    if (entries.length === 0) return [{ semester: "N/A", count: 0 }];
    return entries.map(sem => ({ semester: sem, count: counts[sem] }));
  }, [applicationsList]);

  const appGenderData = useMemo(() => {
    const counts: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
    applicationsList.forEach(app => {
      const g = app.gender || "Other";
      if (counts[g] !== undefined) counts[g] += 1;
    });
    return [
      { name: "Male", value: counts.Male, color: "#5c6b47" },
      { name: "Female", value: counts.Female, color: "#a89b7a" },
      { name: "Other", value: counts.Other, color: "#b5bda0" }
    ];
  }, [applicationsList]);

  const programTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    programsList.forEach(p => {
      const type = p.type || "Other";
      counts[type] = (counts[type] || 0) + 1;
    });
    const colors = ["#5c6b47", "#a89b7a", "#b5bda0", "#c0392b", "#8b7e62"];
    const entries = Object.keys(counts);
    if (entries.length === 0) return [{ name: "None", value: 0, color: colors[0] }];
    return entries.map((type, i) => ({
      name: type,
      value: counts[type],
      color: colors[i % colors.length]
    }));
  }, [programsList]);

  const programStatusSummary = useMemo(() => {
    const total = programsList.length;
    const active = programsList.filter(p => !p.is_archived).length;
    const archived = programsList.filter(p => p.is_archived).length;
    const comingSoon = programsList.filter(p => p.status === "coming_soon").length;
    
    // Average duration calculation
    let totalDurMonths = 0;
    let validCount = 0;
    programsList.forEach(p => {
      if (p.duration) {
        const num = parseFloat(p.duration);
        if (!isNaN(num)) {
          totalDurMonths += num;
          validCount += 1;
        }
      }
    });
    const avgDuration = validCount > 0 ? `${(totalDurMonths / validCount).toFixed(1)} Months` : "N/A";

    return {
      total,
      active,
      archived,
      comingSoon,
      avgDuration
    };
  }, [programsList]);

  const programYearData = useMemo(() => {
    const yearCounts: Record<string, number> = {};
    programsList.forEach((p) => {
      if (p.created_at) {
        const year = new Date(p.created_at).getFullYear().toString();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    const years = Object.keys(yearCounts).sort();
    if (years.length === 0) return [{ year: new Date().getFullYear().toString(), created: 0 }];
    return years.map(yr => ({ year: yr, created: yearCounts[yr] }));
  }, [programsList]);


  const TABS = [
    { id: "mou" as const, label: "MOUs" },
    { id: "applications" as const, label: "Applications" },
    { id: "programs" as const, label: "Programs" },
  ];

  if (!mounted) return <div style={{ minHeight: "100vh", backgroundColor: "#f5f0e8" }} />;

  if (isLoading) return <AdminDashboardSkeleton />;

  return (
    <div style={{ padding: "0.5rem 0", minHeight: "100%" }}>

      {/* ══════════ HEADER ══════════ */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end",
        gap: isMobile ? 12 : 0,
        paddingBottom: "1rem", marginBottom: "1.25rem", borderBottom: "1px solid #b5bda0",
      }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-atavian), serif", color: "#1a1a1a", lineHeight: 1.1,
            margin: 0, fontSize: isMobile ? "2.6rem" : "3.5rem", fontWeight: 400
          }}>
            Analytics
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b6b6b" }}>Office of International Affairs</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Tab Switcher */}
          <div style={{
            display: "flex",
            background: "#ebe4d5",
            padding: "4px",
            borderRadius: "999px",
            position: "relative"
          }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    position: "relative",
                    padding: "6px 20px",
                    fontSize: "13px",
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "#f5f0e8" : "#6b6b6b",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    zIndex: 1,
                    transition: "color 0.3s ease"
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAnalyticsTab"
                      style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "#1a1a1a",
                        borderRadius: "999px",
                        zIndex: -1
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button style={{
            border: "1px solid #1a1a1a", background: "transparent", color: "#1a1a1a",
            padding: "6px 14px", borderRadius: "999px", fontSize: 13, cursor: "pointer",
          }}>
            Export ↓
          </button>
        </div>
      </div>

      {/* ══════════ TAB CONTENT ══════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >

          {/* ══════════ TAB 1: MOU ANALYTICS ══════════ */}
          {activeTab === "mou" && (
            <div>
              {/* KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "0.75rem" : "1rem", marginBottom: "1.25rem" }}>
                <StatCard label="Total MOUs" value={String(mouStatusSummary.total)} delta="+6" positive isMobile={isMobile} />
                <StatCard label="Active MOUs" value={String(mouStatusSummary.active)} delta="+3" positive isMobile={isMobile} />
                <StatCard label="Expiring in 90 Days" value={String(mouStatusSummary.expiringIn90Days)} delta="2 new" positive={false} forceRed isMobile={isMobile} />
                <StatCard label="Expired MOUs" value={String(mouStatusSummary.expired)} delta="1 new" positive={false} forceRed isMobile={isMobile} />
              </div>

              {/* Filters */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.25rem", alignItems: "center" }}>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b", marginRight: 4 }}>Filters:</span>
                <FilterChip
                  label="Status"
                  options={[
                    { label: "All Status", value: "" },
                    { label: "Active", value: "active" },
                    { label: "Draft", value: "draft" },
                    { label: "Expired", value: "expired" },
                  ]}
                  value={mouStatusFilter}
                  onChange={setMouStatusFilter}
                />
                <FilterChip
                  label="MOU Type"
                  options={[
                    { label: "All Types", value: "" },
                    ...mouTypeData.map(d => ({ label: d.type, value: d.type }))
                  ]}
                  value={mouTypeFilter}
                  onChange={setMouTypeFilter}
                />
                <FilterChip
                  label="Year"
                  options={[
                    { label: "All Years", value: "" },
                    ...mouYearData.map(d => ({ label: d.year, value: d.year }))
                  ]}
                  value={mouYearFilter}
                  onChange={setMouYearFilter}
                />
                {(mouStatusFilter || mouTypeFilter || mouYearFilter) && (
                  <button
                    onClick={() => { setMouStatusFilter(""); setMouTypeFilter(""); setMouYearFilter(""); }}
                    style={{ fontSize: 11, color: "#c0392b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Charts Row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "55% 45%", gap: "1rem", marginBottom: "1rem" }}>
                {/* Year-wise MOU Signing */}
                <Panel>
                  <SectionTitle title="Year-wise MOU Signing" subtitle="Number of MOUs signed each year" />
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={mouYearData} barCategoryGap="30%">
                      <CartesianGrid vertical={false} stroke="#b5bda0" strokeOpacity={0.4} />
                      <XAxis dataKey="year" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={{ stroke: "#b5bda0" }} tickLine={false} />
                      <YAxis tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="signed" fill="#5c6b47" name="Signed" barSize={18} radius={[2, 2, 0, 0]} isAnimationActive={false}>
                        <LabelList dataKey="signed" position="top" style={{ fontSize: 11, fill: "#6b6b6b" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>

                {/* MOU Status Donut */}
                <Panel>
                  <SectionTitle title="MOU Status Breakdown" subtitle="Current distribution by status" />
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: "1.5rem", paddingTop: 8 }}>
                    <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Active", value: mouStatusSummary.active, color: "#5c6b47" },
                              { name: "Expiring", value: mouStatusSummary.expiringIn90Days, color: "#a89b7a" },
                              { name: "Expired", value: mouStatusSummary.expired, color: "#c0392b" },
                              { name: "Draft", value: mouStatusSummary.draft, color: "#b5bda0" },
                            ]}
                            innerRadius={45}
                            outerRadius={65}
                            dataKey="value"
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={-270}
                            isAnimationActive={false}
                          >
                            {[
                              { color: "#5c6b47" },
                              { color: "#a89b7a" },
                              { color: "#c0392b" },
                              { color: "#b5bda0" },
                            ].map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                        <div style={{ fontSize: "1.6rem", fontWeight: 300, color: "#1a1a1a" }}>{mouStatusSummary.total}</div>
                        <div style={{ fontSize: 10, color: "#6b6b6b" }}>Total</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { name: "Active", value: mouStatusSummary.active, color: "#5c6b47" },
                        { name: "Expiring (90d)", value: mouStatusSummary.expiringIn90Days, color: "#a89b7a" },
                        { name: "Expired", value: mouStatusSummary.expired, color: "#c0392b" },
                        { name: "Draft", value: mouStatusSummary.draft, color: "#b5bda0" },
                      ].map(d => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#6b6b6b" }}>
                          <span style={{ width: 12, height: 12, background: d.color, display: "inline-block", borderRadius: 2, flexShrink: 0 }} />
                          <span style={{ minWidth: 90 }}>{d.name}</span>
                          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{d.value}</span>
                          <span>({mouStatusSummary.total > 0 ? ((d.value / mouStatusSummary.total) * 100).toFixed(0) : 0}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Charts Row 2 */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "45% 55%", gap: "1rem", marginBottom: "1rem" }}>
                {/* MOU Type Distribution */}
                <Panel>
                  <SectionTitle title="MOU Type Distribution" subtitle="Breakdown by agreement type" />
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={mouTypeData} layout="vertical" margin={{ left: 10, right: 40 }}>
                      <CartesianGrid horizontal={false} stroke="#b5bda0" strokeOpacity={0.4} />
                      <YAxis dataKey="type" type="category" width={isMobile ? 80 : 140} tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                      <XAxis type="number" hide />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="MOUs" barSize={14} radius={[0, 2, 2, 0]} isAnimationActive={false}>
                        {mouTypeData.map((d, i) => (
                          <Cell key={i} fill={d.count >= 4 ? "#5c6b47" : "#a89b7a"} />
                        ))}
                        <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: "#6b6b6b" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>

                {/* Globe + Continents */}
                <Panel style={{ minHeight: isMobile ? 280 : 320, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <SectionTitle title="Global Partner Network" subtitle="Partner universities by MOU status" />
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", minHeight: 200 }}>
                    <WorldMapSVG />
                  </div>
                </Panel>
              </div>

              {/* Continent Gauges */}
              <Panel style={{ padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", marginBottom: 12 }}>Partners by Continent</div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "0.5rem" }}>
                  {(["Europe", "Americas", "Asia", "Oceania"] as const).map((c) => (
                    <ContinentGauge key={c} count={continentCounts[c] || 0} total={totalMOUs} label={c} />
                  ))}
                </div>
              </Panel>

              {/* Year-on-Year Growth Strip for MOU */}
              <div style={{
                display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
                paddingTop: "1rem", gap: isMobile ? "1rem" : 0, borderTop: "1px solid #b5bda0",
              }}>
                {[
                  { value: mouYearData[mouYearData.length - 1]?.signed || 0, prefix: "+", suffix: "", label: "MOUs Signed This Year", color: "#5c6b47" },
                  { value: mousList.filter(m => m.created_at && new Date(m.created_at).getFullYear() === new Date().getFullYear()).length, prefix: "+", suffix: "", label: "New Partners", color: "#5c6b47" },
                  { value: mouStatusSummary.expiringIn90Days, prefix: "", suffix: "", label: "Expiring Soon", color: "#c0392b" },
                  { value: mouStatusSummary.total > 0 ? parseFloat(((mouStatusSummary.active / mouStatusSummary.total) * 100).toFixed(1)) : 0, prefix: "", suffix: "%", label: "Active Rate", color: "#5c6b47" },
                ].map((metric, i, arr) => (
                  <div key={i} style={{
                    textAlign: "center", padding: "0.5rem 0",
                    borderRight: isMobile ? "none" : (i < arr.length - 1 ? "1px solid #b5bda0" : "none"),
                  }}>
                    <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: 300, marginBottom: 4 }}>
                      <AnimatedCounter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} color={metric.color} />
                    </div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b" }}>
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ TAB 2: APPLICATION ANALYTICS ══════════ */}
          {activeTab === "applications" && (
            <div>
              {/* KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "0.75rem" : "1rem", marginBottom: "1.25rem" }}>
                <StatCard label="Total Applications" value="142" delta="+12" positive isMobile={isMobile} />
                <StatCard label="Approved" value="87" delta="+8" positive isMobile={isMobile} />
                <StatCard label="Pending" value="38" delta="-4" positive isMobile={isMobile} />
                <StatCard label="Rejected" value="17" delta="+1" positive={false} forceRed isMobile={isMobile} />
              </div>

              {/* Filters */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.25rem", alignItems: "center" }}>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b", marginRight: 4 }}>Filters:</span>
                <FilterChip
                  label="All Status"
                  options={[
                    { label: "All Status", value: "" },
                    { label: "Approved", value: "approved" },
                    { label: "Pending", value: "pending" },
                    { label: "Rejected", value: "rejected" },
                  ]}
                  value={appStatusFilter}
                  onChange={setAppStatusFilter}
                />
                <FilterChip
                  label="All Programs"
                  options={[{ label: "All Programs", value: "" }, ...PROGRAM_OPTIONS]}
                  value={appProgramFilter}
                  onChange={setAppProgramFilter}
                />
                <FilterChip
                  label="All Schools"
                  options={[{ label: "All Schools", value: "" }, ...SCHOOL_OPTIONS]}
                  value={appSchoolFilter}
                  onChange={setAppSchoolFilter}
                />
                <FilterChip
                  label="All Semesters"
                  options={[{ label: "All Semesters", value: "" }, ...SEMESTER_OPTIONS]}
                  value={appSemesterFilter}
                  onChange={setAppSemesterFilter}
                />
                <FilterChip
                  label="All Courses"
                  options={[{ label: "All Courses", value: "" }, ...COURSE_OPTIONS]}
                  value={appCourseFilter}
                  onChange={setAppCourseFilter}
                />
                {(appStatusFilter || appProgramFilter || appSchoolFilter || appSemesterFilter || appCourseFilter) && (
                  <button
                    onClick={() => { setAppStatusFilter(""); setAppProgramFilter(""); setAppSchoolFilter(""); setAppSemesterFilter(""); setAppCourseFilter(""); }}
                    style={{ fontSize: 11, color: "#c0392b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Charts Row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "55% 45%", gap: "1rem", marginBottom: "1rem" }}>
                {/* Application Trend */}
                <Panel>
                  <SectionTitle title="Application Volume" subtitle="This year vs last year, by month" />
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={MOCK_TREND_DATA} barCategoryGap="30%">
                      <CartesianGrid vertical={false} stroke="#b5bda0" strokeOpacity={0.4} />
                      <XAxis dataKey="month" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={{ stroke: "#b5bda0" }} tickLine={false} />
                      <YAxis tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend iconType="square" iconSize={10} formatter={(v: string) => <span style={{ fontSize: 12, color: "#6b6b6b" }}>{v}</span>} />
                      <Bar dataKey="thisYear" fill="#5c6b47" name="This Year" barSize={10} isAnimationActive={false} />
                      <Bar dataKey="lastYear" fill="#c0392b" name="Last Year" barSize={10} isAnimationActive={false} fillOpacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>

                {/* Application Status Donut */}
                <Panel>
                  <SectionTitle title="Application Status" subtitle="Current approval breakdown" />
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: "1.5rem", paddingTop: 8 }}>
                    <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={MOCK_STATUS_DATA}
                            innerRadius={45}
                            outerRadius={65}
                            dataKey="value"
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={-270}
                            isAnimationActive={false}
                          >
                            {MOCK_STATUS_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                        <div style={{ fontSize: "1.6rem", fontWeight: 300, color: "#1a1a1a" }}>{statusTotal}</div>
                        <div style={{ fontSize: 10, color: "#6b6b6b" }}>Total</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {MOCK_STATUS_DATA.map((d) => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#6b6b6b" }}>
                          <span style={{ width: 12, height: 12, background: d.color, display: "inline-block", borderRadius: 2, flexShrink: 0 }} />
                          <span style={{ minWidth: 70 }}>{d.name}</span>
                          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{d.value}</span>
                          <span>({((d.value / statusTotal) * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Charts Row 2 */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                {/* School Breakdown */}
                <Panel>
                  <SectionTitle title="By School / Department" subtitle="Application count per school" />
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={MOCK_SCHOOL_DATA} layout="vertical" margin={{ left: 0, right: 40 }}>
                      <CartesianGrid horizontal={false} stroke="#b5bda0" strokeOpacity={0.4} />
                      <YAxis dataKey="school" type="category" width={90} tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                      <XAxis type="number" hide />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Applications" barSize={14} isAnimationActive={false}>
                        {MOCK_SCHOOL_DATA.map((d, i) => (
                          <Cell key={i} fill={d.count === schoolMax ? "#5c6b47" : "#a89b7a"} />
                        ))}
                        <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: "#6b6b6b" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>

                {/* Program-wise Breakdown */}
                <Panel>
                  <SectionTitle title="Program-wise Applications" subtitle="Applications per program type" />
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={MOCK_APP_PROGRAM_BREAKDOWN.slice(0, 6)} layout="vertical" margin={{ left: 10, right: 40 }}>
                      <CartesianGrid horizontal={false} stroke="#b5bda0" strokeOpacity={0.4} />
                      <YAxis dataKey="program" type="category" width={isMobile ? 80 : 120} tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                      <XAxis type="number" hide />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="applications" name="Applications" barSize={14} isAnimationActive={false}>
                        {MOCK_APP_PROGRAM_BREAKDOWN.slice(0, 6).map((d, i) => (
                          <Cell key={i} fill={i === 0 ? "#5c6b47" : "#a89b7a"} />
                        ))}
                        <LabelList dataKey="applications" position="right" style={{ fontSize: 11, fill: "#6b6b6b" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              {/* Semester & Gender Row */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "60% 40%", gap: "1rem", marginBottom: "1rem" }}>
                {/* Semester Distribution */}
                <Panel>
                  <SectionTitle title="Semester-wise Distribution" subtitle="Applications by current semester" />
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={MOCK_APP_SEMESTER_DATA} barCategoryGap="20%">
                      <CartesianGrid vertical={false} stroke="#b5bda0" strokeOpacity={0.4} />
                      <XAxis dataKey="semester" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={{ stroke: "#b5bda0" }} tickLine={false} />
                      <YAxis tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#5c6b47" name="Applications" barSize={20} radius={[2, 2, 0, 0]} isAnimationActive={false}>
                        <LabelList dataKey="count" position="top" style={{ fontSize: 11, fill: "#6b6b6b" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>

                {/* Gender Split */}
                <Panel>
                  <SectionTitle title="Gender Distribution" subtitle="Applicant gender split" />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 12 }}>
                    <div style={{ position: "relative", width: 140, height: 140 }}>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={MOCK_APP_GENDER_DATA} innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270} isAnimationActive={false}>
                            {MOCK_APP_GENDER_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                        <div style={{ fontSize: "1.4rem", fontWeight: 300, color: "#1a1a1a" }}>{MOCK_APP_GENDER_DATA.reduce((a, b) => a + b.value, 0)}</div>
                        <div style={{ fontSize: 10, color: "#6b6b6b" }}>Total</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 24 }}>
                      {MOCK_APP_GENDER_DATA.map(d => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b6b6b" }}>
                          <span style={{ width: 12, height: 12, background: d.color, display: "inline-block", borderRadius: 2 }} />
                          {d.name}: <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>



              {/* Year-on-Year Growth Strip */}
              <div style={{
                display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
                paddingTop: "1rem", gap: isMobile ? "1rem" : 0, borderTop: "1px solid #b5bda0",
              }}>
                {[
                  { value: appGrowth, prefix: appGrowth >= 0 ? "+" : "", suffix: "%", label: "Application Growth", color: appGrowth >= 0 ? "#5c6b47" : "#c0392b" },
                  { value: 78, prefix: "", suffix: "%", label: "Approval Rate", color: "#5c6b47" },
                  { value: 142, prefix: "", suffix: "", label: "Total This Year", color: "#1a1a1a" },
                  { value: 6.5, prefix: "", suffix: " days", label: "Avg Processing Time", color: "#a89b7a" },
                ].map((metric, i, arr) => (
                  <div key={i} style={{
                    textAlign: "center", padding: "0.5rem 0",
                    borderRight: isMobile ? "none" : (i < arr.length - 1 ? "1px solid #b5bda0" : "none"),
                  }}>
                    <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: 300, marginBottom: 4 }}>
                      <AnimatedCounter value={Math.abs(metric.value)} prefix={metric.prefix} suffix={metric.suffix} color={metric.color} />
                    </div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b" }}>
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ TAB 3: PROGRAM ANALYTICS ══════════ */}
          {activeTab === "programs" && (
            <div>
              {/* KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "0.75rem" : "1rem", marginBottom: "1.25rem" }}>
                <StatCard label="Total Programs" value={String(MOCK_PROGRAM_STATUS_SUMMARY.total)} delta="+3" positive isMobile={isMobile} />
                <StatCard label="Active Programs" value={String(MOCK_PROGRAM_STATUS_SUMMARY.active)} delta="+2" positive isMobile={isMobile} />
                <StatCard label="Archived" value={String(MOCK_PROGRAM_STATUS_SUMMARY.archived)} delta="+1" positive={false} isMobile={isMobile} />
                <StatCard label="Avg Duration" value={MOCK_PROGRAM_STATUS_SUMMARY.avgDuration} delta="—" positive isMobile={isMobile} />
              </div>

              {/* Filters */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.25rem", alignItems: "center" }}>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b", marginRight: 4 }}>Filters:</span>
                <FilterChip
                  label="Status"
                  options={[
                    { label: "All Status", value: "" },
                    { label: "Active", value: "active" },
                    { label: "Archived", value: "archived" },
                    { label: "Coming Soon", value: "coming_soon" },
                  ]}
                  value={progStatusFilter}
                  onChange={setProgStatusFilter}
                />
                <FilterChip
                  label="Program Type"
                  options={[
                    { label: "All Types", value: "" },
                    ...MOCK_PROGRAM_TYPE_DATA.map(d => ({ label: d.name, value: d.name }))
                  ]}
                  value={progTypeFilter}
                  onChange={setProgTypeFilter}
                />
                {(progStatusFilter || progTypeFilter) && (
                  <button
                    onClick={() => { setProgStatusFilter(""); setProgTypeFilter(""); }}
                    style={{ fontSize: 11, color: "#c0392b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Charts Row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "45% 55%", gap: "1rem", marginBottom: "1rem" }}>
                {/* Program Type Donut */}
                <Panel>
                  <SectionTitle title="Program Type Distribution" subtitle="Programs by category" />
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: "1.5rem", paddingTop: 8 }}>
                    <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={MOCK_PROGRAM_TYPE_DATA}
                            innerRadius={45}
                            outerRadius={65}
                            dataKey="value"
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={-270}
                            isAnimationActive={false}
                          >
                            {MOCK_PROGRAM_TYPE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                        <div style={{ fontSize: "1.6rem", fontWeight: 300, color: "#1a1a1a" }}>{MOCK_PROGRAM_STATUS_SUMMARY.total}</div>
                        <div style={{ fontSize: 10, color: "#6b6b6b" }}>Total</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {MOCK_PROGRAM_TYPE_DATA.map(d => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b6b6b" }}>
                          <span style={{ width: 10, height: 10, background: d.color, display: "inline-block", borderRadius: 2, flexShrink: 0 }} />
                          <span style={{ minWidth: 120 }}>{d.name}</span>
                          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                {/* Programs Created per Year */}
                <Panel>
                  <SectionTitle title="Programs Created per Year" subtitle="Growth of program offerings" />
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={MOCK_PROGRAM_YEAR_DATA} barCategoryGap="30%">
                      <CartesianGrid vertical={false} stroke="#b5bda0" strokeOpacity={0.4} />
                      <XAxis dataKey="year" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={{ stroke: "#b5bda0" }} tickLine={false} />
                      <YAxis tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="created" fill="#5c6b47" name="Programs" barSize={24} radius={[2, 2, 0, 0]} isAnimationActive={false}>
                        <LabelList dataKey="created" position="top" style={{ fontSize: 11, fill: "#6b6b6b" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>
              </div>

              {/* Charts Row 2 */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                {/* School Coverage */}
                <Panel>
                  <SectionTitle title="School Coverage" subtitle="Programs available per school" />
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={MOCK_PROGRAM_SCHOOL_COVERAGE} layout="vertical" margin={{ left: 0, right: 40 }}>
                      <CartesianGrid horizontal={false} stroke="#b5bda0" strokeOpacity={0.4} />
                      <YAxis dataKey="school" type="category" width={60} tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                      <XAxis type="number" hide />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="programs" name="Programs" barSize={14} isAnimationActive={false}>
                        {MOCK_PROGRAM_SCHOOL_COVERAGE.map((d, i) => (
                          <Cell key={i} fill={d.programs === progSchoolMax ? "#5c6b47" : "#a89b7a"} />
                        ))}
                        <LabelList dataKey="programs" position="right" style={{ fontSize: 11, fill: "#6b6b6b" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Panel>

                {/* Program Status Summary */}
                <Panel>
                  <SectionTitle title="Program Status Overview" subtitle="Current program portfolio health" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16 }}>
                    {[
                      { label: "Active Programs", value: MOCK_PROGRAM_STATUS_SUMMARY.active, total: MOCK_PROGRAM_STATUS_SUMMARY.total, color: "#5c6b47" },
                      { label: "Archived", value: MOCK_PROGRAM_STATUS_SUMMARY.archived, total: MOCK_PROGRAM_STATUS_SUMMARY.total, color: "#a89b7a" },
                      { label: "Coming Soon", value: MOCK_PROGRAM_STATUS_SUMMARY.comingSoon, total: MOCK_PROGRAM_STATUS_SUMMARY.total, color: "#8b7e62" },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "#6b6b6b" }}>{item.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{item.value} / {item.total}</span>
                        </div>
                        <div style={{ width: "100%", height: 8, backgroundColor: "#b5bda033", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{
                            width: `${(item.value / item.total) * 100}%`,
                            height: "100%",
                            backgroundColor: item.color,
                            borderRadius: 4,
                            transition: "width 0.8s ease",
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 24, padding: "16px", backgroundColor: "rgba(92, 107, 71, 0.06)", borderRadius: 8, border: "1px solid rgba(181, 189, 160, 0.3)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.4rem", fontWeight: 300, color: "#5c6b47" }}>{MOCK_PROGRAM_STATUS_SUMMARY.avgDuration}</div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b", marginTop: 4 }}>Avg Duration</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.4rem", fontWeight: 300, color: "#5c6b47" }}>75%</div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b", marginTop: 4 }}>Active Rate</div>
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Year-on-Year Growth Strip */}
              <div style={{
                display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
                paddingTop: "1rem", gap: isMobile ? "1rem" : 0, borderTop: "1px solid #b5bda0",
              }}>
                {[
                  { value: 8, prefix: "+", suffix: "", label: "Programs This Year", color: "#5c6b47" },
                  { value: 75, prefix: "", suffix: "%", label: "Active Rate", color: "#5c6b47" },
                  { value: 8, prefix: "", suffix: "", label: "Schools Covered", color: "#1a1a1a" },
                  { value: 3.5, prefix: "", suffix: " mo", label: "Avg Duration", color: "#a89b7a" },
                ].map((metric, i, arr) => (
                  <div key={i} style={{
                    textAlign: "center", padding: "0.5rem 0",
                    borderRight: isMobile ? "none" : (i < arr.length - 1 ? "1px solid #b5bda0" : "none"),
                  }}>
                    <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: 300, marginBottom: 4 }}>
                      <AnimatedCounter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} color={metric.color} />
                    </div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6b6b" }}>
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
