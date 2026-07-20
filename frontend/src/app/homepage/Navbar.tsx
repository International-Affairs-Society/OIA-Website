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
// ============================================================
// DATA CONSTANTS — Replace with API calls when backend is ready
// ============================================================

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

  useEffect(() => {
    if (role === "super_admin") {
      const fetchReviews = async () => {
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
      fetchReviews();
    }
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
      {/* Main navbar bar — glassmorphism */}
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

        {/* Center — Nav Links (Desktop) */}
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

        {/* Right — Profile/Admin/Login (Desktop) + Hamburger (Mobile) */}
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          {/* Notifications */}
          {perms.navbar.notification && role !== 'super_admin' && (
            <Link href="/student/profile?tab=notifications">
              <button
                className="flex relative items-center justify-center transition-colors duration-300"
                style={{ color: textColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = textHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full" style={{ background: "#D12027", transform: "translate(25%, -25%)" }}></span>
              </button>
            </Link>
          )}
          {perms.navbar.notification && role === 'super_admin' && (
            <button
              className="flex relative items-center justify-center transition-colors duration-300"
              style={{ color: textColor }}
              onMouseEnter={(e) => (e.currentTarget.style.color = textHover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
              aria-label="Notifications"
              onClick={() => setNotifPanelOpen(true)}
            >
              <Bell size={18} />
              {reviews.some((r) => r.status === "pending") && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full" style={{ background: "#D12027", transform: "translate(25%, -25%)" }}></span>
              )}
            </button>
          )}

          {/* Admin — Desktop */}
          {perms.navbar.admin && (
            <a
              id={ADMIN_BUTTON.id}
              href={ADMIN_BUTTON.href}
              className="hidden md:flex relative py-2 text-sm lg:text-[15px] tracking-[0.08em] uppercase transition-colors duration-300"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                color: textColor,
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = textHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = textColor)
              }
            >
              {ADMIN_BUTTON.label}
            </a>
          )}

          {/* Profile — Desktop */}
          {perms.navbar.profile && (
            <a
              id={PROFILE_BUTTON.id}
              href={PROFILE_BUTTON.href}
              className="hidden md:flex relative py-2 text-sm lg:text-[15px] tracking-[0.08em] uppercase transition-colors duration-300"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                color: textColor,
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = textHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = textColor)
              }
            >
              {PROFILE_BUTTON.label}
            </a>
          )}

          {/* Login/Logout — Desktop */}
          <a
            id={LOGIN_BUTTON.id}
            href="#"
            className="hidden md:flex relative py-2 text-sm lg:text-[15px] tracking-[0.08em] uppercase transition-colors duration-300"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              color: loginColor,
              fontWeight: 500,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = loginHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = loginColor)
            }
            onClick={(e) => {
              e.preventDefault();
              if (isAuthenticated) {
                logout();
              } else {
                login();
              }
            }}
          >
            {isAuthenticated ? "Logout" : LOGIN_BUTTON.label}
          </a>

          {/* Hamburger — Mobile (non-admin pages) */}
          {!isAdminPage && (
            <button
              id="mobile-menu-toggle"
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 group"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
            <span
              className="block w-6 h-[2px] transition-all duration-300 origin-center"
              style={{
                backgroundColor: textColor,
                transform: isMobileMenuOpen
                  ? "translateY(8px) rotate(45deg)"
                  : "none",
              }}
            />
            <span
              className="block w-6 h-[2px] transition-all duration-300"
              style={{
                backgroundColor: textColor,
                opacity: isMobileMenuOpen ? 0 : 1,
                transform: isMobileMenuOpen ? "scaleX(0)" : "scaleX(1)",
              }}
            />
            <span
              className="block w-6 h-[2px] transition-all duration-300 origin-center"
              style={{
                backgroundColor: textColor,
                transform: isMobileMenuOpen
                  ? "translateY(-8px) rotate(-45deg)"
                  : "none",
              }}
            />
          </button>
          )}

          {/* Admin Hamburger — Mobile (admin pages only) */}
          {isAdminPage && onAdminMenuToggle && (
            <button
              id="admin-mobile-menu-toggle"
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
              onClick={onAdminMenuToggle}
              aria-label="Toggle admin menu"
            >
              <span
                className="block w-6 h-[2px] transition-all duration-300 origin-center"
                style={{
                  backgroundColor: textColor,
                  transform: adminMenuOpen ? "translateY(8px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block w-6 h-[2px] transition-all duration-300"
                style={{
                  backgroundColor: textColor,
                  opacity: adminMenuOpen ? 0 : 1,
                  transform: adminMenuOpen ? "scaleX(0)" : "scaleX(1)",
                }}
              />
              <span
                className="block w-6 h-[2px] transition-all duration-300 origin-center"
                style={{
                  backgroundColor: textColor,
                  transform: adminMenuOpen ? "translateY(-8px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          )}
        </div>
      </div>

    </nav>

      {/* ── Mobile Side Drawer ── */}
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Drawer Panel */}
      <div
        className="md:hidden"
        style={{
          position: "fixed", top: 0, right: 0, height: "100%",
          zIndex: 50,
          display: "flex", flexDirection: "column",
          width: "82vw", maxWidth: "360px",
          boxShadow: "-16px 0 48px rgba(0,0,0,0.18)",
          transform: isMobileMenuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
          willChange: "transform",
        }}
      >
        <LiquidGlass 
          backgroundColor={isDarkPage ? "rgba(15, 15, 15, 0.65)" : "rgba(255, 251, 242, 0.65)"} 
          borderColor={isDarkPage ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)"}
        />
        {/* ── Drawer Header (red branded area) ── */}
        <div
          style={{
            position: "relative", display: "flex", flexDirection: "column",
            justifyContent: "flex-end",
            padding: "56px 24px 24px 24px", flexShrink: 0,
            background: "linear-gradient(135deg, #D12027 0%, #8a0e13 100%)",
            minHeight: "160px",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: "absolute", top: "20px", right: "20px",
              width: "32px", height: "32px",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", border: "none", cursor: "pointer",
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* OIA Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.15)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, color: "white", fontSize: "16px", lineHeight: 1.3, margin: 0 }}>
                {isAuthenticated ? "Welcome Back!" : "OIA — Bennett"}
              </p>
              <p style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.7)", fontSize: "12px", margin: "2px 0 0 0" }}>
                Office of International Affairs
              </p>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.5)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>
            Bennett University · Greater Noida
          </p>
        </div>

        {/* ── Nav Links ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 8px" }}>
          {NAV_ITEMS.map((item) => {
            const navItemColor = isDarkPage ? "rgba(255,255,255,0.85)" : "var(--foreground)";
            const icons: Record<string, React.ReactNode> = {
              "nav-home": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D12027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
              "nav-programs": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D12027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
              "nav-events": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D12027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
              "nav-partners": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D12027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
              "nav-team": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D12027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
              "nav-ias": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D12027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
            };
            return item.dropdown ? (
              <div key={item.id}>
                <button
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderRadius: "12px", border: "none", cursor: "pointer",
                    backgroundColor: "transparent",
                    color: navItemColor,
                    fontFamily: "var(--font-space-grotesk)", fontWeight: 500,
                  }}
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {icons[item.id]}
                    <span style={{ fontSize: "15px", letterSpacing: "0.02em" }}>{item.label}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedItem === item.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", opacity: 0.4 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {expandedItem === item.id && (
                  <div style={{ display: "flex", flexDirection: "column", marginLeft: "44px", marginRight: "16px", marginBottom: "4px", borderRadius: "12px", overflow: "hidden", backgroundColor: isDarkPage ? "rgba(255,255,255,0.05)" : "rgba(209,32,39,0.05)" }}>
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem.label}
                        href={subItem.href}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", fontSize: "14px", textDecoration: "none", color: isDarkPage ? "rgba(255,255,255,0.7)" : "var(--foreground)", fontFamily: "var(--font-space-grotesk)", fontWeight: 500 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, backgroundColor: "#D12027", display: "inline-block" }}/>
                        {subItem.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={item.id}
                id={`${item.id}-mobile`}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 16px", borderRadius: "12px", textDecoration: "none",
                  color: navItemColor,
                  fontFamily: "var(--font-space-grotesk)", fontWeight: 500,
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {icons[item.id]}
                <span style={{ fontSize: "15px", letterSpacing: "0.02em" }}>{item.label}</span>
              </a>
            );
          })}

          {/* Admin */}
          {perms.navbar.admin && (
            <a
              id={`${ADMIN_BUTTON.id}-mobile`}
              href={ADMIN_BUTTON.href}
              style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", textDecoration: "none", color: isDarkPage ? "rgba(255,255,255,0.85)" : "var(--foreground)", fontFamily: "var(--font-space-grotesk)", fontWeight: 500 }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D12027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
              <span style={{ fontSize: "15px", letterSpacing: "0.02em" }}>{ADMIN_BUTTON.label}</span>
            </a>
          )}

          {/* Profile */}
          {perms.navbar.profile && (
            <a
              id={`${PROFILE_BUTTON.id}-mobile`}
              href={PROFILE_BUTTON.href}
              style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", textDecoration: "none", color: isDarkPage ? "rgba(255,255,255,0.85)" : "var(--foreground)", fontFamily: "var(--font-space-grotesk)", fontWeight: 500 }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D12027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span style={{ fontSize: "15px", letterSpacing: "0.02em" }}>{PROFILE_BUTTON.label}</span>
            </a>
          )}
        </div>

        {/* ── Separator + Logout at the bottom ── */}
        <div style={{ flexShrink: 0, padding: "0 16px 32px 16px" }}>
          <div style={{ width: "100%", height: "1px", marginBottom: "16px", backgroundColor: isDarkPage ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }} />
          <button
            id={`${LOGIN_BUTTON.id}-mobile`}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "14px",
              padding: "14px 16px", borderRadius: "12px", border: "none", cursor: "pointer",
              color: "#D12027",
              fontFamily: "var(--font-space-grotesk)", fontWeight: 600,
              backgroundColor: "rgba(209,32,39,0.07)",
            }}
            onClick={(e) => {
              e.preventDefault();
              setIsMobileMenuOpen(false);
              if (isAuthenticated) { logout(); } else { login(); }
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D12027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isAuthenticated
                ? <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>
                : <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>}
            </svg>
            <span style={{ fontSize: "15px", letterSpacing: "0.02em" }}>{isAuthenticated ? "Logout" : "Login"}</span>
          </button>
        </div>
      </div>

    {/* Super Admin Notification Panel */}
    {role === 'super_admin' && (
      <NotificationPanel
        isOpen={notifPanelOpen}
        onClose={() => setNotifPanelOpen(false)}
        reviews={reviews}
      />
    )}
    </>
  );
}
