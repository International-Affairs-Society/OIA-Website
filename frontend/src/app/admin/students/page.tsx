"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminTable, FilterBar } from "@/app/admin/components";
import { AdminPageSkeleton } from "@/app/admin/optemization_component";
import CustomDropdown from "@/app/admin/components/CustomDropdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  { label: "MBA", value: "MBA" },
  { label: "MCA", value: "MCA" },
];

export default function StudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [schoolFilter, setSchoolFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/api/v1/student-records`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setStudents((data.data || []).map((s: any) => ({
            id: s.id,
            name: s.studentName || "N/A",
            email: s.email || "N/A",
            mobile: s.mobile || "N/A",
            school: s.programType || "N/A", // database programType maps to school/department
            course: s.department || "N/A", // database department maps to course
            sem: 1, // Defaulting semester as it is not stored in DB directly
            program: s.programType || "N/A",
          })));
        }
      } catch (err) {
        console.error("Failed to fetch student records:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    let list = [...students];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)
      );
    }
    if (programFilter) {
      list = list.filter((r) => r.program.toLowerCase().includes(programFilter.toLowerCase()) || programFilter.toLowerCase().includes(r.program.toLowerCase()));
    }
    if (schoolFilter) list = list.filter((r) => r.school === schoolFilter);
    if (courseFilter) list = list.filter((r) => r.course.startsWith(courseFilter) || courseFilter.startsWith(r.course));
    if (semFilter) list = list.filter((r) => r.sem === Number(semFilter));

    if (sortBy === "name_asc") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "school_asc") list.sort((a, b) => a.school.localeCompare(b.school));
    else if (sortBy === "sem_desc") list.sort((a, b) => b.sem - a.sem);

    return list;
  }, [students, search, programFilter, schoolFilter, courseFilter, semFilter, sortBy]);

  const columns = [
    { key: "name", label: "Name", width: "15%" },
    { key: "email", label: "Email", width: "20%" },
    { key: "mobile", label: "Mobile", width: "15%" },
    { key: "school", label: "School", width: "10%" },
    { key: "course", label: "Course", width: "15%" },
    { key: "sem", label: "Sem", width: "5%" },
    { key: "program", label: "Program", width: "15%" },
  ];

  const hasActiveFilters = !!(schoolFilter || courseFilter || semFilter);
  const clearFilters = () => {
    setSchoolFilter(""); setCourseFilter(""); setSemFilter("");
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", transition: "width 0.3s ease" }}>
      <AdminPageHeader title="Students" />
      
      <FilterBar 
        searchPlaceholder="Search by Name or Email..."
        onSearch={setSearch}
        filters={[
          { key: "program", label: "All Programs", options: PROGRAM_OPTIONS }
        ]}
        onFilterChange={(key, val) => {
          if (key === "program") setProgramFilter(val);
        }}
        sortOptions={[
          { label: "Name (A-Z)", value: "name_asc" }, 
          { label: "School", value: "school_asc" },
          { label: "Semester (Latest)", value: "sem_desc" }
        ]}
        onSortChange={setSortBy}
      />

      <div
        style={{
          display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: "12px",
          paddingBottom: "12px", marginBottom: "16px", borderBottom: "1px solid #b5bda0",
        }}
      >
        <div style={{ minWidth: "140px", flex: "0 0 auto" }}><CustomDropdown placeholder="School" value={schoolFilter} options={SCHOOL_OPTIONS} onChange={setSchoolFilter} /></div>
        <div style={{ minWidth: "160px", flex: "0 0 auto" }}><CustomDropdown placeholder="Course" value={courseFilter} options={COURSE_OPTIONS} onChange={setCourseFilter} /></div>
        <div style={{ minWidth: "130px", flex: "0 0 auto" }}><CustomDropdown placeholder="Semester" value={semFilter} options={SEMESTER_OPTIONS} onChange={setSemFilter} /></div>
        
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{ padding: "10px 16px", border: "1px solid #b5bda0", borderRadius: "8px", backgroundColor: "transparent", color: "#e63946", fontSize: "13px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.3s ease", whiteSpace: "nowrap" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e63946"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#e63946"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#e63946"; e.currentTarget.style.borderColor = "#b5bda0"; }}>
            Clear Filters
          </button>
        )}
      </div>

      <div style={{ border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {isLoading ? (
          <AdminPageSkeleton columns={5} rows={6} showFilter={false} />
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>No students found.</div>
        ) : (
          <AdminTable
            columns={columns}
            data={filtered}
            actions={(row: any) => (
              <button
                onClick={() => router.push(`/admin/students/${row.id}`)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#6b6b6b",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
              >
                View &rarr;
              </button>
            )}
          />
        )}
      </div>
    </div>
  );
}
