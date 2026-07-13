"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown } from "../../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";

const SCHOOL_OPTIONS = ["SCSET", "SOAI", "SEAS", "SOM", "SOL", "TSOM", "SOLA", "SOD", "All"];
const SEMESTER_OPTIONS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8", "Semester 9", "Semester 10", "All"];
const COURSE_OPTIONS = ["B.Tech", "BCA", "BBA", "B.Com", "B.A. Liberal Arts", "B.A. Mass Communication", "B.A. Film, TV & Web Series", "B.Des", "B.A. LL.B. (Hons.)", "BBA LL.B. (Hons.)", "MBA", "MCA", "M.Tech", "M.A. Mass Communication", "M.A. Economics", "LL.M.", "PG Diploma in TV & Digital Journalism", "B.Tech Global", "BBA Global", "B.A. Global Liberal Arts", "B.A. Global Media", "B.Des Global", "All"];

function MultiSelectPills({ label, options }: { label: string; options: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  
  const toggle = (opt: string) => {
    if (selected.includes(opt)) setSelected(selected.filter(x => x !== opt));
    else setSelected([...selected, opt]);
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

export default function EditProgramPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [showLivingCost, setShowLivingCost] = useState(false);
  const [useDefaultForm, setUseDefaultForm] = useState(false);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/programs" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Programs
        </Link>
      </div>

      <AdminPageHeader title="Edit Program" />

      <div style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
          {/* Basic Details */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Basic Details</h3>
          <FormField label="Program Name" required>
            <input type="text" placeholder="e.g. HSE St. Petersburg Summer School" />
          </FormField>
          
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <FormField label="Program Start Date">
              {isComingSoon ? (
                <input key="coming-soon-start" type="text" defaultValue="Coming Soon" disabled style={{ backgroundColor: "rgba(181, 189, 160, 0.2)", color: "#6b6b6b", border: "1px solid #b5bda0", padding: "10px", borderRadius: "4px", width: "100%", outline: "none", cursor: "not-allowed" }} />
              ) : (
                <input key="date-start" type="date" />
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
              <DynamicListInput label="Additional Custom Fields (Optional)" placeholder="e.g. Why do you want to join this program?" />
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
              {role === 'editor' || role === 'admin' ? 'Send for Approval' : 'Update Program'}
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
