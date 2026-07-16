"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminPageHeader, FormField, FilterBar, ProgramReadOnlyForm, UpcomingEventReadOnlyForm, PastEventReadOnlyForm, MOUReadOnlyForm, ConfirmModal, VisitReadOnlyForm } from "@/app/admin/components";
import { AdminPageSkeleton } from "@/app/admin/optemization_component";
import { MOCK_REVIEWS, ReviewItem, ReviewType, ReviewComment } from "@/app/admin/data/mockReviews";

/* ── Type label helpers ── */
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

function getStatusBadge(status: string): { label: string; bg: string } {
  switch (status) {
    case "pending": return { label: "Pending Review", bg: "#E8A317" };
    case "approved": return { label: "Approved", bg: "#5C6B3F" };
    case "changes_requested": return { label: "Changes Requested", bg: "#c0392b" };
    default: return { label: status, bg: "#6b6b6b" };
  }
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ─────────────────────────────────────────────────────── */
function CommentTimeline({ comments }: { comments: ReviewComment[] }) {
  if (comments.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {comments.map((c) => (
        <div key={c.id} style={{
          padding: "16px", backgroundColor: "#FFFBF2", border: "1px solid #d4cfc4",
          borderLeft: "3px solid #5C6B3F", borderRadius: "2px",
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
/*  Main Reviews Page                                      */
/* ─────────────────────────────────────────────────────── */
function ReviewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams?.get("id") || null;
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [showRequestChangesConfirm, setShowRequestChangesConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showCancelApprovalConfirm, setShowCancelApprovalConfirm] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/api/v1/reviews`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((data.data || []).map((r: any) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          status: r.status,
          submittedAt: r.submitted_at,
          data: r.data,
          comments: Array.isArray(r.comments) ? r.comments : [],
          submittedBy: {
            name: r.submitted_by_name,
            email: r.submitted_by_email,
            role: r.submitted_by_role
          }
        })));
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const selected = selectedId ? reviews.find((r) => r.id === selectedId) : null;

  // ── Filter logic ──
  const filteredReviews = reviews
    .filter((r) => {
      if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter && typeFilter !== "all" && r.type !== typeFilter) return false;
      if (statusFilter && statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });

  // ── List View ──
  if (isLoading) {
    return (
      <div style={{ width: "100%", maxWidth: "100%" }}>
        <AdminPageSkeleton columns={5} rows={5} showFilter={true} filterCount={3} showAction={false} />
      </div>
    );
  }

  if (!selected) {
    const pending = filteredReviews.filter((r) => r.status === "pending");
    const changesRequested = filteredReviews.filter((r) => r.status === "changes_requested");
    const approved = filteredReviews.filter((r) => r.status === "approved");


    const renderRow = (r: ReviewItem, clickable: boolean = true) => (
      <div
        key={r.id}
        onClick={clickable ? () => router.push(`/admin/reviews?id=${r.id}`) : undefined}
        style={{
          padding: "16px 20px", backgroundColor: "#FFFBF2", border: "1px solid #d4cfc4",
          cursor: clickable ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={clickable ? (e) => { e.currentTarget.style.borderColor = "#7A8C5E"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; } : undefined}
        onMouseLeave={clickable ? (e) => { e.currentTarget.style.borderColor = "#d4cfc4"; e.currentTarget.style.boxShadow = "none"; } : undefined}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{
            display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", padding: "3px 8px", backgroundColor: getTypeBadgeColor(r.type),
            color: "#fff", borderRadius: "2px", flexShrink: 0,
          }}>
            {getTypeLabel(r.type)}
          </span>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{r.title}</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b6b6b" }}>
              by {r.submittedBy.name} · {formatDate(r.submittedAt)}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {r.status === "changes_requested" && r.comments.length > 0 && (
            <span style={{ fontSize: "11px", color: "#c0392b", fontWeight: 500 }}>
              {r.comments.length} comment{r.comments.length !== 1 ? "s" : ""}
            </span>
          )}
          {r.status === "approved" && (
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "3px 8px", backgroundColor: "#5C6B3F", color: "#fff", borderRadius: "2px",
            }}>
              ✓ Approved
            </span>
          )}
          {clickable && <span style={{ fontSize: "13px", color: "#7A8C5E", fontWeight: 600 }}>View →</span>}
        </div>
      </div>
    );

    const sectionHeader = (label: string, count: number) => (
      <h3 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b6b", marginBottom: "12px", marginTop: "2rem" }}>
        {label} ({count})
      </h3>
    );

    return (
      <div style={{ maxWidth: "1200px" }}>
        <AdminPageHeader title="Reviews" />

        {/* Filters */}
        <FilterBar
          searchPlaceholder="Search by title..."
          onSearch={setSearchQuery}
          filters={[
            {
              key: "type",
              label: "All Types",
              options: [
                { label: "All Types", value: "all" },
                { label: "Program", value: "program" },
                { label: "Upcoming Event", value: "upcoming_event" },
                { label: "Past Event", value: "past_event" },
                { label: "MOU", value: "mou" },
                { label: "Visit", value: "visit" },
              ],
            },
            {
              key: "status",
              label: "All Statuses",
              options: [
                { label: "All Statuses", value: "all" },
                { label: "Pending Approval", value: "pending" },
                { label: "Changes Requested", value: "changes_requested" },
                { label: "Approved", value: "approved" },
              ],
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === "type") setTypeFilter(val);
            if (key === "status") setStatusFilter(val);
          }}
          sortOptions={[
            { label: "Newest First", value: "newest" },
            { label: "Oldest First", value: "oldest" },
          ]}
          onSortChange={setSortOrder}
        />

        {/* Pending */}
        {pending.length > 0 && (
          <>
            {sectionHeader("Pending Approval", pending.length)}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pending.map((r) => renderRow(r))}
            </div>
          </>
        )}

        {/* Changes Requested */}
        {changesRequested.length > 0 && (
          <>
            {sectionHeader("Changes Requested", changesRequested.length)}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {changesRequested.map((r) => renderRow(r))}
            </div>
          </>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <>
            {sectionHeader("Approved", approved.length)}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", opacity: 0.8 }}>
              {approved.map((r) => renderRow(r))}
            </div>
          </>
        )}

        {filteredReviews.length === 0 && (
          <p style={{ fontSize: "14px", color: "#999", textAlign: "center", padding: "3rem 0" }}>No reviews match your filters.</p>
        )}
      </div>
    );
  }

  // ── Detail / Review View (Read-Only + Comment) ──
  const statusInfo = getStatusBadge(selected.status);

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* Back link */}
      <button
        onClick={() => router.push("/admin/reviews")}
        style={{
          background: "none", border: "none", cursor: "pointer", color: "#6b6b6b",
          fontSize: "14px", padding: 0, marginBottom: "1.5rem", display: "flex",
          alignItems: "center", gap: "4px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
      >
        ← Back to Reviews
      </button>

      {/* Header with type badge + status + meta */}
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
            padding: "4px 10px", backgroundColor: statusInfo.bg, color: "#fff", borderRadius: "2px",
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
          Submitted by <strong style={{ color: "#1a1a1a" }}>{selected.submittedBy.name}</strong> ({selected.submittedBy.email}) ·{" "}
          <span style={{ textTransform: "capitalize" }}>{selected.submittedBy.role}</span> · {formatDate(selected.submittedAt)}
        </p>
      </div>

      {/* Read-only content */}
      <div style={{
        border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "1.5rem",
      }}>
        {selected.type === "program" && <ProgramReadOnlyForm data={selected.data?.payload || selected.data} />}
        {selected.type === "upcoming_event" && <UpcomingEventReadOnlyForm data={selected.data?.payload || selected.data} />}
        {selected.type === "past_event" && <PastEventReadOnlyForm data={selected.data?.payload || selected.data} />}
        {selected.type === "mou" && <MOUReadOnlyForm data={selected.data?.payload || selected.data} />}
        {selected.type === "visit" && <VisitReadOnlyForm data={selected.data?.payload || selected.data} />}
      </div>

      {/* ── Comment Section ── */}
      <div style={{
        border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "1.5rem",
      }}>
        <h3 style={{
          fontSize: "18px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 20px",
          fontFamily: "var(--font-instrument-serif)", paddingBottom: "12px",
          borderBottom: "1px solid rgba(181, 189, 160, 0.5)",
        }}>
          Comments & Review Notes
        </h3>

        {/* Existing comments timeline */}
        {selected.comments.length > 0 ? (
          <div style={{ marginBottom: "24px" }}>
            <CommentTimeline comments={selected.comments} />
          </div>
        ) : (
          <div style={{
            padding: "24px", textAlign: "center", color: "#999", fontSize: "13px",
            border: "1px dashed #d4cfc4", marginBottom: "24px", backgroundColor: "#FFFBF2",
          }}>
            No comments yet. Add a comment below to request changes from the submitter.
          </div>
        )}

        {/* New comment input */}
        <div>
          <label style={{
            display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#6b6b6b", marginBottom: "8px",
          }}>
            Add a Comment
          </label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Describe what changes are needed..."
            rows={4}
            style={{
              width: "100%", padding: "12px 14px", border: "1px solid #b5bda0",
              backgroundColor: "#FFFBF2", fontSize: "14px", color: "#1a1a1a",
              outline: "none", resize: "vertical", minHeight: "100px",
              fontFamily: "inherit", lineHeight: 1.6, borderRadius: "2px",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#5C6B3F")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#b5bda0")}
          />
          <p style={{ fontSize: "11px", color: "#999", margin: "6px 0 0" }}>
            This comment will be visible to the submitter in their &quot;My Submissions&quot; panel.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginBottom: "3rem" }}>
        {selected.status === "approved" ? (
          <>
            <button
              onClick={() => router.push("/admin/reviews")}
              style={{
                padding: "12px 28px", backgroundColor: "transparent", color: "#1a1a1a",
                border: "1px solid #1a1a1a", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
              }}
            >
              Back
            </button>
            <button
              onClick={() => setShowCancelApprovalConfirm(true)}
              style={{
                padding: "12px 28px", backgroundColor: "transparent", color: "#c0392b",
                border: "1px solid #c0392b", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#c0392b"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#c0392b"; }}
            >
              Cancel Approval
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/admin/reviews")}
              style={{
                padding: "12px 28px", backgroundColor: "transparent", color: "#1a1a1a",
                border: "1px solid #1a1a1a", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!commentText.trim()) {
                  alert("Please write a comment describing what changes are needed.");
                  return;
                }
                setShowRequestChangesConfirm(true);
              }}
              style={{
                padding: "12px 28px", backgroundColor: "transparent", color: "#c0392b",
                border: "1px solid #c0392b", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#c0392b"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#c0392b"; }}
            >
              Request Changes
            </button>
            <button
              onClick={() => setShowApproveConfirm(true)}
              style={{
                padding: "12px 28px", backgroundColor: "#5C6B3F", color: "#fff",
                border: "none", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4A5832")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#5C6B3F")}
            >
              Approve
            </button>
          </>
        )}
      </div>

      {/* Request Changes Confirmation */}
      <ConfirmModal
        isOpen={showRequestChangesConfirm}
        onClose={() => setShowRequestChangesConfirm(false)}
        title="Request Changes"
        message="Send this comment to the submitter and mark the submission as needing changes?"
        confirmLabel="Yes, Request Changes"
        cancelLabel="No"
        isDestructive={true}
        onConfirm={async () => {
          try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/api/v1/reviews/${selected.id}/request-changes`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ text: commentText })
            });
            if (res.ok) {
              setCommentText("");
              fetchReviews();
              return true;
            }
            return false;
          } catch (err) {
            console.error("Failed to request changes:", err);
            return false;
          }
        }}
        onSuccess={() => {
          setShowRequestChangesConfirm(false);
          router.push("/admin/reviews");
        }}
      />

      {/* Approve Confirmation */}
      <ConfirmModal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title="Confirm Approval"
        message="Are you sure you want to approve this submission? This action will publish the content to the live website."
        confirmLabel="Yes, Approve"
        cancelLabel="Cancel"
        onConfirm={async () => {
          try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/api/v1/reviews/${selected.id}/approve`, {
              method: "PATCH",
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
              fetchReviews();
              return true;
            }
            return false;
          } catch (err) {
            console.error("Failed to approve review:", err);
            return false;
          }
        }}
        onSuccess={() => {
          setShowApproveConfirm(false);
          router.push("/admin/reviews");
        }}
      />

      {/* Cancel Approval Confirmation */}
      <ConfirmModal
        isOpen={showCancelApprovalConfirm}
        onClose={() => setShowCancelApprovalConfirm(false)}
        title="Cancel Approval"
        message="Are you sure you want to cancel the approval for this submission? It will revert to 'Pending Approval' or 'Rejected'."
        confirmLabel="Yes, Cancel Approval"
        cancelLabel="Keep Approved"
        isDestructive={true}
        onConfirm={async () => {
          try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/api/v1/reviews/${selected.id}/reject`, {
              method: "PATCH",
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
              fetchReviews();
              return true;
            }
            return false;
          } catch (err) {
            console.error("Failed to reject review:", err);
            return false;
          }
        }}
        onSuccess={() => {
          setShowCancelApprovalConfirm(false);
          router.push("/admin/reviews");
        }}
      />
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <React.Suspense fallback={<div />}>
      <ReviewsContent />
    </React.Suspense>
  );
}
