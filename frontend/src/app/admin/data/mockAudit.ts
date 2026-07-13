export type AuditAction = "Approved" | "Requested Changes" | "Submitted" | "Rejected" | "Archived" | "Unarchived";
export type ItemType = "Event" | "Program" | "MOU";

export interface AuditLog {
  id: string;
  itemId: string;
  action: AuditAction;
  itemTitle: string;
  itemType: ItemType;
  performedBy: {
    name: string;
    role: string;
  };
  timestamp: string; // ISO string
  details: string;
}

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "adt-001",
    itemId: "rev-001",
    action: "Approved",
    itemTitle: "International Tech Conference 2026",
    itemType: "Event",
    performedBy: {
      name: "Alice SuperAdmin",
      role: "Super Admin",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    details: "Approved event for publishing. Budget verified: $5000. Venue: Main Hall.",
  },
  {
    id: "adt-002",
    itemId: "rev-002",
    action: "Requested Changes",
    itemTitle: "Summer Exchange Program in Paris",
    itemType: "Program",
    performedBy: {
      name: "Alice SuperAdmin",
      role: "Super Admin",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    details: "Requested changes on eligibility criteria. Required CGPA needs to be 7.5, not 7.0.",
  },
  {
    id: "adt-003",
    itemId: "rev-003",
    action: "Submitted",
    itemTitle: "MOU with Singapore National University",
    itemType: "MOU",
    performedBy: {
      name: "Bob Editor",
      role: "Editor",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    details: "Submitted MOU draft for final approval. Duration: 5 years.",
  },
  {
    id: "adt-004",
    itemId: "rev-004",
    action: "Archived",
    itemTitle: "Winter 2024 Tech Symposium",
    itemType: "Event",
    performedBy: {
      name: "Charlie Admin",
      role: "Admin",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    details: "Archived past event as it concluded successfully.",
  },
  {
    id: "adt-005",
    itemId: "rev-005",
    action: "Rejected",
    itemTitle: "Unofficial Campus Meetup",
    itemType: "Event",
    performedBy: {
      name: "Alice SuperAdmin",
      role: "Super Admin",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
    details: "Rejected due to non-compliance with university guidelines regarding safety.",
  },
];
