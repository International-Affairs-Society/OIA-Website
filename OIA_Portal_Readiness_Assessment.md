# OIA Portal — Technology & Production Readiness Assessment

> Review of current implementation, key gaps and recommended actions

---

## Executive Summary

The OIA portal demonstrates a strong foundation for the proposed International Affairs platform. A significant portion of the public portal, administrative interfaces and workflow structure has already been developed.

The selected technology stack is modern, scalable and suitable for the portal's functional and integration requirements. **We do not recommend replacing the existing technology stack.** Instead, the focus should be on strengthening the current implementation, closing the identified functional and technical gaps, and completing the solution for production readiness.

---

## Technology Stack Assessment

| Component | Technology | Assessment |
|---|---|---|
| Frontend | Next.js + React | Well suited for SEO-friendly public website + interactive dashboards |
| Backend API | Node.js + Express | Appropriate for API development, ERP integration and workflows |
| Database | PostgreSQL via Supabase | Suitable for relational data (students, programs, applications, MOUs) |
| ORM | Prisma | Structured DB access with controlled schema evolution via versioned migrations |
| Async Processing | Redis + BullMQ | Appropriate for emails, document processing, expiry alerts, scheduled notifications |
| Storage | Cloudflare R2 / S3-compatible | Scalable document storage with controlled access |
| Authentication | Microsoft/Bennett via Supabase | Suitable for restricting functionality to institutional users |
| CDN / WAF / Infra | Cloudflare + AWS-compatible | Good foundation for CDN, WAF, storage and horizontal scalability |

---

## Technology & Engineering Capabilities to be Added

- [ ] Establish an automated **CI/CD pipeline** with separate Staging, Pre-production and Production environments
  - Staging: regular integration testing
  - Pre-production: mirror Production for UAT, ERP validation, security and performance testing
- [ ] Implement automated security checks: **SAST, DAST, dependency scanning, secret scanning**
- [ ] Add **malware scanning, file-signature validation and quarantine processing** for documents (passports, transcripts, PDFs, Office files)
- [ ] Introduce **centralized monitoring, logging and alerting** for APIs, database health, Redis, BullMQ workers, storage failures, security events and application performance
- [ ] Implement a reliable **transactional email service** for application updates, reminders, approval notifications, MOU expiry alerts and delivery tracking
- [ ] Implement **automated encrypted backups, point-in-time recovery and disaster-recovery procedures**
- [ ] Create a controlled **Academic ERP integration** for student information (school, course, semester, CGPA, backlogs)

---

## Key Functional and Implementation Gaps

### 1. Database Schema, Migration and API Consistency

**Severity: Critical**

- [ ] Backend controllers reference models not defined in `schema.prisma`
  - `prisma.documents`, `prisma.universities`, `prisma.change_requests` are missing
  - Risk: APIs will fail after a clean deployment
  - Fix: Add missing models/migrations OR remove unused controllers/routes
- [ ] Introduce a **controlled migration process** — all DB changes via approved migration scripts in Git (no manual DB changes)
- [ ] Fix analytics API field name mismatches:
  - `applications.stage` → should be `current_stage`
  - `programs.title` → should be `name`
  - Event API fields `type` / `visibility` → should be `event_type` / `status`

---

### 2. Student Eligibility and Applications

**Severity: High**

- [ ] Implement **complete student eligibility validation** using verified Academic ERP data
  - Eligibility criteria: school, course, semester, CGPA, backlog status
  - Currently: ineligible students can submit applications; OIA team must verify manually
- [ ] Extend student data structure to include:
  - Semester, CGPA, backlog information
  - Source of information
  - Date of last verification
- [ ] Complete **Academic ERP synchronisation** to keep student academic details current
- [ ] Fix **application submission process**
  - Currently: submission sends only `program ID` with an empty `custom-response` object
  - Fix: populate required fields (name, enrollment number, semester, course, CGPA, passport status) from verified student profile
- [ ] **Standardise application stages** across frontend, backend and database
  - Example inconsistency: `applied` / `documents_verified` vs `Submitted` / `under_review`
  - Fix: define a single approved list of stages and transition rules
- [ ] Complete **comments, document checklists, application history and resubmission workflows**
  - Some actions update the UI without persisting changes to the database

---

### 3. Access Control and Security

**Severity: Critical**

- [ ] Fix and centralise **sensitive-document authorisation**
  - Role names and document-ownership checks are inconsistently implemented (uppercase vs lowercase role values)
  - Risk: ownership validation may not execute correctly → one student may access another student's passport
  - QA must confirm: Student A can access their own passport but NOT Student B's passport
- [ ] Replace browser-reported file type with **server-side file validation**
  - Current risk: a harmful executable renamed with `.pdf` extension can be uploaded
  - Fix: verify actual file signature, validate extension and file size, perform malware scanning, quarantine until checks pass
- [ ] Redesign **background document processing** for multi-server deployment
  - Current issue: API passes a local temp file path to BullMQ worker — fails if worker runs on another server
  - Fix: store file in durable shared storage first; pass storage reference to the background job
- [ ] Replace **localStorage token storage** with secure HttpOnly + SameSite cookies
  - Current risk: XSS vulnerability could allow malicious JS to steal tokens from localStorage
- [ ] **Sanitise stored HTML** and implement a **Content Security Policy (CSP)**
  - Risk: unsafe HTML/script in program descriptions, fee info or notifications could execute in another user's browser
- [ ] Enforce access control on **draft and archived content**
  - Currently: a user who knows/guesses a record ID can retrieve a draft program via the detail API
- [ ] Implement **school-level stakeholder restrictions**
  - Currently: a Dean can view students/applications from all schools, not just their own

---

### 4. MOU, Reporting and Notifications

**Severity: High**

- [ ] Implement the **complete MOU lifecycle**
  - Store start/expiry dates ✅ (already done)
  - Auto-identify upcoming expiry → generate reminders → update expiry status → maintain renewal history ❌
- [ ] Move **MOU documents** into controlled private storage with:
  - Access control
  - Version history
  - Signed URLs
  - Audit tracking
- [ ] Replace **hardcoded/sample dashboard data** with live database values
  - Affected values: approval rates, yearly totals, processing times
  - These must not be used for management decisions until validated against actual records
- [ ] Fix **notification and email persistence**
  - Current issue: notifications reappear as unread after page refresh
  - Application status changes must reliably trigger notifications/emails to intended recipients
- [ ] Expand **audit trail coverage** to include:
  - Who changed an application stage (previous → new)
  - Who viewed or downloaded a passport
  - Who verified or deleted a document
  - Timestamp for each action
- [ ] Protect **historical records from accidental deletion**
  - Current risk: cascading delete on a program may delete linked applications
  - Fix: use soft-delete / archive pattern for all business records

---

## Production Readiness & QA

A structured, independent QA cycle is **mandatory** before production go-live.

QA must validate functional requirements, business rules, security requirements and user journeys — not just technical testing.

### QA Activities Required

| Category | Activities |
|---|---|
| Functional | Testing against approved product requirements |
| Integration | Academic ERP integration testing, end-to-end testing |
| Security | Role-based access testing, negative-access testing, VAPT, SAST, DAST |
| Reliability | Regression testing, database & API validation, document upload/processing testing |
| Performance | Load testing, automated testing for critical workflows |
| Compatibility | Cross-browser and responsive testing |
| Resilience | Backup and disaster-recovery testing |
| Acceptance | UAT in Pre-production environment |

### Critical QA Scenarios

- [ ] Eligible student can apply for an appropriate program
- [ ] Ineligible student is blocked and receives the correct reason
- [ ] CGPA/backlog information is correctly retrieved from the ERP
- [ ] Passport is uploaded and linked before application is treated as complete
- [ ] Student A cannot view or download Student B's documents
- [ ] Dean of School A cannot view restricted information belonging to School B
- [ ] Application-stage changes persist correctly after refresh/logout/login
- [ ] Status changes trigger the correct notifications and emails
- [ ] MOU expiry reminders are generated at the required time
- [ ] Dashboard totals match the underlying database records
- [ ] Failed ERP calls are retried and logged appropriately
- [ ] A file with a spoofed file type is rejected/quarantined
- [ ] Production deployment can be rolled back successfully

### QA Governance

- QA team should be **independent of the development team**
- Test cases must be mapped to **approved product requirements and acceptance criteria**
- **Critical and high-severity defects** must be resolved and retested before production sign-off

---

## Additional Production Assurance Checklist

- [ ] Increase automated test coverage for: DB operations, role-based access, document ownership, complete user journeys
- [ ] Ensure frontend is automatically linted/checked before any code release
- [ ] Test backup and DR procedures via an **actual restoration/recovery exercise**
- [ ] Formally approve **privacy and data-retention requirements** before processing real student data
- [ ] Complete VAPT, DAST, load testing and E2E testing; correct and retest critical findings
- [ ] Document runbooks for: deployment, rollback, incident handling, backup restoration, credential rotation, ERP/document-processing failures
- [ ] Complete technical documentation, ownership, escalation paths and knowledge transfer before production handover

---

## Recommendations

1. **Retain** the existing technology stack
2. **Close** the identified functional, database, security and integration gaps
3. **Complete** missing end-to-end business workflows
4. **Carry out** a structured and independent QA cycle against approved product requirements
5. **Validate** the solution through Staging, Pre-production, UAT, security and performance testing
6. **Resolve and retest** all critical/high-priority observations
7. **Obtain** Bennett/Times architecture, security, QA and production approvals before go-live

---

*This assessment reflects a review of the current OIA portal implementation. All gaps listed above should be treated as blockers or high-priority items before the portal is considered production-ready.*
