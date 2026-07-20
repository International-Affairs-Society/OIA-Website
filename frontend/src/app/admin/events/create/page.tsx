"use client";
import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown, ConfirmModal } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { saveDraft, getDraftById } from "@/app/admin/drafts/draftsStorage";

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  
  const draftId = searchParams?.get("draftId") || undefined;
  
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [linkedMOU, setLinkedMOU] = React.useState("");
  const [isArchived, setIsArchived] = React.useState(false);
  
  const [showDraftConfirm, setShowDraftConfirm] = React.useState(false);

  React.useEffect(() => {
    if (draftId && role) {
      const draft = getDraftById(role, draftId);
      if (draft && draft.data) {
        setTitle(draft.data.title || "");
        setDescription(draft.data.description || "");
        setDate(draft.data.date || "");
        setLocation(draft.data.location || "");
        setLinkedMOU(draft.data.linkedMOU || "");
        setIsArchived(draft.data.isArchived || false);
      }
    }
  }, [role, draftId]);

  const handleSaveDraft = () => {
    const payload = { title, description, date, location, linkedMOU, isArchived };
    saveDraft(role, "Event", title, payload, draftId);
    return Promise.resolve(true);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/events" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Events
        </Link>
      </div>

      <AdminPageHeader title="Create Event" />

      <div className="admin-form-container" style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); router.push("/admin/events"); }}>
          <FormField label="Title" required>
            <input type="text" placeholder="Enter here" value={title} onChange={e => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Description">
            <textarea rows={4} placeholder="Enter here..." value={description} onChange={e => setDescription(e.target.value)} />
          </FormField>
          <FormField label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </FormField>
          <FormField label="Location">
            <input type="text" placeholder="Enter here" value={location} onChange={e => setLocation(e.target.value)} />
          </FormField>
          <FormField label="Link MOU">
            <CustomDropdown
              value={linkedMOU}
              onChange={setLinkedMOU}
              options={[
                { value: "", label: "None" },
                { value: "1", label: "UOL MOU" },
                { value: "2", label: "TII MOU" },
              ]}
            />
          </FormField>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "1rem" }}>
            <input type="checkbox" id="archive-event" checked={isArchived} onChange={e => setIsArchived(e.target.checked)} />
            <label htmlFor="archive-event" style={{ fontSize: "13px", color: "#6b6b6b" }}>Archive this event</label>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Add Media (Images/Documents)">
              <div className="admin-upload-box" style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                <input type="file" multiple id="media-upload" style={{ display: "none" }} />
                <label htmlFor="media-upload" style={{ cursor: "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                  Click to upload media files
                </label>
                <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px" }}>PNG, JPG, PDF up to 10MB</div>
              </div>
            </FormField>
          </div>

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
              {role === 'editor' || role === 'admin' ? 'Send for Approval' : 'Save Event'}
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
              onClick={() => router.push("/admin/events")}
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
