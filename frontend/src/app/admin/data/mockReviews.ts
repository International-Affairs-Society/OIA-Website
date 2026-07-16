// ============================================================
// MOCK DATA — Approval Requests & Review Items
// Replace with API calls when backend is ready.
// ============================================================

export type ReviewType = "program" | "upcoming_event" | "past_event" | "mou" | "visit";
export type ReviewStatus = "pending" | "approved" | "rejected" | "changes_requested";

export interface ReviewComment {
  id: string;
  author: string;
  role: "super_admin" | "editor" | "admin";
  text: string;
  timestamp: string;
}

export interface ReviewItem {
  id: string;
  type: ReviewType;
  title: string;
  submittedBy: {
    name: string;
    email: string;
    role: "editor" | "admin";
  };
  submittedAt: string;
  status: ReviewStatus;
  comments: ReviewComment[];
  data: Record<string, any>; // The actual content submitted for review
}

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "rev-001",
    type: "program",
    title: "HSE Summer School 2026",
    submittedBy: {
      name: "Raman Gupta",
      email: "raman.gupta@bennett.edu.in",
      role: "editor",
    },
    submittedAt: "2026-06-22T14:30:00Z",
    status: "pending",
    comments: [],
    data: {
      title: "HSE Summer School 2026",
      programType: "Summer Program",
      startDate: "2026-06-15",
      lastDate: "16th April 2026",
      schools: ["SCSET", "SOAI", "SOM"],
      semesters: ["Semester 4", "Semester 6"],
      courses: ["B.Tech", "BCA", "BBA"],
      overview: "An immersive summer program at HSE University focusing on AI, data science, and cross-cultural collaboration. Students will engage in hands-on workshops, industry visits, and cultural excursions across Moscow.",
      highlights: ["Fully funded travel", "Cultural immersion in Moscow", "Industry visits to Yandex HQ", "Certificate from HSE University"],
      feeSummary: "₹28,675 – ₹50,669",
      feeBreakdown: "Tuition Fee: ₹0 (Covered under MOU)\nAccommodation: ₹8,000 - ₹18,000 approx.\nVisa Fee: ₹3,500",
      showLivingCost: true,
      estimatedStayCost: "₹8,000 – ₹18,000 approx.",
      livingCostDetails: "Food & Groceries | 10,000 RUB/month | ₹11,600\nTransportation | 2,500 RUB/month | ₹2,900\nSIM Card | 500 RUB | ₹580",
      useDefaultForm: true,
      customFields: ["Why do you want to join this program?", "Previous international experience (if any)"],
    },
  },
  {
    id: "rev-002",
    type: "upcoming_event",
    title: "International Research Symposium 2026",
    submittedBy: {
      name: "Priya Sharma",
      email: "priya.sharma@bennett.edu.in",
      role: "admin",
    },
    submittedAt: "2026-06-21T10:15:00Z",
    status: "pending",
    comments: [],
    data: {
      title: "International Research Symposium 2026",
      description: "A three-day international symposium bringing together researchers from 20+ countries to present cutting-edge work in AI, Robotics, and Sustainable Development.",
      location: "Bennett University, Greater Noida",
      date: "2026-08-15",
      linkedMOU: "UOL MOU",
      archived: false,
    },
  },
  {
    id: "rev-003",
    type: "past_event",
    title: "Global Leadership Summit 2025",
    submittedBy: {
      name: "Raman Gupta",
      email: "raman.gupta@bennett.edu.in",
      role: "editor",
    },
    submittedAt: "2026-06-20T16:45:00Z",
    status: "pending",
    comments: [],
    data: {
      title: "Global Leadership Summit 2025",
      description: "An intensive leadership summit that brought together 150+ students from 12 countries for workshops on global governance, sustainability, and entrepreneurship.",
      location: "New Delhi, India",
      date: "2025-12-10",
      linkedMOU: "UOL MOU",
      archived: false,
      addToHomepage: true,
    },
  },
  {
    id: "rev-004",
    type: "mou",
    title: "Partnership with MIT Media Lab",
    submittedBy: {
      name: "Priya Sharma",
      email: "priya.sharma@bennett.edu.in",
      role: "admin",
    },
    submittedAt: "2026-06-19T09:00:00Z",
    status: "pending",
    comments: [],
    data: {
      name: "MIT Media Lab Partnership MOU",
      partner: "Massachusetts Institute of Technology",
      status: "Draft",
      startDate: "2026-09-01",
      expiryDate: "2031-08-31",
      notes: "Strategic partnership for joint research in AI and human-computer interaction. Includes student exchange program for 5 students per year from each institution.",
    },
  },
  // ── Changes Requested items ──
  {
    id: "rev-005",
    type: "program",
    title: "TU Berlin Winter Program 2026",
    submittedBy: {
      name: "Raman Gupta",
      email: "raman.gupta@bennett.edu.in",
      role: "editor",
    },
    submittedAt: "2026-06-15T11:00:00Z",
    status: "changes_requested",
    comments: [
      {
        id: "cmt-001",
        author: "Dr. Anita Verma",
        role: "super_admin",
        text: "Please update the fee breakdown — the visa fee has increased to ₹4,200 as per the latest embassy notification. Also, add SEAS to the eligible schools list.",
        timestamp: "2026-06-16T09:30:00Z",
      },
      {
        id: "cmt-002",
        author: "Dr. Anita Verma",
        role: "super_admin",
        text: "The program overview mentions 'Berlin campus' — TU Berlin uses 'Charlottenburg campus'. Please correct this.",
        timestamp: "2026-06-17T14:00:00Z",
      },
    ],
    data: {
      title: "TU Berlin Winter Program 2026",
      programType: "Winter Program",
      startDate: "2026-12-01",
      lastDate: "30th September 2026",
      schools: ["SCSET", "SOAI"],
      semesters: ["Semester 5", "Semester 7"],
      courses: ["B.Tech", "M.Tech"],
      overview: "A winter program at TU Berlin campus focusing on sustainable engineering and renewable energy systems.",
      highlights: ["DAAD scholarship eligible", "Industry visits to Siemens", "Certificate from TU Berlin"],
      feeSummary: "₹35,000 – ₹55,000",
      feeBreakdown: "Tuition Fee: ₹0 (DAAD covered)\nAccommodation: ₹12,000/month\nVisa Fee: ₹3,500",
      showLivingCost: false,
      useDefaultForm: true,
      customFields: ["Statement of Purpose"],
    },
  },
  {
    id: "rev-006",
    type: "upcoming_event",
    title: "AI & Ethics Global Forum 2026",
    submittedBy: {
      name: "Priya Sharma",
      email: "priya.sharma@bennett.edu.in",
      role: "admin",
    },
    submittedAt: "2026-06-14T08:30:00Z",
    status: "changes_requested",
    comments: [
      {
        id: "cmt-003",
        author: "Dr. Anita Verma",
        role: "super_admin",
        text: "The event date conflicts with our convocation week. Please propose an alternative date and update the description to reflect the new timeline.",
        timestamp: "2026-06-15T10:00:00Z",
      },
    ],
    data: {
      title: "AI & Ethics Global Forum 2026",
      description: "A full-day forum exploring the intersection of artificial intelligence and ethical governance, featuring keynote speakers from Oxford, Stanford, and IIT Delhi.",
      location: "Bennett University, Greater Noida",
      date: "2026-09-20",
      linkedMOU: "",
      archived: false,
    },
  },
  // ── Approved items ──
  {
    id: "rev-007",
    type: "mou",
    title: "University of London Exchange Agreement",
    submittedBy: {
      name: "Raman Gupta",
      email: "raman.gupta@bennett.edu.in",
      role: "editor",
    },
    submittedAt: "2026-06-10T12:00:00Z",
    status: "approved",
    comments: [],
    data: {
      name: "University of London Exchange Agreement",
      partner: "University of London",
      status: "Active",
      date: "2024-05-20",
      endDate: "2029-05-19",
      notes: "Standard agreement covering faculty exchange and joint research initiatives.",
    },
  },
  {
    id: "rev-005",
    type: "visit",
    title: "Visit by MIT Delegation",
    submittedBy: {
      name: "Shrish",
      email: "shrish@bennett.edu.in",
      role: "admin",
    },
    submittedAt: "2026-07-14T09:00:00Z",
    status: "pending",
    comments: [],
    data: {
      university: "Massachusetts Institute of Technology (MIT)",
      visitDate: "2026-08-20",
      purpose: "To discuss potential research collaborations and student exchange programs in AI and Robotics.",
      highlights: ["Campus Tour", "Meeting with Vice Chancellor", "Lab demonstrations"],
      delegations: [
        { name: "Dr. John Doe", designation: "Dean of Engineering", email: "jdoe@mit.edu" }
      ],
      ourPOCs: [
        { name: "Prof. R.S. Sharma", email: "rs.sharma@bennett.edu.in" }
      ]
    },
  },
  {
    id: "rev-008",
    type: "past_event",
    title: "Bennett International Week 2025",
    submittedBy: {
      name: "Priya Sharma",
      email: "priya.sharma@bennett.edu.in",
      role: "admin",
    },
    submittedAt: "2026-06-08T15:00:00Z",
    status: "approved",
    comments: [],
    data: {
      title: "Bennett International Week 2025",
      description: "A week-long celebration of global partnerships featuring cultural showcases, panel discussions, and student presentations from 8 partner universities.",
      location: "Bennett University, Greater Noida",
      date: "2025-11-15",
      linkedMOU: "UOL MOU",
      archived: false,
      addToHomepage: false,
    },
  },
];
