"use client";

import React from "react";
import { User, StudentRecord, Application, Notification } from "../types";
import GlassCard from "./GlassCard";
import { User as UserIcon, FileText, Bell, LogOut, CheckCircle2, Pencil } from "lucide-react";
import { useAuth } from "@/app/admin/roles/AuthContext";

interface SidebarProps {
  user: User;
  student: StudentRecord;
  application: Application;
  notifications: Notification[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Sidebar({
  user,
  student,
  application,
  notifications,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const { logout } = useAuth();
  const [displayName, setDisplayName] = React.useState(user.display_name);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [mobile, setMobile] = React.useState(user.mobile || "");
  const [isEditingMobile, setIsEditingMobile] = React.useState(false);
  const [photoUri, setPhotoUri] = React.useState(user.photo_uri);

  const hasUnreadNotifications = notifications.some((n) => !n.read);

  const NavItem = ({ id, label, icon: Icon, hasDot = false }: any) => {
    const isActive = activeTab === id;
    const [isHovered, setIsHovered] = React.useState(false);

    const bg = isActive
      ? "rgba(209, 32, 39, 0.08)"
      : isHovered ? "rgba(255, 255, 255, 0.55)" : "transparent";
    const border = isActive
      ? "1px solid rgba(209, 32, 39, 0.20)"
      : "1px solid transparent";
    const color = isActive
      ? "#7A8C5E"
      : isHovered ? "var(--foreground)" : "rgba(57, 57, 57, 0.7)";
    const iconColor = isActive
      ? "#7A8C5E"
      : "rgba(57, 57, 57, 0.6)";

    return (
      <button
        onClick={() => onTabChange(id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full flex items-center gap-3 transition-all duration-200"
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          marginBottom: "4px",
          background: bg,
          border: border,
          color: color,
          fontFamily: "var(--font-space-grotesk)",
          fontWeight: 600,
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <Icon size={18} style={{ color: iconColor }} />
        <span>{label}</span>
        {hasDot && hasUnreadNotifications && (
          <span className="w-2 h-2 rounded-full" style={{ background: "#9A7A20", marginLeft: "auto" }}></span>
        )}
      </button>
    );
  };

  const [isLogoutHovered, setIsLogoutHovered] = React.useState(false);

  return (
    <div
      className="hidden md:flex w-full"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "28px 16px",
        boxSizing: "border-box",
        background: "rgba(255, 251, 242, 0.35)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.45)",
        boxShadow: "0 8px 32px rgba(57,57,57,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
        borderRadius: "16px",
      }}
    >
      {/* 1. Profile Block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            border: "2px solid #D12027",
            overflow: "hidden",
            flexShrink: 0,
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            position: "relative",
          }}
        >
          {photoUri ? (
            <img
              src={photoUri}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-[rgba(255, 251, 242, 0.8)] rounded-full flex items-center justify-center">
              <UserIcon size={32} color="rgba(57, 57, 57, 0.7)" />
            </div>
          )}
          {/* Overlay to upload photo */}
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 hover:opacity-100 rounded-full cursor-pointer transition-opacity">
            <span style={{ fontSize: '10px', textAlign: 'center', lineHeight: 1.1 }}>Change<br />Photo</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const url = URL.createObjectURL(e.target.files[0]);
                setPhotoUri(url);
              }
            }} />
          </label>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {isEditingName ? (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
              autoFocus
              className="text-xl font-bold bg-transparent outline-none border-b border-[#7A8C5E] text-center w-full"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "var(--foreground)" }}
            />
          ) : (
            <div
              className="group relative flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsEditingName(true)}
              title="Click to edit name"
            >
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-space-grotesk)", margin: 0, color: "var(--foreground)" }}
              >
                {displayName}
              </h2>
              <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 absolute -right-5" />
            </div>
          )}

          {isEditingMobile ? (
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onBlur={() => setIsEditingMobile(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingMobile(false); }}
              autoFocus
              className="text-sm bg-transparent outline-none border-b border-[#7A8C5E] text-center w-full"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "var(--foreground)", marginBottom: "4px" }}
            />
          ) : (
            <div
              className="group relative flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsEditingMobile(true)}
              title="Click to edit mobile"
              style={{ marginBottom: "4px" }}
            >
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-space-grotesk)", margin: 0, color: "rgba(57, 57, 57, 0.8)" }}
              >
                {mobile || "Add Mobile"}
              </p>
              <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 absolute -right-5" />
            </div>
          )}

          <p
            className="text-[11px] uppercase tracking-[0.1em]"
            style={{
              color: "rgba(57, 57, 57, 0.6)",
              fontFamily: "var(--font-space-grotesk)",
              margin: 0,
            }}
          >
            {student.enrollment_id} &middot; {student.department}
          </p>
        </div>


      </div>

      {/* 2. Divider */}
      <div
        style={{
          width: "100%",
          height: "1px",
          background: "rgba(255, 251, 242, 0.8)",
          marginBottom: "20px",
        }}
      ></div>

      {/* 3. Navigation */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <NavItem id="status" label="Application Status" icon={CheckCircle2} />
        <NavItem id="notifications" label="Notifications" icon={Bell} hasDot={true} />
      </div>

      {/* 4. Bottom Stats */}
      <div style={{ marginTop: "auto" }}>


        <button
          onClick={() => logout()}
          className="flex items-center justify-center gap-2 w-full py-2 transition-colors"
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          style={{
            color: isLogoutHovered ? "#7A8C5E" : "rgba(57, 57, 57, 0.4)",
            fontFamily: "var(--font-space-grotesk)",
            textTransform: "uppercase",
            fontSize: "11px",
            letterSpacing: "0.1em",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
