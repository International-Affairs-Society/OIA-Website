"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TabGroup, AdminTable, StatusBadge, FormField } from "@/app/admin/components";
import { AdminFormSkeleton } from "@/app/admin/optemization_component";
import { apiFetch } from "@/lib/apiFetch";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [activeTab, setActiveTab] = useState("applications");
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [newAlert, setNewAlert] = useState("");
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const fetchStudentDetails = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`/api/v1/student-records/${id}`);
      if (res.ok) {
        const json = await res.json();
        setStudent(json);
        if (json.userId) {
          fetchAlerts(json.userId);
        }
      }
    } catch (err) {
      console.error("Failed to fetch student details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlerts = async (userId: string) => {
    try {
      const res = await apiFetch(`/api/v1/notifications?type=ALERT&recipientFilter=user:${userId}`);
      if (res.ok) {
        const json = await res.json();
        setAlerts((json.data || []).map((notif: any) => ({
          id: notif.id,
          message: notif.bodyHtml,
          date: notif.sentAt ? new Date(notif.sentAt).toLocaleDateString() : "N/A",
          sentBy: "Admin"
        })));
      }
    } catch (err) {
      console.error("Failed to fetch student alerts:", err);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const handleSendAlert = async () => {
    if (!newAlert.trim() || !student?.userId) return;

    try {
      setIsSendingAlert(true);
      const res = await apiFetch(`/api/v1/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "ALERT",
          recipientFilter: `user:${student.userId}`,
          subject: "Admin Alert",
          bodyHtml: newAlert
        }),
      });

      if (res.ok) {
        setNewAlert("");
        fetchAlerts(student.userId);
      } else {
        alert("Failed to send alert.");
      }
    } catch (err) {
      console.error("Failed to send alert:", err);
    } finally {
      setIsSendingAlert(false);
    }
  };

  const appsColumns = [
    { key: "sNo", label: "S.No", width: "10%" },
    { key: "program", label: "Program", width: "50%" },
    { key: "statusBadge", label: "Status", width: "40%" },
  ];

  const formattedAppsData = (student?.applications || []).map((app: any, idx: number) => ({
    id: app.id,
    sNo: idx + 1,
    program: app.programName,
    statusBadge: <StatusBadge status={app.status.toUpperCase()} variant={app.status as any} />
  }));

  const documentsList = (student?.applications || []).reduce((acc: any[], app: any) => {
    if (app.documents) {
      const mapped = app.documents.map((doc: any) => ({
        ...doc,
        programName: app.programName
      }));
      return [...acc, ...mapped];
    }
    return acc;
  }, []);

  const initials = student?.studentName
    ? student.studentName.split(" ").map((x: string) => x[0]).join("").slice(0, 2).toUpperCase()
    : "ST";

  if (isLoading) {
    return <AdminFormSkeleton fields={8} />;
  }

  if (!student) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>Student not found.</div>;
  }

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/students" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Students
        </Link>
      </div>

      {/* Profile Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "3rem" }}>
        <div style={{ width: "64px", height: "64px", border: "1px solid #b5bda0", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0ebe1", fontSize: "20px", color: "#6b6b6b" }}>
          {initials}
        </div>
        <div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: 600, color: "#1a1a1a" }}>{student.studentName || "N/A"}</h1>
          <div style={{ fontSize: "13px", color: "#6b6b6b", lineHeight: 1.5 }}>
            <div>{student.email || "N/A"}</div>
            <div>{student.programType || ""} &bull; {student.department || ""}</div>
            <div style={{ marginTop: "4px", display: "inline-block", padding: "2px 6px", border: "1px solid #b5bda0", fontSize: "11px", letterSpacing: "0.05em" }}>ID: {student.enrollmentNumber}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabGroup
        tabs={[
          { key: "applications", label: "Applications" },
          { key: "alerts", label: "Alerts" },
          { key: "documents", label: "Documents" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div style={{ marginTop: "2rem" }}>
        {activeTab === "applications" && (
          <div style={{ border: "1px solid #b5bda0" }}>
            {formattedAppsData.length === 0 ? (
              <p style={{ padding: "20px", color: "#6b6b6b", fontSize: "14px", textAlign: "center" }}>No applications found.</p>
            ) : (
              <AdminTable
                columns={appsColumns}
                data={formattedAppsData}
              />
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <FormField label="New Alert">
                <textarea
                  rows={2}
                  value={newAlert}
                  onChange={(e) => setNewAlert(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #b5bda0", backgroundColor: "#f5f0e8" }}
                  placeholder="Type an alert message..."
                />
              </FormField>
              <div style={{ textAlign: "right" }}>
                <button 
                  onClick={handleSendAlert} 
                  disabled={isSendingAlert || !newAlert.trim()}
                  style={{ padding: "8px 16px", backgroundColor: "#1a1a1a", color: "#f5f0e8", border: "none", cursor: "pointer", fontSize: "13px" }}
                >
                  {isSendingAlert ? "Sending..." : "Send Alert"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {alerts.length === 0 ? (
                <p style={{ color: "#6b6b6b", fontSize: "14px" }}>No alerts sent.</p>
              ) : (
                alerts.map((alert: any) => (
                  <div key={alert.id} style={{ padding: "16px 0", borderBottom: "1px solid #b5bda0" }}>
                    <div style={{ fontSize: "14px", color: "#1a1a1a", marginBottom: "6px" }}>{alert.message}</div>
                    <div style={{ fontSize: "12px", color: "#6b6b6b" }}>Sent at {alert.date} by {alert.sentBy}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {documentsList.length === 0 ? (
              <p style={{ color: "#6b6b6b", fontSize: "14px" }}>No documents uploaded.</p>
            ) : (
              documentsList.map((doc: any) => (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid #b5bda0", backgroundColor: "#fcfaf6" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: "11px", color: "#6b6b6b" }}>Uploaded for: {doc.programName}</div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>{doc.type}</div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ padding: "4px 12px", border: "1px solid #1a1a1a", background: "none", fontSize: "12px", cursor: "pointer", color: "#1a1a1a", textDecoration: "none" }}>
                    View
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
