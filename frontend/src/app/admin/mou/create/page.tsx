"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown, ConfirmModal } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { Plus, Trash2 } from "lucide-react";
import { saveDraft, getDraftById } from "@/app/admin/drafts/draftsStorage";
import { apiFetch } from "@/lib/apiFetch";

const SCHOOL_OPTIONS = ["SCSET", "SOAI", "SEAS", "SOM", "SOL", "TSOM", "SOLA", "SOD", "All"];
const SEMESTER_OPTIONS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8", "Semester 9", "Semester 10", "All"];
const COURSE_OPTIONS = ["B.Tech", "BCA", "BBA", "B.Com", "B.A. Liberal Arts", "B.A. Mass Communication", "B.A. Film, TV & Web Series", "B.Des", "B.A. LL.B. (Hons.)", "BBA LL.B. (Hons.)", "MBA", "MCA", "M.Tech", "M.A. Mass Communication", "M.A. Economics", "LL.M.", "PG Diploma in TV & Digital Journalism", "B.Tech Global", "BBA Global", "B.A. Global Liberal Arts", "B.A. Global Media", "B.Des Global", "All"];
const MOU_TYPE_OPTIONS = [
  "Semester Exchange", "Global Immersion", "Inbound Immersion", 
  "Pathways Program", "Progression Arrangement", "International Internship", 
  "Inbound Semester Exchange", "Summer Program", "Winter Program", 
  "Study Tour", "Dual Degree", "Articulation", "Other"
];

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  role?: string;
}

export default function CreateMOUPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  
  const draftId = searchParams?.get("draftId") || undefined;

  // Loading / Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [partnerUniversity, setPartnerUniversity] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("Semester Exchange");
  const [status, setStatus] = useState("Active");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const [partnerPOCs, setPartnerPOCs] = useState<any[]>([{ name: "", designation: "", email: "", contactNumber: "" }]);
  const [ourPOCs, setOurPOCs] = useState<any[]>([]);
  const [showPOCDropdown, setShowPOCDropdown] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        
        const res = await apiFetch(`/api/v1/users`);
        if (res.ok) {
          const json = await res.json();
          setUsers(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch users for POC:", err);
      }
    };
    fetchUsers();

    const loadDraft = async () => {
      if (draftId && role) {
        const draft = await getDraftById(role, draftId);
        if (draft && draft.data) {
          setName(draft.data.name || "");
          setPartnerUniversity(draft.data.partnerUniversity || "");
          setCountry(draft.data.country || "");
          setType(draft.data.type || "Semester Exchange");
          setStatus(draft.data.status || "Active");
          setDuration(draft.data.duration || "");
          setStartDate(draft.data.startDate || "");
          setExpiryDate(draft.data.expiryDate || "");
          setNotes(draft.data.notes || "");
          setSelectedSchools(draft.data.selectedSchools || []);
          setSelectedSemesters(draft.data.selectedSemesters || []);
          setSelectedCourses(draft.data.selectedCourses || []);
          setPartnerPOCs(draft.data.partnerPOCs?.length ? draft.data.partnerPOCs : [{ name: "", designation: "", email: "", contactNumber: "" }]);
          setOurPOCs(draft.data.ourPOCs || []);
        }
      }
    };
    loadDraft();
  }, [role, draftId]);

  const addPartnerPOC = () => {
    setPartnerPOCs([...partnerPOCs, { name: "", designation: "", email: "", contactNumber: "" }]);
  };

  const removePartnerPOC = (index: number) => {
    const updated = [...partnerPOCs];
    updated.splice(index, 1);
    setPartnerPOCs(updated);
  };

  const updatePartnerPOC = (index: number, field: string, value: string) => {
    const updated = [...partnerPOCs];
    updated[index][field] = value;
    setPartnerPOCs(updated);
  };

  const addPOC = (user?: any) => {
    if (user) {
      setOurPOCs([...ourPOCs, { 
        name: user.name, 
        designation: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "", 
        email: user.email, 
        contactNumber: user.phone_number || "+91 9876543210" 
      }]);
    } else {
      setOurPOCs([...ourPOCs, { name: "", designation: "", email: "", contactNumber: "" }]);
    }
    setShowPOCDropdown(false);
  };

  const removePOC = (index: number) => {
    const updated = [...ourPOCs];
    updated.splice(index, 1);
    setOurPOCs(updated);
  };

  const updatePOC = (index: number, field: string, value: string) => {
    const updated = [...ourPOCs];
    (updated[index] as any)[field] = value;
    setOurPOCs(updated);
  };

  const toggleSelection = (opt: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(opt)) setList(list.filter(x => x !== opt));
    else setList([...list, opt]);
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const executeSave = async () => {
    if (!name || !partnerUniversity || !country || !startDate || !expiryDate) {
      alert("Please fill in all required fields.");
      return false;
    }

    try {
      setIsSaving(true);

      const payload = {
        name,
        partner_university: partnerUniversity,
        country,
        type,
        status,
        duration: duration || null,
        start_date: startDate,
        expiry_date: expiryDate,
        applicable_semesters: selectedSemesters,
        eligible_schools: selectedSchools,
        eligible_courses: selectedCourses,
        notes: notes || null,
        our_pocs: ourPOCs.map(p => ({
          name: p.name || "",
          designation: p.designation || "",
          email: p.email || "",
          contact_number: p.contactNumber || ""
        })),
        partner_pocs: partnerPOCs.map(p => ({
          name: p.name || "",
          designation: p.designation || "",
          email: p.email || "",
          contact_number: p.contactNumber || ""
        })),
        documents: []
      };

      const res = await apiFetch(`/api/v1/mous`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return true;
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to create MOU");
        return false;
      }
    } catch (err) {
      console.error("Error creating MOU:", err);
      alert("Error creating MOU");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = () => {
    const payload = {
      name, partnerUniversity, country, type, status, duration, 
      startDate, expiryDate, notes, selectedSchools, selectedSemesters, 
      selectedCourses, partnerPOCs, ourPOCs
    };
    saveDraft(role, "MOU", name, payload, draftId);
    return Promise.resolve(true);
  };

  const sectionHeadingStyle = {
    fontSize: "14px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "#1a1a1a",
    margin: "32px 0 16px 0",
    paddingBottom: "8px",
    borderBottom: "1px solid #b5bda0"
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/mou" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to MOUs
        </Link>
      </div>

      <AdminPageHeader title="Create MOU" />

      <div className="admin-form-container" style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
          
          <h3 style={{ ...sectionHeadingStyle, marginTop: 0 }}>General Details</h3>
          <FormField label="MOU Name" required>
            <input 
              type="text" 
              placeholder="Enter MOU Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ backgroundColor: "#FFFBF2", width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }} 
            />
          </FormField>
          
          <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="Partner University" required>
              <input 
                type="text" 
                placeholder="Enter Partner University" 
                value={partnerUniversity} 
                onChange={(e) => setPartnerUniversity(e.target.value)} 
                style={{ backgroundColor: "#FFFBF2", width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }} 
              />
            </FormField>
            <FormField label="Country" required>
              <input 
                type="text" 
                placeholder="Enter country" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                style={{ backgroundColor: "#FFFBF2", width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }} 
              />
            </FormField>
          </div>

          <FormField label="Type of MOU" required>
            <CustomDropdown
              value={type}
              onChange={setType}
              options={MOU_TYPE_OPTIONS.map(o => ({ value: o, label: o }))}
            />
          </FormField>
          
          <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="Status">
              <CustomDropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Draft", label: "Draft" },
                  { value: "Expired", label: "Expired" },
                  { value: "Expiring in 30 days", label: "Expiring in 30 days" },
                  { value: "Expiring in 90 days", label: "Expiring in 90 days" },
                  { value: "Expiring in 120 days", label: "Expiring in 120 days" },
                ]}
              />
            </FormField>
            <FormField label="Duration (e.g., 4 Years)">
              <input 
                type="text" 
                placeholder="Enter duration" 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                style={{ backgroundColor: "#FFFBF2", width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }} 
              />
            </FormField>
          </div>
          
          <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="MOU Signing Date" required>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                style={{ backgroundColor: "#FFFBF2", width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }} 
              />
            </FormField>
            <FormField label="Expiry Date" required>
              <input 
                type="date" 
                value={expiryDate} 
                onChange={(e) => setExpiryDate(e.target.value)} 
                style={{ backgroundColor: "#FFFBF2", width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }} 
              />
            </FormField>
          </div>

          <h3 style={sectionHeadingStyle}>Eligibility</h3>
          
          <FormField label="Eligible Schools">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {SCHOOL_OPTIONS.map(opt => {
                const isSelected = selectedSchools.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleSelection(opt, selectedSchools, setSelectedSchools)}
                    style={{
                      padding: "6px 12px", borderRadius: "20px",
                      border: isSelected ? "1px solid #1a1a1a" : "1px solid #b5bda0",
                      backgroundColor: isSelected ? "#1a1a1a" : "transparent",
                      color: isSelected ? "#f5f0e8" : "#1a1a1a",
                      fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: isSelected ? 600 : 400 }}>{isSelected ? "✓" : "+"}</span> {opt}
                  </button>
                )
              })}
            </div>
          </FormField>

          <FormField label="Eligible Semesters">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {SEMESTER_OPTIONS.map(opt => {
                const isSelected = selectedSemesters.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleSelection(opt, selectedSemesters, setSelectedSemesters)}
                    style={{
                      padding: "6px 12px", borderRadius: "20px",
                      border: isSelected ? "1px solid #1a1a1a" : "1px solid #b5bda0",
                      backgroundColor: isSelected ? "#1a1a1a" : "transparent",
                      color: isSelected ? "#f5f0e8" : "#1a1a1a",
                      fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: isSelected ? 600 : 400 }}>{isSelected ? "✓" : "+"}</span> {opt}
                  </button>
                )
              })}
            </div>
          </FormField>

          <FormField label="Eligible Courses">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {COURSE_OPTIONS.map(opt => {
                const isSelected = selectedCourses.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleSelection(opt, selectedCourses, setSelectedCourses)}
                    style={{
                      padding: "6px 12px", borderRadius: "20px",
                      border: isSelected ? "1px solid #1a1a1a" : "1px solid #b5bda0",
                      backgroundColor: isSelected ? "#1a1a1a" : "transparent",
                      color: isSelected ? "#f5f0e8" : "#1a1a1a",
                      fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: isSelected ? 600 : 400 }}>{isSelected ? "✓" : "+"}</span> {opt}
                  </button>
                )
              })}
            </div>
          </FormField>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h3 style={{ ...sectionHeadingStyle, borderBottom: "none", marginBottom: 0 }}>Partner University POCs</h3>
            <button 
              type="button"
              onClick={addPartnerPOC}
              style={{
                display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700,
                color: "#1a1a1a", backgroundColor: "transparent", border: "1px solid #1a1a1a",
                padding: "6px 12px", borderRadius: "4px", cursor: "pointer"
              }}
            >
              <Plus size={14} /> Add POC
            </button>
          </div>
          <div style={{ borderBottom: "1px solid #b5bda0", marginBottom: "16px", marginTop: "8px" }} />

          {partnerPOCs.length === 0 && (
            <div style={{ 
              padding: "32px 24px", 
              textAlign: "center", 
              backgroundColor: "rgba(181, 189, 160, 0.1)", 
              border: "1px dashed #b5bda0", 
              borderRadius: "8px",
              color: "#6b6b6b",
              fontSize: "14px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px"
            }}>
              <span style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a" }}>No Partner POCs Assigned</span>
              <span>Click the <strong>+ Add POC</strong> button above to add an external contact.</span>
            </div>
          )}

          {partnerPOCs.map((poc, index) => (
            <div key={index} style={{ backgroundColor: "#FFFBF2", border: "1px dashed #b5bda0", padding: "16px", borderRadius: "8px", marginBottom: "16px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b6b6b" }}>POC #{index + 1}</span>
                <button type="button" onClick={() => removePartnerPOC(index)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer" }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Name">
                  <input type="text" value={poc.name} onChange={(e) => updatePartnerPOC(index, 'name', e.target.value)} placeholder="Enter here" style={{ width: "100%", padding: "8px", border: "1px solid #b5bda0", borderRadius: "4px" }} />
                </FormField>
                <FormField label="Designation">
                  <input type="text" value={poc.designation} onChange={(e) => updatePartnerPOC(index, 'designation', e.target.value)} placeholder="Enter here" style={{ width: "100%", padding: "8px", border: "1px solid #b5bda0", borderRadius: "4px" }} />
                </FormField>
                <FormField label="Email">
                  <input type="email" value={poc.email} onChange={(e) => updatePartnerPOC(index, 'email', e.target.value)} placeholder="Enter here" style={{ width: "100%", padding: "8px", border: "1px solid #b5bda0", borderRadius: "4px" }} />
                </FormField>
                <FormField label="Contact Number">
                  <input type="text" value={poc.contactNumber} onChange={(e) => updatePartnerPOC(index, 'contactNumber', e.target.value)} placeholder="Enter here" style={{ width: "100%", padding: "8px", border: "1px solid #b5bda0", borderRadius: "4px" }} />
                </FormField>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h3 style={{ ...sectionHeadingStyle, borderBottom: "none", marginBottom: 0 }}>Our University POCs</h3>
            <div style={{ position: "relative" }}>
              <button 
                type="button"
                onClick={() => setShowPOCDropdown(!showPOCDropdown)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700,
                  color: "#1a1a1a", backgroundColor: "transparent", border: "1px solid #1a1a1a",
                  padding: "6px 12px", borderRadius: "4px", cursor: "pointer"
                }}
              >
                <Plus size={14} /> Add POC
              </button>
              
              {showPOCDropdown && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: "8px",
                  backgroundColor: "#fff", border: "1px solid #b5bda0", borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "200px",
                  overflow: "hidden"
                }}>
                  <div data-lenis-prevent style={{ padding: "8px", maxHeight: "200px", overflowY: "auto" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", padding: "4px 8px 8px 8px", borderBottom: "1px solid #eaeaea", marginBottom: "4px" }}>Select from Users</div>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => addPOC(u)}
                        style={{
                          width: "100%", textAlign: "left", padding: "8px", background: "none", border: "none",
                          fontSize: "13px", color: "#1a1a1a", cursor: "pointer", borderRadius: "4px",
                          display: "flex", flexDirection: "column", gap: "2px", transition: "background 0.1s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FFFBF2"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        <span style={{ fontSize: "11px", color: "#6b6b6b" }}>{u.email}</span>
                      </button>
                    ))}
                    <div style={{ borderTop: "1px solid #eaeaea", margin: "4px 0" }} />
                    <button
                      type="button"
                      onClick={() => addPOC()}
                      style={{
                        width: "100%", textAlign: "left", padding: "8px", background: "none", border: "none",
                        fontSize: "13px", color: "#1a1a1a", cursor: "pointer", borderRadius: "4px",
                        fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", transition: "background 0.1s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FFFBF2"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <Plus size={14} /> Blank Custom POC
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ borderBottom: "1px solid #b5bda0", marginBottom: "16px", marginTop: "8px" }} />

          {ourPOCs.length === 0 && (
            <div style={{ 
              padding: "32px 24px", 
              textAlign: "center", 
              backgroundColor: "rgba(181, 189, 160, 0.1)", 
              border: "1px dashed #b5bda0", 
              borderRadius: "8px",
              color: "#6b6b6b",
              fontSize: "14px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px"
            }}>
              <span style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a" }}>No University POCs Assigned</span>
              <span>Click the <strong>+ Add POC</strong> button above to assign someone from the team.</span>
            </div>
          )}

          {ourPOCs.map((poc, index) => (
            <div key={index} style={{ backgroundColor: "#FFFBF2", border: "1px dashed #b5bda0", padding: "16px", borderRadius: "8px", marginBottom: "16px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b6b6b" }}>POC #{index + 1}</span>
                <button type="button" onClick={() => removePOC(index)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer" }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Name">
                  <input type="text" value={poc.name} onChange={(e) => updatePOC(index, 'name', e.target.value)} placeholder="Enter here" style={{ width: "100%", padding: "8px", border: "1px solid #b5bda0", borderRadius: "4px" }} />
                </FormField>
                <FormField label="Designation">
                  <input type="text" value={poc.designation} onChange={(e) => updatePOC(index, 'designation', e.target.value)} placeholder="Enter here" style={{ width: "100%", padding: "8px", border: "1px solid #b5bda0", borderRadius: "4px" }} />
                </FormField>
                <FormField label="Email">
                  <input type="email" value={poc.email} onChange={(e) => updatePOC(index, 'email', e.target.value)} placeholder="Enter here" style={{ width: "100%", padding: "8px", border: "1px solid #b5bda0", borderRadius: "4px" }} />
                </FormField>
                <FormField label="Contact Number">
                  <input type="text" value={poc.contactNumber} onChange={(e) => updatePOC(index, 'contactNumber', e.target.value)} placeholder="Enter here" style={{ width: "100%", padding: "8px", border: "1px solid #b5bda0", borderRadius: "4px" }} />
                </FormField>
              </div>
            </div>
          ))}

          <FormField label="Notes">
            <textarea 
              rows={4} 
              placeholder="Notes..." 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }}
            />
          </FormField>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: "10px 24px",
                backgroundColor: "#1a1a1a",
                color: "#f5f0e8",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
                borderRadius: "4px",
                opacity: isSaving ? 0.6 : 1
              }}
            >
              {isSaving ? "Saving..." : (role === 'editor' || role === 'admin' ? 'Send for Approval' : 'Save MOU')}
            </button>
            <button
              type="button"
              onClick={() => setShowDraftConfirm(true)}
              style={{
                padding: "10px 24px",
                backgroundColor: "#FFFBF2",
                color: "#1a1a1a",
                border: "1px solid #1a1a1a",
                fontSize: "14px",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/mou")}
              style={{
                padding: "10px 24px",
                backgroundColor: "transparent",
                color: "#1a1a1a",
                border: "1px solid #1a1a1a",
                fontSize: "14px",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeSave}
        onSuccess={() => router.push("/admin/mou")}
        title="Save MOU?"
        confirmLabel="Yes"
        cancelLabel="No"
        submittingLabel="Submitting..."
        successLabel="Submitted!"
      />

      <ConfirmModal
        isOpen={showDraftConfirm}
        onClose={() => setShowDraftConfirm(false)}
        onConfirm={handleSaveDraft}
        onSuccess={() => router.push("/admin/drafts")}
        title="Save as Draft?"
        confirmLabel="Save Draft"
        cancelLabel="Cancel"
        submittingLabel="Saving..."
        successLabel="Draft Saved!"
      />
    </div>
  );
}
