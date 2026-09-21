"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminTable, ActionButtons, StatusBadge, FilterBar } from "@/app/admin/components";
import { usePermission } from "@/app/admin/roles/usePermission";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { AdminPageSkeleton } from "@/app/admin/optemization_component";
import { apiFetch } from "@/lib/apiFetch";

const MOU_TYPE_OPTIONS = [
  "Semester Exchange", "Global Immersion", "Inbound Immersion", 
  "Pathways Program", "Progression Arrangement", "International Internship", 
  "Inbound Semester Exchange", "Summer Program", "Winter Program", 
  "Study Tour", "Dual Degree", "Articulation", "Other"
];

interface MouItem {
  id: string;
  name: string;
  partner_university: string;
  country: string;
  type: string;
  status: string;
  duration: string;
  start_date: string;
  expiry_date: string;
  our_pocs: { name: string; designation?: string; email?: string; contact_number?: string }[];
}

export default function MOUsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [mous, setMous] = useState<MouItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const { readOnly } = usePermission("admin:mou");

  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchMous = async () => {
    try {
      setIsLoading(true);
      
      const res = await apiFetch(`/api/v1/mous`);
      if (res.ok) {
        const json = await res.json();
        setMous(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch MOUs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMous();
  }, []);

  const handleDeleteMou = async (id: string) => {
    try {
      
      const res = await apiFetch(`/api/v1/mous/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMous(prev => prev.filter(m => m.id !== id));
      } else {
        alert("Failed to delete MOU");
      }
    } catch (err) {
      console.error("Error deleting MOU:", err);
      alert("Error deleting MOU");
    } finally {
      setConfirmingId(null);
    }
  };

  const columns = [
    { key: "sNo", label: "S.No.", width: "5%" },
    { key: "partner", label: "Partner University", width: "15%" },
    { key: "country", label: "Country", width: "10%" },
    { key: "program", label: "Program", width: "10%" },
    { key: "poc", label: "Our POC", width: "15%" },
    { key: "duration", label: "Duration", width: "10%" },
    { key: "startDate", label: "MOU Signed", width: "10%" },
    { key: "expiryDate", label: "Valid Till", width: "10%" },
    { key: "statusBadge", label: "Status", width: "15%" },
  ];

  const filteredData = useMemo(() => {
    let result = [...mous];

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.name || "").toLowerCase().includes(lowerQ) || 
        (item.partner_university || "").toLowerCase().includes(lowerQ)
      );
    }

    if (programFilter) {
      result = result.filter(item => item.type === programFilter);
    }

    if (dateFilter === "signed") {
      result.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    } else if (dateFilter === "expiry") {
      result.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
    }

    return result;
  }, [mous, searchQuery, programFilter, dateFilter]);

  const data = filteredData.map((row, index) => {
    let variant: any = "active";
    const st = (row.status || "").toLowerCase();
    if (st.includes("expired")) variant = "expired";
    else if (st.includes("expiring") || st === "draft") variant = "pending";

    // Format dates nicely
    const formatD = (ds: string) => {
      if (!ds) return "-";
      return ds.split("T")[0];
    };

    return {
      ...row,
      sNo: index + 1,
      partner: row.partner_university,
      program: row.type,
      poc: row.our_pocs && row.our_pocs.length > 0 ? row.our_pocs[0].name : "-",
      startDate: formatD(row.start_date),
      expiryDate: formatD(row.expiry_date),
      statusBadge: <StatusBadge status={row.status} variant={variant} />
    };
  });

  return (
    <div style={{ width: "100%", maxWidth: "100%", transition: "width 0.3s ease" }}>
      <AdminPageHeader
        title="MOUs"
        actionLabel={readOnly ? undefined : "Create MOU"}
        onAction={readOnly ? undefined : () => router.push("/admin/mou/create")}
      />
      
      <FilterBar
        searchPlaceholder="Search MOU or Partner..."
        onSearch={setSearchQuery}
        filters={[
          {
            key: "program",
            label: "All Programs",
            options: [{ label: "All Programs", value: "" }, ...MOU_TYPE_OPTIONS.map(o => ({ label: o, value: o }))]
          },
          {
            key: "date",
            label: "Sort by Date",
            options: [
              { label: "Default Sort", value: "" },
              { label: "Signed Date (Newest)", value: "signed" },
              { label: "Valid Till (Soonest)", value: "expiry" },
            ]
          }
        ]}
        onFilterChange={(key, val) => {
          if (key === "program") setProgramFilter(val);
          if (key === "date") setDateFilter(val);
        }}
      />

      <div style={{ border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {isLoading ? (
          <AdminPageSkeleton columns={8} rows={6} showFilter={false} />
        ) : data.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>No MOUs found.</div>
        ) : (
          <AdminTable
            columns={columns}
            data={data}
            actions={(row: any) => (
              <ActionButtons
                rowId={row.id}
                confirmingDeleteId={confirmingId}
                setConfirmingDeleteId={role === 'super_admin' ? setConfirmingId : undefined}
                onConfirmDelete={role === 'super_admin' ? (id: string) => handleDeleteMou(id) : undefined}
                onCancelDelete={role === 'super_admin' ? () => setConfirmingId(null) : undefined}
                onView={() => router.push(`/admin/mou/${row.id}`)}
                onEdit={!readOnly ? () => router.push(`/admin/mou/edit/${row.id}`) : undefined}
              />
            )}
          />
        )}
      </div>
    </div>
  );
}
