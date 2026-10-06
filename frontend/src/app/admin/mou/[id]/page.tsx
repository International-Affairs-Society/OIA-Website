"use client";
import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminPageHeader, StatusBadge } from "@/app/admin/components";
import { AdminFormSkeleton } from "@/app/admin/optemization_component";
import { apiFetch } from "@/lib/apiFetch";

export default function ViewMOUPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [mou, setMou] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMou = async () => {
      try {
        const res = await apiFetch(`/api/v1/mous/${id}`);
        if (res.ok) {
          const data = await res.json();
          // Map to match the expected format for the page
          const mapped = {
            id: data.id,
            name: data.name,
            partner: data.partner_university || data.name,
            type: data.type,
            status: data.status,
            startDate: new Date(data.start_date).toISOString().split('T')[0],
            expiryDate: new Date(data.expiry_date).toISOString().split('T')[0],
            applicableSemesters: data.applicable_semesters || [],
            partnerPOC: data.partner_pocs && data.partner_pocs.length > 0 ? {
              name: data.partner_pocs[0].name,
              designation: data.partner_pocs[0].designation,
              email: data.partner_pocs[0].email,
              contactNumber: data.partner_pocs[0].contact_number,
            } : null,
            ourPOCs: (data.our_pocs || []).map((p: any) => ({
              name: p.name,
              designation: p.designation,
              email: p.email,
              contactNumber: p.contact_number,
            })),
            attachedDocuments: (data.documents || []).map((d: any) => ({
              name: d.name,
              url: d.url
            }))
          };
          setMou(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch MOU:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMou();
  }, [id]);

  if (loading) {
    return (
      <div style={{ width: "100%", padding: "40px" }}>
        <AdminFormSkeleton fields={8} />
      </div>
    );
  }

  if (!mou) {
    return (
      <div style={{ width: "100%", padding: "40px", textAlign: "center" }}>
        <AdminPageHeader title="MOU Not Found" onBack={() => router.push("/admin/mou")} />
        <p style={{ color: "#6b6b6b" }}>The requested MOU could not be found.</p>
      </div>
    );
  }

  const sectionStyle = {
    backgroundColor: "#FFFBF2",
    border: "1px solid #b5bda0",
    borderRadius: "12px",
    padding: "32px",
    marginBottom: "32px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
  };

  const sectionTitleStyle = {
    margin: "0 0 24px 0",
    fontSize: "20px",
    fontWeight: 600,
    color: "#1a1a1a",
    fontFamily: "var(--font-instrument-serif)",
    borderBottom: "1px solid #eaeaea",
    paddingBottom: "12px"
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column" as const,
    marginBottom: "20px"
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "#6b6b6b",
    marginBottom: "8px"
  };

  const valueStyle = {
    fontSize: "15px",
    color: "#1a1a1a",
    fontWeight: 500,
    backgroundColor: "#f9f7f1",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #eaeaea",
    wordBreak: "break-word" as const
  };

  return (
    <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", animation: "fadeIn 0.3s ease" }}>
      <AdminPageHeader 
        title={`View MOU: ${mou.name}`} 
        onBack={() => router.push("/admin/mou")} 
      />

      {/* General Details */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>General Details</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={fieldStyle}>
            <span style={labelStyle}>MOU Name</span>
            <span style={valueStyle}>{mou.name}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Partner University</span>
            <span style={valueStyle}>{mou.partner}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Type of MOU</span>
            <span style={valueStyle}>{(mou as any).type || "N/A"}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Status</span>
            <div style={{ ...valueStyle, backgroundColor: "transparent", border: "none", padding: 0 }}>
              <StatusBadge status={mou.status} variant={mou.status as any} />
            </div>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>MOU Signing Date</span>
            <span style={valueStyle}>{mou.startDate}</span>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Expiry Date</span>
            <span style={valueStyle}>{mou.expiryDate}</span>
          </div>
          <div style={{ ...fieldStyle, gridColumn: "span 2" }}>
            <span style={labelStyle}>Applicable Semesters</span>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {((mou as any).applicableSemesters || []).map((sem: string, idx: number) => (
                <span key={idx} style={{ padding: "6px 12px", backgroundColor: "#e2e8f0", borderRadius: "20px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  {sem}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Partner University POC */}
      {mou && (mou as any).partnerPOC && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Partner University POC</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={fieldStyle}>
              <span style={labelStyle}>Name</span>
              <span style={valueStyle}>{(mou as any).partnerPOC.name}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Designation</span>
              <span style={valueStyle}>{(mou as any).partnerPOC.designation}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Email</span>
              <span style={valueStyle}>{(mou as any).partnerPOC.email}</span>
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Contact Number</span>
              <span style={valueStyle}>{(mou as any).partnerPOC.contactNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Our University POCs */}
      {mou && (mou as any).ourPOCs && (mou as any).ourPOCs.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Our University POCs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {((mou as any).ourPOCs).map((poc: any, idx: number) => (
              <div key={idx} style={{ padding: "20px", backgroundColor: "#fbfaf7", border: "1px dashed #d4cfc4", borderRadius: "8px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase" }}>
                  POC #{idx + 1}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Name</span>
                    <span style={valueStyle}>{poc.name}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Designation</span>
                    <span style={valueStyle}>{poc.designation}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Email</span>
                    <span style={valueStyle}>{poc.email}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={labelStyle}>Contact Number</span>
                    <span style={valueStyle}>{poc.contactNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attached Documents */}
      {mou && (mou as any).attachedDocuments && (mou as any).attachedDocuments.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Attached Documents</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {((mou as any).attachedDocuments).map((doc: any, idx: number) => (
              <div key={idx} style={{ 
                display: "flex", alignItems: "center", justifyContent: "space-between", 
                padding: "16px 20px", backgroundColor: "#f9f7f1", borderRadius: "8px", border: "1px solid #eaeaea" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span style={{ fontSize: "15px", fontWeight: 500, color: "#1a1a1a" }}>{doc.name}</span>
                </div>
                <button
                  onClick={() => alert(`Downloading ${doc.name}...`)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#333"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1a1a1a"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
