"use client";

import React, { useState } from "react";
import Image from "next/image";
import Navbar from "../../homepage/Navbar";
import CrackedEarth from "../../homepage/CrackedEarth";
import Sidebar from "./components/Sidebar";
import ApplicationStatus from "./components/ApplicationStatus";
import NotificationsPage from "./components/NotificationsPage";
import ApplicationList from "./components/ApplicationList";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, FileText, Bell } from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuth } from "../../admin/roles/AuthContext";
import { PERMISSIONS } from "../../admin/roles/permissions";

type Tab = "status" | "notifications";

function ProfileContent() {
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated || !PERMISSIONS[role].canAccessProfile) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, role, router]);
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(true);

  React.useEffect(() => {
    if (isLoading || !isAuthenticated || !PERMISSIONS[role].canAccessProfile) return;

    const fetchApplications = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/applications/me`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setAppsLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/notifications/me`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setNotifsLoading(false);
      }
    };

    fetchApplications();
    fetchNotifications();
  }, [isLoading, isAuthenticated, role]);


  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setSelectedAppId(null);
  };



  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFBF2" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !PERMISSIONS[role].canAccessProfile) {
    return null;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }} className="selection:bg-[#404040] selection:text-white">
      {/* LAYER 1: Background — fixed, truly behind everything */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <CrackedEarth />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,251,242,0)' }} />
      </div>

      {/* LAYER 2: Navbar — fixed at top */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <Navbar />
      </div>

      {/* LAYER 3: Full page content — padded top by navbar height */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        padding: '24px',
        paddingTop: '80px',
        gap: '24px'
      }} className="max-w-7xl mx-auto w-full">

        {/* SIDEBAR — normal flow, NOT fixed, fixed width, full remaining height */}
        <aside
          className="hidden md:block"
          style={{
            width: '260px',
            flexShrink: 0,
            minHeight: 'calc(100vh - 80px)',
            position: 'sticky',
            top: '80px',
            alignSelf: 'flex-start',
            overflowY: 'auto',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
          <Sidebar
            user={{
              id: user?.id || "",
              email: user?.email || "",
              display_name: user?.display_name || "Student",
              role: user?.role || "student",
              photo_uri: user?.photo_url || null,
              mobile: user?.phone_number || "",
            }}
            student={{
              id: "",
              user_id: user?.id || "",
              enrollment_id: (user as any)?.enrollment_no || "N/A",
              department: user?.course || "N/A",
              batch_year: new Date().getFullYear(),
              program_type: user?.school || "N/A",
            }}
            application={applications.length > 0 ? {
              id: applications[0].id,
              user_id: user?.id || "",
              program_id: applications[0].programId,
              stage: applications[0].pipelineStage || "received",
              fee_paid: true,
              departure_date: "",
              applied_at: applications[0].submittedAt
            } : (null as any)}
            notifications={notifications}
            activeTab={activeTab}
            onTabChange={(tab: string) => handleTabChange(tab as Tab)}
          />
        </aside>

        {/* MAIN CONTENT — takes remaining width */}
        <main style={{
          flex: 1,
          minWidth: 0,
          padding: '0',
          overflowX: 'hidden'
        }}>
          <div style={{ position: "relative", width: "100%" }}>
            <div style={{ display: activeTab === "status" ? "block" : "none", width: "100%" }}>
              {selectedAppId ? (
                <ApplicationStatus
                  key="status-detail"
                  application={{
                    id: applications.find(a => a.id === selectedAppId)?.id || "",
                    user_id: user?.id || "",
                    program_id: applications.find(a => a.id === selectedAppId)?.programId || "",
                    stage: applications.find(a => a.id === selectedAppId)?.pipelineStage || "received",
                    fee_paid: true,
                    departure_date: "",
                    applied_at: applications.find(a => a.id === selectedAppId)?.submittedAt || ""
                  }}
                  program={applications.find(a => a.id === selectedAppId)?.program || {
                    id: "default",
                    title: "Program",
                    country: "Unknown",
                    duration: "Unknown",
                    fee: 0,
                    poc: { name: "", designation: "", email: "", contactNumber: "" }
                  }}
                  documents={[]}
                  history={[]}
                  comments={[]}
                  onBack={() => setSelectedAppId(null)}
                />
              ) : (
                <ApplicationList
                  key="status-list"
                  applications={applications.map(app => {
                    let mappedStatus = "In Process";
                    if (app.pipelineStage === "completed") mappedStatus = "Completed";
                    else if (app.pipelineStage === "accepted" || app.status === "approved") mappedStatus = "Accepted";
                    else if (app.status === "rejected") mappedStatus = "Rejected";

                    return {
                      id: app.id,
                      program_title: app.programName || "Unknown Program",
                      status: mappedStatus,
                      applied_at: app.submittedAt
                    };
                  })}
                  onSelect={(id) => setSelectedAppId(id)}
                />
              )}
            </div>

            <div style={{ display: activeTab === "notifications" ? "block" : "none", width: "100%" }}>
              <NotificationsPage
                key="notifications"
                notifications={notifications}
                onNotificationClick={(appId) => {
                  setActiveTab("status");
                  setSelectedAppId(appId);
                }}
              />
            </div>
          </div>
        </main>

      </div>

      <MobileTabBar 
        activeTab={activeTab} 
        handleTabChange={handleTabChange} 
        unreadCount={notifications.filter((n) => !n.read).length} 
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FFFBF2]" />}>
      <ProfileContent />
    </React.Suspense>
  );
}

function MobileTabBar({ activeTab, handleTabChange, unreadCount }: { activeTab: Tab, handleTabChange: (id: Tab) => void, unreadCount: number }) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t"
      style={{
        background: "rgba(57, 57, 57, 0.1)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderColor: "var(--muted-3)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <div className="flex items-center justify-between px-2 pb-safe">
        <MobileTabButton id="status" activeTab={activeTab} icon={CheckCircle2} label="Status" onClick={() => handleTabChange("status")} />
        <MobileTabButton id="notifications" activeTab={activeTab} icon={Bell} label="Notifs" hasDot={unreadCount > 0} onClick={() => handleTabChange("notifications")} />
      </div>
    </div>
  );
}

function MobileTabButton({ id, activeTab, icon: Icon, label, hasDot, onClick }: any) {
  const isActive = activeTab === id;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 relative py-3 transition-colors"
      style={{ color: isActive ? "#404040" : "rgba(57, 57, 57, 0.6)" }}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      <span
        className="text-[10px] uppercase tracking-wider"
        style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: isActive ? 600 : 500 }}
      >
        {label}
      </span>
      {hasDot && (
        <span className="absolute top-2.5 right-[calc(50%-14px)] w-2 h-2 rounded-full bg-[#404040]"></span>
      )}
    </button>
  );
}
