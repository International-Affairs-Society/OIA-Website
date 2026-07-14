import React from "react";
import FormField from "./FormField";
import CustomDropdown from "./CustomDropdown";

/* ─────────────────────────────────────────────────────── */
/*  Shared Form Title                                       */
/* ─────────────────────────────────────────────────────── */
function sectionTitle(text: string) {
  return (
    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "1.5rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>
      {text}
    </h3>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Disabled Input Component Helpers                        */
/* ─────────────────────────────────────────────────────── */
// We use FormField with a disabled input/textarea/select so it looks exactly like the create form

function DisabledInput({ value, placeholder = "", isEditable, onChange }: { value: any; placeholder?: string; isEditable?: boolean; onChange?: (val: string) => void }) {
  return (
    <input
      type="text"
      value={value || ""}
      placeholder={placeholder}
      disabled={!isEditable}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%", padding: "1rem", border: isEditable ? "1px solid #b5bda0" : "none", backgroundColor: isEditable ? "transparent" : "#ffffff",
        borderRadius: "1rem", fontSize: "1rem", color: "#1a1a1a",
        boxShadow: isEditable ? "none" : "0 0.4rem #b5bda0", cursor: isEditable ? "text" : "not-allowed", opacity: isEditable ? 1 : 0.8
      }}
    />
  );
}

function DisabledTextarea({ value, placeholder = "", isEditable, onChange }: { value: any; placeholder?: string; isEditable?: boolean; onChange?: (val: string) => void }) {
  return (
    <textarea
      value={value || ""}
      placeholder={placeholder}
      disabled={!isEditable}
      onChange={(e) => onChange?.(e.target.value)}
      rows={4}
      style={{
        width: "100%", padding: "1rem", border: isEditable ? "1px solid #b5bda0" : "none", backgroundColor: isEditable ? "transparent" : "#ffffff",
        borderRadius: "1rem", fontSize: "1rem", color: "#1a1a1a",
        boxShadow: isEditable ? "none" : "0 0.4rem #b5bda0", cursor: isEditable ? "text" : "not-allowed", opacity: isEditable ? 1 : 0.8,
        resize: isEditable ? "vertical" : "none"
      }}
    />
  );
}

function DisabledDate({ value, isEditable, onChange }: { value: any; isEditable?: boolean; onChange?: (val: string) => void }) {
  // Normalize ISO timestamps (2026-07-31T00:00:00.000Z) to YYYY-MM-DD for <input type="date">
  const normalizedValue = value ? String(value).split('T')[0] : ''
  return (
    <input
      type="date"
      value={normalizedValue}
      disabled={!isEditable}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%", padding: "1rem", border: isEditable ? "1px solid #b5bda0" : "none", backgroundColor: isEditable ? "transparent" : "#ffffff",
        borderRadius: "1rem", fontSize: "1rem", color: "#1a1a1a",
        boxShadow: isEditable ? "none" : "0 0.4rem #b5bda0", cursor: isEditable ? "pointer" : "not-allowed", opacity: isEditable ? 1 : 0.8
      }}
    />
  );
}

function DisabledPills({ options, selected, isEditable, onChange }: { options: string[]; selected: string[]; isEditable?: boolean; onChange?: (selected: string[]) => void }) {
  const selectedList = Array.isArray(selected) ? selected : [];
  
  const toggle = (opt: string) => {
    if (!isEditable || !onChange) return;
    if (selectedList.includes(opt)) onChange(selectedList.filter(o => o !== opt));
    else onChange([...selectedList, opt]);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map(opt => {
        const isSelected = selectedList.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            disabled={!isEditable}
            onClick={() => toggle(opt)}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              border: isSelected ? "1px solid #1a1a1a" : "1px solid #b5bda0",
              backgroundColor: isSelected ? "#1a1a1a" : "transparent",
              color: isSelected ? "#f5f0e8" : "#1a1a1a",
              fontSize: "13px",
              cursor: isEditable ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: isSelected ? 1 : (isEditable ? 0.8 : 0.6)
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: isSelected ? 600 : 400 }}>{isSelected ? "✓" : "+"}</span> {opt}
          </button>
        )
      })}
    </div>
  );
}

function DisabledDynamicList({ items, isEditable, onChange }: { items: string[]; isEditable?: boolean; onChange?: (items: string[]) => void }) {
  const list = Array.isArray(items) && items.length > 0 ? items : [""];
  
  const updateItem = (idx: number, val: string) => {
    if (!onChange) return;
    const newList = [...list];
    newList[idx] = val;
    onChange(newList);
  };
  
  const addItem = () => {
    if (!onChange) return;
    onChange([...list, ""]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {list.map((item, idx) => (
        <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#b5bda0", flexShrink: 0 }} />
          <input
            type="text"
            value={item}
            disabled={!isEditable}
            onChange={(e) => updateItem(idx, e.target.value)}
            style={{
              flex: 1, padding: "8px 12px", border: "1px solid #b5bda0", borderRadius: "4px",
              backgroundColor: "transparent", fontSize: "14px", color: "#1a1a1a", cursor: isEditable ? "text" : "not-allowed"
            }}
          />
        </div>
      ))}
      {isEditable && (
        <button
          type="button"
          onClick={addItem}
          style={{
            alignSelf: "flex-start", padding: "6px 12px", fontSize: "12px", color: "#5C6B3F",
            border: "1px dashed #5C6B3F", borderRadius: "4px", background: "transparent", cursor: "pointer",
            marginTop: "4px"
          }}
        >
          + Add Item
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Content Renderers                                       */
/* ─────────────────────────────────────────────────────── */

export function ProgramReadOnlyForm({ data, isEditable, onChange }: { data: Record<string, any>; isEditable?: boolean; onChange?: (key: string, val: any) => void }) {
  const SCHOOL_OPTIONS = ["SCSET", "SOAI", "SEAS", "SOM", "SOL", "TSOM", "SOLA", "SOD", "All"];
  const SEMESTER_OPTIONS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8", "Semester 9", "Semester 10", "All"];
  const COURSE_OPTIONS = ["B.Tech", "BCA", "BBA", "B.Com", "B.A. Liberal Arts", "B.A. Mass Communication", "B.A. Film, TV & Web Series", "B.Des", "B.A. LL.B. (Hons.)", "BBA LL.B. (Hons.)", "MBA", "MCA", "M.Tech", "M.A. Mass Communication", "M.A. Economics", "LL.M.", "PG Diploma in TV & Digital Journalism", "B.Tech Global", "BBA Global", "B.A. Global Liberal Arts", "B.A. Global Media", "B.Des Global", "All"];

  const handleChange = (key: string, val: any) => {
    if (onChange) onChange(key, val);
  };

  // Resolve with snake_case fallbacks for DB-sourced payloads
  const title = data.title || data.name;
  const programType = data.programType || data.program_type;
  const startDate = data.startDate || data.start_date;
  const lastDate = data.lastDate || data.last_date_to_apply;
  const schools = data.schools || data.schools_eligible || [];
  const semesters = data.semesters || data.semesters_eligible || [];
  const courses = data.courses || data.courses_eligible || [];
  const feeSummary = data.feeSummary || data.fee_summary;
  const feeBreakdown = data.feeBreakdown || data.fee_breakdown;
  const showLivingCost = data.showLivingCost ?? data.show_living_cost;
  const estimatedStayCost = data.estimatedStayCost || data.estimated_stay_cost;
  const livingCostDetails = data.livingCostDetails || data.living_cost_details;
  const useDefaultForm = data.useDefaultForm ?? data.use_default_form;
  const customFields = data.customFields || data.custom_fields?.formFields || [];

  return (
    <div>
      {sectionTitle("Basic Details")}
      <FormField label="Program Name">
        <DisabledInput value={title} isEditable={isEditable} onChange={(v) => handleChange("title", v)} />
      </FormField>
      <FormField label="Program Type">
        <DisabledInput value={programType} isEditable={isEditable} onChange={(v) => handleChange("programType", v)} />
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <FormField label="Program Start Date">
          <DisabledDate value={startDate} isEditable={isEditable} onChange={(v) => handleChange("startDate", v)} />
        </FormField>
        <FormField label="Last Date to Apply">
          <DisabledDate value={lastDate} isEditable={isEditable} onChange={(v) => handleChange("lastDate", v)} />
        </FormField>
      </div>

      {sectionTitle("Eligibility")}
      <FormField label="Eligible Schools">
        <DisabledPills options={SCHOOL_OPTIONS} selected={schools} isEditable={isEditable} onChange={(v) => handleChange("schools", v)} />
      </FormField>
      <FormField label="Eligible Semesters">
        <DisabledPills options={SEMESTER_OPTIONS} selected={semesters} isEditable={isEditable} onChange={(v) => handleChange("semesters", v)} />
      </FormField>
      <FormField label="Eligible Courses">
        <DisabledPills options={COURSE_OPTIONS} selected={courses} isEditable={isEditable} onChange={(v) => handleChange("courses", v)} />
      </FormField>

      {sectionTitle("Content")}
      <FormField label="Overview">
        <DisabledTextarea value={data.overview} isEditable={isEditable} onChange={(v) => handleChange("overview", v)} />
      </FormField>
      <FormField label="Highlights">
        <DisabledDynamicList items={data.highlights} isEditable={isEditable} onChange={(v) => handleChange("highlights", v)} />
      </FormField>

      {sectionTitle("Financials")}
      <FormField label="Program Fee Summary">
        <DisabledInput value={feeSummary} isEditable={isEditable} onChange={(v) => handleChange("feeSummary", v)} />
      </FormField>
      <FormField label="Fee Breakdown">
        <DisabledTextarea value={feeBreakdown} isEditable={isEditable} onChange={(v) => handleChange("feeBreakdown", v)} />
      </FormField>

      <FormField label="Show Living Cost?">
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1a1a1a" }}>
            <input type="radio" checked={showLivingCost === true} disabled={!isEditable} onChange={() => handleChange("showLivingCost", true)} /> Yes
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1a1a1a" }}>
            <input type="radio" checked={showLivingCost !== true} disabled={!isEditable} onChange={() => handleChange("showLivingCost", false)} /> No
          </label>
        </div>
      </FormField>

      {showLivingCost && (
        <div style={{ marginTop: "1rem", padding: "1.5rem", backgroundColor: "rgba(181, 189, 160, 0.1)", borderRadius: "8px", border: "1px solid rgba(181, 189, 160, 0.3)" }}>
          <FormField label="Estimated Stay Cost">
            <DisabledInput value={estimatedStayCost} isEditable={isEditable} onChange={(v) => handleChange("estimatedStayCost", v)} />
          </FormField>
          <FormField label="Living Costs (Item | Cost | CostINR)">
            <DisabledTextarea value={livingCostDetails} isEditable={isEditable} onChange={(v) => handleChange("livingCostDetails", v)} />
          </FormField>
        </div>
      )}

      {sectionTitle("Application Form")}
      <FormField label="Attach default application form?">
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1a1a1a" }}>
            <input type="radio" checked={useDefaultForm === true} disabled={!isEditable} onChange={() => handleChange("useDefaultForm", true)} /> Yes
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1a1a1a" }}>
            <input type="radio" checked={useDefaultForm !== true} disabled={!isEditable} onChange={() => handleChange("useDefaultForm", false)} /> No
          </label>
        </div>
      </FormField>

      {useDefaultForm && (
        <div style={{ marginTop: "1rem", padding: "1.5rem", backgroundColor: "rgba(181, 189, 160, 0.1)", borderRadius: "8px", border: "1px solid rgba(181, 189, 160, 0.3)" }}>
          <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "1rem", lineHeight: 1.5 }}>
            Includes: Full Name, Enrollment No, Gender, School, Semester, Course, CGPA, Passport details.
          </p>
          <FormField label="Additional Custom Fields">
            <DisabledDynamicList items={customFields} isEditable={isEditable} onChange={(v) => handleChange("customFields", v)} />
          </FormField>
        </div>
      )}
    </div>
  );
}

export function UpcomingEventReadOnlyForm({ data, isEditable, onChange }: { data: Record<string, any>; isEditable?: boolean; onChange?: (key: string, val: any) => void }) {
  const handleChange = (key: string, val: any) => {
    if (onChange) onChange(key, val);
  };

  // Resolve with snake_case fallbacks for DB-sourced payloads
  const linkedMOU = data.linkedMOU || data.linked_mou_id;
  const isArchived = data.archived ?? data.is_archived ?? data.isArchived;

  return (
    <div>
      <FormField label="Title">
        <DisabledInput value={data.title} isEditable={isEditable} onChange={(v) => handleChange("title", v)} />
      </FormField>
      <FormField label="Description">
        <DisabledTextarea value={data.description} isEditable={isEditable} onChange={(v) => handleChange("description", v)} />
      </FormField>
      <FormField label="Location">
        <DisabledInput value={data.location} isEditable={isEditable} onChange={(v) => handleChange("location", v)} />
      </FormField>
      <FormField label="Date">
        <DisabledDate value={data.date} isEditable={isEditable} onChange={(v) => handleChange("date", v)} />
      </FormField>
      <FormField label="Linked MOU">
        <DisabledInput value={linkedMOU} isEditable={isEditable} onChange={(v) => handleChange("linkedMOU", v)} />
      </FormField>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "1rem" }}>
        <input type="checkbox" checked={!!isArchived} disabled={!isEditable} onChange={(e) => handleChange("archived", e.target.checked)} />
        <label style={{ fontSize: "13px", color: "#6b6b6b" }}>Archive this event</label>
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <FormField label="Event Poster / Cover Image">
          <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", textDecoration: "underline", margin: 0 }}>
              (Media attached in submission)
            </p>
          </div>
        </FormField>
      </div>
    </div>
  );
}

export function PastEventReadOnlyForm({ data, isEditable, onChange }: { data: Record<string, any>; isEditable?: boolean; onChange?: (key: string, val: any) => void }) {
  const handleChange = (key: string, val: any) => {
    if (onChange) onChange(key, val);
  };

  // Resolve with snake_case fallbacks for DB-sourced payloads
  const linkedMOU = data.linkedMOU || data.linked_mou_id;
  const isArchived = data.archived ?? data.is_archived ?? data.isArchived;
  const addToHomepage = data.addToHomepage ?? data.add_to_homepage;

  return (
    <div>
      <FormField label="Title">
        <DisabledInput value={data.title} isEditable={isEditable} onChange={(v) => handleChange("title", v)} />
      </FormField>
      <FormField label="Description">
        <DisabledTextarea value={data.description} isEditable={isEditable} onChange={(v) => handleChange("description", v)} />
      </FormField>
      <FormField label="Location">
        <DisabledInput value={data.location} isEditable={isEditable} onChange={(v) => handleChange("location", v)} />
      </FormField>
      <FormField label="Date">
        <DisabledDate value={data.date} isEditable={isEditable} onChange={(v) => handleChange("date", v)} />
      </FormField>
      <FormField label="Linked MOU">
        <DisabledInput value={linkedMOU} isEditable={isEditable} onChange={(v) => handleChange("linkedMOU", v)} />
      </FormField>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "1rem" }}>
        <input type="checkbox" checked={!!isArchived} disabled={!isEditable} onChange={(e) => handleChange("archived", e.target.checked)} />
        <label style={{ fontSize: "13px", color: "#6b6b6b" }}>Archive this event</label>
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <FormField label="Event Gallery (Images / Documents)">
          <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", textDecoration: "underline", margin: 0 }}>
              (Media attached in submission)
            </p>
          </div>
        </FormField>
      </div>
      <div style={{ marginTop: "1.5rem", padding: "1.25rem", border: "1px solid #b5bda0", backgroundColor: "rgba(245, 240, 232, 0.5)" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px", fontFamily: "var(--font-outfit)" }}>
          Add this event to the homepage?
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1a1a1a" }}>
            <input type="radio" checked={addToHomepage === true} disabled={!isEditable} onChange={() => handleChange("addToHomepage", true)} /> Yes
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#1a1a1a" }}>
            <input type="radio" checked={addToHomepage !== true} disabled={!isEditable} onChange={() => handleChange("addToHomepage", false)} /> No
          </label>
        </div>
      </div>
    </div>
  );
}

export function MOUReadOnlyForm({ data, isEditable, onChange }: { data: Record<string, any>; isEditable?: boolean; onChange?: (key: string, val: any) => void }) {
  const handleChange = (key: string, val: any) => {
    if (onChange) onChange(key, val);
  };

  // Resolve with snake_case fallbacks for DB-sourced payloads
  const partnerUniversity = data.partner || data.partner_university;
  const startDate = data.startDate || data.start_date;
  const expiryDate = data.expiryDate || data.expiry_date;

  return (
    <div>
      <FormField label="MOU Name">
        <DisabledInput value={data.name} isEditable={isEditable} onChange={(v) => handleChange("name", v)} />
      </FormField>
      <FormField label="Partner University">
        <DisabledInput value={partnerUniversity} isEditable={isEditable} onChange={(v) => handleChange("partner", v)} />
      </FormField>
      <FormField label="Status">
        <DisabledInput value={data.status} isEditable={isEditable} onChange={(v) => handleChange("status", v)} />
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <FormField label="Start Date">
          <DisabledDate value={startDate} isEditable={isEditable} onChange={(v) => handleChange("startDate", v)} />
        </FormField>
        <FormField label="Expiry Date">
          <DisabledDate value={expiryDate} isEditable={isEditable} onChange={(v) => handleChange("expiryDate", v)} />
        </FormField>
      </div>
      <FormField label="Notes">
        <DisabledTextarea value={data.notes} isEditable={isEditable} onChange={(v) => handleChange("notes", v)} />
      </FormField>
      <div style={{ marginTop: "1.5rem" }}>
        <FormField label="Add Media (Images/Documents)">
          <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", textDecoration: "underline", margin: 0 }}>
              (Media attached in submission)
            </p>
          </div>
        </FormField>
      </div>
    </div>
  );
}
