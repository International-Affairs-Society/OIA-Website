"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, ConfirmModal, CustomDropdown } from "../components";
import { SkeletonPulse } from "../optemization_component";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { getDrafts, deleteDraft, DraftItem, DraftType } from "./draftsStorage";
import { Edit3, Eye, Trash2, FileText, Search } from "lucide-react";

export default function DraftsPage() {
  const router = useRouter();
  const { role } = useAuth();
  
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<DraftType | "All">("All");
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [draftToView, setDraftToView] = useState<DraftItem | null>(null);

  useEffect(() => {
    if (role) {
      setIsLoading(true);
      getDrafts(role).then((res) => {
        setDrafts(res);
        setIsLoading(false);
      });
    }
  }, [role]);

  const filteredDrafts = drafts
    .filter(d => filterType === "All" || d.type === filterType)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

  const handleContinue = (draft: DraftItem) => {
    let path = "";
    switch (draft.type) {
      case "MOU": path = "/admin/mou/create"; break;
      case "Event": path = "/admin/events/create"; break;
      case "Program": path = "/admin/programs/create"; break;
      case "Visit": path = "/admin/visits/create"; break;
    }
    router.push(`${path}?draftId=${draft.id}`);
  };

  const confirmDelete = (id: string) => {
    setDraftToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (draftToDelete && role) {
      await deleteDraft(role, draftToDelete);
      setDrafts(await getDrafts(role));
    }
    return Promise.resolve(true);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "4rem" }}>
      <AdminPageHeader title="My Drafts" />

      <div style={{ 
        display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center",
        backgroundColor: "transparent", padding: "1rem 0", borderBottom: "1px solid rgba(181, 189, 160, 0.4)"
      }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>Filter by Type:</div>
        <div style={{ minWidth: "150px" }}>
          <CustomDropdown 
            value={filterType}
            onChange={(val) => setFilterType(val as DraftType | "All")}
            options={[
              { label: "All Types", value: "All" },
              { label: "MOU", value: "MOU" },
              { label: "Event", value: "Event" },
              { label: "Program", value: "Program" },
              { label: "Visit", value: "Visit" }
            ]}
          />
        </div>
        <div style={{ marginLeft: "auto", fontSize: "13px", color: "#6b6b6b" }}>
          Showing {filteredDrafts.length} drafts
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <DraftSkeletonCard key={i} />
          ))}
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div style={{ 
          textAlign: "center", padding: "4rem 2rem", backgroundColor: "rgba(181, 189, 160, 0.1)", 
          borderRadius: "12px", border: "1px dashed #b5bda0" 
        }}>
          <FileText size={48} color="#b5bda0" style={{ margin: "0 auto 1rem auto" }} />
          <h3 style={{ fontSize: "18px", color: "#1a1a1a", marginBottom: "8px" }}>No drafts found</h3>
          <p style={{ color: "#6b6b6b", fontSize: "14px" }}>You don't have any saved drafts in this category.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {filteredDrafts.map(draft => (
            <div key={draft.id} style={{ 
              backgroundColor: "transparent", border: "1px solid #b5bda0", borderRadius: "8px",
              padding: "1.5rem", display: "flex", flexDirection: "column",
              position: "relative"
            }}>
              <div style={{ 
                position: "absolute", top: "1rem", right: "1rem",
                fontSize: "11px", fontWeight: 700, padding: "4px 8px",
                borderRadius: "4px", textTransform: "uppercase",
                backgroundColor: "rgba(181, 189, 160, 0.15)", color: "#5b6348"
              }}>
                {draft.type}
              </div>
              
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "8px", paddingRight: "60px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {draft.title || "Untitled Draft"}
              </h3>
              
              <div style={{ fontSize: "12px", color: "#6b6b6b", marginBottom: "1.5rem" }}>
                Saved: {new Date(draft.savedAt).toLocaleString()}
              </div>
              
              <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleContinue(draft)}
                  style={{
                    flex: 1, padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    backgroundColor: "#1a1a1a", color: "#f5f0e8", border: "none", borderRadius: "4px",
                    fontSize: "13px", fontWeight: 500, cursor: "pointer"
                  }}
                >
                  <Edit3 size={14} /> Continue
                </button>
                <button
                  onClick={() => { setDraftToView(draft); setShowViewModal(true); }}
                  style={{
                    padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "transparent", color: "#1a1a1a", border: "1px solid #b5bda0", borderRadius: "4px",
                    fontSize: "13px", cursor: "pointer"
                  }}
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => confirmDelete(draft.id)}
                  style={{
                    padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "transparent", color: "#d12027", border: "1px solid #d12027", borderRadius: "4px",
                    fontSize: "13px", cursor: "pointer"
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && draftToView && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "#f5f0e8", padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "500px",
            maxHeight: "80vh", overflowY: "auto", border: "1px solid #b5bda0"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem", borderBottom: "1px solid #b5bda0", paddingBottom: "1rem" }}>
              Draft Summary: {draftToView.type}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.keys(draftToView.data).map(key => {
                const val = draftToView.data[key];
                if (typeof val === 'string' || typeof val === 'number') {
                  return (
                    <div key={key}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase" }}>{key}</div>
                      <div style={{ fontSize: "14px", color: "#1a1a1a" }}>{val || "-"}</div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setShowViewModal(false)}
                style={{ padding: "8px 24px", backgroundColor: "#1a1a1a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Draft?"
        message="Are you sure you want to delete this draft? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        submittingLabel="Deleting..."
        successLabel="Deleted!"
      />
    </div>
  );
}

// ─── Local Component: Skeleton for Draft Card ───
function DraftSkeletonCard() {
  return (
    <div style={{ 
      backgroundColor: "transparent", border: "1px solid #b5bda0", borderRadius: "8px",
      padding: "1.5rem", display: "flex", flexDirection: "column",
      position: "relative", minHeight: "160px"
    }}>
      <div style={{ position: "absolute", top: "1rem", right: "1rem", width: "60px", height: "20px", borderRadius: "4px", overflow: "hidden" }}>
        <SkeletonPulse />
      </div>
      
      <div style={{ width: "80%", height: "20px", borderRadius: "4px", marginBottom: "8px", overflow: "hidden" }}>
        <SkeletonPulse />
      </div>
      
      <div style={{ width: "50%", height: "14px", borderRadius: "4px", marginBottom: "1.5rem", overflow: "hidden" }}>
        <SkeletonPulse />
      </div>
      
      <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
        <div style={{ flex: 1, height: "32px", borderRadius: "4px", overflow: "hidden" }}>
          <SkeletonPulse />
        </div>
        <div style={{ width: "32px", height: "32px", borderRadius: "4px", overflow: "hidden" }}>
          <SkeletonPulse />
        </div>
        <div style={{ width: "32px", height: "32px", borderRadius: "4px", overflow: "hidden" }}>
          <SkeletonPulse />
        </div>
      </div>
    </div>
  );
}
