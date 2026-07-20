"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  PieChart, Calendar, Layers, Users, FileText, 
  Handshake, MapPin, GraduationCap, UserCog, 
  Star, Send, Archive, History, Home, Bell, FileEdit
} from "lucide-react";
import LiquidGlass from "../../components/LiquidGlass";
import Navbar from "@/app/homepage/Navbar";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { getAllowedAdminPaths, PERMISSIONS } from "@/app/admin/roles/permissions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // desktop collapse

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const { role, isLoading } = useAuth();
  const allowedPaths = useMemo(() => getAllowedAdminPaths(role), [role]);
  const isReadOnly = !PERMISSIONS[role].admin.canEdit;

  // Redirect to first allowed section if user lands on /admin but doesn't have analytics access
  // Or redirect to home if they have no admin access at all
  useEffect(() => {
    if (isLoading) return;
    if (!PERMISSIONS[role].navbar.admin) {
      router.replace("/");
      return;
    }
    if (pathname === "/admin" && !allowedPaths.includes("/admin") && allowedPaths.length > 0) {
      router.replace(allowedPaths[0]);
    }
  }, [pathname, allowedPaths, router, role, isLoading]);

  const allNavItems = [
    { label: "Main Website", path: "/", icon: Home },
    { label: "Analytics", path: "/admin", icon: PieChart },
    { label: "Events", path: "/admin/events", icon: Calendar },
    { label: "Programs", path: "/admin/programs", icon: Layers },
    { label: "MOUs", path: "/admin/mou", icon: Handshake },
    { label: "Visits", path: "/admin/visits", icon: MapPin },
    { label: "Drafts", path: "/admin/drafts", icon: FileEdit },
    { label: "Program Leads", path: "/admin/leads", icon: Users },
    { label: "Applications", path: "/admin/applications", icon: FileText },
    { label: "Students", path: "/admin/students", icon: GraduationCap },
    { label: "Users", path: "/admin/users", icon: UserCog },
    { label: "Reviews", path: "/admin/reviews", icon: Star },
    { label: "My Submissions", path: "/admin/submissions", icon: Send },
    { label: "Archived", path: "/admin/archived", icon: Archive },
    { label: "Audit Trail", path: "/admin/audit", icon: History },
  ];

  // Filter nav items based on role permissions
  const navItems = allNavItems.filter((item) => {
    if (item.path === "/") return isMobile;
    return allowedPaths.includes(item.path);
  });

  const sidebarWidth = isMobile ? "260px" : collapsed ? "56px" : "220px";

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5f0e8" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden", backgroundColor: "#f5f0e8", display: "flex", flexDirection: "column" }}>
      {/* Navbar Area */}
      <div style={{ flexShrink: 0, position: "relative", zIndex: 1000 }}>
        <Navbar
          onAdminMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          adminMenuOpen={sidebarOpen}
        />
      </div>

      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Sidebar overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.3)", zIndex: 1049,
            }}
          />
        )}

        {/* Sidebar */}
        <aside
          data-lenis-prevent
          style={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

            // Desktop: fixed flex layout, independent scroll
            position: isMobile ? "fixed" : "relative",
            top: 0,
            left: isMobile ? "auto" : 0,
            right: isMobile ? 0 : "auto",
            bottom: isMobile ? 0 : undefined,
            height: isMobile ? "100vh" : "100%", 
            overflowY: "auto",
            overflowX: "hidden",
            zIndex: isMobile ? 1200 : 40,

            // Mobile sliding transition
            ...(isMobile ? {
              transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            } : {}),
          }}
        >
          <LiquidGlass 
            backgroundColor="rgba(240, 235, 225, 0.65)"
            borderColor="rgba(255, 255, 255, 0.4)"
          />
          {/* Desktop collapse toggle */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "14px 0",
                background: "none",
                border: "none",
                borderBottom: "1px solid #b5bda0",
                cursor: "pointer",
                color: "#6b6b6b",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e63946")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: "transform 0.3s ease",
                  transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
          )}

          {/* Mobile close toggle */}
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 16px 0 16px" }}>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#1a1a1a",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          <nav style={{ padding: isMobile ? "16px 0" : "12px 0", display: "flex", flexDirection: "column" }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/" && item.path !== "/admin" && pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={collapsed ? item.label : undefined}
                  style={{
                    padding: isMobile ? "14px 20px" : collapsed ? "14px 0" : "12px 24px",
                    fontSize: "15px",
                    color: isActive ? "#e63946" : "#6b6b6b",
                    textDecoration: "none",
                    borderLeft: collapsed ? "none" : isActive ? "2px solid #e63946" : "2px solid transparent",
                    backgroundColor: isActive ? "#ede8de" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: collapsed ? "0px" : "12px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>}
                  
                  {/* Indicator line for collapsed state */}
                  {collapsed && isActive && (
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", backgroundColor: "#e63946" }} />
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Scrolling Content Area */}
        <main
          id="admin-scroll-area"
          data-lenis-prevent
          style={{
            flex: 1,
            padding: isMobile ? "1rem" : "2rem",
            overflowX: "hidden",
            overflowY: "auto",
            position: "relative",
            width: isMobile ? "100%" : undefined,
            height: "100%",
            transition: "margin-left 0.3s ease",
          }}
        >
          <style>{`
            @media (max-width: 768px) {
              .admin-form-container {
                padding: 1rem !important;
              }
              .admin-grid-1, .admin-grid-2, .admin-grid-3 {
                grid-template-columns: 1fr !important;
              }
              .admin-upload-box {
                padding: 1rem !important;
              }
              .admin-filter-right {
                flex-wrap: wrap !important;
              }
              .admin-bulk-actions {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 16px !important;
              }
              .admin-bulk-actions-right {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 16px !important;
                justify-content: flex-start !important;
              }
              .admin-bulk-actions .desktop-divider {
                display: none !important;
              }
              .admin-bulk-actions-right > div {
                width: 100% !important;
              }
              .admin-bulk-actions-right .status-update-row {
                flex-direction: column !important;
              }
              .audit-card-content {
                flex-direction: column !important;
                gap: 12px !important;
                padding: 16px !important;
              }
              .audit-card-content > div {
                width: 100% !important;
                text-align: left !important;
              }
              .review-card {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 16px !important;
              }
              .review-card-left {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
              }
              .review-card-right {
                width: 100% !important;
                justify-content: space-between !important;
              }
            }
          `}</style>
          {children}
        </main>
      </div>
    </div>
  );
}
