"use client";
import React, { useState } from "react";
import CustomDropdown from "@/app/admin/components/CustomDropdown";

export function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#1a1a1a", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-outfit)" }}>
        {label} {required && <span style={{ color: "#d12027" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export interface DefaultApplicationFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  customFields?: string[];
}

export default function DefaultApplicationForm({ onSubmit, onCancel, customFields }: DefaultApplicationFormProps) {
  const [hasPassport, setHasPassport] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #b5bda0",
    borderRadius: "4px",
    backgroundColor: "#fff",
    fontSize: "14px",
    color: "#1a1a1a",
    fontFamily: "var(--font-outfit)",
    outline: "none"
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      
      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem", fontFamily: "var(--font-outfit)" }}>Student Details</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <FormField label="Full Name" required>
          <input type="text" placeholder="e.g. Aarav Sharma" style={inputStyle} required />
        </FormField>
        <FormField label="Enrollment Number" required>
          <input type="text" placeholder="e.g. E22CSEU0101" style={inputStyle} required />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
        <FormField label="Gender" required>
          <CustomDropdown
            onChange={() => {}}
            placeholder="Select Gender"
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]}
          />
        </FormField>
        <FormField label="School" required>
          <CustomDropdown
            onChange={() => {}}
            placeholder="Select School"
            options={[
              { label: "SCSET – School of Computer Science Engineering & Technology", value: "SCSET" },
              { label: "SOAI – School of Artificial Intelligence", value: "SOAI" },
              { label: "SEAS – School of Engineering & Applied Sciences", value: "SEAS" },
              { label: "SOM – School of Management", value: "SOM" },
              { label: "SOL – School of Law", value: "SOL" },
              { label: "TSOM – Times School of Media", value: "TSOM" },
              { label: "SOLA – School of Liberal Arts", value: "SOLA" },
              { label: "SOD – School of Design", value: "SOD" },
            ]}
          />
        </FormField>
        <FormField label="Semester" required>
          <CustomDropdown
            onChange={() => {}}
            placeholder="Select Sem"
            options={Array.from({length: 10}, (_, i) => ({ label: `Semester ${i+1}`, value: String(i+1) }))}
          />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <FormField label="Course" required>
          <CustomDropdown
            onChange={() => {}}
            placeholder="Select Course"
            options={[
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
            ]}
          />
        </FormField>
        <FormField label="CGPA" required>
          <input type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.5" style={inputStyle} required />
        </FormField>
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem", fontFamily: "var(--font-outfit)" }}>Travel Documents</h3>

      <FormField label="Do you have a valid passport?" required>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginTop: "0.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px", color: "#1a1a1a", cursor: "pointer", fontFamily: "var(--font-outfit)" }}>
            <input type="radio" name="hasPassport" checked={hasPassport} onChange={() => setHasPassport(true)} style={{ accentColor: "#1a1a1a" }} required /> Yes
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "14px", color: "#1a1a1a", cursor: "pointer", fontFamily: "var(--font-outfit)" }}>
            <input type="radio" name="hasPassport" checked={!hasPassport} onChange={() => setHasPassport(false)} style={{ accentColor: "#1a1a1a" }} required /> No
          </label>
        </div>
      </FormField>

      {hasPassport && (
        <div style={{ marginTop: "1rem", padding: "1.5rem", backgroundColor: "rgba(181, 189, 160, 0.1)", borderRadius: "8px", border: "1px solid rgba(181, 189, 160, 0.3)" }}>
          <FormField label="Upload Passport Copy" required>
            <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "#fff", borderRadius: "4px" }}>
              <input type="file" accept="image/*,.pdf" id="passport-upload" style={{ display: "none" }} required={hasPassport} />
              <label htmlFor="passport-upload" style={{ cursor: "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline", fontFamily: "var(--font-outfit)" }}>
                Click to upload passport
              </label>
              <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px", fontFamily: "var(--font-outfit)" }}>PDF, PNG, JPG up to 5MB</div>
            </div>
          </FormField>
        </div>
      )}

      {customFields && customFields.length > 0 && (
        <>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem", fontFamily: "var(--font-outfit)" }}>Additional Information</h3>
          {customFields.map((field, idx) => (
            <FormField key={idx} label={field} required>
              <textarea rows={3} placeholder={`Enter your response for: ${field}`} style={{ ...inputStyle, resize: "vertical" }} required />
            </FormField>
          ))}
        </>
      )}

      <div style={{ marginTop: "3rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "12px 32px",
            backgroundColor: "transparent",
            color: "#1a1a1a",
            border: "1px solid #1a1a1a",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-outfit)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            borderRadius: "4px"
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: "12px 32px",
            backgroundColor: "#1a1a1a",
            color: "#FFFBF2",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-outfit)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            borderRadius: "4px",
            transition: "background-color 0.3s ease"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#7A8C5E"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1a1a1a"; }}
        >
          Submit Application
        </button>
      </div>
    </form>
  );
}
