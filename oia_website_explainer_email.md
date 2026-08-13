# Email — OIA Student Portal Technical Overview

---

**Subject:** OIA Student Portal — How It Works & What's Inside

---

Hi everyone,

We wanted to share a clear overview of how the OIA Student Portal works — what it does, how data flows through it, and what technology powers it. This is meant to give students and faculty a useful picture of the platform without going too deep into the technical weeds.

---

## 🌐 What is the OIA Student Portal?

The OIA Student Portal is a full-stack web application built for Bennett University's Office of International Affairs. It serves two distinct user groups:

1. **The Public** — prospective and current students who visit the homepage to browse international programs, events, partner universities, and MOUs.
2. **Internal Staff / Students** — authenticated users (students, editors, admins, super admins) who log in to manage applications, documents, programs, events, and more through a role-protected internal dashboard.

---

## 🖥️ The Public-Facing Website (Homepage)

When a visitor opens the website, they land on a richly animated homepage built in Next.js. Here is what loads and how:

### 1. Homepage Sections
The homepage is divided into multiple animated sections, each pulling live data from the backend:

- **Hero Section** — An animated globe built with Three.js/react-globe.gl showing the university's international reach with animated arcs.
- **Events Section** — A fan-card layout displaying the 5 most recent past events fetched from `/api/v1/events?eventType=past`. Cards auto-rotate and are interactive.
- **Upcoming Event Section** — A countdown timer to the next upcoming event, fetched from `/api/v1/events`. Falls back to a static placeholder if no upcoming events exist.
- **Programs Section** — An animated node-network visualization of exchange programs (Semester Exchange, Summer School, etc.) with floating animated labels.
- **Partners Section** — An orbiting logo wheel showing 23 partner university logos, with a D3-powered world map plotting partner locations.
- **Footer** — Links, social media, contact info.

### 2. How the Frontend Fetches Data
Every public section makes a `fetch()` call from the browser to the Express backend API (`http://localhost:3001`). To handle the backend warming up on cold starts, every fetch includes **retry logic with exponential backoff** — it retries up to 3 times at 1s, 2s, and 4s intervals before giving up gracefully.

---

## 🔐 Authentication & Role System

The application uses **Supabase Auth** with **Microsoft SSO (OAuth)**. Here's the exact flow:

```
Student visits /login
  → Redirected to Microsoft OAuth via Supabase
  → Microsoft authenticates the user
  → Supabase issues a JWT access token
  → Token stored in an HttpOnly cookie
  → Frontend's AuthWrapper reads the session and redirects the user
     to their respective dashboard based on their role:
       STUDENT    → /student/profile
       EDITOR     → /admin (limited write access)
       ADMIN      → /admin (full access)
       SUPER_ADMIN→ /admin (system-level access)
       VIEWER     → /admin (read-only)
```

The backend verifies the JWT on every protected request using `jsonwebtoken` + Supabase's JWT secret. No passwords are stored — identity is fully delegated to Supabase Auth.

### User Roles (6 levels)
| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Everything — role management, approvals, system config |
| `ADMIN` | Full CRUD on all data, approve change requests |
| `EDITOR` | Submit changes for approval (cannot directly apply changes) |
| `VIEWER` | Read-only access to admin panels |
| `GENERAL` | Basic authenticated user |
| `STUDENT` | Own profile, applications, documents only |

---

## 🏛️ The Admin Dashboard

Authenticated staff/admins land on a large, feature-rich admin panel at `/admin`. It includes:

| Section | What It Does |
|---------|-------------|
| **Programs** | Create/edit international exchange programs, manage seat counts, open/close dates |
| **Applications** | View all student applications, move them through stages (RECEIVED → VERIFIED → OFFER → VISA → ENROLLED) |
| **Students** | View student profiles and academic records |
| **Events** | Create, edit, publish/draft events (public or internal) |
| **MOUs** | Manage Memoranda of Understanding with partner universities — track expiry, attach PDFs |
| **Universities** | Partner university master list with coordinates (plotted on the world map) |
| **Documents** | Review student-submitted documents (passport, transcript, SOP, etc.) and mark them verified |
| **Notifications** | Send bulk or targeted notifications to students or specific users |
| **Change Requests** | EDITOR-submitted changes awaiting ADMIN/SUPER_ADMIN approval |
| **Audit Log** | Full history of who changed what and when |
| **Visits** | Track and log university visits / delegation meetings |
| **Reviews** | Staff/admin reviews tied to programs or universities |
| **Drafts** | Save works-in-progress (events, programs) before publishing |
| **Analytics** | Dashboard-level charts (application counts, stage distribution, etc.) |
| **Roles** | SUPER_ADMIN-only: promote/demote user roles |

---

## 📦 Full Document Upload Flow

When a student uploads a document (e.g., passport scan):

```
1. Student selects file in browser
2. POST /api/v1/documents (multipart/form-data) → Express
3. Multer middleware handles file → stores to local /tmp disk
4. A new document record is created in the DB (status: PENDING)
5. A job is pushed to the BullMQ "fileProcessing" queue in Redis
6. Express responds 202 Accepted immediately (non-blocking)
7. Background: fileWorker picks up the job from the queue
8. Worker reads the temp file → uploads it to Cloudflare R2 (private bucket)
9. Worker deletes the /tmp file
10. If upload fails → worker creates a SYSTEM_ALERT notification for the student
    and re-throws the error so BullMQ can retry
11. Admin sees document in the "Pending Verification" queue
12. Admin verifies → document status changes to VERIFIED
13. Student's application can proceed to next stage
```

---

## 🗄️ Database Schema (PostgreSQL via Supabase)

The database has **11 main tables**:

| Table | Purpose |
|-------|---------|
| `users` | All users — UUID matches Supabase Auth |
| `student_records` | One-to-one with users; enrollment ID, department, batch year |
| `universities` | Partner university master list with lat/lng for map |
| `mous` | MOUs — signed date, expiry date, status, alerts sent flags |
| `programs` | Exchange programs always tied to an MOU |
| `events` | Public/draft events, optionally MOU-linked |
| `applications` | Student × Program (one per student per program, UNIQUE constraint) |
| `documents` | Files owned by users, optionally linked to an application |
| `stage_history` | Full audit trail for every application stage change |
| `notifications` | System notification log (bulk, transactional, MOU alerts) |
| `change_requests` | EDITOR change proposals awaiting approval |

MOU expiry alerts are automated: background jobs check for MOUs expiring within 180, 90, and 30 days, send notifications, and flip boolean flags so alerts are not sent twice.

---

## ⚙️ Tech Stack

### Frontend

| Technology | Role |
|-----------|------|
| **Next.js 16.2** (React 19) | Framework — SSR + App Router |
| **TypeScript 5** | Type safety across all components |
| **Tailwind CSS v4** | Utility-first styling |
| **GSAP 3** + **ScrollTrigger** | High-performance scroll animations |
| **Framer Motion** | Component-level transitions |
| **Lenis** | Smooth scroll inertia |
| **Three.js** + **OGL** | WebGL (animated globe, particle effects) |
| **react-globe.gl** | 3D interactive globe on homepage |
| **D3.js** | World map SVG rendering, data-driven visuals |
| **Recharts** | Analytics dashboard charts |
| **Supabase JS Client** | Authentication (Microsoft OAuth / JWT session management) |
| **Lucide React** | Icon library |
| **Sharp** | Server-side image optimization |

### Backend

| Technology | Role |
|-----------|------|
| **Node.js (ESM)** | Runtime |
| **Express v5** | HTTP server + REST API |
| **Prisma v7** + **@prisma/adapter-pg** | ORM — type-safe database queries |
| **PostgreSQL** (via Supabase) | Primary database |
| **Supabase Auth** | User identity, Microsoft SSO, JWT issuance |
| **BullMQ v5** | Job queue for background file processing |
| **ioredis** | Redis client for BullMQ + dual rate limiting |
| **Multer** | Multipart file upload handling |
| **AWS SDK S3 / Cloudflare R2** | Private file storage (documents, MOU PDFs, logos) |
| **jsonwebtoken** | JWT verification on protected routes |
| **Helmet** | Secure HTTP headers |
| **express-rate-limit** | Global IP-level rate limiting (15min window) |
| **Custom dualRateLimiter** | Per-user + per-IP rate limiting via Redis pipelines |
| **Zod v4** | Request body validation and schema enforcement |
| **Winston** | Structured application logging |
| **Vitest** | Unit testing framework |
| **dotenv / dotenvx** | Environment variable management |

### Infrastructure & Cloud

| Service | Role |
|---------|------|
| **Supabase** | Managed PostgreSQL + Auth (Microsoft OAuth) + Row-Level Security |
| **Cloudflare R2** | S3-compatible private object storage (all uploaded files) |
| **Redis** | Queue persistence (BullMQ) + rate limiting counters |
| **GitHub** | Version control (`International-Affairs-Society/OIA-Website`) |

---

## 🔄 Request Lifecycle (End-to-End Example)

**Scenario: Student submits a program application**

```
Browser                      Next.js Frontend              Express Backend            Supabase (PostgreSQL)
  |                               |                               |                         |
  |-- POST /api/v1/applications ->|                               |                         |
  |   (with Authorization cookie) |                               |                         |
  |                               |-- proxy to :3001 ----------->|                         |
  |                               |                          authenticateUser middleware     |
  |                               |                          (verify JWT with Supabase secret)
  |                               |                          dualRateLimiter middleware      |
  |                               |                          (check Redis: IP + UUID counts) |
  |                               |                               |                         |
  |                               |                          Zod validates request body      |
  |                               |                               |                         |
  |                               |                          Prisma.application.create() --->|
  |                               |                               |              (INSERT, UNIQUE check,
  |                               |                               |               stage_history INSERT,
  |                               |                               |               seats_remaining decrement)
  |                               |                               |<--------------------------|
  |                               |<-- 201 Created JSON ----------|                         |
  |<-- Rendered success UI -------|                               |                         |
```

---

## 🚧 Features Currently In Progress

The portal's UI is largely complete, but the following areas are still being wired to the live backend. They currently display placeholder/mock data:

| Feature | Status |
|---------|--------|
| **Admin Analytics Dashboard** | Charts and stat cards are built, but populated with hardcoded figures (application trends, stage distribution, school coverage, gender split). Needs connection to the `/analytics` API. |
| **Past Events Page** | The animated timeline layout is done. Still reads from a local mock file instead of the live events API. |
| **Upcoming Events Page** | Carousel and mobile card layouts built. Not yet wired to the backend. |
| **Public Programs Listing Page** | Filter UI, program cards, and lead capture modal are designed. Uses a local mock dataset instead of the real programs API. |
| **Admin Archived Section** | UI shell exists but shows mock lists for archived events, programs, and MOUs. |
| **Admin Reviews Section** | Review cards and comment threads render correctly but from mock data, not the live reviews API. |
| **Admin Audit Log** | Log table UI is present, using mock entries instead of the live audit trail. |
| **Student Activity Timeline** | Application stage history displays correctly from the backend. However, a "Visa documentation review" step is currently hardcoded as an upcoming stub. |
| **Program Date Fields** (Admin) | Program start date, end date, and application deadline fields in the Create/Edit program forms are currently disabled and marked "Coming Soon" pending final schema confirmation. |

---

Thanks for reading — feel free to reach out with any questions or feedback.

**— The OIA Team**
