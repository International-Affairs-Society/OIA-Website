export interface LivingCost {
  item: string;
  cost: string;
  costINR: string;
}

export interface POC {
  name: string;
  designation: string;
  email: string;
  contactNumber: string;
}

export interface ProgramData {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  images?: string[];
  // Eligibility fields (admin can enter multiple)
  schools?: string[];
  programType?: string;
  semesters?: string[];
  courses?: string[];
  // Content
  overview: string;
  highlights: string[];
  programFee: string;
  feeBreakdownHtml: string; // Rich HTML from admin — renders exactly as entered
  livingCosts?: LivingCost[];
  estimatedStayCost?: string;
  lastDate: string;
  ourPOCs?: POC[];
}

export const MOCK_PROGRAMS: ProgramData[] = [
  {
    id: "hse-summer-school",
    title: "HSE St. Petersburg Summer School",
    category: "Summer Program",
    date: "June 15, 2025",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547448415-e9f5b28e570d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520106212299-d99c443e4568?q=80&w=1000&auto=format&fit=crop"
    ],
    schools: ["SCSET", "SOAI", "SEAS"],
    programType: "Semester Exchange",
    semesters: ["Semester 4", "Semester 5", "Semester 6"],
    courses: ["B.Tech", "BCA", "M.Tech"],
    overview:
      "The HSE St. Petersburg Summer School 2026 runs from 6th July to 7th August 2026 and offers in-person, English-taught courses across multiple disciplines carrying ECTS credits. Upon completion, participants receive a Transcript of Records and Certificate. A cultural programme including boat trips along the Neva River and museum visits during St. Petersburg's famous White Nights season is also included.",
    highlights: [
      "In-person, English-taught courses with ECTS credits",
      "Cultural programme includes boat trips and museum visits",
      "Access to St. Petersburg's iconic White Nights season",
      "Transcript of Records and Certificate upon completion",
      "Opportunity to study alongside international peers from 20+ countries",
      "10% group discount for 5 or more Bennett students registering together",
    ],
    programFee: "₹28,675 – ₹50,669",
    feeBreakdownHtml: `<p><strong>Tuition Fee (per course):</strong></p>
<ul>
  <li>Language &amp; Culture (1 session, 2 weeks) — <strong>24,720 RUB</strong> (~₹28,675)</li>
  <li>Language &amp; Culture (both sessions, 4 weeks) — <strong>43,680 RUB</strong> (~₹50,669)</li>
  <li>All other courses (2 weeks each) — <strong>32,400 RUB</strong> (~₹37,584)</li>
</ul>
<p><strong>Registration Fee:</strong> 3,000 RUB (~₹3,480) — <em>one-time, non-refundable</em></p>
<p><strong>Group Discount:</strong> If 5 or more Bennett students register together, an additional <strong>10% discount</strong> will be applicable on the tuition fee.</p>`,
    livingCosts: [
      { item: "University Dormitory", cost: "1,200–6,600 RUB/month", costINR: "₹1,400–₹7,650" },
      { item: "Food & Groceries", cost: "10,000–20,000 RUB/month", costINR: "₹11,600–₹23,200" },
      { item: "Local Transport (Student Pass)", cost: "1,600–2,500 RUB/month", costINR: "₹1,850–₹2,900" },
      { item: "Dining Out (per meal)", cost: "300–500 RUB", costINR: "₹350–₹580" },
      { item: "SIM Card & Internet", cost: "500–700 RUB/month", costINR: "₹580–₹810" },
    ],
    estimatedStayCost:
      "Estimated total for a 2-week stay: ₹8,000–₹18,000 approx. Estimated total for a 4-week stay: ₹15,000–₹35,000 approx.",
    lastDate: "16th April 2026",
    ourPOCs: [
      { name: "Dr. Sunita Sharma", designation: "Global Exchange Coordinator", email: "sunita.sharma@bennett.edu.in", contactNumber: "+91 9876543210" },
      { name: "Alice Johnson", designation: "Admin", email: "alice@bennett.edu.in", contactNumber: "+91 9876543211" }
    ]
  },
  {
    id: "semester-exchange-london",
    title: "Semester Exchange — University of London",
    category: "Semester Exchange",
    date: "September 1, 2025",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c476?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop"
    ],
    schools: ["SOM", "SCSET"],
    programType: "Semester Exchange",
    semesters: ["Semester 5", "Semester 6"],
    courses: ["BBA", "B.Tech", "BCA"],
    overview:
      "The Semester Exchange programme at the University of London provides Bennett students a chance to spend one full academic semester studying at one of London's premier institutions. Students can choose from a wide range of electives across departments, earn transferable credits, and immerse themselves in British academic culture.",
    highlights: [
      "Full semester immersion at a top-tier London institution",
      "Transferable credits accepted by Bennett University",
      "Access to world-class libraries and research centres",
      "Orientation sessions and integration into campus life",
      "15% tuition fee waiver for students with CGPA 8.5+",
    ],
    programFee: "£2,400 per module (~₹2,52,000)",
    feeBreakdownHtml: `<p><strong>Tuition Fee:</strong> £2,400 per module (~₹2,52,000)</p>
<p>Students typically enrol in <strong>3–5 modules</strong> per semester.</p>
<p><strong>Registration Fee:</strong> £150 (~₹15,750) — <em>one-time, non-refundable</em></p>
<p><strong>Merit Waiver:</strong> Bennett students with <strong>CGPA 8.5+</strong> are eligible for a <strong>15% tuition fee waiver</strong>.</p>`,
    livingCosts: [
      { item: "University Accommodation", cost: "£600–£900/month", costINR: "₹63,000–₹94,500" },
      { item: "Food & Groceries", cost: "£200–£350/month", costINR: "₹21,000–₹36,750" },
      { item: "Transport (Oyster Card)", cost: "£70–£140/month", costINR: "₹7,350–₹14,700" },
      { item: "Mobile & Internet", cost: "£15–£30/month", costINR: "₹1,575–₹3,150" },
    ],
    estimatedStayCost:
      "Estimated total for one semester (4 months): ₹3,70,000–₹5,95,000 approx.",
    lastDate: "30th May 2025",
  },
  {
    id: "daad-research-munich",
    title: "DAAD Research Internship — TU Munich",
    category: "Research Internship",
    date: "May 20, 2025",
    image: "https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop"
    ],
    schools: ["SCSET", "SEAS", "SOAI"],
    programType: "International Internship",
    semesters: ["Semester 6", "Semester 7", "Semester 8"],
    courses: ["B.Tech", "M.Tech"],
    overview:
      "The DAAD-funded Research Internship at Technical University of Munich offers Bennett students an opportunity to work alongside leading researchers in cutting-edge labs. The 8–12 week programme covers disciplines from engineering and computer science to biotechnology and environmental sciences.",
    highlights: [
      "Fully funded by the DAAD (German Academic Exchange Service)",
      "Monthly stipend of approximately ₹75,000",
      "Work directly with leading researchers at TU Munich",
      "Research certificate and letter of recommendation upon completion",
      "Airfare reimbursement up to €1,200",
      "Covers engineering, computer science, biotech, and environmental sciences",
    ],
    programFee: "Fully Funded (DAAD Stipend)",
    feeBreakdownHtml: `<p><strong>Tuition:</strong> Fully Funded — No tuition fee required.</p>
<p><strong>DAAD Monthly Stipend:</strong> ~₹75,000/month</p>
<p><strong>Airfare Reimbursement:</strong> Up to <strong>€1,200</strong> (~₹1,08,000)</p>
<p><strong>Registration Fee:</strong> €50 (~₹4,500) — <em>one-time</em></p>
<p><em>The DAAD stipend covers tuition, travel, and most living costs. No additional university fee is required.</em></p>`,
    lastDate: "15th February 2025",
  },
  {
    id: "dual-degree-deakin",
    title: "Dual Degree — Deakin University",
    category: "Dual Degree",
    date: "February 10, 2025",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525926472898-7c8bfcc29b11?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519452314545-fb405c75e243?q=80&w=1000&auto=format&fit=crop"
    ],
    schools: ["SCSET", "SOM"],
    programType: "Pathways Program",
    semesters: ["Semester 5", "Semester 6", "Semester 7"],
    courses: ["B.Tech", "BBA", "MBA"],
    overview:
      "The Dual Degree programme with Deakin University, Australia allows Bennett students to earn two degrees — one from Bennett University and one from Deakin — upon completing a structured curriculum split across both campuses.",
    highlights: [
      "Earn two internationally recognised degrees simultaneously",
      "Study at Deakin's Geelong or Melbourne campus in Australia",
      "Available for B.Tech CSE, BBA, and MBA specialisations",
      "20% scholarship for students maintaining Distinction average (70%+)",
      "Seamless credit transfer between Bennett and Deakin",
    ],
    programFee: "AUD $33,400–$42,600/year",
    feeBreakdownHtml: `<p><strong>Deakin Tuition Fees (per year at Deakin campus):</strong></p>
<ul>
  <li>B.Tech CSE + Master of IT — <strong>AUD $34,600/year</strong> (~₹18,50,000)</li>
  <li>BBA + Bachelor of Commerce — <strong>AUD $33,400/year</strong> (~₹17,80,000)</li>
  <li>MBA + MBA — <strong>AUD $42,600/year</strong> (~₹22,70,000)</li>
</ul>
<p><strong>Registration Fee:</strong> AUD $200 (~₹10,700) — <em>one-time</em></p>
<p><strong>Scholarship:</strong> Deakin offers a <strong>20% scholarship</strong> for Bennett Dual Degree students maintaining a <strong>Distinction average (70%+)</strong>.</p>`,
    livingCosts: [
      { item: "On-Campus Accommodation", cost: "AUD $180–$350/week", costINR: "₹9,600–₹18,700/week" },
      { item: "Food & Groceries", cost: "AUD $100–$200/week", costINR: "₹5,350–₹10,700/week" },
      { item: "Transport (myki Pass)", cost: "AUD $50–$80/month", costINR: "₹2,670–₹4,280/month" },
      { item: "Health Insurance (OSHC)", cost: "AUD $550/year", costINR: "₹29,400/year" },
    ],
    estimatedStayCost:
      "Estimated annual living cost in Melbourne/Geelong: ₹8,00,000–₹12,00,000 approx.",
    lastDate: "30th November 2024",
  },
  {
    id: "study-tour-singapore",
    title: "Faculty-Led Study Tour — Singapore",
    category: "Study Tour",
    date: "March 8, 2025",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545084920-56ef6d78efed?q=80&w=1000&auto=format&fit=crop"
    ],
    schools: ["SOM", "SCSET", "SOLA", "TSOM"],
    programType: "Global Immersion",
    semesters: ["Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"],
    courses: ["BBA", "B.Tech", "B.A. Liberal Arts", "B.A. Mass Communication"],
    overview:
      "This 10-day faculty-led study tour to Singapore provides students with hands-on exposure to innovation ecosystems, global business hubs, and smart city infrastructure. Participants visit NUS, NTU, and leading tech companies and startups.",
    highlights: [
      "10-day immersive tour led by Bennett faculty members",
      "Visit NUS, NTU, and leading Singapore tech companies",
      "Workshops on entrepreneurship, urban planning, and cross-cultural management",
      "Cultural excursions: Gardens by the Bay, Sentosa, Chinatown",
      "Open to all UG & PG students — no minimum CGPA required",
      "Early bird and group discounts available",
    ],
    programFee: "₹85,000 (all-inclusive)",
    feeBreakdownHtml: `<p><strong>Programme Fee:</strong> ₹85,000 — <em>all-inclusive package</em></p>
<p>This covers:</p>
<ul>
  <li>Accommodation (hotel stay for 10 days)</li>
  <li>Breakfast and select meals</li>
  <li>All institutional and company visits</li>
  <li>Local transport within Singapore</li>
  <li>Workshop and certification fees</li>
</ul>
<p><strong>Not included:</strong> International airfare, visa fees, personal expenses</p>
<p><strong>Registration Fee:</strong> ₹5,000 — <em>non-refundable, adjustable against total fee</em></p>
<p><strong>Early Bird Discount:</strong> ₹10,000 off for registrations before 15th January 2025.</p>
<p><strong>Group Discount:</strong> 5% off for 8 or more students registering together.</p>`,
    lastDate: "1st February 2025",
  },
  {
    id: "winter-school-helsinki",
    title: "Winter School — University of Helsinki",
    category: "Winter Program",
    date: "January 5, 2026",
    image: "https://images.unsplash.com/photo-1551524559-8af4e6624178?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551524559-8af4e6624178?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517554592471-2ed104258957?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=1000&auto=format&fit=crop"
    ],
    schools: ["SOLA", "TSOM", "SOD"],
    programType: "Semester Exchange",
    semesters: ["Semester 3", "Semester 4"],
    courses: ["B.A. Liberal Arts", "B.A. Mass Communication", "B.Des"],
    overview:
      "The University of Helsinki Winter School offers a 3-week intensive programme in January, combining academic coursework with the unique Finnish experience of the polar winter. Courses focus on sustainability, Nordic governance, AI & society, and Arctic studies.",
    highlights: [
      "3-week intensive programme during the Finnish polar winter",
      "Courses on sustainability, Nordic governance, AI & society, and Arctic studies",
      "Day trip to Tallinn, Estonia included",
      "Optional Northern Lights excursion to Lapland",
      "Access to Helsinki's world-class academic libraries",
      "10% early bird discount + €200 reduction for CGPA 8.0+ students",
    ],
    programFee: "€950 per course (~₹85,500)",
    feeBreakdownHtml: `<p><strong>Tuition Fee:</strong> €950 per course (~₹85,500)</p>
<p>Students may enrol in <strong>1 or 2 courses</strong> during the 3-week programme.</p>
<p><strong>Registration Fee:</strong> €100 (~₹9,000) — <em>one-time, non-refundable</em></p>
<p><strong>Early Bird Discount:</strong> <strong>10% off</strong> tuition for applications received <strong>2 months before deadline</strong>.</p>
<p><strong>Bennett Merit Reduction:</strong> Students with <strong>CGPA 8.0+</strong> receive an additional <strong>€200 tuition reduction</strong>.</p>`,
    livingCosts: [
      { item: "Student Housing (HOAS)", cost: "€350–€550/month", costINR: "₹31,500–₹49,500" },
      { item: "Food & Groceries", cost: "€250–€400/month", costINR: "₹22,500–₹36,000" },
      { item: "Transport (HSL Monthly Pass)", cost: "€35/month (student)", costINR: "₹3,150" },
      { item: "Winter Clothing (if needed)", cost: "€100–€300 (one-time)", costINR: "₹9,000–₹27,000" },
    ],
    estimatedStayCost:
      "Estimated total for 3 weeks: ₹50,000–₹90,000 approx. (excluding Lapland excursion).",
    lastDate: "15th October 2025",
  },
];
