// ============================================================
// ROLE-BASED ACCESS CONTROL — Permissions Configuration
// Single source of truth for all role permissions.
// When backend is integrated, nothing here changes.
// ============================================================

export type Role = 'general' | 'student' | 'editor' | 'admin' | 'super_admin' | 'viewer';

export interface NavbarPermissions {
  profile: boolean;
  admin: boolean;
  notification: boolean;
  showLogout: boolean; // all authenticated users see logout
}

export interface AdminPermissions {
  analytics: boolean;
  events: boolean;
  programs: boolean;
  applications: boolean;
  mou: boolean;
  students: boolean;
  users: boolean;
  reviews: boolean;
  submissions: boolean;
  archived: boolean;
  audit: boolean;
  visits: boolean;
  leads: boolean;
  canEdit: boolean; // false = read-only mode for viewer
}

export interface RolePermissions {
  navbar: NavbarPermissions;
  admin: AdminPermissions;
  canAccessProfile: boolean; // can access /student/profile page
}

export const PERMISSIONS: Record<Role, RolePermissions> = {
  general: {
    navbar: { profile: false, admin: false, notification: false, showLogout: true },
    admin: { analytics: false, events: false, programs: false, applications: false, mou: false, students: false, users: false, reviews: false, submissions: false, archived: false, audit: false, visits: false, leads: false, canEdit: false },
    canAccessProfile: false,
  },
  student: {
    navbar: { profile: true, admin: false, notification: true, showLogout: true },
    admin: { analytics: false, events: false, programs: false, applications: false, mou: false, students: false, users: false, reviews: false, submissions: false, archived: false, audit: false, visits: false, leads: false, canEdit: false },
    canAccessProfile: true,
  },
  editor: {
    navbar: { profile: true, admin: true, notification: true, showLogout: true },
    admin: { analytics: false, events: true, programs: true, applications: false, mou: false, students: false, users: false, reviews: false, submissions: true, archived: false, audit: false, visits: false, leads: false, canEdit: true },
    canAccessProfile: true,
  },
  admin: {
    navbar: { profile: false, admin: true, notification: false, showLogout: true },
    admin: { analytics: true, events: true, programs: true, applications: true, mou: true, students: true, users: false, reviews: false, submissions: true, archived: false, audit: false, visits: true, leads: true, canEdit: true },
    canAccessProfile: false,
  },
  super_admin: {
    navbar: { profile: false, admin: true, notification: true, showLogout: true },
    admin: { analytics: true, events: true, programs: true, applications: true, mou: true, students: true, users: true, reviews: true, submissions: false, archived: true, audit: true, visits: true, leads: true, canEdit: true },
    canAccessProfile: false,
  },
  viewer: {
    navbar: { profile: false, admin: true, notification: false, showLogout: true },
    admin: { analytics: true, events: false, programs: false, applications: false, mou: true, students: false, users: false, reviews: false, submissions: false, archived: false, audit: false, visits: true, leads: false, canEdit: false },
    canAccessProfile: false,
  },
};

// Helper: get allowed admin sidebar paths for a role
export function getAllowedAdminPaths(role: Role): string[] {
  const perms = PERMISSIONS[role].admin;
  const paths: string[] = [];
  if (perms.analytics) paths.push('/admin');
  if (perms.events) paths.push('/admin/events');
  if (perms.programs) paths.push('/admin/programs');
  if (perms.applications) paths.push('/admin/applications');
  if (perms.mou) paths.push('/admin/mou');
  if (perms.students) paths.push('/admin/students');
  if (perms.users) paths.push('/admin/users');
  if (perms.reviews) paths.push('/admin/reviews');
  if (perms.submissions) paths.push('/admin/submissions');
  if (perms.archived) paths.push('/admin/archived');
  if (perms.audit) paths.push('/admin/audit');
  if (perms.visits) paths.push('/admin/visits');
  if (perms.leads) paths.push('/admin/leads');
  return paths;
}

// Helper: check if a role can access any admin section
export function canAccessAdmin(role: Role): boolean {
  return getAllowedAdminPaths(role).length > 0;
}
