"use client";
import React, { useState, useEffect } from "react";
import { AdminPageHeader, FilterBar } from "@/app/admin/components";
import { ProgramReadOnlyForm, UpcomingEventReadOnlyForm, PastEventReadOnlyForm, MOUReadOnlyForm } from "@/app/admin/components/ReadOnlyForms";
import { MOCK_EVENTS_LIST, MOCK_PROGRAMS_LIST, MOCK_MOUS_LIST } from "@/app/admin/data/mockData";
import { RotateCcw, Trash2, Eye, X } from "lucide-react";

type ArchiveItemType = "Event" | "Program" | "MOU";

interface ArchiveItem {
  id: string;
  originalId: string;
  title: string;
  type: ArchiveItemType;
  dateOrDuration: string;
  data: any;
}

export default function ArchivedPage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"unarchive" | "delete" | null>(null);
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);

  // View Modal States
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [itemToView, setItemToView] = useState<ArchiveItem | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  const fetchArchivedItems = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [resEvents, resPrograms, resMous] = await Promise.all([
        fetch(`${API_URL}/api/v1/events?is_archived=true`, { headers }),
        fetch(`${API_URL}/api/v1/programs?is_archived=true`, { headers }),
        fetch(`${API_URL}/api/v1/mous?is_archived=true`, { headers })
      ]);

      const eventsData = resEvents.ok ? await resEvents.json() : { data: [] };
      const programsData = resPrograms.ok ? await resPrograms.json() : { data: [] };
      const mousData = resMous.ok ? await resMous.json() : { data: [] };

      const events: ArchiveItem[] = (eventsData.data || []).map((e: any) => ({
        id: `event-${e.id}`,
        originalId: e.id,
        title: e.title,
        type: "Event",
        dateOrDuration: e.date,
        data: e,
      }));

      const programs: ArchiveItem[] = (programsData.data || []).map((p: any) => ({
        id: `program-${p.id}`,
        originalId: p.id,
        title: p.name,
        type: "Program",
        dateOrDuration: p.duration,
        data: p,
      }));

      const mous: ArchiveItem[] = (mousData.data || []).map((m: any) => ({
        id: `mou-${m.id}`,
        originalId: m.id,
        title: m.name,
        type: "MOU",
        dateOrDuration: `${m.start_date ? m.start_date.split('T')[0] : ''} to ${m.expiry_date ? m.expiry_date.split('T')[0] : ''}`,
        data: m,
      }));

      setItems([...events, ...programs, ...mous]);
    } catch (err) {
      console.error("Failed to fetch archived items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedItems();
  }, []);

  const handleActionClick = (item: ArchiveItem, action: "unarchive" | "delete") => {
    setSelectedItem(item);
    setModalAction(action);
    setConfirmModalOpen(true);
  };

  const handleViewClick = (item: ArchiveItem) => {
    setItemToView(item);
    setViewModalOpen(true);
  };

  const executeAction = async () => {
    if (!selectedItem || !modalAction) return;

    try {
      const token = localStorage.getItem("access_token");
      const headers = { 
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}) 
      };

      let endpoint = "";
      if (selectedItem.type === "Event") endpoint = `/api/v1/events/${selectedItem.originalId}`;
      else if (selectedItem.type === "Program") endpoint = `/api/v1/programs/${selectedItem.originalId}`;
      else if (selectedItem.type === "MOU") endpoint = `/api/v1/mous/${selectedItem.originalId}`;

      if (modalAction === "unarchive") {
        await fetch(`${API_URL}${endpoint}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ is_archived: false, isArchived: false })
        });
      } else if (modalAction === "delete") {
        await fetch(`${API_URL}${endpoint}`, {
          method: "DELETE",
          headers
        });
      }

      fetchArchivedItems();
    } catch (err) {
      console.error(`Failed to ${modalAction} item:`, err);
    }
    
    // Close modal
    setConfirmModalOpen(false);
    setSelectedItem(null);
    setModalAction(null);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setSelectedItem(null);
    setModalAction(null);
  };

  const filteredItems = items.filter(i => {
    if (filterType === "All") return true;
    if (filterType === "Events" && i.type === "Event") return true;
    if (filterType === "Programs" && i.type === "Program") return true;
    if (filterType === "MOUs" && i.type === "MOU") return true;
    return false;
  });

  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      <AdminPageHeader
        title="Archived Items"
        subtitle="Manage deleted or archived Events, Programs, and MOUs. Only Super Admins can access this section."
      />

      <div style={{ marginTop: "24px" }}>
        <FilterBar
          filters={[
            {
              key: "type",
              label: "Filter by Type",
              options: [
                { label: "All", value: "All" },
                { label: "Events", value: "Events" },
                { label: "Programs", value: "Programs" },
                { label: "MOUs", value: "MOUs" }
              ]
            }
          ]}
          onFilterChange={(_key, val) => setFilterType(val)}
        />
      </div>

      <div style={{
        marginTop: "24px",
        backgroundColor: "transparent",
        borderRadius: "8px",
        border: "1px solid #b5bda0",
        overflowX: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#faf8f5", borderBottom: "1px solid #b5bda0" }}>
              <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-outfit)" }}>Name / Title</th>
              <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-outfit)" }}>Type</th>
              <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-outfit)" }}>Date / Duration</th>
              <th style={{ padding: "16px", textAlign: "right", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-outfit)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skeleton-${i}`} style={{ borderBottom: "1px solid #eaeded" }}>
                  <td style={{ padding: "16px" }}><div className="animate-pulse bg-gray-200 rounded h-5 w-3/4"></div></td>
                  <td style={{ padding: "16px" }}><div className="animate-pulse bg-gray-200 rounded h-6 w-20"></div></td>
                  <td style={{ padding: "16px" }}><div className="animate-pulse bg-gray-200 rounded h-5 w-1/2"></div></td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>
                      <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>
                      <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#6b6b6b", fontSize: "14px", fontFamily: "var(--font-outfit)" }}>
                  No archived items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eaeded", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#faf8f5"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#1a1a1a", fontWeight: 500, fontFamily: "var(--font-outfit)" }}>{item.title}</td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#6b6b6b", fontFamily: "var(--font-outfit)" }}>
                    <span style={{ 
                      backgroundColor: item.type === "Event" ? "rgba(37, 99, 235, 0.1)" : item.type === "Program" ? "rgba(92, 107, 63, 0.1)" : "rgba(217, 119, 6, 0.1)",
                      color: item.type === "Event" ? "#2563EB" : item.type === "Program" ? "#5C6B3F" : "#D97706",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600
                    }}>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#393939", fontFamily: "var(--font-outfit)" }}>{item.dateOrDuration}</td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button 
                        onClick={() => handleViewClick(item)}
                        title="View Details"
                        style={{ background: "rgba(107, 107, 107, 0.1)", color: "#1a1a1a", border: "1px solid #6b6b6b", borderRadius: "4px", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}
                      >
                        <Eye size={14} /> View Details
                      </button>
                      <button 
                        onClick={() => handleActionClick(item, "unarchive")}
                        title="Unarchive"
                        style={{ background: "rgba(92, 107, 63, 0.1)", color: "#5C6B3F", border: "1px solid #5C6B3F", borderRadius: "4px", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}
                      >
                        <RotateCcw size={14} /> Unarchive
                      </button>
                      <button 
                        onClick={() => handleActionClick(item, "delete")}
                        title="Permanently Delete"
                        style={{ background: "rgba(192, 57, 43, 0.1)", color: "#c0392b", border: "1px solid #c0392b", borderRadius: "4px", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && selectedItem && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", justifyContent: "center", alignItems: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#FFFBF2", borderRadius: "8px", width: "100%", maxWidth: "400px",
            padding: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#1a1a1a", fontFamily: "var(--font-outfit)" }}>
              {modalAction === "unarchive" ? "Confirm Unarchive" : "Confirm Deletion"}
            </h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#6b6b6b", fontFamily: "var(--font-outfit)" }}>
              {modalAction === "unarchive" 
                ? `Are you sure you want to unarchive "${selectedItem.title}"? It will become visible again in its respective section.`
                : `Are you sure you want to permanently delete "${selectedItem.title}"? This action cannot be undone.`}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={closeConfirmModal}
                style={{
                  padding: "8px 24px", backgroundColor: "transparent", color: "#1a1a1a", border: "1px solid #1a1a1a",
                  borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "14px", fontFamily: "var(--font-outfit)"
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                style={{
                  padding: "8px 24px", 
                  backgroundColor: modalAction === "unarchive" ? "#5C6B3F" : "#c0392b", 
                  color: "#fff", border: "none",
                  borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "14px", fontFamily: "var(--font-outfit)"
                }}
              >
                {modalAction === "unarchive" ? "Yes, Unarchive" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && itemToView && (
        <div 
          data-lenis-prevent="true"
          style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", justifyContent: "center", alignItems: "flex-start",
          padding: "40px 20px", overflowY: "auto"
        }}>
          <div style={{
            backgroundColor: "#f5f0e8", borderRadius: "8px", width: "100%", maxWidth: "1120px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)", position: "relative",
            display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #b5bda0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#faf8f5", borderRadius: "8px 8px 0 0" }}>
              <h2 style={{ margin: 0, fontSize: "20px", color: "#1a1a1a", fontFamily: "var(--font-instrument-serif)" }}>
                {itemToView.title} Details
              </h2>
              <button 
                onClick={() => setViewModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6b6b" }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
              {itemToView.type === "Event" && itemToView.data.event_type === "past" && <PastEventReadOnlyForm data={itemToView.data} />}
              {itemToView.type === "Event" && itemToView.data.event_type !== "past" && <UpcomingEventReadOnlyForm data={itemToView.data} />}
              {itemToView.type === "Program" && <ProgramReadOnlyForm data={itemToView.data} />}
              {itemToView.type === "MOU" && <MOUReadOnlyForm data={itemToView.data} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
