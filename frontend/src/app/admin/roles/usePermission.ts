"use client";
// ============================================================
// usePermission — Hook to check role-based access.
// Usage:
//   const { allowed, readOnly } = usePermission("admin:events");
//   const { allowed } = usePermission("navbar:profile");
// ============================================================

import { useAuth } from "./AuthContext";
import { PERMISSIONS } from "./permissions";

type NavbarKey = "profile" | "admin" | "notification";
type AdminKey = "analytics" | "events" | "programs" | "applications" | "mou" | "students" | "users" | "reviews";

type PermissionKey = `navbar:${NavbarKey}` | `admin:${AdminKey}` | "profile";

interface PermissionResult {
  allowed: boolean;
  readOnly: boolean;
}

export function usePermission(key: PermissionKey): PermissionResult {
  const { role } = useAuth();
  const perms = PERMISSIONS[role];

  if (key === "profile") {
    return { allowed: perms.canAccessProfile, readOnly: false };
  }

  const [section, field] = key.split(":") as [string, string];

  if (section === "navbar") {
    const val = perms.navbar[field as NavbarKey];
    return { allowed: val, readOnly: false };
  }

  if (section === "admin") {
    const val = perms.admin[field as AdminKey];
    return { allowed: val, readOnly: !perms.admin.canEdit };
  }

  return { allowed: false, readOnly: false };
}
