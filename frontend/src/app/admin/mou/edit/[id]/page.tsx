"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown } from "../../../components";

const MOU_TYPE_OPTIONS = [
  { value: "Semester Exchange", label: "Semester Exchange" },
  { value: "Global Immersion", label: "Global Immersion" },
  { value: "Inbound Immersion", label: "Inbound Immersion" },
  { value: "Pathways Program", label: "Pathways Program" },
  { value: "Progression Arrangement", label: "Progression Arrangement" },
  { value: "International Internship", label: "International Internship" },
  { value: "Inbound Semester Exchange", label: "Inbound Semester Exchange" },
  { value: "Summer Program", label: "Summer Program" },
  { value: "Winter Program", label: "Winter Program" },
  { value: "Study Tour", label: "Study Tour" },
  { value: "Dual Degree", label: "Dual Degree" },
  { value: "Articulation", label: "Articulation" },
  { value: "Other", label: "Other" }
];

const MOU_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Draft", label: "Draft" },
  { value: "Expired", label: "Expired" },
  { value: "Dormant", label: "Dormant" },
  { value: "Expiring in 30 days", label: "Expiring in 30 days" },
  { value: "Expiring in 90 days", label: "Expiring in 90 days" },
  { value: "Expiring in 120 days", label: "Expiring in 120 days" }
];

export default function EditMOUPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [partnerUniversity, setPartnerUniversity] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("Semester Exchange");
  const [status, setStatus] = useState("Active");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchMou = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("access_token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        const res = await fetch(`${API_URL}/api/v1/mous/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setPartnerUniversity(data.partner_university || "");
          setCountry(data.country || "");
          setType(data.type || "Semester Exchange");
          setStatus(data.status || "Active");
          setStartDate(data.start_date ? data.start_date.split("T")[0] : "");
          setExpiryDate(data.expiry_date ? data.expiry_date.split("T")[0] : "");
          setNotes(data.notes || "");
        } else {
          alert("MOU not found.");
          router.push("/admin/mou");
        }
      } catch (err) {
        console.error("Error fetching MOU:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMou();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !partnerUniversity || !country) {
      return alert("Please fill in all required fields.");
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const res = await fetch(`${API_URL}/api/v1/mous/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name,
          partner_university: partnerUniversity,
          country,
          type,
          status,
          start_date: startDate,
          expiry_date: expiryDate,
          notes
        })
      });

      if (res.ok) {
        alert("MOU updated successfully!");
        router.push("/admin/mou");
      } else {
        const errorData = await res.json();
        alert(errorData.error?.message || "Failed to update MOU");
      }
    } catch (err) {
      console.error("Error updating MOU:", err);
      alert("Error updating MOU");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ width: "100%", padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#6b6b6b" }}>Loading MOU Details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/mou" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to MOUs
        </Link>
      </div>

      <AdminPageHeader title={`Edit MOU`} />

      <div style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={handleSubmit}>
          <FormField label="MOU Name" required>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }}
            />
          </FormField>
          <FormField label="Partner University" required>
            <input 
              type="text" 
              value={partnerUniversity} 
              onChange={(e) => setPartnerUniversity(e.target.value)} 
              style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }}
            />
          </FormField>
          <FormField label="Country" required>
            <input 
              type="text" 
              value={country} 
              onChange={(e) => setCountry(e.target.value)} 
              style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }}
            />
          </FormField>
          <FormField label="Program Type" required>
            <CustomDropdown
              value={type}
              onChange={setType}
              options={MOU_TYPE_OPTIONS}
            />
          </FormField>
          <FormField label="Status">
            <CustomDropdown
              value={status}
              onChange={setStatus}
              options={MOU_STATUS_OPTIONS}
            />
          </FormField>
          <FormField label="Start Date" required>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }}
            />
          </FormField>
          <FormField label="Expiry Date" required>
            <input 
              type="date" 
              value={expiryDate} 
              onChange={(e) => setExpiryDate(e.target.value)} 
              style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }}
            />
          </FormField>
          <FormField label="Notes">
            <textarea 
              rows={4} 
              placeholder="Notes..." 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #b5bda0", borderRadius: "4px" }}
            />
          </FormField>

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: "10px 24px",
                backgroundColor: "#1a1a1a",
                color: "#f5f0e8",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
                opacity: isSaving ? 0.6 : 1
              }}
            >
              {isSaving ? "Updating..." : "Update MOU"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/mou")}
              style={{
                padding: "10px 24px",
                backgroundColor: "transparent",
                color: "#1a1a1a",
                border: "1px solid #1a1a1a",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
