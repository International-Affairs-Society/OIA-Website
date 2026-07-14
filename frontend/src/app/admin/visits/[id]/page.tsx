"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "../../components";

import { ArrowLeft, ChevronLeft, ChevronRight, Download, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";

function ImageSlider({ photos }: { photos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return <div style={{ width: "100%", height: "300px", backgroundColor: "#eaeaea", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6b6b" }}>No photos available</div>;
  }

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? photos.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === photos.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden" }}>
      <Image src={photos[currentIndex]} alt={`Visit photo ${currentIndex + 1}`} fill style={{ objectFit: "cover" }} />
      
      {photos.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            style={{ 
              position: "absolute", top: "50%", left: "16px", transform: "translateY(-50%)",
              backgroundColor: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%",
              width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 10
            }}
          >
            <ChevronLeft size={24} color="#1a1a1a" />
          </button>
          
          <button 
            onClick={nextSlide}
            style={{ 
              position: "absolute", top: "50%", right: "16px", transform: "translateY(-50%)",
              backgroundColor: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%",
              width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 10
            }}
          >
            <ChevronRight size={24} color="#1a1a1a" />
          </button>

          <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 10 }}>
            {photos.map((_, slideIndex) => (
              <div 
                key={slideIndex} 
                onClick={() => setCurrentIndex(slideIndex)}
                style={{ 
                  width: "8px", height: "8px", borderRadius: "50%", 
                  backgroundColor: currentIndex === slideIndex ? "#1a1a1a" : "rgba(255,255,255,0.5)",
                  cursor: "pointer", border: currentIndex === slideIndex ? "2px solid #fff" : "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function VisitDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/visits/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = {
            id: data.id,
            university: data.university,
            date: data.date,
            status: data.status || "approved", // fallback if no status
            purpose: data.purpose,
            highlights: data.highlights || [],
            delegations: data.delegations || [],
            ourPOCs: data.our_pocs || [],
            photos: data.photos || [],
            reports: data.reports ? data.reports.map((r: any) => ({ name: r.name, url: r.url })) : []
          };
          setVisit(mapped);
        } else {
          router.push("/admin/visits");
        }
      } catch (err) {
        console.error("Failed to fetch visit details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisit();
  }, [id, router]);

  if (loading) {
    return (
      <div style={{ width: "100%", padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#6b6b6b" }}>Loading visit details...</p>
      </div>
    );
  }

  if (!visit) return null;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/visits" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          <ArrowLeft size={16} /> Back to Visits
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <AdminPageHeader title={`Visit: ${visit.university}`} />
          <p style={{ fontSize: "15px", color: "#6b6b6b", marginTop: "-16px" }}>
            {new Date(visit.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ 
          display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "20px",
          backgroundColor: visit.status === "approved" ? "rgba(76, 175, 80, 0.1)" : "rgba(255, 152, 0, 0.1)",
          color: visit.status === "approved" ? "#2e7d32" : "#ed6c02",
          fontSize: "14px", fontWeight: 600, textTransform: "uppercase"
        }}>
          {visit.status === "approved" ? <CheckCircle size={16} /> : <Clock size={16} />}
          {visit.status}
        </div>
      </div>

      <div style={{ marginBottom: "3rem" }}>
        <ImageSlider photos={visit.photos} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        
        {/* Delegations */}
        <section style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid #b5bda0" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1.5rem", borderBottom: "1px solid rgba(181, 189, 160, 0.3)", paddingBottom: "0.5rem" }}>Delegation (Visitors)</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(181, 189, 160, 0.1)" }}>
                  <th style={{ padding: "12px", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>Name</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>Designation</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>Email</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>Country</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>University</th>
                </tr>
              </thead>
              <tbody>
                {visit.delegations?.map((del: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eaeaea" }}>
                    <td style={{ padding: "12px", fontSize: "14px", fontWeight: 500, color: "#1a1a1a" }}>{del.name}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#4a4a4a" }}>{del.designation}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#4a4a4a" }}>{del.email}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#4a4a4a" }}>{del.country}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#4a4a4a" }}>{del.university}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Our POCs */}
        <section style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid #b5bda0" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1.5rem", borderBottom: "1px solid rgba(181, 189, 160, 0.3)", paddingBottom: "0.5rem" }}>Bennett University POCs</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(181, 189, 160, 0.1)" }}>
                  <th style={{ padding: "12px", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>Name</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>Designation</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>Email</th>
                  <th style={{ padding: "12px", fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>Contact</th>
                </tr>
              </thead>
              <tbody>
                {visit.ourPOCs?.map((poc: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eaeaea" }}>
                    <td style={{ padding: "12px", fontSize: "14px", fontWeight: 500, color: "#1a1a1a" }}>{poc.name}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#4a4a4a" }}>{poc.designation}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#4a4a4a" }}>{poc.email}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#4a4a4a" }}>{poc.contactNumber || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Purpose & Highlights */}
        <section style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid #b5bda0" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.3)", paddingBottom: "0.5rem" }}>Purpose of Visit</h3>
            <p style={{ fontSize: "15px", color: "#4a4a4a", lineHeight: 1.6 }}>{visit.purpose}</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem", borderBottom: "1px solid rgba(181, 189, 160, 0.3)", paddingBottom: "0.5rem" }}>Key Highlights & Outcomes</h3>
            <ul style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {visit.highlights?.map((highlight: string, idx: number) => (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14px", color: "#4a4a4a", lineHeight: 1.5 }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#b5bda0", flexShrink: 0, marginTop: "8px" }} />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Reports */}
        {visit.reports && visit.reports.length > 0 && (
          <section style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid #b5bda0" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", marginBottom: "1.5rem", borderBottom: "1px solid rgba(181, 189, 160, 0.3)", paddingBottom: "0.5rem" }}>Attached Reports</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {visit.reports.map((report: any, idx: number) => (
                <a key={idx} href={report.url} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px", borderRadius: "8px", border: "1px solid #eaeaea",
                  backgroundColor: "#fcfaf7", textDecoration: "none", color: "inherit",
                  transition: "border-color 0.2s"
                }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a" }}>{report.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2563eb", fontSize: "13px", fontWeight: 500 }}>
                    <Download size={16} /> Download
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
        
      </div>
    </div>
  );
}
