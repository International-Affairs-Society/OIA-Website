export const UNIVERSITY_COORDS: Record<string, { coords: [number, number]; country: string; continent: string }> = {
  "University of Essex": { coords: [51.886, 0.9045], country: "UK", continent: "Europe" },
  "Yeshiva University": { coords: [40.8502, -73.929], country: "USA", continent: "Americas" },
  "Western Sydney University": { coords: [-33.8688, 150.7931], country: "Australia", continent: "Oceania" },
  "University of Wollongong": { coords: [-34.4059, 150.8775], country: "Australia", continent: "Oceania" },
  "University of Waikato": { coords: [-37.787, 175.2793], country: "New Zealand", continent: "Oceania" },
  "Babson College": { coords: [42.2993, -71.2673], country: "USA", continent: "Americas" },
  "Georgia Tech": { coords: [33.7756, -84.3963], country: "USA", continent: "Americas" },
  "Monash University": { coords: [-37.9105, 145.1363], country: "Australia", continent: "Oceania" },
  "University of Waikato College": { coords: [-37.787, 175.2793], country: "New Zealand", continent: "Oceania" },
};

export const MOCK_MOUS = [
  { id: "1", name: "Essex Exchange MOU", partner_university: "University of Essex", status: "active" as const },
  { id: "2", name: "Yeshiva Research MOU", partner_university: "Yeshiva University", status: "active" as const },
  { id: "3", name: "WSU Collaboration", partner_university: "Western Sydney University", status: "active" as const },
  { id: "4", name: "Wollongong Partnership", partner_university: "University of Wollongong", status: "expired" as const },
  { id: "5", name: "Waikato Student Exchange", partner_university: "University of Waikato", status: "active" as const },
  { id: "6", name: "Babson Entrepreneurship", partner_university: "Babson College", status: "draft" as const },
  { id: "7", name: "Georgia Tech STEM", partner_university: "Georgia Tech", status: "active" as const },
  { id: "8", name: "Monash Dual Degree", partner_university: "Monash University", status: "active" as const },
  { id: "9", name: "Waikato College Prep", partner_university: "University of Waikato College", status: "dormant" as const },
];

export const MOCK_TREND_DATA = [
  { month: "Jan", thisYear: 12, lastYear: 8 },
  { month: "Feb", thisYear: 18, lastYear: 11 },
  { month: "Mar", thisYear: 15, lastYear: 14 },
  { month: "Apr", thisYear: 22, lastYear: 16 },
  { month: "May", thisYear: 28, lastYear: 19 },
  { month: "Jun", thisYear: 24, lastYear: 21 },
  { month: "Jul", thisYear: 16, lastYear: 12 },
  { month: "Aug", thisYear: 20, lastYear: 15 },
  { month: "Sep", thisYear: 25, lastYear: 18 },
  { month: "Oct", thisYear: 30, lastYear: 22 },
  { month: "Nov", thisYear: 19, lastYear: 17 },
  { month: "Dec", thisYear: 13, lastYear: 10 },
];

export const MOCK_STATUS_DATA = [
  { name: "Approved", value: 87, color: "#5c6b47" },
  { name: "Pending", value: 38, color: "#a89b7a" },
  { name: "Rejected", value: 17, color: "#c0392b" },
];

export const MOCK_SCHOOL_DATA = [
  { school: "CSE", count: 42 },
  { school: "ECE", count: 28 },
  { school: "Law", count: 19 },
  { school: "Management", count: 15 },
  { school: "Media", count: 11 },
  { school: "Liberal Arts", count: 8 },
];

export const MOCK_BOTTLENECK_DATA = [
  { stage: "IAS Review", avgDays: 18.2 },
  { stage: "Faculty Approval", avgDays: 12.4 },
  { stage: "Document Verification", avgDays: 8.7 },
  { stage: "Dean Sign-off", avgDays: 5.1 },
  { stage: "Final Decision", avgDays: 3.2 },
];

export const MOCK_APPLICATIONS_LIST = [
  { id: "1", appNo: "APP-001", studentName: "Alice Johnson", program: "Global Exchange 2024", appliedOn: "2024-03-15", status: "pending", course: "B.Tech", sem: 4, passport: "Yes", cgpa: 8.5, enrollmentNo: "E2022001", gender: "Female", school: "SCSE" },
  { id: "2", appNo: "APP-002", studentName: "Bob Smith", program: "Summer Internship", appliedOn: "2024-03-14", status: "approved", course: "BBA", sem: 6, passport: "No", cgpa: 7.2, enrollmentNo: "E2021045", gender: "Male", school: "SOM" },
  { id: "3", appNo: "APP-003", studentName: "Charlie Davis", program: "Cultural Immersion", appliedOn: "2024-03-12", status: "rejected", course: "BA LLB", sem: 2, passport: "Yes", cgpa: 6.8, enrollmentNo: "E2023102", gender: "Male", school: "SOL" },
  { id: "4", appNo: "APP-004", studentName: "Diana Prince", program: "Global Exchange 2024", appliedOn: "2024-04-01", status: "pending", course: "B.Tech", sem: 6, passport: "Yes", cgpa: 9.1, enrollmentNo: "E2021099", gender: "Female", school: "SCSE" },
  { id: "5", appNo: "APP-005", studentName: "Evan Wright", program: "Research Fellowship", appliedOn: "2024-04-05", status: "approved", course: "M.Tech", sem: 2, passport: "Yes", cgpa: 8.8, enrollmentNo: "M2023012", gender: "Male", school: "SCSE" },
  { id: "6", appNo: "APP-006", studentName: "Fiona Gallagher", program: "Summer Internship", appliedOn: "2024-04-10", status: "pending", course: "BAJMC", sem: 4, passport: "No", cgpa: 7.9, enrollmentNo: "J2022055", gender: "Female", school: "SLA" },
  { id: "7", appNo: "APP-007", studentName: "George Miller", program: "Cultural Immersion", appliedOn: "2024-04-12", status: "rejected", course: "BBA", sem: 2, passport: "No", cgpa: 6.5, enrollmentNo: "E2023088", gender: "Male", school: "SOM" },
  { id: "8", appNo: "APP-008", studentName: "Hannah Abbott", program: "Global Exchange 2024", appliedOn: "2024-04-15", status: "approved", course: "B.Tech", sem: 4, passport: "Yes", cgpa: 8.9, enrollmentNo: "E2022145", gender: "Female", school: "SCSE" },
  { id: "9", appNo: "APP-009", studentName: "Ian Malcolm", program: "Research Fellowship", appliedOn: "2024-04-18", status: "pending", course: "PhD", sem: 1, passport: "Yes", cgpa: 9.5, enrollmentNo: "P2024001", gender: "Male", school: "SCSE" },
  { id: "10", appNo: "APP-010", studentName: "Julia Roberts", program: "Summer Internship", appliedOn: "2024-04-20", status: "approved", course: "BBA", sem: 6, passport: "Yes", cgpa: 8.2, enrollmentNo: "E2021111", gender: "Female", school: "SOM" },
];

export const MOCK_EVENTS_LIST = [
  { id: "1", title: "Global Tech Summit 2026", date: "2026-10-12", location: "Main Hall", mou: "Global Tech Inc. MOU", is_archived: false, event_type: "upcoming" },
  { id: "2", title: "Cultural Exchange Day", date: "2026-11-20", location: "Campus Square", mou: "EduCorp MOU", is_archived: false, event_type: "upcoming" },
  { id: "3", title: "Winter Symposium", date: "2026-12-05", location: "Auditorium", mou: "None", is_archived: false, event_type: "upcoming" },
  { id: "4", title: "Spring Research Fair", date: "2027-03-15", location: "Exhibition Center", mou: "University of London MOU", is_archived: false, event_type: "upcoming" },
  { id: "5", title: "AI & Future of Tech", date: "2027-05-10", location: "Main Hall", mou: "Tech Innovators Inc.", is_archived: false, event_type: "upcoming" },
  { id: "6", title: "Leadership Workshop", date: "2026-02-15", location: "Seminar Room 1", mou: "Babson College MOU", is_archived: true, event_type: "past" },
  { id: "7", title: "Annual Partner Meetup", date: "2025-11-10", location: "Grand Hotel", mou: "None", is_archived: true, event_type: "past" },
  { id: "8", title: "Global Study Abroad Fair", date: "2025-09-05", location: "Campus Square", mou: "Multiple MOUs", is_archived: true, event_type: "past" },
  { id: "9", title: "Faculty Exchange Seminar", date: "2026-01-20", location: "Conference Hall A", mou: "Georgia Tech MOU", is_archived: true, event_type: "past" },
  { id: "10", title: "Cultural Immersion Kickoff", date: "2026-04-12", location: "Auditorium", mou: "Kyoto University MOU", is_archived: true, event_type: "past" },
];

export const MOCK_MOUS_LIST = [
  { 
    id: "1", 
    name: "Global Tech Inc. MOU", 
    partner: "Global Tech Inc.", 
    status: "Active", 
    country: "United States",
    duration: "5 Years",
    startDate: "2023-01-01", 
    expiryDate: "2028-01-01", 
    is_archived: false,
    type: "Global Exchange",
    applicableSemesters: ["Semester 4", "Semester 5", "Semester 6"],
    partnerPOC: {
      name: "John Doe",
      designation: "Director of International Relations",
      email: "johndoe@globaltech.edu",
      contactNumber: "+1 (555) 123-4567"
    },
    ourPOCs: [
      {
        name: "Prof. Rajesh Kumar",
        designation: "Dean of SCSET",
        email: "rajesh.kumar@bennett.edu.in",
        contactNumber: "+91 9876543210"
      },
      {
        name: "Dr. Sunita Sharma",
        designation: "Global Exchange Coordinator",
        email: "sunita.sharma@bennett.edu.in",
        contactNumber: "+91 9876543211"
      }
    ],
    attachedDocuments: [
      { name: "MOU_Signed_Agreement.pdf", url: "#" },
      { name: "Financial_Terms_Addendum.pdf", url: "#" }
    ]
  },
  { 
    id: "2", 
    name: "EduCorp MOU", 
    partner: "EduCorp", 
    status: "Expiring in 90 days", 
    country: "United Kingdom",
    duration: "2 Years",
    startDate: "2024-06-01", 
    expiryDate: "2026-06-01", 
    is_archived: false,
    type: "Summer Internship",
    applicableSemesters: ["Semester 4", "Semester 6"],
    partnerPOC: {
      name: "Jane Smith",
      designation: "Head of Partnerships",
      email: "jsmith@educorp.org",
      contactNumber: "+44 20 7946 0958"
    },
    ourPOCs: [
      {
        name: "Prof. Anil Desai",
        designation: "Internship Coordinator",
        email: "anil.desai@bennett.edu.in",
        contactNumber: "+91 9876543212"
      }
    ],
    attachedDocuments: [
      { name: "Draft_MOU_EduCorp.docx", url: "#" }
    ]
  },
  { 
    id: "3", 
    name: "Old Partners MOU", 
    partner: "University of XYZ", 
    status: "Expired", 
    country: "Japan",
    duration: "5 Years",
    startDate: "2015-01-01", 
    expiryDate: "2020-01-01", 
    is_archived: true,
    type: "Cultural Immersion",
    applicableSemesters: ["Semester 2", "Semester 3"],
    partnerPOC: {
      name: "Takeshi Kovacs",
      designation: "Exchange Admin",
      email: "kovacs@uni-xyz.ac.jp",
      contactNumber: "+81 90-1234-5678"
    },
    ourPOCs: [
      {
        name: "Dr. Sunita Sharma",
        designation: "Global Exchange Coordinator",
        email: "sunita.sharma@bennett.edu.in",
        contactNumber: "+91 9876543211"
      }
    ],
    attachedDocuments: [
      { name: "Archived_MOU_XYZ.pdf", url: "#" }
    ]
  },
  { 
    id: "4", 
    name: "Georgia Tech MOU", 
    partner: "Georgia Tech", 
    status: "Active", 
    country: "United States",
    duration: "4 Years",
    startDate: "2022-01-01", 
    expiryDate: "2026-01-01", 
    is_archived: false,
    type: "Student Exchange",
    applicableSemesters: ["Semester 4", "Semester 6"],
    partnerPOC: {
      name: "Amanda Richards",
      designation: "Exchange Officer",
      email: "arichards@gatech.edu",
      contactNumber: "+1 (404) 894-2000"
    },
    ourPOCs: [
      {
        name: "Prof. Rajesh Kumar",
        designation: "Dean of SCSET",
        email: "rajesh.kumar@bennett.edu.in",
        contactNumber: "+91 9876543210"
      }
    ],
    attachedDocuments: [
      { name: "GaTech_Agreement.pdf", url: "#" }
    ]
  },
  { 
    id: "5", 
    name: "Monash Dual Degree", 
    partner: "Monash University", 
    status: "Active", 
    country: "Australia",
    duration: "5 Years",
    startDate: "2023-01-01", 
    expiryDate: "2028-01-01", 
    is_archived: false,
    type: "Dual Degree Track",
    applicableSemesters: ["Semester 6", "Semester 8"],
    partnerPOC: {
      name: "Dr. Liam Hemsworth",
      designation: "International Programs",
      email: "liam@monash.edu.au",
      contactNumber: "+61 3 9902 6000"
    },
    ourPOCs: [
      {
        name: "Dr. Sunita Sharma",
        designation: "Global Exchange Coordinator",
        email: "sunita.sharma@bennett.edu.in",
        contactNumber: "+91 9876543211"
      }
    ],
    attachedDocuments: [
      { name: "Monash_Dual_Degree_Signed.pdf", url: "#" }
    ]
  },
];

export const MOCK_PROGRAMS_LIST = [
  { id: "1", name: "Global Exchange 2024", duration: "6 months", partner: "University of London", mou: "UOL MOU", is_archived: false },
  { id: "2", name: "Summer Internship", duration: "2 months", partner: "Tech Innovators Inc.", mou: "TII MOU", is_archived: false },
  { id: "3", name: "Cultural Immersion", duration: "4 weeks", partner: "Kyoto University", mou: "None", is_archived: true },
  { id: "4", name: "Semester Abroad", duration: "6 months", partner: "Georgia Tech", mou: "Georgia Tech MOU", is_archived: false },
  { id: "5", name: "Dual Degree Track", duration: "2 years", partner: "Monash University", mou: "Monash Dual Degree", is_archived: false },
  { id: "6", name: "Language & Culture", duration: "3 weeks", partner: "University of Tokyo", mou: "None", is_archived: false },
  { id: "7", name: "Research Fellowship", duration: "1 year", partner: "Harvard University", mou: "Harvard Collab", is_archived: false },
  { id: "8", name: "Global Tech Bootcamp", duration: "8 weeks", partner: "Stanford", mou: "Stanford Tech MOU", is_archived: false },
  { id: "9", name: "European Exchange", duration: "5 months", partner: "University of Essex", mou: "Essex Exchange MOU", is_archived: false },
  { id: "10", name: "Archived Old Program", duration: "6 months", partner: "Unknown", mou: "None", is_archived: true },
];

export const MOCK_STUDENTS_LIST = [
  { id: "1", name: "Alice Johnson", email: "alice@bennett.edu.in", school: "SCSE", degree: "B.Tech CSE", program: "Global Exchange", course: "B.Tech", sem: 4, mobile: "+91 9876543210" },
  { id: "2", name: "Bob Smith", email: "bob@bennett.edu.in", school: "SOM", degree: "BBA", program: "Summer Internship", course: "BBA", sem: 6, mobile: "+91 9876543211" },
  { id: "3", name: "Charlie Davis", email: "charlie@bennett.edu.in", school: "SOL", degree: "BA LLB", program: "None", course: "BA LLB", sem: 2, mobile: "+91 9876543212" },
  { id: "4", name: "Diana Prince", email: "diana@bennett.edu.in", school: "SCSE", degree: "B.Tech CSE", program: "Global Exchange", course: "B.Tech", sem: 6, mobile: "+91 9876543213" },
  { id: "5", name: "Evan Wright", email: "evan@bennett.edu.in", school: "SCSE", degree: "M.Tech", program: "Research Fellowship", course: "M.Tech", sem: 2, mobile: "+91 9876543214" },
  { id: "6", name: "Fiona Gallagher", email: "fiona@bennett.edu.in", school: "SLA", degree: "BAJMC", program: "Summer Internship", course: "BAJMC", sem: 4, mobile: "+91 9876543215" },
  { id: "7", name: "George Miller", email: "george@bennett.edu.in", school: "SOM", degree: "BBA", program: "Cultural Immersion", course: "BBA", sem: 2, mobile: "+91 9876543216" },
  { id: "8", name: "Hannah Abbott", email: "hannah@bennett.edu.in", school: "SCSE", degree: "B.Tech CSE", program: "Global Exchange", course: "B.Tech", sem: 4, mobile: "+91 9876543217" },
  { id: "9", name: "Ian Malcolm", email: "ian@bennett.edu.in", school: "SCSE", degree: "PhD", program: "Research Fellowship", course: "PhD", sem: 1, mobile: "+91 9876543218" },
  { id: "10", name: "Julia Roberts", email: "julia@bennett.edu.in", school: "SOM", degree: "BBA", program: "Summer Internship", course: "BBA", sem: 6, mobile: "+91 9876543219" },
];

export const MOCK_USERS_LIST = [
  { id: "1", name: "Alice Johnson", email: "alice@bennett.edu.in", role: "admin" },
  { id: "2", name: "Bob Smith", email: "bob@bennett.edu.in", role: "staff" },
  { id: "3", name: "Charlie Davis", email: "charlie@bennett.edu.in", role: "student" },
];

export const MOCK_MOU_YEAR_DATA = [
  { year: "2020", signed: 12 },
  { year: "2021", signed: 19 },
  { year: "2022", signed: 28 },
  { year: "2023", signed: 38 },
  { year: "2024", signed: 55 },
];

export const MOCK_MOU_TYPE_DATA = [
  { type: "Student Exchange", count: 40, color: "#2563eb" },
  { type: "Faculty Exchange", count: 25, color: "#16a34a" },
  { type: "Joint Research", count: 20, color: "#d97706" },
  { type: "Cultural Immersion", count: 15, color: "#9333ea" },
];

export const MOCK_MOU_STATUS_SUMMARY = { total: 100, active: 65, expiringIn90Days: 10, expired: 15, draft: 10 };

export const MOCK_APP_PROGRAM_BREAKDOWN = [
  { name: "Global Exchange 2024", value: 120, color: "#2563eb" },
  { name: "Summer Internship", value: 85, color: "#16a34a" },
  { name: "Cultural Immersion", value: 45, color: "#9333ea" },
  { name: "Research Fellowship", value: 30, color: "#d97706" },
];

export const MOCK_APP_SEMESTER_DATA = [
  { name: "Semester 2", value: 40, color: "#60a5fa" },
  { name: "Semester 4", value: 110, color: "#3b82f6" },
  { name: "Semester 6", value: 90, color: "#2563eb" },
  { name: "Semester 8", value: 40, color: "#1d4ed8" },
];

export const MOCK_APP_GENDER_DATA = [
  { name: "Male", value: 145, color: "#3b82f6" },
  { name: "Female", value: 125, color: "#ec4899" },
  { name: "Other", value: 10, color: "#8b5cf6" },
];

export const MOCK_PROGRAM_TYPE_DATA = [
  { name: "Semester Exchange", value: 35, color: "#2563eb" },
  { name: "Summer Program", value: 45, color: "#f59e0b" },
  { name: "Short-term Immersion", value: 20, color: "#10b981" },
];

export const MOCK_PROGRAM_YEAR_DATA = [
  { year: "2022", created: 5 },
  { year: "2023", created: 12 },
  { year: "2024", created: 18 },
];

export const MOCK_PROGRAM_SCHOOL_COVERAGE = [
  { school: "SCSE", programs: 15 },
  { school: "SOM", programs: 8 },
  { school: "SOL", programs: 6 },
  { school: "SLA", programs: 4 },
];

export const MOCK_PROGRAM_STATUS_SUMMARY = { total: 45, active: 25, archived: 12, comingSoon: 8, avgDuration: "3.5 Months" };

export const MOCK_VISITS_LIST = [
  {
    id: "1",
    university: "Harvard University",
    date: "2024-10-15",
    photos: ["https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80"],
    status: "approved",
    delegations: [
      { name: "Dr. Alan Grant", designation: "Dean of Sciences", email: "agrant@harvard.edu", country: "USA", university: "Harvard University" }
    ],
    ourPOCs: [
      { name: "Prof. Rajesh Kumar", designation: "Dean of SCSET", email: "rajesh.kumar@bennett.edu.in", contactNumber: "+91 9876543210" }
    ],
    purpose: "Discussing dual-degree programs and research collaboration in biotechnology.",
    highlights: ["Agreed on a framework for student exchange.", "Planned a joint research symposium for 2025."],
    reports: [{ name: "Visit_Report_Harvard.pdf", url: "#" }]
  },
  {
    id: "2",
    university: "National University of Singapore",
    date: "2024-11-20",
    photos: ["https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80"],
    status: "pending",
    delegations: [
      { name: "Prof. Tan Eng Chye", designation: "President", email: "tan.eng@nus.edu.sg", country: "Singapore", university: "NUS" },
      { name: "Dr. Sarah Lee", designation: "Head of International Relations", email: "sarah.lee@nus.edu.sg", country: "Singapore", university: "NUS" }
    ],
    ourPOCs: [
      { name: "Dr. Sunita Sharma", designation: "Global Exchange Coordinator", email: "sunita.sharma@bennett.edu.in", contactNumber: "+91 9876543211" }
    ],
    purpose: "Establishing a semester exchange program for computing students.",
    highlights: ["Finalized MOU draft.", "Reviewed curriculum mapping for CS courses."],
    reports: [{ name: "NUS_Delegation_Minutes.pdf", url: "#" }]
  },
  {
    id: "3",
    university: "University of London",
    date: "2024-09-10",
    photos: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"],
    status: "approved",
    delegations: [
      { name: "John Smith", designation: "Director", email: "john@uol.edu", country: "UK", university: "UOL" }
    ],
    ourPOCs: [
      { name: "Dr. Sunita Sharma", designation: "Global Exchange Coordinator", email: "sunita.sharma@bennett.edu.in", contactNumber: "+91 9876543211" }
    ],
    purpose: "Reviewing ongoing MOU and expanding into new disciplines.",
    highlights: ["Expanded MOU to include media studies.", "Set targets for next year."],
    reports: [{ name: "UOL_Visit_Notes.pdf", url: "#" }]
  },
  {
    id: "4",
    university: "Georgia Tech",
    date: "2025-01-15",
    photos: ["https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"],
    status: "pending",
    delegations: [
      { name: "Amanda Richards", designation: "Exchange Officer", email: "arichards@gatech.edu", country: "USA", university: "Georgia Tech" }
    ],
    ourPOCs: [
      { name: "Prof. Rajesh Kumar", designation: "Dean of SCSET", email: "rajesh.kumar@bennett.edu.in", contactNumber: "+91 9876543210" }
    ],
    purpose: "Planning the upcoming Summer Bootcamp series.",
    highlights: ["Agreed on curriculum.", "Finalized dates for summer 2025."],
    reports: [{ name: "GaTech_Summary.pdf", url: "#" }]
  }
];
