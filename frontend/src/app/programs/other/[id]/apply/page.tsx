"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/homepage/Navbar";

import DefaultApplicationForm from "../../components/DefaultApplicationForm";

export default function ApplyProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [programTitle, setProgramTitle] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/programs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProgramTitle(data.title || data.name);
        }
      } catch (err) {
        console.error("Failed to fetch program:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgram();
  }, [id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!programTitle) return <div style={{ padding: "100px", textAlign: "center" }}>Program not found</div>;

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#f5f0e8" }}>
      <div style={{ position: "relative", zIndex: 50 }}>
        <Navbar />
      </div>

      <main style={{ position: "relative", zIndex: 10, maxWidth: "800px", width: "100%", margin: "0 auto", padding: "140px clamp(24px, 4vw, 64px) 100px", boxSizing: "border-box" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link href={`/programs/other/${id}`} style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px", fontFamily: "var(--font-outfit)" }}>
            &larr; Back to {programTitle}
          </Link>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-instrument-serif)", fontSize: "40px", color: "#1a1a1a", margin: "0 0 8px 0" }}>Apply Now</h1>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", color: "#6b6b6b", margin: 0 }}>
            Applying for <strong>{programTitle}</strong>
          </p>
        </div>

        <div style={{ border: "1px solid #b5bda0", padding: "2.5rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: "8px" }}>
          <DefaultApplicationForm 
            onSubmit={async () => {
              try {
                const token = localStorage.getItem("access_token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/applications`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({
                    programId: id,
                    customFieldResponses: {}
                  })
                });
                
                if (res.ok) {
                  alert("Application Submitted successfully!"); 
                  router.push(`/student/profile`); 
                } else {
                  const data = await res.json();
                  alert(`Failed to submit application: ${data.error?.message || 'Unknown error'}`);
                }
              } catch (err) {
                console.error("Failed to submit application:", err);
                alert("An error occurred while submitting the application.");
              }
            }}
            onCancel={() => router.push(`/programs/other/${id}`)}
          />
        </div>
      </main>
    </div>
  );
}
