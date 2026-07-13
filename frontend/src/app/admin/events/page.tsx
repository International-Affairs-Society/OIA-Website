"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminTable, ActionButtons, StatusBadge, AdminButton } from "@/app/admin/components";
import { MOCK_EVENTS_LIST } from "@/app/admin/data/mockData";
import { useAuth } from "@/app/admin/roles/AuthContext";

export default function EventsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const columns = [
    { key: "title", label: "Title", width: "25%" },
    { key: "date", label: "Date", width: "15%" },
    { key: "location", label: "Location", width: "20%" },
    { key: "mou", label: "Linked MOU", width: "20%" },
    { key: "statusBadge", label: "Archived", width: "10%" },
  ];

  const upcomingEvents = MOCK_EVENTS_LIST
    .filter((e) => e.event_type === "upcoming")
    .map((row) => ({
      ...row,
      statusBadge: <StatusBadge status={row.is_archived ? "Archived" : "Active"} variant={row.is_archived ? "archived" : "active"} />,
    }));

  const pastEvents = MOCK_EVENTS_LIST
    .filter((e) => e.event_type === "past")
    .map((row) => ({
      ...row,
      statusBadge: <StatusBadge status={row.is_archived ? "Archived" : "Active"} variant={row.is_archived ? "archived" : "active"} />,
    }));

  const renderActions = (row: any) => (
    <ActionButtons
      rowId={row.id}
      confirmingDeleteId={confirmingId}
      setConfirmingDeleteId={role === 'super_admin' ? setConfirmingId : undefined}
      onConfirmDelete={role === 'super_admin' ? (id: string) => { setConfirmingId(null); alert(`Deleted event ${id}`); } : undefined}
      onCancelDelete={role === 'super_admin' ? () => setConfirmingId(null) : undefined}
      onEdit={() => router.push(`/admin/events/edit/${row.id}`)}
      onArchive={() => alert("Toggled archive")}
      isArchived={row.is_archived}
    />
  );

  /* ── Section sub-heading style ── */
  const sectionHeadingStyle: React.CSSProperties = {
    fontFamily: "var(--font-instrument-serif)",
    fontSize: "31px", // 30% larger than 24px
    color: "#1a1a1a",
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
    borderBottom: "2px solid #7A8C5E",
    display: "inline-block",
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", transition: "width 0.3s ease" }}>
      {/* Removed the global Add Event button here */}
      <AdminPageHeader title="Events" />

      {/* ── Upcoming Events ── */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={sectionHeadingStyle}>Upcoming Events</h2>
            <span
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 10px",
                backgroundColor: "rgba(122, 140, 94, 0.12)",
                color: "#5C6B3F",
                borderRadius: "4px",
                letterSpacing: "0.05em",
                marginBottom: "1.5rem" // visually align with heading text
              }}
            >
              {upcomingEvents.length}
            </span>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <AdminButton onClick={() => router.push("/admin/events/create-upcoming")}>
              Add Upcoming Event
            </AdminButton>
          </div>
        </div>

        <div style={{ border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <AdminTable columns={columns} data={upcomingEvents} actions={renderActions} />
        </div>
      </div>

      {/* ── Past Events ── */}
      <div style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={sectionHeadingStyle}>Past Events</h2>
            <span
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "12px",
                fontWeight: 600,
                padding: "4px 10px",
                backgroundColor: "rgba(26, 26, 26, 0.06)",
                color: "#6b6b6b",
                borderRadius: "4px",
                letterSpacing: "0.05em",
                marginBottom: "1.5rem" // visually align with heading text
              }}
            >
              {pastEvents.length}
            </span>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <AdminButton onClick={() => router.push("/admin/events/create-past")}>
              Add Past Event
            </AdminButton>
          </div>
        </div>

        <div style={{ border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <AdminTable columns={columns} data={pastEvents} actions={renderActions} />
        </div>
      </div>
    </div>
  );
}
