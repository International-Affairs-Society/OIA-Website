"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader, FormField, ConfirmModal } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { Plus, Trash2, Upload, AlertCircle, CheckCircle, X, FileText, Loader2 } from "lucide-react";
import { saveDraft, getDraftById } from "@/app/admin/drafts/draftsStorage";
import { apiFetch } from "@/lib/apiFetch";

function DynamicHighlightsInput({ 
  label, 
  placeholder,
  items,
  onChange
}: { 
  label: string; 
  placeholder: string;
  items: string[];
  onChange: (newItems: string[]) => void;
}) {
  const handleAdd = () => onChange([...items, ""]);
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
  const searchParams = useSearchParams();
  const { role } = useAuth();
  
  const draftId = searchParams?.get("draftId") || undefined;
  
  const [delegations, setDelegations] = useState<any[]>([{ name: "", designation: "", email: "", country: "" }]);
  const [ourPOCs, setOurPOCs] = useState<any[]>([{ name: "", designation: "", email: "", contactNumber: "" }]);
  const [purpose, setPurpose] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  
  // Photos Upload states
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  
  // Report Upload states
  const [reportFileUrl, setReportFileUrl] = useState<string | null>(null);
  const [reportFileName, setReportFileName] = useState("");
  const [isUploadingReport, setIsUploadingReport] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);

  const [showPOCDropdown, setShowPOCDropdown] = useState(false);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [university, setUniversity] = useState("");
  const [visitDate, setVisitDate] = useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const reportInputRef = React.useRef<HTMLInputElement>(null);

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
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/users`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/events?eventType=upcoming`)
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

    const loadDraft = async () => {
      if (draftId && role) {
        const draft = await getDraftById(role, draftId);
        if (draft && draft.data) {
          setUniversity(draft.data.university || "");
          setVisitDate(draft.data.visitDate || "");
          setDelegations(draft.data.delegations?.length ? draft.data.delegations : [{ name: "", designation: "", email: "", country: "" }]);
          setOurPOCs(draft.data.ourPOCs?.length ? draft.data.ourPOCs : [{ name: "", designation: "", email: "", contactNumber: "" }]);
          setPurpose(draft.data.purpose || "");
          setHighlights(draft.data.highlights?.length ? draft.data.highlights : [""]);
          setUploadedPhotos(draft.data.uploadedPhotos || []);
          setReportFileUrl(draft.data.reportFileUrl || null);
          setReportFileName(draft.data.reportFileName || "");
        }
      }
    };
    loadDraft();
  }, [role, draftId]);

  const addPOC = (user?: any) => {
    if (user) {
      setOurPOCs([...ourPOCs, { 
        name: user.name || user.display_name || user.email, 
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

  // Photo uploads
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadPhotosList(files);
  };

  const uploadPhotosList = async (files: FileList) => {
    setIsUploadingPhotos(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await apiFetch(`/api/v1/media`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const json = await res.json();
          uploadedUrls.push(json.url);
        }
      } catch (err) {
        console.error("Failed to upload photo:", err);
      }
    }
    setUploadedPhotos((prev) => [...prev, ...uploadedUrls]);
    setIsUploadingPhotos(false);
  };

  const handlePhotoDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadPhotosList(files);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, idx) => idx !== indexToRemove));
  };

  // Report Upload
  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReport(true);

    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiFetch(`/api/v1/media`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        setReportFileUrl(json.url);
        setReportFileName(file.name);
      } else {
        alert("Report upload failed.");
      }
    } catch (err) {
      console.error("Failed to upload report file:", err);
      alert("Error uploading report file.");
    } finally {
      setIsUploadingReport(false);
    }
  };

  const handleConfirmSubmit = async () => {
    try {

      const payload = {
        university,
        date: visitDate,
        purpose: purpose || null,
        highlights: highlights.filter(h => h.trim() !== ""),
        photos: uploadedPhotos,
        delegations: delegations.filter(d => d.name.trim() !== ""),
        our_pocs: ourPOCs.filter(p => p.name.trim() !== "").map(p => ({
          name: p.name,
          designation: p.designation,
          email: p.email,
          contactNumber: p.contactNumber
        })),
        reports: reportFileUrl ? [{ name: reportFileName, url: reportFileUrl }] : []
      };

      const res = await apiFetch(`/api/v1/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return true;
      } else {
        const errJson = await res.json();
        alert(`Failed to save visit: ${errJson.error?.message || "Unknown error"}`);
        return false;
      }
    } catch (err) {
      console.error("Error saving visit:", err);
      alert("Error saving visit.");
      return false;
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/visits" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Visits
        </Link>
      </div>

      <AdminPageHeader title="Record a New Visit" />

      <div className="admin-form-container" style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
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
          
          <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormField label="University Visited" required>
              <input type="text" placeholder="e.g. Harvard University" value={university} onChange={e => setUniversity(e.target.value)} required minLength={2} maxLength={200} autoComplete="off" />
            </FormField>
            <FormField label="Date of Visit" required>
              <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} required />
            </FormField>
          </div>

          <FormField label="Visit Photos (Upload multiple for gallery)">
             <div 
               onClick={() => fileInputRef.current?.click()}
               onDragOver={(e) => e.preventDefault()}
               onDrop={handlePhotoDrop}
               style={{ 
                 border: "2px dashed #b5bda0", borderRadius: "8px", padding: "2rem", 
                 textAlign: "center", backgroundColor: "rgba(255,255,255,0.5)", cursor: "pointer",
                 display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
               }}
             >
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handlePhotoUpload} 
                 multiple 
                 accept="image/*" 
                 style={{ display: "none" }} 
               />
               {isUploadingPhotos ? (
                 <>
                   <Loader2 className="animate-spin" size={24} color="#6b6b6b" />
                   <span style={{ fontSize: "14px", color: "#6b6b6b" }}>Uploading photos...</span>
                 </>
               ) : (
                 <>
                   <Upload size={24} color="#6b6b6b" />
                   <span style={{ fontSize: "14px", color: "#6b6b6b" }}>Click or drag photos here to upload</span>
                 </>
               )}
             </div>

             {/* Photos Preview Grid */}
             {uploadedPhotos.length > 0 && (
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px", marginTop: "16px" }}>
                 {uploadedPhotos.map((url, idx) => (
                   <div key={idx} style={{ position: "relative", width: "100px", height: "100px", border: "1px solid #b5bda0", borderRadius: "4px", overflow: "hidden" }}>
                     <img src={url} alt={`Visit preview ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                     <button
                       type="button"
                       onClick={() => handleRemovePhoto(idx)}
                       style={{
                         position: "absolute", top: "4px", right: "4px",
                         backgroundColor: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%",
                         width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                         cursor: "pointer", color: "#fff"
                       }}
                     >
                       <X size={12} />
                     </button>
                   </div>
                 ))}
               </div>
             )}
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
                <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <FormField label="Full Name"><input type="text" value={del.name} onChange={e => updateDelegation(index, 'name', e.target.value)} minLength={2} maxLength={100} autoComplete="name" /></FormField>
                  <FormField label="Designation"><input type="text" value={del.designation} onChange={e => updateDelegation(index, 'designation', e.target.value)} maxLength={100} /></FormField>
                  <FormField label="Email"><input type="email" value={del.email} onChange={e => updateDelegation(index, 'email', e.target.value)} maxLength={254} autoComplete="email" /></FormField>
                  <FormField label="Country"><input type="text" value={del.country} onChange={e => updateDelegation(index, 'country', e.target.value)} maxLength={100} autoComplete="country-name" /></FormField>
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
                        <span style={{ fontWeight: 600 }}>{u.name || u.display_name || u.email}</span>
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
                <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <FormField label="Full Name"><input type="text" value={poc.name} onChange={e => updatePOC(index, 'name', e.target.value)} minLength={2} maxLength={100} autoComplete="name" /></FormField>
                  <FormField label="Designation"><input type="text" value={poc.designation} onChange={e => updatePOC(index, 'designation', e.target.value)} maxLength={100} /></FormField>
                  <FormField label="Email"><input type="email" value={poc.email} onChange={e => updatePOC(index, 'email', e.target.value)} maxLength={254} autoComplete="email" /></FormField>
                  <FormField label="Contact Number"><input type="tel" inputMode="tel" value={poc.contactNumber} onChange={e => updatePOC(index, 'contactNumber', e.target.value.replace(/[^\d\+\-\s\(\)]/g, ''))} placeholder="+91 9876543210" maxLength={20} autoComplete="tel" /></FormField>
                </div>
              </div>
            ))}
          </div>

          {/* Details */}
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginTop: "2rem", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "0.5rem" }}>Purpose & Highlights</h3>
          <FormField label="Purpose of Visit">
            <textarea 
              rows={4} 
              placeholder="Summarize the core reason for the visit..." 
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              maxLength={2000}
            />
          </FormField>
          
          <DynamicHighlightsInput 
            label="Meeting Highlights & Outcomes" 
            placeholder="e.g. Finalized MOU draft..." 
            items={highlights}
            onChange={setHighlights}
          />

          <FormField label="Attach Final Report (PDF/DOCX)">
             <div style={{ 
               border: "1px solid #b5bda0", borderRadius: "8px", padding: "1rem", 
               backgroundColor: "#fff", display: "flex", alignItems: "center", gap: "12px"
             }}>
               <input 
                 type="file" 
                 ref={reportInputRef}
                 onChange={handleReportUpload}
                 accept=".pdf,.docx,.doc"
                 style={{ display: "none" }} 
               />
               <button
                 type="button"
                 onClick={() => reportInputRef.current?.click()}
                 style={{
                   padding: "6px 12px", border: "1px solid #1a1a1a", backgroundColor: "transparent",
                   fontSize: "13px", cursor: "pointer", borderRadius: "4px", display: "flex", alignItems: "center", gap: "6px"
                 }}
               >
                 {isUploadingReport ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                 Choose Report File
               </button>
               {reportFileUrl ? (
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#2e7d32" }}>
                   <FileText size={16} />
                   <span>{reportFileName}</span>
                   <button
                     type="button"
                     onClick={() => { setReportFileUrl(null); setReportFileName(""); }}
                     style={{ background: "none", border: "none", color: "#d12027", cursor: "pointer" }}
                   >
                     <X size={14} />
                   </button>
                 </div>
               ) : (
                 <span style={{ fontSize: "13px", color: "#6b6b6b" }}>
                   {isUploadingReport ? "Uploading..." : "No file chosen"}
                 </span>
               )}
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
              onClick={() => setShowDraftConfirm(true)}
              style={{
                padding: "12px 32px", backgroundColor: "#FFFBF2", color: "#1a1a1a",
                border: "1px solid #1a1a1a", fontSize: "15px", fontWeight: 500, cursor: "pointer", borderRadius: "4px"
              }}
            >
              Save as Draft
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

        <ConfirmModal
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          onSuccess={() => router.push("/admin/visits")}
          title="Record Visit?"
          confirmLabel="Yes, Submit"
          cancelLabel="Cancel"
          submittingLabel="Submitting..."
          successLabel="Submitted Successfully!"
        />

        <ConfirmModal
          isOpen={showDraftConfirm}
          onClose={() => setShowDraftConfirm(false)}
          onConfirm={() => {
            const payload = {
              university, visitDate, delegations, ourPOCs, purpose, highlights, uploadedPhotos, reportFileUrl, reportFileName
            };
            saveDraft(role, "Visit", university || "Untitled Visit", payload, draftId);
            return Promise.resolve(true);
          }}
          onSuccess={() => router.push("/admin/drafts")}
          title="Save as Draft?"
          confirmLabel="Save Draft"
          cancelLabel="Cancel"
          submittingLabel="Saving..."
          successLabel="Draft Saved!"
        />
      </div>
    </div>
  );
}
