"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  PieChart, Calendar, Layers, Users, FileText, 
  Handshake, MapPin, GraduationCap, UserCog, 
  Star, Send, Archive, History 
} from "lucide-react";
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

  const { role } = useAuth();
  const allowedPaths = getAllowedAdminPaths(role);
  const isReadOnly = !PERMISSIONS[role].admin.canEdit;

  // Redirect to first allowed section if user lands on /admin but doesn't have analytics access
  useEffect(() => {
    if (pathname === "/admin" && !allowedPaths.includes("/admin") && allowedPaths.length > 0) {
      router.replace(allowedPaths[0]);
    }
  }, [pathname, allowedPaths, router]);

  const allNavItems = [
    { label: "Analytics", path: "/admin", icon: PieChart },
    { label: "Events", path: "/admin/events", icon: Calendar },
    { label: "Programs", path: "/admin/programs", icon: Layers },
    { label: "Program Leads", path: "/admin/leads", icon: Users },
    { label: "Applications", path: "/admin/applications", icon: FileText },
    { label: "MOUs", path: "/admin/mou", icon: Handshake },
    { label: "Visits", path: "/admin/visits", icon: MapPin },
    { label: "Students", path: "/admin/students", icon: GraduationCap },
    { label: "Users", path: "/admin/users", icon: UserCog },
    { label: "Reviews", path: "/admin/reviews", icon: Star },
    { label: "My Submissions", path: "/admin/submissions", icon: Send },
    { label: "Archived", path: "/admin/archived", icon: Archive },
    { label: "Audit Trail", path: "/admin/audit", icon: History },
  ];

  // Filter nav items based on role permissions
  const navItems = allNavItems.filter((item) => allowedPaths.includes(item.path));

  const sidebarWidth = isMobile ? "260px" : collapsed ? "56px" : "220px";

  return (
    <div style={{ height: "100vh", overflow: "hidden", backgroundColor: "#f5f0e8", display: "flex", flexDirection: "column" }}>
      {/* Navbar Area */}
      <div style={{ height: isMobile ? "60px" : "73px", flexShrink: 0, position: "relative" }}>
        <Navbar />
        {/* Mobile hamburger button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
            style={{
              position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", zIndex: 1100,
              padding: 8, display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            <span style={{ display: "block", width: 22, height: 2, background: sidebarOpen ? "transparent" : "#1a1a1a", transition: "all 0.3s", position: "relative" }}>
              {sidebarOpen && (
                <>
                  <span style={{ position: "absolute", top: 0, left: 0, width: 22, height: 2, background: "#1a1a1a", transform: "rotate(45deg)" }} />
                  <span style={{ position: "absolute", top: 0, left: 0, width: 22, height: 2, background: "#1a1a1a", transform: "rotate(-45deg)" }} />
                </>
              )}
            </span>
            {!sidebarOpen && (
              <>
                <span style={{ display: "block", width: 22, height: 2, background: "#1a1a1a" }} />
                <span style={{ display: "block", width: 22, height: 2, background: "#1a1a1a" }} />
              </>
            )}
          </button>
        )}
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
            borderRight: "1px solid #b5bda0",
            backgroundColor: "#f0ebe1",
            flexShrink: 0,
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

            // Desktop: fixed flex layout, independent scroll
            position: isMobile ? "fixed" : "relative",
            top: isMobile ? 60 : 0,
            left: 0,
            bottom: isMobile ? 0 : undefined,
            height: isMobile ? undefined : "100%", 
            overflowY: "auto",
            overflowX: "hidden",
            zIndex: isMobile ? 1050 : 40,

            // Mobile sliding transition
            ...(isMobile ? {
              transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            } : {}),
          }}
        >
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

          <nav style={{ padding: isMobile ? "16px 0" : "12px 0", display: "flex", flexDirection: "column" }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== "/admin");
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
          {children}
        </main>
      </div>
    </div>
  );
}
