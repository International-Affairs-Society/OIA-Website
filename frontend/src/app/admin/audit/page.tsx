"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/app/admin/components";
import CustomDropdown from "@/app/admin/components/CustomDropdown";
import { AdminPageSkeleton } from "@/app/admin/optemization_component";
import { MOCK_AUDIT_LOGS, AuditAction } from "../data/mockAudit";

const ROLE_OPTIONS = [
  { label: "Super Admin", value: "Super Admin" },
  { label: "Admin", value: "Admin" },
  { label: "Editor", value: "Editor" },
];

export default function AuditTrailPage() {
  const router = useRouter();

  // Filters
  const [searchName, setSearchName] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (searchName.trim()) queryParams.append("search", searchName.trim());
        if (roleFilter) queryParams.append("role", roleFilter); // Note: backend doesn't seem to natively support role filtering, but we can pass it if we add it, or filter on frontend
        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/audit?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (res.ok) {
          const json = await res.json();
          const mapped = (json.data || []).map((log: any) => ({
            id: log.id,
            itemId: log.item_id,
            action: log.action,
            itemType: log.item_type,
            itemTitle: log.item_title,
            details: log.details || "No additional details provided.",
            timestamp: log.timestamp,
            performedBy: {
              name: log.performed_by_name,
              role: log.performed_by_role
            }
          }));
          
          // Role filtering since it's not supported in the backend route explicitly
          let filtered = mapped;
          if (roleFilter) {
            filtered = filtered.filter((l: any) => l.performedBy.role === roleFilter);
          }
          setLogs(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [searchName, roleFilter, startDate, endDate]);

  const filteredLogs = logs;

  const getActionColor = (action: string) => {
    const normalized = action ? action.toUpperCase().replace(/ /g, "_") : "";
    switch (normalized) {
      case "APPROVED": return { bg: "#edf5e1", text: "#5C6B3F" };
      case "REQUESTED_CHANGES": return { bg: "#fce8e6", text: "#c0392b" };
      case "CHANGES_REQUESTED": return { bg: "#fce8e6", text: "#c0392b" };
      case "REJECTED": return { bg: "#fce8e6", text: "#c0392b" };
      case "SUBMITTED": return { bg: "#e6f2ff", text: "#0066cc" };
      case "ARCHIVED": return { bg: "#f0f0f0", text: "#666666" };
      case "UNARCHIVED": return { bg: "#f0f0f0", text: "#666666" };
      case "CREATED": return { bg: "#edf5e1", text: "#5C6B3F" }; // Green
      case "UPDATED": return { bg: "#fff3cd", text: "#856404" }; // Yellow/Orange
      case "DELETED": return { bg: "#fce8e6", text: "#c0392b" }; // Red
      default: return { bg: "#FFFBF2", text: "#1a1a1a" };
    }
  };

  const clearFilters = () => {
    setSearchName("");
    setRoleFilter("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      <AdminPageHeader title="Audit Trail" />

      {/* Filters Area */}
      <div style={{
        display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap",
        backgroundColor: "#FFFBF2", padding: "20px", borderRadius: "12px",
        border: "1px solid #b5bda0", marginBottom: "24px"
      }}>
        {/* Name Search */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Search by Name
          </label>
          <div style={{
            display: "flex", alignItems: "center", padding: "10px 14px", border: "1px solid #b5bda0",
            borderRadius: "8px", backgroundColor: "transparent", transition: "border-color 0.2s"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="E.g. Alice SuperAdmin"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "14px", color: "#1a1a1a", width: "100%", backgroundColor: "transparent" }}
            />
          </div>
        </div>

        {/* Role Filter */}
        <div style={{ minWidth: "160px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Role
          </label>
          <CustomDropdown
            placeholder="All Roles"
            value={roleFilter}
            options={ROLE_OPTIONS}
            onChange={setRoleFilter}
          />
        </div>

        {/* Custom Date Picker (From - To) */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: "9px 12px", border: "1px solid #b5bda0", borderRadius: "8px",
                backgroundColor: "transparent", fontSize: "14px", color: "#1a1a1a", outline: "none",
                fontFamily: "var(--font-outfit)"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b6b6b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: "9px 12px", border: "1px solid #b5bda0", borderRadius: "8px",
                backgroundColor: "transparent", fontSize: "14px", color: "#1a1a1a", outline: "none",
                fontFamily: "var(--font-outfit)"
              }}
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchName || roleFilter || startDate || endDate) && (
          <button
            onClick={clearFilters}
            style={{
              padding: "10px 16px", backgroundColor: "transparent", color: "#e63946",
              border: "1px solid #e63946", borderRadius: "8px", fontWeight: 600,
              cursor: "pointer", fontSize: "13px", height: "42px", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e63946"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#e63946"; }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Logs List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          <AdminPageSkeleton />
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFBF2", borderRadius: "12px", border: "1px dashed #b5bda0", color: "#6b6b6b", fontSize: "15px" }}>
            No audit logs found matching your filters.
          </div>
        ) : (
          filteredLogs.map(log => {
            const colors = getActionColor(log.action);
            return (
              <div
                key={log.id}
                onClick={() => router.push(`/admin/reviews?id=${log.itemId}`)}
                style={{
                  display: "flex", backgroundColor: "#fbfaf7", border: "1px solid #d4cfc4",
                  borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "#b5bda0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#d4cfc4";
                }}
              >
                {/* Left Action Indicator */}
                <div style={{ width: "8px", backgroundColor: colors.text }} />

                {/* Content */}
                <div className="audit-card-content" style={{ padding: "20px", display: "flex", flex: 1, gap: "24px", alignItems: "flex-start" }}>
                  {/* Left Col: User & Role */}
                  <div style={{ width: "200px", flexShrink: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "15px", color: "#1a1a1a", marginBottom: "4px" }}>
                      {log.performedBy.name}
                    </div>
                    <span style={{
                      display: "inline-block", padding: "4px 8px", backgroundColor: "#f0ebe1",
                      color: "#6b6b6b", borderRadius: "4px", fontSize: "11px", fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.04em"
                    }}>
                      {log.performedBy.role}
                    </span>
                  </div>

                  {/* Middle Col: Action & Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <span style={{
                        padding: "4px 10px", backgroundColor: colors.bg, color: colors.text,
                        borderRadius: "16px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.04em"
                      }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: 500 }}>
                        {log.itemTitle} <span style={{ color: "#999", fontWeight: 400 }}>({log.itemType})</span>
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#6b6b6b", lineHeight: 1.5 }}>
                      {log.details}
                    </p>
                  </div>

                  {/* Right Col: Timestamp */}
                  <div style={{ textAlign: "right", color: "#6b6b6b", fontSize: "13px", width: "150px" }}>
                    <div>{new Date(log.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#999" }}>
                      {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
