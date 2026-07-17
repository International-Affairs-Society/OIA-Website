"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown, ConfirmModal } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { Plus, Trash2 } from "lucide-react";

const SCHOOL_OPTIONS = ["SCSET", "SOAI", "SEAS", "SOM", "SOL", "TSOM", "SOLA", "SOD", "All"];
const SEMESTER_OPTIONS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8", "Semester 9", "Semester 10", "All"];
const COURSE_OPTIONS = ["B.Tech", "BCA", "BBA", "B.Com", "B.A. Liberal Arts", "B.A. Mass Communication", "B.A. Film, TV & Web Series", "B.Des", "B.A. LL.B. (Hons.)", "BBA LL.B. (Hons.)", "MBA", "MCA", "M.Tech", "M.A. Mass Communication", "M.A. Economics", "LL.M.", "PG Diploma in TV & Digital Journalism", "B.Tech Global", "BBA Global", "B.A. Global Liberal Arts", "B.A. Global Media", "B.Des Global", "All"];

function MultiSelectPills({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (sel: string[]) => void }) {
  const toggle = (opt: string) => {
    if (opt === "All") {
      if (selected.includes("All")) {
        onChange([]);
      } else {
        onChange(["All"]);
      }
    } else {
      let newSelected = selected.filter(x => x !== "All");
      if (newSelected.includes(opt)) {
        newSelected = newSelected.filter(x => x !== opt);
      } else {
        newSelected = [...newSelected, opt];
      }
      onChange(newSelected);
    }
  };

  return (
    <FormField label={label}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                border: isSelected ? "1px solid #1a1a1a" : "1px solid #b5bda0",
                backgroundColor: isSelected ? "#1a1a1a" : "transparent",
                color: isSelected ? "#f5f0e8" : "#1a1a1a",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: isSelected ? 600 : 400 }}>{isSelected ? "✓" : "+"}</span> {opt}
            </button>
          )
        })}
      </div>
    </FormField>
  );
}

function DynamicListInput({ label, placeholder, items, onChange }: { label: string; placeholder: string; items: string[]; onChange: (items: string[]) => void }) {
  const handleAdd = () => {
    onChange([...items, ""]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems.length ? newItems : [""]);
  };

  const handleChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    onChange(newItems);
  };

  return (
    <FormField label={label}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#b5bda0", flexShrink: 0 }} />
            <input
              type="text"
              value={item}
              onChange={(e) => handleChange(idx, e.target.value)}
              placeholder={placeholder}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #b5bda0", borderRadius: "4px", backgroundColor: "transparent", fontSize: "14px", color: "#1a1a1a", outline: "none" }}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                style={{
                  padding: "0 12px",
                  backgroundColor: "transparent",
                  border: "1px solid #d12027",
                  color: "#d12027",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          style={{
            alignSelf: "flex-start",
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#1a1a1a",
            border: "1px dashed #b5bda0",
            borderRadius: "4px",
            fontSize: "13px",
            cursor: "pointer",
            marginTop: "4px"
          }}
        >
          + Add Point
        </button>
      </div>
    </FormField>
  );
}

interface CustomField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string;
}

function CustomFormBuilder({ fields, setFields }: { fields: CustomField[]; setFields: React.Dispatch<React.SetStateAction<CustomField[]>> }) {
  const handleAddField = () => {
    setFields([...fields, { id: Math.random().toString(36).substr(2, 9), label: "", type: "text", required: false }]);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleChange = (id: string, key: keyof CustomField, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  return (
    <div style={{ marginTop: "1rem", padding: "1.5rem", backgroundColor: "rgba(181, 189, 160, 0.1)", borderRadius: "8px", border: "1px solid rgba(181, 189, 160, 0.3)" }}>
      <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px" }}>Custom Form Builder</h4>
      <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "1.5rem", lineHeight: 1.5 }}>
        Add specific fields you want applicants to fill out. You can ask for text answers, require document uploads, or provide dropdown selections.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {fields.map((field) => (
          <div key={field.id} style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-start", backgroundColor: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #b5bda0" }}>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#6b6b6b", marginBottom: "4px" }}>Field Label</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => handleChange(field.id, "label", e.target.value)}
                placeholder="e.g. Statement of Purpose"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #b5bda0", borderRadius: "4px", backgroundColor: "#f5f0e8", fontSize: "13px" }}
              />
            </div>
            <div style={{ flex: "1 1 150px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#6b6b6b", marginBottom: "4px" }}>Field Type</label>
              <select
                value={field.type}
                onChange={(e) => handleChange(field.id, "type", e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #b5bda0", borderRadius: "4px", backgroundColor: "#f5f0e8", fontSize: "13px", height: "37px" }}
              >
                <option value="text">Short Text</option>
                <option value="textarea">Long Text (Paragraph)</option>
                <option value="file">File Upload (Document/Image)</option>
                <option value="dropdown">Dropdown Options</option>
              </select>
            </div>
            
            {field.type === "dropdown" && (
              <div style={{ flex: "1 1 100%", marginTop: "4px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#6b6b6b", marginBottom: "4px" }}>Dropdown Options (comma separated)</label>
                <input
                  type="text"
                  value={field.options || ""}
                  onChange={(e) => handleChange(field.id, "options", e.target.value)}
                  placeholder="e.g. Option 1, Option 2, Option 3"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #b5bda0", borderRadius: "4px", backgroundColor: "#f5f0e8", fontSize: "13px" }}
                />
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "24px", width: "100%" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", flex: 1 }}>
                <input 
                  type="checkbox" 
                  checked={field.required} 
                  onChange={(e) => handleChange(field.id, "required", e.target.checked)} 
                  style={{ accentColor: "#1a1a1a" }} 
                /> Required Field
              </label>
              <button
                type="button"
                onClick={() => handleRemoveField(field.id)}
                style={{
                  background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px"
                }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddField}
          style={{
            alignSelf: "flex-start",
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#1a1a1a",
            border: "1px dashed #b5bda0",
            borderRadius: "4px",
            fontSize: "13px",
            cursor: "pointer",
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Plus size={14} /> Add Custom Field
        </button>
      </div>
    </div>
  );
}

export default function CreateProgramPage() {
  const router = useRouter();
  const { role } = useAuth();
  
  const [name, setName] = useState("");
  const [partner, setPartner] = useState("");
  const [duration, setDuration] = useState("");
  const [mou, setMou] = useState("None");
  const [programType, setProgramType] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastDateToApply, setLastDateToApply] = useState("");
  
  const [showLivingCost, setShowLivingCost] = useState(false);
  const [useDefaultForm, setUseDefaultForm] = useState(true);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [ourPOCs, setOurPOCs] = useState<any[]>([]);
  const [showPOCDropdown, setShowPOCDropdown] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [mousList, setMousList] = useState<{ value: string; label: string }[]>([]);

  const [schoolsEligible, setSchoolsEligible] = useState<string[]>([]);
  const [semestersEligible, setSemestersEligible] = useState<string[]>([]);
  const [coursesEligible, setCoursesEligible] = useState<string[]>([]);
  const [overview, setOverview] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [feeSummary, setFeeSummary] = useState("");
  const [feeBreakdown, setFeeBreakdown] = useState("");
  const [estimatedStayCost, setEstimatedStayCost] = useState("");
  const [livingCostsText, setLivingCostsText] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [posterUrl, setPosterUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Fetch Users and MOUs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        // Fetch Users
        const usersRes = await fetch(`${API_URL}/api/v1/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsersList(data.data || []);
        }

        // Fetch MOUs
        const mousRes = await fetch(`${API_URL}/api/v1/mous`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (mousRes.ok) {
          const data = await mousRes.json();
          const mapped = (data.data || []).map((m: any) => ({
            value: m.name,
            label: m.name
          }));
          setMousList([{ value: "None", label: "None" }, ...mapped]);
        }
      } catch (err) {
        console.error("Failed to fetch initial data for create program:", err);
      }
    };
    fetchData();
  }, []);

  const addPOC = (user?: any) => {
    if (user) {
      setOurPOCs([...ourPOCs, { 
        name: user.displayName || "No Name", 
        designation: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "Coordinator", 
        email: user.email, 
        contactNumber: user.mobile || "+91 9876543210" 
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
    updated[index][field] = value;
    setOurPOCs(updated);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPoster(true);
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/v1/media`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPosterUrl(data.publicUrl || data.url);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingGallery(true);
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch(`${API_URL}/api/v1/media`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          uploaded.push(data.publicUrl || data.url);
        }
      }
      setGalleryUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const executeSaveProgram = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const startD = isComingSoon ? "2099-12-31" : startDate;
      const applyD = isComingSoon ? "2099-12-31" : lastDateToApply;

      if (!name || !programType || !country || !startD || !applyD) {
        alert("Please fill in all required fields (Name, Program Type, Country, Start Date, Apply Date).");
        return false;
      }

      // Parse living costs details into structured formats if needed, or store in custom_fields
      const livingCosts = livingCostsText.split('\n').filter(l => l.trim() !== "").map(line => {
        const parts = line.split('|');
        return {
          item: parts[0]?.trim() || "",
          cost: parts[1]?.trim() || "",
          costINR: parts[2]?.trim() || ""
        };
      });

      const payload = {
        name,
        duration: duration || null,
        partner: partner || null,
        mou: mou || null,
        program_type: programType,
        country,
        start_date: startD,
        last_date_to_apply: applyD,
        schools_eligible: schoolsEligible,
        semesters_eligible: semestersEligible,
        courses_eligible: coursesEligible,
        overview: overview || null,
        highlights: highlights.filter(h => h.trim() !== ""),
        fee_summary: feeSummary || null,
        fee_breakdown: feeBreakdown || null,
        show_living_cost: showLivingCost,
        estimated_stay_cost: estimatedStayCost || null,
        living_cost_details: livingCostsText || null,
        use_default_form: useDefaultForm,
        custom_fields: {
          posterUrl,
          galleryUrls,
          ourPOCs,
          formFields: customFields,
          isComingSoon,
          livingCosts,
          endDate: endDate || null
        },
        status: (role === 'editor' || role === 'admin') ? 'pending_approval' : 'published'
      };

      const res = await fetch(`${API_URL}/api/v1/programs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return true;
      } else {
        const errorJson = await res.json();
        alert(`Failed to save program: ${errorJson.error?.message || "Unknown error"}`);
        return false;
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while saving program.");
      return false;
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/programs" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Programs
        </Link>
      </div>

      <AdminPageHeader title="Create Program" />

      <div className="admin-form-container" style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
          {/* Basic Details */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Basic Details</h3>
          <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormField label="Program Name" required>
              <input type="text" placeholder="e.g. HSE Summer School" value={name} onChange={(e) => setName(e.target.value)} required style={{ backgroundColor: "transparent", border: "1px solid #b5bda0", padding: "8px 12px", borderRadius: "4px", width: "100%", fontSize: "14px" }} />
            </FormField>
            <FormField label="Partner University Name">
              <input type="text" placeholder="e.g. HSE University" value={partner} onChange={(e) => setPartner(e.target.value)} style={{ backgroundColor: "transparent", border: "1px solid #b5bda0", padding: "8px 12px", borderRadius: "4px", width: "100%", fontSize: "14px" }} />
            </FormField>
          </div>
          
          <div className="admin-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <FormField label="Program Type" required>
              <CustomDropdown
                value={programType}
                onChange={setProgramType}
                options={[
                  { value: "", label: "Select Type" },
                  { value: "Semester Exchange", label: "Semester Exchange" },
                  { value: "Global Immersion", label: "Global Immersion" },
                  { value: "Inbound Immersion", label: "Inbound Immersion" },
                  { value: "Pathways Program", label: "Pathways Program" },
                  { value: "Progression Arrangement", label: "Progression Arrangement" },
                  { value: "International Internship", label: "International Internship" },
                  { value: "Inbound Semester Exchange", label: "Inbound Semester Exchange" }
                ]}
              />
            </FormField>
            <FormField label="Duration (Weeks/Months)">
              <input type="text" placeholder="e.g. 4 Weeks" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ backgroundColor: "transparent", border: "1px solid #b5bda0", padding: "8px 12px", borderRadius: "4px", width: "100%", fontSize: "14px" }} />
            </FormField>
            <FormField label="Country" required>
              <input type="text" placeholder="e.g. Russia" value={country} onChange={(e) => setCountry(e.target.value)} required style={{ backgroundColor: "transparent", border: "1px solid #b5bda0", padding: "8px 12px", borderRadius: "4px", width: "100%", fontSize: "14px" }} />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginTop: "1rem" }}>
            <FormField label="Link MOU">
              <CustomDropdown
                value={mou}
                onChange={setMou}
                options={mousList}
              />
            </FormField>
          </div>

          {/* POC Section */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Points of Contact (POCs)</h3>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "1rem", position: "relative" }}>
              <button 
                type="button" 
                onClick={() => setShowPOCDropdown(!showPOCDropdown)} 
                style={{ padding: "8px 16px", backgroundColor: "#1a1a1a", color: "#f5f0e8", border: "none", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                + Add POC from Database
              </button>
              <button 
                type="button" 
                onClick={() => addPOC()} 
                style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#1a1a1a", border: "1px solid #1a1a1a", fontSize: "13px", cursor: "pointer" }}
              >
                Create Custom POC
              </button>

              {showPOCDropdown && (
                <div style={{ position: "absolute", top: "100%", left: 0, width: "300px", maxHeight: "250px", overflowY: "auto", backgroundColor: "#f5f0e8", border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, padding: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px", padding: "4px" }}>SELECT A USER</div>
                  {usersList.length === 0 ? (
                    <div style={{ padding: "8px", fontSize: "12px", color: "#6b6b6b" }}>No users found</div>
                  ) : (
                    usersList.map(u => (
                      <div 
                        key={u.id} 
                        onClick={() => addPOC(u)}
                        style={{ padding: "8px", fontSize: "13px", color: "#1a1a1a", cursor: "pointer", borderBottom: "1px solid rgba(181,189,160,0.3)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(181,189,160,0.2)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        {u.displayName || "No Name"} ({u.role})
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {ourPOCs.length === 0 ? (
              <div style={{ border: "1px dashed #b5bda0", padding: "24px", textAlign: "center", color: "#6b6b6b", fontSize: "14px" }}>
                <span style={{ fontWeight: 600, color: "#1a1a1a" }}>No POCs Assigned</span>
              </div>
            ) : (
              ourPOCs.map((poc, index) => (
                <div key={index} style={{ backgroundColor: "rgba(181, 189, 160, 0.1)", border: "1px dashed #b5bda0", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>POC #{index + 1}</span>
                    <button type="button" onClick={() => removePOC(index)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <FormField label="Name">
                      <input type="text" value={poc.name} onChange={(e) => updatePOC(index, 'name', e.target.value)} placeholder="Enter name" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0" }} />
                    </FormField>
                    <FormField label="Designation">
                      <input type="text" value={poc.designation} onChange={(e) => updatePOC(index, 'designation', e.target.value)} placeholder="Enter designation" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0" }} />
                    </FormField>
                    <FormField label="Email">
                      <input type="email" value={poc.email} onChange={(e) => updatePOC(index, 'email', e.target.value)} placeholder="Enter email" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0" }} />
                    </FormField>
                    <FormField label="Contact Number">
                      <input type="text" value={poc.contactNumber} onChange={(e) => updatePOC(index, 'contactNumber', e.target.value)} placeholder="Enter number" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0" }} />
                    </FormField>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dates */}
          <div className="admin-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <FormField label="Program Start Date" required>
              {isComingSoon ? (
                <input key="coming-soon-start" type="text" defaultValue="Coming Soon" disabled style={{ backgroundColor: "rgba(181, 189, 160, 0.2)", color: "#6b6b6b", border: "1px solid #b5bda0", padding: "10px", borderRadius: "4px", width: "100%", outline: "none", cursor: "not-allowed" }} />
              ) : (
                <input key="date-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              )}
            </FormField>
            <FormField label="Program End Date">
              {isComingSoon ? (
                <input key="coming-soon-end-date" type="text" defaultValue="Coming Soon" disabled style={{ backgroundColor: "rgba(181, 189, 160, 0.2)", color: "#6b6b6b", border: "1px solid #b5bda0", padding: "10px", borderRadius: "4px", width: "100%", outline: "none", cursor: "not-allowed" }} />
              ) : (
                <input key="date-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              )}
            </FormField>
            <FormField label="Last Date to Apply" required>
              {isComingSoon ? (
                <input key="coming-soon-apply" type="text" defaultValue="Coming Soon" disabled style={{ backgroundColor: "rgba(181, 189, 160, 0.2)", color: "#6b6b6b", border: "1px solid #b5bda0", padding: "10px", borderRadius: "4px", width: "100%", outline: "none", cursor: "not-allowed" }} />
              ) : (
                <input key="date-apply" type="date" value={lastDateToApply} onChange={(e) => setLastDateToApply(e.target.value)} required />
              )}
            </FormField>
          </div>

          {/* Image Upload Poster */}
          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Program Poster Image">
              {posterUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
                  <img src={posterUrl} alt="Poster Preview" style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid #b5bda0" }} />
                  <button
                    type="button"
                    onClick={() => setPosterUrl("")}
                    style={{ padding: "6px 12px", border: "1px solid #c0392b", color: "#c0392b", background: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="admin-upload-box" style={{ border: "1px dashed #b5bda0", borderRadius: "4px", padding: "2rem", textAlign: "center", backgroundColor: "rgba(255,255,255,0.4)" }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="poster-upload"
                    style={{ display: "none" }}
                    onChange={handlePosterUpload}
                    disabled={isUploadingPoster}
                  />
                  <label htmlFor="poster-upload" style={{ cursor: isUploadingPoster ? "not-allowed" : "pointer" }}>
                    <div style={{ fontSize: "13px", color: "#6b6b6b" }}>
                      <span style={{ fontWeight: 600, color: "#1a1a1a", textDecoration: "underline" }}>
                        {isUploadingPoster ? "Uploading..." : "Click to upload poster"}
                      </span> or drag and drop<br />
                      PNG, JPG or WebP (max. 5MB)
                    </div>
                  </label>
                </div>
              )}
            </FormField>
          </div>

          {/* Gallery Images */}
          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Program Images (Gallery)">
              <div className="admin-upload-box" style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="media-upload"
                  style={{ display: "none" }}
                  onChange={handleGalleryUpload}
                  disabled={isUploadingGallery}
                />
                <label htmlFor="media-upload" style={{ cursor: isUploadingGallery ? "not-allowed" : "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                  {isUploadingGallery ? "Uploading..." : "Click to upload program images"}
                </label>
                <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px" }}>PNG, JPG, WebP allowed</div>
              </div>

              {galleryUrls.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                  {galleryUrls.map((url, idx) => (
                    <div key={idx} style={{ position: "relative", width: "100px", height: "100px", border: "1px solid #b5bda0", borderRadius: "4px", overflow: "hidden" }}>
                      <img src={url} alt={`Gallery ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        style={{
                          position: "absolute", top: "2px", right: "2px", backgroundColor: "rgba(192, 57, 43, 0.8)",
                          color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer",
                          fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormField>
          </div>

          {/* Eligibility */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Eligibility</h3>
          <MultiSelectPills label="Eligible Schools" options={SCHOOL_OPTIONS} selected={schoolsEligible} onChange={setSchoolsEligible} />
          <MultiSelectPills label="Eligible Semesters" options={SEMESTER_OPTIONS} selected={semestersEligible} onChange={setSemestersEligible} />
          <MultiSelectPills label="Eligible Courses" options={COURSE_OPTIONS} selected={coursesEligible} onChange={setCoursesEligible} />

          {/* Content */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Content</h3>
          <FormField label="Overview">
            <textarea rows={4} placeholder="Enter detailed program overview..." value={overview} onChange={(e) => setOverview(e.target.value)} style={{ width: "100%" }} />
          </FormField>
          <DynamicListInput label="Highlights" placeholder="e.g. Fully funded by partner" items={highlights} onChange={setHighlights} />

          {/* Financials */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Financials</h3>
          <FormField label="Program Fee Summary">
            <input type="text" placeholder="e.g. ₹28,675 – ₹50,669" value={feeSummary} onChange={(e) => setFeeSummary(e.target.value)} />
          </FormField>
          <FormField label="Fee Breakdown">
            <textarea rows={4} placeholder="e.g. Tuition Fee: ₹28,675" value={feeBreakdown} onChange={(e) => setFeeBreakdown(e.target.value)} />
          </FormField>

          <FormField label="Add approximate living cost?">
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginTop: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px", color: "#1a1a1a", cursor: "pointer" }}>
                <input type="radio" name="showLivingCost" checked={showLivingCost} onChange={() => setShowLivingCost(true)} style={{ accentColor: "#1a1a1a" }} /> Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px", color: "#1a1a1a", cursor: "pointer" }}>
                <input type="radio" name="showLivingCost" checked={!showLivingCost} onChange={() => setShowLivingCost(false)} style={{ accentColor: "#1a1a1a" }} /> No
              </label>
            </div>
          </FormField>

          {showLivingCost && (
            <div style={{ marginTop: "1rem", padding: "1.5rem", backgroundColor: "rgba(181, 189, 160, 0.1)", borderRadius: "8px", border: "1px solid rgba(181, 189, 160, 0.3)" }}>
              <FormField label="Estimated Stay Cost">
                <input type="text" placeholder="e.g. ₹8,000–₹18,000 approx." value={estimatedStayCost} onChange={(e) => setEstimatedStayCost(e.target.value)} />
              </FormField>
              <FormField label="Living Costs (Format: Item | Cost | CostINR, one per line)">
                <textarea rows={4} placeholder="e.g. Food & Groceries | 10,000 RUB/month | ₹11,600" value={livingCostsText} onChange={(e) => setLivingCostsText(e.target.value)} />
              </FormField>
            </div>
          )}

          {/* Application Form */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Application Form</h3>
          <FormField label="Attach Default Application Form?">
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginTop: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px", color: "#1a1a1a", cursor: "pointer" }}>
                <input type="radio" name="useDefaultForm" checked={useDefaultForm} onChange={() => setUseDefaultForm(true)} style={{ accentColor: "#1a1a1a" }} /> Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px", color: "#1a1a1a", cursor: "pointer" }}>
                <input type="radio" name="useDefaultForm" checked={!useDefaultForm} onChange={() => setUseDefaultForm(false)} style={{ accentColor: "#1a1a1a" }} /> No
              </label>
            </div>
          </FormField>

          {useDefaultForm ? (
            <div style={{ marginTop: "1rem", padding: "1.5rem", backgroundColor: "rgba(181, 189, 160, 0.1)", borderRadius: "8px", border: "1px solid rgba(181, 189, 160, 0.3)" }}>
              <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                The default form includes: Full Name, Enrollment No, Gender, School, Semester, Course, CGPA, and Passport details. You can add additional fields below.
              </p>
              <CustomFormBuilder fields={customFields} setFields={setCustomFields} />
            </div>
          ) : (
            <div style={{ marginTop: "1rem", padding: "1.5rem", backgroundColor: "rgba(181, 189, 160, 0.1)", borderRadius: "8px", border: "1px solid rgba(181, 189, 160, 0.3)" }}>
              <FormField label="Mark as Coming Soon?">
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginTop: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px", color: "#1a1a1a", cursor: "pointer" }}>
                    <input type="radio" name="comingSoon" checked={isComingSoon} onChange={() => setIsComingSoon(true)} style={{ accentColor: "#1a1a1a" }} /> Yes
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px", color: "#1a1a1a", cursor: "pointer" }}>
                    <input type="radio" name="comingSoon" checked={!isComingSoon} onChange={() => setIsComingSoon(false)} style={{ accentColor: "#1a1a1a" }} /> No
                  </label>
                </div>
              </FormField>
            </div>
          )}

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              style={{
                padding: "10px 24px",
                backgroundColor: "#1a1a1a",
                color: "#f5f0e8",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {role === 'editor' || role === 'admin' ? 'Send for Approval' : 'Save Program'}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/programs")}
              style={{
                padding: "10px 24px",
                backgroundColor: "transparent",
                color: "#1a1a1a",
                border: "1px solid #1a1a1a",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Popup */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeSaveProgram}
        onSuccess={() => router.push("/admin/programs")}
        title="Save program?"
        confirmLabel="Yes"
        cancelLabel="No"
        submittingLabel="Submitting..."
        successLabel="Submitted!"
      />
    </div>
  );
}
