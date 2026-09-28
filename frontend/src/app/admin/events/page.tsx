"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminTable, ActionButtons, StatusBadge, AdminButton } from "@/app/admin/components";
import { AdminPageSkeleton } from "@/app/admin/optemization_component";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { apiFetch } from "@/lib/apiFetch";

export default function EventsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const columns = [
    { key: "title", label: "Title", width: "25%" },
    { key: "date", label: "Date", width: "15%" },
    { key: "location", label: "Location", width: "20%" },
    { key: "mou", label: "Linked MOU", width: "20%" },
    { key: "statusBadge", label: "Archived", width: "10%" },
  ];

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`/api/v1/events`);
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/v1/events/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents(events.filter((e) => e.id !== id));
      } else {
        const errorJson = await res.json();
        alert(`Failed to delete event: ${errorJson.error?.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleToggleArchive = async (row: any) => {
    try {
      // Zod schema validates body.isArchived (camelCase)
      const res = await apiFetch(`/api/v1/events/${row.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isArchived: !row.is_archived }),
      });
      if (res.ok) {
        setEvents(events.map((e) => e.id === row.id ? { ...e, is_archived: !e.is_archived } : e));
      } else {
        const errorJson = await res.json();
        alert(`Failed to update event: ${errorJson.error?.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to archive/unarchive event:", err);
    }
  };

  const upcomingEvents = events
    .filter((e) => e.event_type === "upcoming")
    .map((row) => ({
      ...row,
      mou: row.mou?.name || "None",
      statusBadge: <StatusBadge status={row.is_archived ? "Archived" : "Active"} variant={row.is_archived ? "archived" : "active"} />,
    }));

  const pastEvents = events
    .filter((e) => e.event_type === "past")
    .map((row) => ({
      ...row,
      mou: row.mou?.name || "None",
      statusBadge: <StatusBadge status={row.is_archived ? "Archived" : "Active"} variant={row.is_archived ? "archived" : "active"} />,
    }));

  const renderActions = (row: any) => (
    <ActionButtons
      rowId={row.id}
      confirmingDeleteId={confirmingId}
      setConfirmingDeleteId={role === 'super_admin' ? setConfirmingId : undefined}
      onConfirmDelete={role === 'super_admin' ? () => handleDelete(row.id) : undefined}
      onCancelDelete={role === 'super_admin' ? () => setConfirmingId(null) : undefined}
      onEdit={() => router.push(`/admin/events/edit/${row.id}`)}
      onArchive={() => handleToggleArchive(row)}
      isArchived={row.is_archived}
    />
  );

  const sectionHeadingStyle: React.CSSProperties = {
    fontFamily: "var(--font-instrument-serif)",
    fontSize: "31px",
    color: "#1a1a1a",
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
    borderBottom: "2px solid #7A8C5E",
    display: "inline-block",
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", transition: "width 0.3s ease" }}>
      <AdminPageHeader title="Events" />

      {isLoading ? (
        <AdminPageSkeleton columns={5} rows={4} showFilter={false} showAction={false} />
      ) : (
        <>
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
                    marginBottom: "1.5rem"
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
              {upcomingEvents.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>No upcoming events found.</div>
              ) : (
                <AdminTable columns={columns} data={upcomingEvents} actions={renderActions} />
              )}
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
                    marginBottom: "1.5rem"
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
              {pastEvents.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>No past events found.</div>
              ) : (
                <AdminTable columns={columns} data={pastEvents} actions={renderActions} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
