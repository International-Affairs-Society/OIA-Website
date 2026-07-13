"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { Plus, Trash2, Upload, AlertCircle, CheckCircle } from "lucide-react";
function DynamicHighlightsInput({ label, placeholder }: { label: string; placeholder: string }) {
  const [items, setItems] = useState<string[]>([""]);

  const handleAdd = () => setItems([...items, ""]);
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
                style={{ padding: "0 12px", backgroundColor: "transparent", border: "1px solid #d12027", color: "#d12027", borderRadius: "4px", cursor: "pointer", fontSize: "16px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          style={{ alignSelf: "flex-start", padding: "8px 16px", backgroundColor: "transparent", color: "#1a1a1a", border: "1px dashed #b5bda0", borderRadius: "4px", fontSize: "13px", cursor: "pointer", marginTop: "4px" }}
        >
          + Add Highlight
        </button>
      </div>
    </FormField>
  );
}

export default function CreateVisitPage() {
  const router = useRouter();
  const { role } = useAuth();
  
  const [delegations, setDelegations] = useState<any[]>([{ name: "", designation: "", email: "", country: "" }]);
  const [ourPOCs, setOurPOCs] = useState<any[]>([{ name: "", designation: "", email: "", contactNumber: "" }]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showPOCDropdown, setShowPOCDropdown] = useState(false);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [university, setUniversity] = useState("");
  const [visitDate, setVisitDate] = useState("");

  const addDelegation = () => setDelegations([...delegations, { name: "", designation: "", email: "", country: "" }]);
  const removeDelegation = (index: number) => {
    const updated = [...delegations];
    updated.splice(index, 1);
    setDelegations(updated.length ? updated : [{ name: "", designation: "", email: "", country: "" }]);
  };
  const updateDelegation = (index: number, field: string, value: string) => {
    const updated = [...delegations];
    updated[index][field] = value;
    setDelegations(updated);
  };

  const [usersList, setUsersList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, eRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/events?eventType=upcoming`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
          })
        ]);
        if (uRes.ok) {
          const uJson = await uRes.json();
          setUsersList(uJson.data || []);
        }
        if (eRes.ok) {
          const eJson = await eRes.json();
          setEventsList(eJson.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const addPOC = (user?: any) => {
    if (user) {
      setOurPOCs([...ourPOCs, { 
        name: user.display_name || user.email, 
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
    setOurPOCs(updated.length ? updated : [{ name: "", designation: "", email: "", contactNumber: "" }]);
  };
  const updatePOC = (index: number, field: string, value: string) => {
    const updated = [...ourPOCs];
    updated[index][field] = value;
    setOurPOCs(updated);
  };

  const fillFromEvent = (event: any) => {
    setUniversity(event.title); 
    const dateStr = new Date(event.date).toISOString().split('T')[0];
    setVisitDate(dateStr);
    setShowEventDropdown(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/visits" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Visits
        </Link>
      </div>

      <AdminPageHeader title="Record a New Visit" />


      <div style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirmDialog(true); }}>
          
          {/* Basic Info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>Visit Overview</h3>
            <div style={{ position: "relative" }}>
              <button 
                type="button"
                onClick={() => setShowEventDropdown(!showEventDropdown)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700,
                  color: "#1a1a1a", backgroundColor: "transparent", border: "1px solid #1a1a1a",
                  padding: "6px 12px", borderRadius: "4px", cursor: "pointer"
                }}
              >
                Fetch from Upcoming Event
              </button>
              
              {showEventDropdown && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: "8px",
                  backgroundColor: "#fff", border: "1px solid #b5bda0", borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "250px",
                  overflow: "hidden"
                }}>
                  <div style={{ padding: "8px", maxHeight: "200px", overflowY: "auto" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", padding: "4px 8px 8px 8px", borderBottom: "1px solid #eaeaea", marginBottom: "4px" }}>Select Event</div>
                    {eventsList.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => fillFromEvent(ev)}
                        style={{
                          width: "100%", textAlign: "left", padding: "8px", background: "none", border: "none",
                          fontSize: "13px", color: "#1a1a1a", cursor: "pointer", borderRadius: "4px",
                          display: "flex", flexDirection: "column", gap: "2px", transition: "background 0.1s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FFFBF2"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <span style={{ fontWeight: 600 }}>{ev.title}</span>
                        <span style={{ fontSize: "11px", color: "#6b6b6b" }}>{ev.date}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormField label="University Visited" required>
              <input type="text" placeholder="e.g. Harvard University" value={university} onChange={e => setUniversity(e.target.value)} />
            </FormField>
            <FormField label="Date of Visit" required>
              <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} />
            </FormField>
          </div>

          <FormField label="Visit Photos (Upload multiple for gallery)">
             <div style={{ 
               border: "2px dashed #b5bda0", borderRadius: "8px", padding: "2rem", 
               textAlign: "center", backgroundColor: "rgba(255,255,255,0.5)", cursor: "pointer",
               display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
             }}>
               <Upload size={24} color="#6b6b6b" />
               <span style={{ fontSize: "14px", color: "#6b6b6b" }}>Click or drag photos here to upload</span>
             </div>
          </FormField>

          {/* Delegations */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Delegations (Visitors)
            <button type="button" onClick={addDelegation} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", background: "none", border: "1px solid #1a1a1a", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>
              <Plus size={12} /> Add Visitor
            </button>
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {delegations.map((del, index) => (
              <div key={index} style={{ backgroundColor: "rgba(181, 189, 160, 0.15)", padding: "16px", borderRadius: "8px", position: "relative" }}>
                {delegations.length > 1 && (
                  <button type="button" onClick={() => removeDelegation(index)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#d12027", cursor: "pointer" }}>
                    <Trash2 size={16} />
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <FormField label="Full Name"><input type="text" value={del.name} onChange={e => updateDelegation(index, 'name', e.target.value)} /></FormField>
                  <FormField label="Designation"><input type="text" value={del.designation} onChange={e => updateDelegation(index, 'designation', e.target.value)} /></FormField>
                  <FormField label="Email"><input type="email" value={del.email} onChange={e => updateDelegation(index, 'email', e.target.value)} /></FormField>
                  <FormField label="Country"><input type="text" value={del.country} onChange={e => updateDelegation(index, 'country', e.target.value)} /></FormField>
                </div>
              </div>
            ))}
          </div>

          {/* Our POCs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>Bennett University POCs</h3>
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
                    {usersList.map((u) => (
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
                        <span style={{ fontWeight: 600 }}>{u.display_name || u.email}</span>
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
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {ourPOCs.map((poc, index) => (
              <div key={index} style={{ backgroundColor: "rgba(181, 189, 160, 0.15)", padding: "16px", borderRadius: "8px", position: "relative" }}>
                {ourPOCs.length > 1 && (
                  <button type="button" onClick={() => removePOC(index)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#d12027", cursor: "pointer" }}>
                    <Trash2 size={16} />
                  </button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <FormField label="Full Name"><input type="text" value={poc.name} onChange={e => updatePOC(index, 'name', e.target.value)} /></FormField>
                  <FormField label="Designation"><input type="text" value={poc.designation} onChange={e => updatePOC(index, 'designation', e.target.value)} /></FormField>
                  <FormField label="Email"><input type="email" value={poc.email} onChange={e => updatePOC(index, 'email', e.target.value)} /></FormField>
                  <FormField label="Contact Number"><input type="text" value={poc.contactNumber} onChange={e => updatePOC(index, 'contactNumber', e.target.value)} /></FormField>
                </div>
              </div>
            ))}
          </div>

          {/* Details */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Purpose & Highlights</h3>
          <FormField label="Purpose of Visit">
            <textarea rows={4} placeholder="Summarize the core reason for the visit..." />
          </FormField>
          
          <DynamicHighlightsInput label="Meeting Highlights & Outcomes" placeholder="e.g. Finalized MOU draft..." />

          <FormField label="Attach Final Report (PDF/DOCX)">
             <div style={{ 
               border: "1px solid #b5bda0", borderRadius: "8px", padding: "1rem", 
               backgroundColor: "#fff", display: "flex", alignItems: "center", gap: "12px"
             }}>
               <input type="file" style={{ fontSize: "13px" }} />
             </div>
          </FormField>

          <div style={{ marginTop: "3rem", display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              style={{
                padding: "12px 32px", backgroundColor: "#1a1a1a", color: "#f5f0e8",
                border: "none", fontSize: "15px", fontWeight: 500, cursor: "pointer", borderRadius: "4px"
              }}
            >
              {role === 'editor' || role === 'admin' ? 'Submit for Approval' : 'Record Visit'}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/visits")}
              style={{
                padding: "12px 32px", backgroundColor: "transparent", color: "#1a1a1a",
                border: "1px solid #1a1a1a", fontSize: "15px", fontWeight: 500, cursor: "pointer", borderRadius: "4px"
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        {showConfirmDialog && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", maxWidth: "400px", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#fff3e0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
                <AlertCircle size={24} color="#ed6c02" />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", marginBottom: "0.5rem" }}>
                Confirm Submission
              </h3>
              <p style={{ fontSize: "14px", color: "#6b6b6b", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                Are you sure you want to {role === 'admin' || role === 'editor' ? 'submit this visit for approval' : 'record this visit'}? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button 
                  onClick={() => setShowConfirmDialog(false)}
                  style={{ padding: "10px 24px", backgroundColor: "transparent", color: "#1a1a1a", border: "1px solid #1a1a1a", borderRadius: "4px", fontSize: "14px", cursor: "pointer", flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setShowConfirm(true);
                  }}
                  style={{ padding: "10px 24px", backgroundColor: "#1a1a1a", color: "#f5f0e8", border: "none", borderRadius: "4px", fontSize: "14px", cursor: "pointer", flex: 1 }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirm && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", maxWidth: "400px", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
                <CheckCircle size={24} color="#4caf50" />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", marginBottom: "0.5rem" }}>
                {role === 'admin' || role === 'editor' ? 'Submitted for Approval' : 'Visit Recorded'}
              </h3>
              <p style={{ fontSize: "14px", color: "#6b6b6b", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                {role === 'admin' || role === 'editor' 
                  ? 'The visit record has been saved and sent to the Super Admin for final approval. An entry has been logged in the audit trail.'
                  : 'The visit record has been successfully added to the database. An entry has been logged in the audit trail.'
                }
              </p>
              <button 
                onClick={() => router.push("/admin/visits")}
                style={{ padding: "10px 24px", backgroundColor: "#1a1a1a", color: "#f5f0e8", border: "none", borderRadius: "4px", fontSize: "14px", cursor: "pointer", width: "100%" }}
              >
                Go to Visits
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
