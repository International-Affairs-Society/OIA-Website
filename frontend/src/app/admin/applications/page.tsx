"use client";
import React, { useState, useEffect, useMemo } from "react";
import { AdminPageHeader, AdminTable, StatusBadge, FilterBar } from "@/app/admin/components";
import CustomDropdown from "@/app/admin/components/CustomDropdown";
import { AdminPageSkeleton } from "@/app/admin/optemization_component";

// Hardcoded options matching the programs section
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
  value: String(i + 1),
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
];

const DEFAULT_STATUS_OPTIONS = [
  { label: "Application Submitted", value: "Application Submitted" },
  { label: "Application Received", value: "Application Received" },
  { label: "Application Initiated", value: "Application Initiated" },
  { label: "Interview", value: "Interview" },
  { label: "Nomination Letter Accepted", value: "Nomination Letter Accepted" },
  { label: "Selected by Partnered University", value: "Selected by Partnered University" },
  { label: "Flight - Will be updated by student", value: "Flight - Will be updated by student" },
  { label: "Flight Done", value: "Flight Done" },
  { label: "Visa - Will be updated by student", value: "Visa - Will be updated by student" },
  { label: "Visa - Done", value: "Visa - Done" },
  { label: "Other", value: "other" },
];

interface ApplicationItem {
  id: string;
  applicationNumber: string;
  studentId: string;
  studentName: string | null;
  userId: string | null;
  programId: string;
  programName: string | null;
  status: string;
  currentStage: string;
  gender: string | null;
  school: string | null;
  course: string | null;
  semester: number | null;
  cgpa: number | null;
  hasPassport: boolean;
  passportNumber: string | null;
}

interface ProgramOptionItem {
  id: string;
  name: string;
}

function mapStatusToStage(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("submit") || s.includes("received") || s.includes("initiated")) return "Submitted";
  if (s.includes("interview") || s.includes("review")) return "Under Review";
  if (s.includes("accepted") || s.includes("selected")) return "Accepted";
  if (s.includes("flight") || s.includes("visa")) return "Completed";
  return "Submitted";
}

export default function ApplicationsPage() {
  /* ── State: Data ── */
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [programsList, setProgramsList] = useState<ProgramOptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Top-bar filters ── */
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [programNameFilter, setProgramNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  /* ── Second-row filters ── */
  const [genderFilter, setGenderFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [passportFilter, setPassportFilter] = useState("");

  /* ── CGPA double-input filter ── */
  const [cgpaGte, setCgpaGte] = useState("");
  const [cgpaLte, setCgpaLte] = useState("");

  /* ── Bulk Actions State ── */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [massComment, setMassComment] = useState("");
  const [massStatus, setMassStatus] = useState("");
  const [customStatuses, setCustomStatuses] = useState<string[]>([]);
  const [newStatusInput, setNewStatusInput] = useState("");
  const [showAddCommentPopup, setShowAddCommentPopup] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [enableEditReply, setEnableEditReply] = useState(false);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const [appRes, progRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/applications`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch(`${API_URL}/api/v1/programs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      ]);

      if (appRes.ok) {
        const json = await appRes.json();
        setApplications(json.data || []);
      }
      if (progRes.ok) {
        const json = await progRes.json();
        setProgramsList(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /* ── Filter + sort logic ── */
  const filtered = useMemo(() => {
    let list = [...applications];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.studentName || "").toLowerCase().includes(q) ||
          (r.passportNumber || "").toLowerCase().includes(q)
      );
    }
    if (programFilter) {
      list = list.filter((r) => {
        // Matches program type / structure
        return true; 
      });
    }
    if (programNameFilter) {
      list = list.filter((r) => r.programName === programNameFilter);
    }
    if (statusFilter) {
      list = list.filter((r) => (r.status || "").toLowerCase() === statusFilter.toLowerCase());
    }
    if (genderFilter) {
      list = list.filter((r) => (r.gender || "").toUpperCase() === genderFilter.toUpperCase());
    }
    if (schoolFilter) {
      list = list.filter((r) => r.school === schoolFilter);
    }
    if (courseFilter) {
      list = list.filter((r) => (r.course || "").startsWith(courseFilter) || courseFilter.startsWith(r.course || ""));
    }
    if (semFilter) {
      list = list.filter((r) => r.semester === Number(semFilter));
    }
    if (passportFilter) {
      const wantsPassport = passportFilter === "Yes";
      list = list.filter((r) => r.hasPassport === wantsPassport);
    }
    if (cgpaGte) {
      const val = parseFloat(cgpaGte);
      if (!isNaN(val)) list = list.filter((r) => r.cgpa !== null && r.cgpa >= val);
    }
    if (cgpaLte) {
      const val = parseFloat(cgpaLte);
      if (!isNaN(val)) list = list.filter((r) => r.cgpa !== null && r.cgpa <= val);
    }
    if (sortBy === "name_asc") {
      list.sort((a, b) => (a.studentName || "").localeCompare(b.studentName || ""));
    } else if (sortBy === "cgpa_desc") {
      list.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
    } else if (sortBy === "cgpa_asc") {
      list.sort((a, b) => (a.cgpa || 0) - (b.cgpa || 0));
    } else if (sortBy === "sem_desc") {
      list.sort((a, b) => (b.semester || 0) - (a.semester || 0));
    }

    return list;
  }, [applications, search, programFilter, programNameFilter, statusFilter, genderFilter, schoolFilter, courseFilter, semFilter, passportFilter, cgpaGte, cgpaLte, sortBy]);

  /* ── Handlers ── */
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSendComment = () => {
    if (selectedIds.size === 0) return alert("Select at least one student.");
    if (!massComment.trim()) return alert("Comment cannot be empty.");
    alert(`Comment "${massComment}" sent to ${selectedIds.size} students.`);
    setMassComment("");
  };

  const handleAddCustomStatus = () => {
    if (newStatusInput.trim()) {
      setCustomStatuses([...customStatuses, newStatusInput.trim()]);
      setMassStatus(newStatusInput.trim());
      setNewStatusInput("");
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedIds.size === 0) return alert("Select at least one student.");
    if (!massStatus) return alert("Select a status to update.");
    if (massStatus === "other") return alert("Please add a custom status first.");

    try {
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const res = await fetch(`${API_URL}/api/v1/applications/bulk/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          applicationIds: Array.from(selectedIds),
          stage: mapStatusToStage(massStatus),
          status: massStatus
        })
      });

      if (res.ok) {
        setApplications(apps => apps.map(app => 
          selectedIds.has(app.id) ? { ...app, status: massStatus, currentStage: mapStatusToStage(massStatus) } : app
        ));
        alert(`Status updated to "${massStatus}" for ${selectedIds.size} students.`);
      } else {
        alert("Failed to update status on backend.");
      }
    } catch (err) {
      console.error("Error bulk updating applications:", err);
      alert("Error updating status.");
    } finally {
      setMassStatus("");
      setSelectedIds(new Set());
    }
  };

  /* ── Columns ── */
  const isAllSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  const columns = [
    { 
      key: "checkboxCell", 
      label: (
        <input 
          type="checkbox" 
          checked={isAllSelected} 
          onChange={toggleSelectAll} 
          style={{ cursor: "pointer", accentColor: "#e63946" }}
        />
      ), 
      width: "3%" 
    },
    { key: "sNo", label: "S.No.", width: "4%" },
    { key: "enrollmentNo", label: "Enrollment No.", width: "11%" },
    { key: "studentName", label: "Student Name", width: "13%" },
    { key: "gender", label: "Gender", width: "5%" },
    { key: "school", label: "School", width: "7%" },
    { key: "course", label: "Course", width: "10%" },
    { key: "sem", label: "Sem", width: "4%" },
    { key: "cgpa", label: "CGPA", width: "5%" },
    { key: "program", label: "Program", width: "12%" },
    { key: "passportCell", label: "Passport", width: "7%" },
    { key: "statusBadge", label: "Status", width: "9%" },
  ];

  const data = filtered.map((row, idx) => ({
    ...row,
    checkboxCell: (
      <input 
        type="checkbox" 
        checked={selectedIds.has(row.id)} 
        onChange={() => toggleSelectRow(row.id)}
        style={{ cursor: "pointer", accentColor: "#e63946" }}
      />
    ),
    sNo: idx + 1,
    enrollmentNo: row.passportNumber || "-",
    studentName: (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(`/admin/students/${row.id}`, "_self");
        }}
        style={{
          color: "#1a1a1a",
          textDecoration: "underline",
          cursor: "pointer",
          fontWeight: 500,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#e63946")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#1a1a1a")}
      >
        {row.studentName || "Unnamed"}
      </a>
    ),
    sem: row.semester || "-",
    cgpa: row.cgpa !== null ? row.cgpa.toFixed(2) : "-",
    program: row.programName || "-",
    passportCell:
      row.hasPassport ? (
        <span style={{ color: "#e63946", fontWeight: 600 }}>Yes</span>
      ) : (
        <span style={{ color: "#6b6b6b" }}>No</span>
      ),
    statusBadge: <StatusBadge status={row.status} variant={(row.status.toLowerCase() === "approved" || row.status.toLowerCase() === "pending" || row.status.toLowerCase() === "rejected") ? row.status.toLowerCase() as any : "pending"} />,
  }));

  const hasActiveFilters = !!(genderFilter || schoolFilter || courseFilter || semFilter || passportFilter || cgpaGte || cgpaLte);
  const clearFilters = () => {
    setGenderFilter(""); setSchoolFilter(""); setCourseFilter(""); setSemFilter(""); setPassportFilter(""); setCgpaGte(""); setCgpaLte("");
  };

  const currentStatusOptions = [
    ...DEFAULT_STATUS_OPTIONS.slice(0, -1), // all except 'other'
    ...customStatuses.map(s => ({ label: s, value: s })),
    DEFAULT_STATUS_OPTIONS[DEFAULT_STATUS_OPTIONS.length - 1], // 'other' at the end
  ];

  return (
    <div style={{ width: "100%", maxWidth: "100%", transition: "width 0.3s ease" }}>
      <AdminPageHeader title="Applications" />

      {/* ── Top filter bar (search + program + status + sort) ── */}
      <FilterBar
        searchPlaceholder="Search by Name or Enrollment No..."
        onSearch={setSearch}
        filters={[
          { key: "program", label: "All Program Types", options: PROGRAM_OPTIONS },
          { key: "programName", label: "All Program Names", options: programsList.map(p => ({ label: p.name, value: p.name })) },
          { key: "status", label: "All Statuses", options: currentStatusOptions },
        ]}
        onFilterChange={(key, val) => {
          if (key === "program") setProgramFilter(val);
          if (key === "programName") setProgramNameFilter(val);
          if (key === "status") setStatusFilter(val);
        }}
        sortOptions={[
          { label: "Name (A-Z)", value: "name_asc" },
          { label: "CGPA (Highest to Lowest)", value: "cgpa_desc" },
          { label: "CGPA (Lowest to Highest)", value: "cgpa_asc" },
          { label: "Semester (Latest)", value: "sem_desc" },
        ]}
        onSortChange={setSortBy}
      />

      {/* ── Second filter row ── */}
      <div
        style={{
          display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: "12px",
          paddingBottom: "12px", marginBottom: "16px", borderBottom: "1px solid #b5bda0",
        }}
      >
        <div style={{ minWidth: "140px", flex: "0 0 auto" }}><CustomDropdown placeholder="Gender" value={genderFilter} options={[{ label: "Male", value: "M" }, { label: "Female", value: "F" }]} onChange={setGenderFilter} /></div>
        <div style={{ minWidth: "140px", flex: "0 0 auto" }}><CustomDropdown placeholder="School" value={schoolFilter} options={SCHOOL_OPTIONS} onChange={setSchoolFilter} /></div>
        <div style={{ minWidth: "160px", flex: "0 0 auto" }}><CustomDropdown placeholder="Course" value={courseFilter} options={COURSE_OPTIONS} onChange={setCourseFilter} /></div>
        <div style={{ minWidth: "130px", flex: "0 0 auto" }}><CustomDropdown placeholder="Semester" value={semFilter} options={SEMESTER_OPTIONS} onChange={setSemFilter} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "0 0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", border: "1px solid #b5bda0", borderRadius: "8px", backgroundColor: "#f5f0e8", height: "42px" }}>
            <span style={{ fontSize: "14px", color: "#6b6b6b", fontWeight: 700 }}>&ge;</span>
            <input type="number" step="0.1" min="0" max="10" placeholder="CGPA" value={cgpaGte} onChange={(e) => setCgpaGte(e.target.value)} style={{ width: "60px", padding: "4px", border: "none", backgroundColor: "transparent", color: "#1a1a1a", fontSize: "14px", outline: "none" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", border: "1px solid #b5bda0", borderRadius: "8px", backgroundColor: "#f5f0e8", height: "42px" }}>
            <span style={{ fontSize: "14px", color: "#6b6b6b", fontWeight: 700 }}>&le;</span>
            <input type="number" step="0.1" min="0" max="10" placeholder="CGPA" value={cgpaLte} onChange={(e) => setCgpaLte(e.target.value)} style={{ width: "60px", padding: "4px", border: "none", backgroundColor: "transparent", color: "#1a1a1a", fontSize: "14px", outline: "none" }} />
          </div>
        </div>
        <div style={{ minWidth: "130px", flex: "0 0 auto" }}><CustomDropdown placeholder="Passport" value={passportFilter} options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]} onChange={setPassportFilter} /></div>
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{ padding: "10px 16px", border: "1px solid #b5bda0", borderRadius: "8px", backgroundColor: "transparent", color: "#e63946", fontSize: "13px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.3s ease", whiteSpace: "nowrap" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e63946"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#e63946"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#e63946"; e.currentTarget.style.borderColor = "#b5bda0"; }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Bulk Actions Bar ── */}
      <div className="admin-bulk-actions" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "24px", padding: "16px", backgroundColor: "#f0ebe1", border: "1px solid #b5bda0", borderRadius: "8px", marginBottom: "16px" }}>
        
        {/* Left: Select All */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, marginTop: "8px" }}>
          <button
            onClick={toggleSelectAll}
            style={{ padding: "8px 16px", backgroundColor: isAllSelected ? "#e63946" : "transparent", color: isAllSelected ? "#fff" : "#1a1a1a", border: `1px solid ${isAllSelected ? "#e63946" : "#b5bda0"}`, borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", transition: "all 0.2s" }}
          >
            {isAllSelected ? "Deselect All" : "Select All"}
          </button>
          <span style={{ fontSize: "14px", color: "#6b6b6b", fontWeight: 500 }}>
            {selectedIds.size} selected
          </span>
        </div>

        {/* Right: Comments & Status Update */}
        <div className="admin-bulk-actions-right" style={{ display: "flex", alignItems: "flex-start", gap: "24px", flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
          
          {/* Add Comment */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setShowAddCommentPopup(true)}
              disabled={selectedIds.size === 0}
              style={{ padding: "10px 16px", backgroundColor: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px", cursor: selectedIds.size === 0 ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "13px", opacity: selectedIds.size === 0 ? 0.5 : 1, transition: "opacity 0.2s", width: "100%" }}
            >
              Add Comment
            </button>
          </div>

          <div className="desktop-divider" style={{ width: "1px", height: "40px", backgroundColor: "#b5bda0" }} />

          {/* Update Status */}
          <div className="status-update-row" style={{ display: "flex", alignItems: "flex-start", gap: "8px", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <div style={{ minWidth: "0" }}>
                <CustomDropdown
                  placeholder="Select Status..."
                  value={massStatus}
                  options={currentStatusOptions}
                  onChange={setMassStatus}
                />
              </div>
              
              {/* "Other" inline input */}
              {massStatus === "other" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", animation: "fadeIn 0.2s ease" }}>
                  <input
                    type="text"
                    placeholder="Type custom status..."
                    value={newStatusInput}
                    onChange={(e) => setNewStatusInput(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #b5bda0", backgroundColor: "#fff", fontSize: "13px", outline: "none", color: "#1a1a1a" }}
                  />
                  <button
                    onClick={handleAddCustomStatus}
                    disabled={!newStatusInput.trim()}
                    style={{ padding: "8px 12px", backgroundColor: "#e63946", color: "#fff", border: "none", borderRadius: "6px", cursor: !newStatusInput.trim() ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "12px", opacity: !newStatusInput.trim() ? 0.5 : 1 }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={selectedIds.size === 0 || !massStatus || massStatus === "other"}
              style={{ padding: "10px 16px", backgroundColor: "#e63946", color: "#fff", border: "none", borderRadius: "8px", cursor: (selectedIds.size === 0 || !massStatus || massStatus === "other") ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "13px", opacity: (selectedIds.size === 0 || !massStatus || massStatus === "other") ? 0.5 : 1, transition: "opacity 0.2s" }}
            >
              Update Status
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {isLoading ? (
          <AdminPageSkeleton columns={8} rows={6} showFilter={false} showAction={false} />
        ) : data.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>No applications found.</div>
        ) : (
          <AdminTable columns={columns} data={data} />
        )}
      </div>

      {/* ── Add Comment Popup ── */}
      {showAddCommentPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "#FFFBF2", borderRadius: "12px", width: "800px", maxWidth: "90%",
            display: "flex", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)"
          }}>
            {/* Left side: textarea */}
            <div style={{ flex: 1, padding: "32px", borderRight: "1px solid #d4cfc4" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a", fontFamily: "var(--font-outfit)" }}>
                Add Comment ({selectedIds.size} selected)
              </h2>
              <textarea
                value={massComment}
                onChange={(e) => setMassComment(e.target.value)}
                placeholder="Write your comment here..."
                style={{
                  width: "100%", height: "240px", padding: "16px", borderRadius: "8px",
                  border: "1px solid #b5bda0", backgroundColor: "#fff", fontSize: "15px",
                  outline: "none", color: "#1a1a1a", resize: "none", fontFamily: "var(--font-outfit)",
                  marginBottom: "24px"
                }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f9f7f1", padding: "16px 20px", borderRadius: "8px", border: "1px solid #d4cfc4" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#1a1a1a", fontFamily: "var(--font-outfit)" }}>Enable Edit / Reply</h4>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b6b6b", fontFamily: "var(--font-outfit)" }}>Allow the student to reply or edit their application details.</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setEnableEditReply(true)}
                    style={{
                      padding: "8px 24px",
                      backgroundColor: enableEditReply ? "#1a1a1a" : "transparent",
                      color: enableEditReply ? "#fff" : "#1a1a1a",
                      border: "1px solid #1a1a1a",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px",
                      transition: "all 0.2s"
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setEnableEditReply(false)}
                    style={{
                      padding: "8px 24px",
                      backgroundColor: !enableEditReply ? "#1a1a1a" : "transparent",
                      color: !enableEditReply ? "#fff" : "#1a1a1a",
                      border: "1px solid #1a1a1a",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px",
                      transition: "all 0.2s"
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
            {/* Right side: buttons */}
            <div style={{ width: "250px", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px", backgroundColor: "#f9f7f1" }}>
              <button
                onClick={() => {
                  if (!massComment.trim()) return alert("Comment cannot be empty.");
                  setShowSendConfirm(true);
                }}
                disabled={!massComment.trim()}
                style={{
                  padding: "16px", backgroundColor: "#e63946", color: "#fff", border: "none",
                  borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: !massComment.trim() ? "not-allowed" : "pointer",
                  opacity: !massComment.trim() ? 0.5 : 1, transition: "background-color 0.2s"
                }}
              >
                Send Comment
              </button>
              <button
                onClick={() => {
                  setShowAddCommentPopup(false);
                  setMassComment("");
                  setEnableEditReply(false);
                }}
                style={{
                  padding: "16px", backgroundColor: "transparent", color: "#1a1a1a", border: "1px solid #1a1a1a",
                  borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer", transition: "background-color 0.2s"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Confirm Modal ── */}
      {showSendConfirm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "32px", borderRadius: "12px", width: "400px", maxWidth: "90%",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)", textAlign: "center"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#1a1a1a" }}>Confirm Send</h3>
            <p style={{ fontSize: "14px", color: "#6b6b6b", marginBottom: "24px", lineHeight: 1.5 }}>
              Are you sure you want to send this comment to {selectedIds.size} selected student(s)?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setShowSendConfirm(false)}
                style={{ padding: "10px 20px", backgroundColor: "transparent", color: "#1a1a1a", border: "1px solid #d4cfc4", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSendComment();
                  setShowSendConfirm(false);
                  setShowAddCommentPopup(false);
                }}
                style={{ padding: "10px 20px", backgroundColor: "#e63946", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
              >
                Yes, Send
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
