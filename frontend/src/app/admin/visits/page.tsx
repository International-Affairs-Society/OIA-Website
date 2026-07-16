"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminTable } from "../components";
import ActionButtons from "../components/ActionButtons";
import { AdminPageSkeleton } from "@/app/admin/optemization_component";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { Plus, ClipboardCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VisitsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const canEdit = role === "admin" || role === "super_admin" || role === "editor";
  const canDelete = role === "super_admin";

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/api/v1/visits`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setVisits(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch visits:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisits();
  }, []);

  const columns = [
    { key: "sno", label: "S.No", width: "10%" },
    { key: "university", label: "University", width: "25%" },
    { key: "delegation", label: "Delegation (Primary)", width: "25%" },
    { key: "ourPOC", label: "Our POC", width: "20%" },
    { key: "date", label: "Date", width: "10%" },
  ];

  const handleDeleteVisit = async (id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/api/v1/visits/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setVisits(visits.filter(v => v.id !== id));
      } else {
        const errJson = await res.json();
        alert(`Failed to delete visit: ${errJson.error?.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to delete visit:", err);
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredVisits = visits.filter(v => {
    return (v.university || "").toLowerCase().includes(searchTerm.toLowerCase());
  }).map((visit, index) => ({
    id: visit.id,
    sno: index + 1,
    university: visit.university,
    delegation: visit.delegations && visit.delegations.length > 0 ? (
      <div>
        <div style={{ fontWeight: 600 }}>{visit.delegations[0].name}</div>
        <div style={{ fontSize: "11px", color: "#6b6b6b" }}>{visit.delegations[0].designation}</div>
      </div>
    ) : "N/A",
    ourPOC: visit.ourPOCs && visit.ourPOCs.length > 0 ? (
      <div>
        <div style={{ fontWeight: 600 }}>{visit.ourPOCs[0].name}</div>
        <div style={{ fontSize: "11px", color: "#6b6b6b" }}>{visit.ourPOCs[0].designation}</div>
      </div>
    ) : "N/A",
    date: visit.date ? new Date(visit.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"
  }));

  const renderActions = (row: any) => (
    <ActionButtons
      rowId={row.id}
      confirmingDeleteId={confirmingId}
      setConfirmingDeleteId={canDelete ? setConfirmingId : undefined}
      onConfirmDelete={canDelete ? (id) => handleDeleteVisit(id) : undefined}
      onCancelDelete={canDelete ? () => setConfirmingId(null) : undefined}
      onView={() => router.push(`/admin/visits/${row.id}`)}
      onEdit={canEdit ? () => router.push(`/admin/visits/edit/${row.id}`) : undefined}
    />
  );

  return (
    <div>
      <AdminPageHeader 
        title="Visits & Delegations" 
        actionLabel={canEdit ? "Record Visit" : undefined}
        onAction={canEdit ? () => router.push("/admin/visits/create") : undefined}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "300px" }}>
          <input
            type="text"
            placeholder="Search university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 16px", borderRadius: "8px", border: "1px solid #b5bda0",
              backgroundColor: "#fff", fontSize: "14px", flex: 1, maxWidth: "300px", outline: "none"
            }}
          />
        </div>
      </div>

      <div style={{ border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden" }}>
        {isLoading ? (
          <AdminPageSkeleton columns={4} rows={5} showFilter={false} />
        ) : filteredVisits.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>No visits found.</div>
        ) : (
          <AdminTable columns={columns} data={filteredVisits} actions={renderActions} />
        )}
      </div>
    </div>
  );
}
