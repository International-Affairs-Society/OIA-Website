"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TabGroup, AdminTable, StatusBadge, FormField } from "@/app/admin/components";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const [activeTab, setActiveTab] = useState("applications");

  const [alerts, setAlerts] = useState([
    { id: "1", message: "Please update your passport details.", date: "2024-03-10", sentBy: "Admin" }
  ]);
  const [newAlert, setNewAlert] = useState("");

  const handleSendAlert = () => {
    if (!newAlert.trim()) return;
    setAlerts([{ id: Date.now().toString(), message: newAlert, date: "Just now", sentBy: "Admin" }, ...alerts]);
    setNewAlert("");
  };

  const appsColumns = [
    { key: "sNo", label: "S.No", width: "10%" },
    { key: "enrollment", label: "Enrollment", width: "20%" },
    { key: "name", label: "Name", width: "25%" },
    { key: "gender", label: "Gender", width: "10%" },
    { key: "program", label: "Program", width: "20%" },
    { key: "statusBadge", label: "Status", width: "15%" },
  ];
  const appsData = [
    { 
      id: "1", 
      sNo: 1, 
      enrollment: `E20CSE123`, 
      name: "Alice Johnson", 
      gender: "F", 
      program: "Global Exchange 2024", 
      status: "pending" 
    }
  ];

  const formattedAppsData = appsData.map(app => ({
    ...app,
    statusBadge: <StatusBadge status={app.status.toUpperCase()} variant={app.status as any} />
  }));

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
          AJ
        </div>
        <div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: 600, color: "#1a1a1a" }}>Alice Johnson</h1>
          <div style={{ fontSize: "13px", color: "#6b6b6b", lineHeight: 1.5 }}>
            <div>alice@bennett.edu.in</div>
            <div>SCSE &bull; B.Tech CSE</div>
            <div style={{ marginTop: "4px", display: "inline-block", padding: "2px 6px", border: "1px solid #b5bda0", fontSize: "11px", letterSpacing: "0.05em" }}>ID: E20CSE123</div>
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
            <AdminTable
              columns={appsColumns}
              data={formattedAppsData}
            />
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
                <button onClick={handleSendAlert} style={{ padding: "8px 16px", backgroundColor: "#1a1a1a", color: "#f5f0e8", border: "none", cursor: "pointer", fontSize: "13px" }}>
                  Send Alert
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {alerts.length === 0 ? <p style={{ color: "#6b6b6b", fontSize: "14px" }}>No alerts sent.</p> : alerts.map(alert => (
                <div key={alert.id} style={{ padding: "16px 0", borderBottom: "1px solid #b5bda0" }}>
                  <div style={{ fontSize: "14px", color: "#1a1a1a", marginBottom: "6px" }}>{alert.message}</div>
                  <div style={{ fontSize: "12px", color: "#6b6b6b" }}>Sent at {alert.date} by {alert.sentBy}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid #b5bda0" }}>
              <div style={{ fontSize: "14px", color: "#1a1a1a" }}>Profile_Photo.jpg</div>
              <div style={{ fontSize: "12px", color: "#6b6b6b", textTransform: "uppercase" }}>JPG</div>
              <button style={{ padding: "4px 12px", border: "1px solid #1a1a1a", background: "none", fontSize: "12px", cursor: "pointer" }}>View</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
