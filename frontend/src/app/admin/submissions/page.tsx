"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminPageHeader, FilterBar, ProgramReadOnlyForm, UpcomingEventReadOnlyForm, PastEventReadOnlyForm, MOUReadOnlyForm, VisitReadOnlyForm } from "@/app/admin/components";
import { AdminPageSkeleton } from "@/app/admin/optemization_component";
import { ReviewItem, ReviewType, ReviewComment, ReviewStatus } from "@/app/admin/data/mockReviews";

/* ── Helpers ── */
function getTypeLabel(type: ReviewType): string {
  switch (type) {
    case "program": return "Program";
    case "upcoming_event": return "Upcoming Event";
    case "past_event": return "Past Event";
    case "mou": return "MOU";
    case "visit": return "Visit";
    default: return type;
  }
}

function getTypeBadgeColor(type: ReviewType): string {
  switch (type) {
    case "program": return "#5C6B3F";
    case "upcoming_event": return "#2563EB";
    case "past_event": return "#7C3AED";
    case "mou": return "#D97706";
    case "visit": return "#10B981";
    default: return "#6b6b6b";
  }
}

function getStatusBadge(status: ReviewStatus): { label: string; bg: string; color: string } {
  switch (status) {
    case "pending": return { label: "Pending", bg: "rgba(232, 163, 23, 0.12)", color: "#B8860B" };
    case "approved": return { label: "Approved", bg: "rgba(92, 107, 63, 0.12)", color: "#5C6B3F" };
    case "changes_requested": return { label: "Changes Requested", bg: "rgba(192, 57, 43, 0.12)", color: "#c0392b" };
    default: return { label: status, bg: "#eee", color: "#6b6b6b" };
  }
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ── Confirmation Modal ── */
function ConfirmModal({
  isOpen, title, description, confirmText = "Yes", cancelText = "No",
  onConfirm, onCancel,
}: {
  isOpen: boolean; title: string; description: string;
  confirmText?: string; cancelText?: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)", zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#FFFBF2", border: "1px solid #b5bda0",
          padding: "2rem", width: "420px", maxWidth: "90vw",
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
        }}
      >
        <h3 style={{
          margin: "0 0 8px", fontSize: "20px", fontWeight: 700,
          fontFamily: "var(--font-instrument-serif)", color: "#1a1a1a",
        }}>
          {title}
        </h3>
        <p style={{ fontSize: "14px", color: "#6b6b6b", margin: "0 0 24px", lineHeight: 1.6 }}>
          {description}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 24px", backgroundColor: "transparent", color: "#1a1a1a",
              border: "1px solid #1a1a1a", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 24px", backgroundColor: "#5C6B3F", color: "#fff",
              border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              letterSpacing: "0.04em", textTransform: "uppercase", transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4A5832")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#5C6B3F")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Comment Timeline ── */
function CommentTimeline({ comments }: { comments: ReviewComment[] }) {
  if (comments.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {comments.map((c) => (
        <div key={c.id} style={{
          padding: "16px", backgroundColor: "#FFFBF2", border: "1px solid #d4cfc4",
          borderLeft: "3px solid #c0392b", borderRadius: "2px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#5C6B3F",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, color: "#fff",
              }}>
                {c.author.charAt(0)}
              </div>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>{c.author}</span>
                <span style={{ fontSize: "11px", color: "#6b6b6b", marginLeft: "8px", textTransform: "capitalize" }}>
                  {c.role.replace("_", " ")}
                </span>
              </div>
            </div>
            <span style={{ fontSize: "11px", color: "#999" }}>{formatDateTime(c.timestamp)}</span>
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: "#1a1a1a", lineHeight: 1.7 }}>{c.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Tab Button                                              */
/* ─────────────────────────────────────────────────────── */
function TabButton({
  label, count, active, onClick,
}: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px", fontSize: "13px", fontWeight: 600,
        letterSpacing: "0.04em", textTransform: "uppercase",
        backgroundColor: active ? "#1a1a1a" : "transparent",
        color: active ? "#f5f0e8" : "#6b6b6b",
        border: active ? "1px solid #1a1a1a" : "1px solid #d4cfc4",
        borderRadius: "8px",
        cursor: "pointer", transition: "all 0.2s",
        display: "flex", alignItems: "center", gap: "8px",
      }}
      onMouseEnter={!active ? (e) => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#1a1a1a"; } : undefined}
      onMouseLeave={!active ? (e) => { e.currentTarget.style.borderColor = "#d4cfc4"; e.currentTarget.style.color = "#6b6b6b"; } : undefined}
    >
      {label}
      <span style={{
        fontSize: "11px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px",
        backgroundColor: active ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)",
        color: active ? "#f5f0e8" : "#6b6b6b",
      }}>
        {count}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Main Submissions Content                                */
/* ─────────────────────────────────────────────────────── */
function SubmissionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams?.get("id") || null;
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/reviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (res.ok) {
          const json = await res.json();
          const mapped = (json.data || []).map((r: any) => ({
            id: r.id,
            type: r.type,
            title: r.title,
            submittedBy: r.submitted_by_name || r.submitted_by,
            submittedAt: r.submitted_at,
            status: r.status,
            data: r.data,
            comments: r.comments || []
          }));
          setReviews(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const selected = selectedId ? reviews.find((r) => r.id === selectedId) : null;

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "changes_requested" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Resubmit confirm
  const [showResubmitConfirm, setShowResubmitConfirm] = useState(false);

  // Editable data for when status === "changes_requested"
  const [editableData, setEditableData] = React.useState<Record<string, any>>({});
  
  React.useEffect(() => {
    if (selected) {
      setEditableData(selected.data);
    }
  }, [selected]);

  // Filtered data
  const filteredReviews = reviews
    .filter((r) => {
      if (activeTab !== "all" && r.status !== activeTab) return false;
      if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter && r.type !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });

  // Counts for tabs
  const allCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const changesCount = reviews.filter((r) => r.status === "changes_requested").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;

  // ── List View ──
  if (loading) {
    return (
      <div style={{ maxWidth: "900px" }}>
        <AdminPageSkeleton columns={4} rows={4} showFilter={true} filterCount={2} showAction={false} />
      </div>
    );
  }

  if (!selected) {
    return (
      <div style={{ maxWidth: "900px" }}>
        <AdminPageHeader title="My Submissions" />

        {/* Status summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div style={{
            padding: "20px", backgroundColor: "#FFFBF2", border: "1px solid #d4cfc4", borderRadius: "8px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#E8A317", fontFamily: "var(--font-instrument-serif)" }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b6b", marginTop: "4px" }}>
              Pending
            </div>
          </div>
          <div style={{
            padding: "20px", backgroundColor: "#FFFBF2", border: "1px solid #d4cfc4", borderRadius: "8px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#c0392b", fontFamily: "var(--font-instrument-serif)" }}>
              {changesCount}
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b6b", marginTop: "4px" }}>
              Changes Requested
            </div>
          </div>
          <div style={{
            padding: "20px", backgroundColor: "#FFFBF2", border: "1px solid #d4cfc4", borderRadius: "8px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#5C6B3F", fontFamily: "var(--font-instrument-serif)" }}>
              {approvedCount}
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b6b", marginTop: "4px" }}>
              Approved
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          <TabButton label="All" count={allCount} active={activeTab === "all"} onClick={() => setActiveTab("all")} />
          <TabButton label="Pending" count={pendingCount} active={activeTab === "pending"} onClick={() => setActiveTab("pending")} />
          <TabButton label="Changes Requested" count={changesCount} active={activeTab === "changes_requested"} onClick={() => setActiveTab("changes_requested")} />
          <TabButton label="Approved" count={approvedCount} active={activeTab === "approved"} onClick={() => setActiveTab("approved")} />
        </div>

        {/* Filters */}
        <FilterBar
          searchPlaceholder="Search by title..."
          onSearch={setSearchQuery}
          filters={[{
            key: "type",
            label: "All Types",
            options: [
              { label: "Program", value: "program" },
              { label: "Upcoming Event", value: "upcoming_event" },
              { label: "Past Event", value: "past_event" },
              { label: "MOU", value: "mou" },
            ],
          }]}
          onFilterChange={(_, val) => setTypeFilter(val)}
          sortOptions={[
            { label: "Newest First", value: "newest" },
            { label: "Oldest First", value: "oldest" },
          ]}
          onSortChange={setSortOrder}
        />

        {/* List */}
        {filteredReviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>📋</div>
            <p style={{ fontSize: "14px", color: "#999" }}>No submissions match your filters.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredReviews.map((r) => {
              const badge = getStatusBadge(r.status);
              return (
                <div
                  key={r.id}
                  onClick={() => router.push(`/admin/submissions?id=${r.id}`)}
                  style={{
                    padding: "16px 20px", backgroundColor: "#FFFBF2", border: "1px solid #d4cfc4",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7A8C5E"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d4cfc4"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                    <span style={{
                      display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
                      textTransform: "uppercase", padding: "3px 8px", backgroundColor: getTypeBadgeColor(r.type),
                      color: "#fff", borderRadius: "2px", flexShrink: 0,
                    }}>
                      {getTypeLabel(r.type)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{r.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b6b6b" }}>
                        Submitted {formatDate(r.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {r.status === "changes_requested" && r.comments.length > 0 && (
                      <span style={{
                        fontSize: "11px", color: "#c0392b", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: "4px",
                      }}>
                        ⚠ {r.comments.length} comment{r.comments.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "4px 10px",
                      backgroundColor: badge.bg, color: badge.color, borderRadius: "2px",
                      letterSpacing: "0.04em",
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: "13px", color: "#7A8C5E", fontWeight: 600 }}>View →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Detail View ──
  const statusInfo = getStatusBadge(selected.status);

  // Render the appropriate read-only form based on type
  const renderDataSummary = (type: ReviewType) => {
    const isEditable = selected.status === "changes_requested";
    const handleChange = (key: string, val: any) => {
      setEditableData((prev) => ({ ...prev, [key]: val }));
    };

    switch (type) {
      case "program": return <ProgramReadOnlyForm data={editableData} isEditable={isEditable} onChange={handleChange} />;
      case "upcoming_event": return <UpcomingEventReadOnlyForm data={editableData} isEditable={isEditable} onChange={handleChange} />;
      case "past_event": return <PastEventReadOnlyForm data={editableData} isEditable={isEditable} onChange={handleChange} />;
      case "mou": return <MOUReadOnlyForm data={editableData} isEditable={isEditable} onChange={handleChange} />;
      case "visit": return <VisitReadOnlyForm data={editableData} isEditable={isEditable} onChange={handleChange} />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Back link */}
      <button
        onClick={() => router.push("/admin/submissions")}
        style={{
          background: "none", border: "none", cursor: "pointer", color: "#6b6b6b",
          fontSize: "14px", padding: 0, marginBottom: "1.5rem", display: "flex",
          alignItems: "center", gap: "4px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
      >
        ← Back to My Submissions
      </button>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "4px 10px", backgroundColor: getTypeBadgeColor(selected.type), color: "#fff", borderRadius: "2px",
          }}>
            {getTypeLabel(selected.type)}
          </span>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "4px 10px",
            backgroundColor: selected.status === "changes_requested" ? "#c0392b" : selected.status === "approved" ? "#5C6B3F" : "#E8A317",
            color: "#fff", borderRadius: "2px",
          }}>
            {statusInfo.label}
          </span>
        </div>
        <h1 style={{
          fontFamily: "var(--font-instrument-serif)", fontSize: "32px", fontWeight: 400,
          color: "#1a1a1a", margin: "0 0 8px",
        }}>
          {selected.title}
        </h1>
        <p style={{ fontSize: "13px", color: "#6b6b6b", margin: 0 }}>
          Submitted on {formatDate(selected.submittedAt)}
        </p>
      </div>

      {/* Content summary */}
      <div style={{
        border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "1.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid rgba(181, 189, 160, 0.5)", paddingBottom: "8px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
            Submitted Content
          </h3>
          {selected.status === "changes_requested" && (
            <span style={{ fontSize: "13px", color: "#c0392b", fontWeight: 600, backgroundColor: "rgba(192, 57, 43, 0.1)", padding: "4px 8px", borderRadius: "4px" }}>
              Make changes directly below
            </span>
          )}
        </div>
        {renderDataSummary(selected.type)}
      </div>

      {/* Comments from Super Admin */}
      {selected.comments.length > 0 && (
        <div style={{
          border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "1.5rem",
        }}>
          <h3 style={{
            fontSize: "18px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 20px",
            fontFamily: "var(--font-instrument-serif)", paddingBottom: "12px",
            borderBottom: "1px solid rgba(181, 189, 160, 0.5)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span style={{ color: "#c0392b" }}>⚠</span> Changes Requested by Super Admin
          </h3>
          <CommentTimeline comments={selected.comments} />
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginBottom: "3rem" }}>
        <button
          onClick={() => router.push("/admin/submissions")}
          style={{
            padding: "12px 28px", backgroundColor: "transparent", color: "#1a1a1a",
            border: "1px solid #1a1a1a", fontSize: "14px", fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
          }}
        >
          Back
        </button>
        {selected.status === "changes_requested" && (
          <button
            onClick={() => setShowResubmitConfirm(true)}
            style={{
              padding: "12px 28px", backgroundColor: "#5C6B3F", color: "#fff",
              border: "none", fontSize: "14px", fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4A5832")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#5C6B3F")}
          >
            Resubmit for Approval
          </button>
        )}
        {selected.status === "approved" && (
          <span style={{
            padding: "12px 28px", fontSize: "14px", fontWeight: 600,
            color: "#5C6B3F", letterSpacing: "0.04em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            ✓ Published
          </span>
        )}
      </div>

      {/* Resubmit Confirmation */}
      <ConfirmModal
        isOpen={showResubmitConfirm}
        title="Resubmit for Approval"
        description="Send this updated submission back to the Super Admin for review? Make sure you've addressed all the requested changes."
        confirmText="Yes, Resubmit"
        cancelText="No"
        onConfirm={() => {
          setReviews(reviews.map((r) =>
            r.id === selected.id ? { ...r, status: "pending" as const, data: editableData } : r
          ));
          setShowResubmitConfirm(false);
          router.push("/admin/submissions");
        }}
        onCancel={() => setShowResubmitConfirm(false)}
      />
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <React.Suspense fallback={<div />}>
      <SubmissionsContent />
    </React.Suspense>
  );
}
