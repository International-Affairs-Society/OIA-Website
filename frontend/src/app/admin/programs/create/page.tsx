"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { Plus, Trash2 } from "lucide-react";
import { MOCK_USERS_LIST } from "@/app/admin/data/mockData";

const SCHOOL_OPTIONS = ["SCSET", "SOAI", "SEAS", "SOM", "SOL", "TSOM", "SOLA", "SOD", "All"];
const SEMESTER_OPTIONS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8", "Semester 9", "Semester 10", "All"];
const COURSE_OPTIONS = ["B.Tech", "BCA", "BBA", "B.Com", "B.A. Liberal Arts", "B.A. Mass Communication", "B.A. Film, TV & Web Series", "B.Des", "B.A. LL.B. (Hons.)", "BBA LL.B. (Hons.)", "MBA", "MCA", "M.Tech", "M.A. Mass Communication", "M.A. Economics", "LL.M.", "PG Diploma in TV & Digital Journalism", "B.Tech Global", "BBA Global", "B.A. Global Liberal Arts", "B.A. Global Media", "B.Des Global", "All"];

function MultiSelectPills({ label, options }: { label: string; options: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  
  const toggle = (opt: string) => {
    if (opt === "All") {
      // If clicking All, and it's already selected, unselect it. Otherwise, select ONLY All.
      if (selected.includes("All")) {
        setSelected([]);
      } else {
        setSelected(["All"]);
      }
    } else {
      // If clicking a specific option, unselect All, and toggle the specific option
      let newSelected = selected.filter(x => x !== "All");
      if (newSelected.includes(opt)) {
        newSelected = newSelected.filter(x => x !== opt);
      } else {
        newSelected = [...newSelected, opt];
      }
      setSelected(newSelected);
    }
  };

  const isAllSelected = selected.length === options.length && options.length > 0;

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

function DynamicListInput({ label, placeholder }: { label: string; placeholder: string }) {
  const [items, setItems] = useState<string[]>([""]);

  const handleAdd = () => {
    setItems([...items, ""]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems.length ? newItems : [""]);
  };

  const handleChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    setItems(newItems);
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

function CustomFormBuilder() {
  const [fields, setFields] = useState<CustomField[]>([]);

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
        Add specific fields you want applicants to fill out. You can ask for text answers, require document uploads (like portfolios), or provide dropdown selections.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {fields.map((field, index) => (
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
  const [showLivingCost, setShowLivingCost] = useState(false);
  const [useDefaultForm, setUseDefaultForm] = useState(false);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [ourPOCs, setOurPOCs] = useState<any[]>([]);
  const [showPOCDropdown, setShowPOCDropdown] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setUsersList(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);


  const addPOC = (user?: any) => {
    if (user) {
      setOurPOCs([...ourPOCs, { 
        name: user.display_name || user.name || user.email, 
        designation: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "", 
        email: user.email, 
        contactNumber: user.mobile || user.phoneNumber || "+91 9876543210" 
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

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/programs" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Programs
        </Link>
      </div>

      <AdminPageHeader title="Create Program" />

      <div style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
          {/* Basic Details */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Basic Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormField label="Program Name" required>
              <input type="text" placeholder="e.g. HSE St. Petersburg Summer School" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0", padding: "8px 12px", borderRadius: "4px", width: "100%", fontSize: "14px" }} />
            </FormField>
            
            <FormField label="Partner University Name">
              <input type="text" placeholder="e.g. HSE University" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0", padding: "8px 12px", borderRadius: "4px", width: "100%", fontSize: "14px" }} />
            </FormField>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <FormField label="Program Type">
              <CustomDropdown
                onChange={() => {}}
                options={[
                  { value: "", label: "Select Program Type" },
                  { value: "Semester Exchange", label: "Semester Exchange" },
                  { value: "Global Immersion", label: "Global Immersion" },
                  { value: "Inbound Immersion", label: "Inbound Immersion" },
                  { value: "Pathways Program", label: "Pathways Program" },
                  { value: "Progression Arrangement", label: "Progression Arrangement" },
                  { value: "International Internship", label: "International Internship" },
                  { value: "Inbound Semester Exchange", label: "Inbound Semester Exchange" },
                  { value: "Summer Program", label: "Summer Program" },
                  { value: "Winter Program", label: "Winter Program" },
                  { value: "Study Tour", label: "Study Tour" },
                  { value: "Dual Degree", label: "Dual Degree" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </FormField>

            <FormField label="Linked MoU">
              <CustomDropdown
                onChange={() => {}}
                options={[
                  { value: "", label: "Select Linked MoU" },
                  { value: "mou_hse", label: "HSE University MoU - 2024" },
                  { value: "mou_ntu", label: "NTU Singapore Exchange - 2025" },
                  { value: "mou_gatech", label: "Georgia Tech Research - 2023" },
                ]}
              />
            </FormField>
          </div>

          <div style={{ marginTop: "2rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: 0 }}>Our University POCs</h3>
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
                      {(usersList.length > 0 ? usersList : MOCK_USERS_LIST).map((u) => (
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
                          <span style={{ fontWeight: 600 }}>{u.display_name || u.name || u.email}</span>
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
            <div style={{ borderBottom: "1px solid rgba(181, 189, 160, 0.5)", marginBottom: "16px", marginTop: "8px" }} />

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
                gap: "8px"
              }}>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a" }}>No POCs Assigned</span>
                <span>Click the <strong>+ Add POC</strong> button above to assign a university contact for this program.</span>
              </div>
            )}

            {ourPOCs.map((poc, index) => (
              <div key={index} style={{ backgroundColor: "rgba(181, 189, 160, 0.1)", border: "1px dashed #b5bda0", padding: "16px", borderRadius: "8px", marginBottom: "16px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>POC #{index + 1}</span>
                  <button type="button" onClick={() => removePOC(index)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <FormField label="Name">
                    <input type="text" value={poc.name} onChange={(e) => updatePOC(index, 'name', e.target.value)} placeholder="Enter here" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0" }} />
                  </FormField>
                  <FormField label="Designation">
                    <input type="text" value={poc.designation} onChange={(e) => updatePOC(index, 'designation', e.target.value)} placeholder="Enter here" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0" }} />
                  </FormField>
                  <FormField label="Email">
                    <input type="email" value={poc.email} onChange={(e) => updatePOC(index, 'email', e.target.value)} placeholder="Enter here" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0" }} />
                  </FormField>
                  <FormField label="Contact Number">
                    <input type="text" value={poc.contactNumber} onChange={(e) => updatePOC(index, 'contactNumber', e.target.value)} placeholder="Enter here" style={{ backgroundColor: "transparent", border: "1px solid #b5bda0" }} />
                  </FormField>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <FormField label="Program Start Date">
              {isComingSoon ? (
                <input key="coming-soon-start" type="text" defaultValue="Coming Soon" disabled style={{ backgroundColor: "rgba(181, 189, 160, 0.2)", color: "#6b6b6b", border: "1px solid #b5bda0", padding: "10px", borderRadius: "4px", width: "100%", outline: "none", cursor: "not-allowed" }} />
              ) : (
                <input key="date-start" type="date" />
              )}
            </FormField>
            <FormField label="Program End Date">
              {isComingSoon ? (
                <input key="coming-soon-end-prog" type="text" defaultValue="Coming Soon" disabled style={{ backgroundColor: "rgba(181, 189, 160, 0.2)", color: "#6b6b6b", border: "1px solid #b5bda0", padding: "10px", borderRadius: "4px", width: "100%", outline: "none", cursor: "not-allowed" }} />
              ) : (
                <input key="date-end-prog" type="date" />
              )}
            </FormField>
            <FormField label="Last Date to Apply">
              {isComingSoon ? (
                <input key="coming-soon-end" type="text" defaultValue="Coming Soon" disabled style={{ backgroundColor: "rgba(181, 189, 160, 0.2)", color: "#6b6b6b", border: "1px solid #b5bda0", padding: "10px", borderRadius: "4px", width: "100%", outline: "none", cursor: "not-allowed" }} />
              ) : (
                <input key="date-end" type="date" />
              )}
            </FormField>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Program Poster Image">
              <div style={{ 
                border: "1px dashed #b5bda0", 
                borderRadius: "4px", 
                padding: "2rem", 
                textAlign: "center", 
                backgroundColor: "rgba(255,255,255,0.4)",
                cursor: "pointer"
              }}>
                <div style={{ fontSize: "13px", color: "#6b6b6b" }}>
                  <span style={{ fontWeight: 600, color: "#1a1a1a" }}>Click to upload</span> or drag and drop<br />
                  SVG, PNG, JPG or GIF (max. 5MB)
                </div>
              </div>
            </FormField>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Program Images">
              <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                <input type="file" multiple accept="image/*" id="media-upload" style={{ display: "none" }} />
                <label htmlFor="media-upload" style={{ cursor: "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                  Click to upload program images
                </label>
                <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px" }}>PNG, JPG up to 10MB</div>
                <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "4px" }}>Recommended resolution: 1920 x 1080 px</div>
              </div>
            </FormField>
          </div>

          {/* Eligibility */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Eligibility</h3>
          <MultiSelectPills label="Eligible Schools" options={SCHOOL_OPTIONS} />
          <MultiSelectPills label="Eligible Semesters" options={SEMESTER_OPTIONS} />
          <MultiSelectPills label="Eligible Courses" options={COURSE_OPTIONS} />

          {/* Content */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Content</h3>
          <FormField label="Overview">
            <div style={{ position: "relative" }}>
              <textarea rows={4} placeholder="Enter detailed program overview..." style={{ width: "100%" }} />
              <div style={{ fontSize: "11px", color: "#6b6b6b", position: "absolute", bottom: "-20px", right: "0" }}>Max 150 words</div>
            </div>
          </FormField>
          <DynamicListInput label="Highlights" placeholder="e.g. Fully funded by DAAD" />

          {/* Financials */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Financials</h3>
          <FormField label="Program Fee Summary">
            <input type="text" placeholder="e.g. ₹28,675 – ₹50,669" />
          </FormField>
          <FormField label="Fee Breakdown">
            <textarea rows={4} placeholder="e.g. Tuition Fee: ₹28,675" />
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
                <input type="text" placeholder="e.g. ₹8,000–₹18,000 approx." />
              </FormField>
              <FormField label="Living Costs (Format: Item | Cost | CostINR, one per line)">
                <textarea rows={4} placeholder="e.g. Food & Groceries | 10,000 RUB/month | ₹11,600" />
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
                The default form includes: Full Name, Enrollment No, Gender, School, Semester, Course, CGPA, and Passport details. You can add additional fields below if required.
              </p>
              <CustomFormBuilder />
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
      {showConfirm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 10000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "#f5f0e8", border: "2px solid #b5bda0", padding: "32px", maxWidth: "400px", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#1a1a1a", fontSize: "18px" }}>Save program?</h3>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px" }}>
              <button 
                onClick={() => router.push("/admin/programs")}
                style={{ padding: "8px 24px", backgroundColor: "#1a1a1a", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
              >
                Yes
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{ padding: "8px 24px", backgroundColor: "transparent", color: "#1a1a1a", border: "1px solid #1a1a1a", fontWeight: 600, cursor: "pointer" }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
