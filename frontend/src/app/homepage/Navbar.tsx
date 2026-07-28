"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { PERMISSIONS } from "@/app/admin/roles/permissions";
import NotificationPanel from "@/app/admin/components/NotificationPanel";
import LiquidGlass from "../../components/LiquidGlass";

interface NavItem {
  label: string;
  href?: string;
  id: string;
  dropdown?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/#home", id: "nav-home" },
  { label: "Programs", href: "/programs/other", id: "nav-programs" },
  {
    label: "Events",
    id: "nav-events",
    dropdown: [
      { label: "Upcoming events", href: "/events/upcoming" },
      { label: "Past event", href: "/events/past" },
    ],
  },
  { label: "Partners", href: "/partners", id: "nav-partners" },
  { label: "Team", href: "/team", id: "nav-team" },
  { label: "IAS", href: "/ias", id: "nav-ias" },
];

const LOGIN_BUTTON = {
  label: "Login",
  href: "/login", // Replace with auth route
  id: "nav-login",
};

const PROFILE_BUTTON = {
  label: "Profile",
  href: "/student/profile",
  id: "nav-profile",
};

const ADMIN_BUTTON = {
  label: "Admin",
  href: "/admin",
  id: "nav-admin",
};

// ============================================================

export default function Navbar({ onAdminMenuToggle, adminMenuOpen }: { onAdminMenuToggle?: () => void; adminMenuOpen?: boolean } = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname() || "";
  const { role, isAuthenticated, login, logout } = useAuth();
  const perms = PERMISSIONS[role];
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (role !== "super_admin" && role !== "admin" && role !== "editor") return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/reviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (res.ok) {
          const json = await res.json();
          setReviews((json.data || []).map((r: any) => ({
            id: r.id,
            type: r.type,
            title: r.title,
            status: r.status,
            submittedAt: r.submitted_at,
            data: r.data,
            comments: Array.isArray(r.comments) ? r.comments : [],
            submittedBy: {
              name: r.submitted_by_name,
              email: r.submitted_by_email,
              role: r.submitted_by_role
            }
          })));
        }
      } catch (err) {
        console.error("Failed to fetch reviews in Navbar:", err);
      }
    };

    const fetchAlerts = async () => {
      if (role !== "super_admin" && role !== "admin" && role !== "editor") return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/notifications/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (res.ok) {
          const json = await res.json();
          setSystemAlerts(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch system alerts in Navbar:", err);
      }
    };

    fetchReviews();
    fetchAlerts();
  }, [role, notifPanelOpen]);

  // Dark-theme pages (e.g. /ias)
  const isDarkPage = pathname.startsWith("/ias");
  const isAdminPage = pathname.startsWith("/admin");

  // Dynamic Theme Variables
  const textColor = isDarkPage ? "#ffffff" : "var(--foreground)";
  const textHover = isDarkPage ? "#D12027" : "var(--accent)";
  const loginColor = isDarkPage ? "#D12027" : "var(--accent)";
  const loginHover = isDarkPage ? "#ffffff" : "var(--foreground)";
  const borderColor = isDarkPage ? "rgba(255,255,255,0.12)" : "rgba(196, 203, 183, 0.4)";
  const borderScrolledColor = isDarkPage ? "rgba(255,255,255,0.08)" : "rgba(196, 203, 183, 0.3)";
  const bgUnscrolled = isDarkPage ? "rgba(10, 10, 10, 0.75)" : "rgba(255, 251, 242, 0.65)";
  const bgScrolled = isDarkPage ? "rgba(10, 10, 10, 0.85)" : "rgba(255, 251, 242, 0.45)";
  const menuBg = isDarkPage ? "rgba(20, 20, 20, 0.95)" : "rgba(255, 251, 242, 0.95)";
  const mobileMenuBg = isDarkPage ? "rgba(10, 10, 10, 0.97)" : "rgba(255, 251, 242, 0.97)";
  const dividerColor = isDarkPage ? "rgba(255,255,255,0.15)" : "var(--muted-3)";
  const dropdownDot = isDarkPage ? "#D12027" : "#C5A880";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
    <nav
      id="main-navbar"
      className={isAdminPage ? "relative z-50 w-full" : "fixed left-0 right-0 z-50"}
      style={{
        animation: "slideDown 0.8s ease-out forwards",
        top: isScrolled ? "14px" : "0px",
        margin: isScrolled ? "0 24px" : "0",
        borderRadius: isScrolled ? "16px" : "0",
        border: isScrolled
          ? `1px solid ${borderScrolledColor}`
          : "1px solid transparent",
        transition:
          "top 0.5s cubic-bezier(0.23,1,0.32,1), margin 0.5s cubic-bezier(0.23,1,0.32,1), border-radius 0.5s ease-out, box-shadow 0.5s ease-out, border-color 0.5s ease-out",
        boxShadow: isScrolled
          ? "0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)"
          : "none",
        overflow: "visible",
      }}
    >
      <div
        className="px-6 sm:px-8 lg:px-12 py-3 flex items-center justify-between"
        style={{
          borderRadius: "inherit",
          backgroundColor: isScrolled ? bgScrolled : bgUnscrolled,
          backdropFilter: isScrolled
            ? "blur(24px) saturate(180%)"
            : "blur(18px) saturate(150%)",
          WebkitBackdropFilter: isScrolled
            ? "blur(24px) saturate(180%)"
            : "blur(18px) saturate(150%)",
          borderBottom: isScrolled
            ? "none"
            : `1px solid ${borderColor}`,
          transition:
            "background-color 0.5s ease-out, backdrop-filter 0.5s ease-out, border-radius 0.5s ease-out",
        }}
      >
        <div className="flex items-center gap-4 sm:gap-5 shrink-0">
          <Image
            src="/homepage assets/bennett logo .png"
            alt="Bennett University Logo"
            width={160}
            height={55}
            className="h-9 sm:h-10 lg:h-12 w-auto object-contain"
            unoptimized
            priority
          />
          <div
            className="w-px h-7 sm:h-8"
            style={{ backgroundColor: "var(--muted-3)" }}
          />
          <Image
            src="/homepage assets/IAS LOGO.webp"
            alt="International Affairs Society Logo"
            width={160}
            height={55}
            className="h-9 sm:h-10 lg:h-12 w-auto object-contain"
            unoptimized
            priority
          />
        </div>
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {NAV_ITEMS.map((item) => (
            item.dropdown ? (
              <div key={item.id} className="relative group py-2">
                <button
                  id={item.id}
                  className="flex items-center gap-1 text-sm lg:text-[15px] tracking-[0.08em] uppercase transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    color: textColor,
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:rotate-180 transition-transform duration-300">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex flex-col gap-1.5"
                     style={{
                       backgroundColor: menuBg,
                       backdropFilter: "blur(16px)",
                       border: `1px solid ${borderColor}`,
                       borderRadius: "12px",
                       boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                       padding: "8px",
                     }}
                >
                  {item.dropdown.map((subItem) => (
                    <a
                      key={subItem.label}
                      href={subItem.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm tracking-wide transition-colors duration-200 rounded-md hover:bg-[rgba(196,203,183,0.3)]"
                      style={{ 
                        fontFamily: "var(--font-space-grotesk)", 
                        fontWeight: 500,
                        color: "var(--foreground)"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = textHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dropdownDot }}></span>
                      {subItem.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                key={item.id}
                id={item.id}
                href={item.href}
                className="relative py-2 text-sm lg:text-[15px] tracking-[0.08em] uppercase transition-colors duration-300"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  color: textColor,
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = textHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
              >
                {item.label}
              </a>
            )
          ))}
        </div>
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          {perms.navbar.notification && role !== 'super_admin' && (
    {role === 'super_admin' && (
      <NotificationPanel
        isOpen={notifPanelOpen}
        onClose={() => setNotifPanelOpen(false)}
        reviews={reviews}
        systemAlerts={systemAlerts}
        isDarkTheme={isDarkPage}
      />
    )}
    </>
  );
}
