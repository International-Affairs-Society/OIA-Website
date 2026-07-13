"use client";
import React, { useState, useEffect } from "react";
import { AdminPageHeader, AdminTable, FilterBar } from "@/app/admin/components";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
}

export default function ProgramLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeads = async (search = "") => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const queryParam = search ? `?search=${encodeURIComponent(search)}` : "";
      
      const res = await fetch(`${API_URL}/api/v1/program-leads${queryParam}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setLeads((json.data || []).map((l: any) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: l.email,
          date: l.submitted_at
        })));
      }
    } catch (err) {
      console.error("Failed to fetch program leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(searchTerm);
  }, [searchTerm]);

  const handleDownloadCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ["Name", "Phone Number", "Email Address", "Date Submitted"];
    const csvContent = [
      headers.join(","),
      ...leads.map(l => `"${l.name}","${l.phone}","${l.email}","${new Date(l.date).toLocaleString()}"`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `program_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { key: "name", label: "Full Name", width: "25%" },
    { key: "email", label: "Email Address", width: "30%" },
    { key: "phone", label: "Phone Number", width: "20%" },
    { key: "date", label: "Date Submitted", width: "25%" },
  ];

  const formattedLeads = leads.map(l => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    date: new Date(l.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }));

  return (
    <div style={{ width: "100%", maxWidth: "100%", transition: "width 0.3s ease" }}>
      <AdminPageHeader 
        title="Program Leads" 
        actionLabel="Export CSV" 
        onAction={handleDownloadCSV} 
      />

      <FilterBar
        searchPlaceholder="Search leads by name, email or phone..."
        onSearch={setSearchTerm}
      />

      <div style={{ border: "1px solid #b5bda0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>Loading program leads...</div>
        ) : formattedLeads.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>No program leads found.</div>
        ) : (
          <AdminTable columns={columns} data={formattedLeads} />
        )}
      </div>
    </div>
  );
}
