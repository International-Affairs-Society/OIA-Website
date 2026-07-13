"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminTable, ActionButtons, StatusBadge } from "@/app/admin/components";
import { useAuth } from "@/app/admin/roles/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProgramsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/api/v1/programs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setPrograms((data.data || []).map((p: any) => ({
            id: p.id,
            name: p.title || p.name,
            duration: p.duration || "N/A",
            partner: p.partner_university || "N/A",
            mou: p.mou_id || "None",
            is_archived: p.is_archived || false,
          })));
        }
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const columns = [
    { key: "name", label: "Name", width: "25%" },
    { key: "duration", label: "Duration", width: "15%" },
    { key: "partner", label: "Partner University", width: "25%" },
    { key: "mou", label: "Linked MOU", width: "15%" },
    { key: "statusBadge", label: "Archived", width: "10%" },
  ];

  const data = programs.map(row => ({
    ...row,
    statusBadge: <StatusBadge status={row.is_archived ? "Archived" : "Active"} variant={row.is_archived ? "archived" : "active"} />
  }));

  return (
    <div style={{ width: "100%", maxWidth: "100%", transition: "width 0.3s ease" }}>
      <AdminPageHeader title="Programs" actionLabel="Add Program" onAction={() => router.push("/admin/programs/create")} />
      
      <div style={{ border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>Loading programs...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>No programs found.</div>
        ) : (
          <AdminTable
            columns={columns}
            data={data}
            actions={(row: any) => (
              <ActionButtons
                rowId={row.id}
                confirmingDeleteId={confirmingId}
                setConfirmingDeleteId={role === 'super_admin' ? setConfirmingId : undefined}
                onConfirmDelete={role === 'super_admin' ? (id: string) => { setConfirmingId(null); alert(`Deleted program ${id}`); } : undefined}
                onCancelDelete={role === 'super_admin' ? () => setConfirmingId(null) : undefined}
                onEdit={() => router.push(`/admin/programs/edit/${row.id}`)}
                onArchive={() => alert("Toggled archive")}
                isArchived={row.is_archived}
              />
            )}
          />
        )}
      </div>
    </div>
  );
}
