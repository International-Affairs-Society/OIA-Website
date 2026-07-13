# SCHEMA.md

Quick-reference for all tables, columns, relationships, and enums. **Source of truth is `schema-final.sql`** — this file is a human-readable summary for agents and developers. Update both when schema changes.

The schema is **final and stable** — do not modify without flagging to both team members.

---

## Enums

| Enum | Values |
|---|---|
| `user_role` | `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `VIEWER`, `GENERAL`, `STUDENT` |
| `program_status` | `OPEN`, `FULL`, `CLOSED` |
| `app_stage` | `RECEIVED`, `VERIFIED`, `OFFER`, `VISA`, `ENROLLED` |
| `doc_type` | `PASSPORT`, `TRANSCRIPT`, `SOP`, `BANK_STATEMENT`, `PHOTO`, `VACCINATION` |
| `doc_status` | `PENDING`, `VERIFIED` |
| `mou_status` | `ACTIVE`, `EXPIRING`, `EXPIRED` |
| `event_visibility` | `PUBLIC`, `DRAFT` |
| `notif_type` | `BULK`, `TRANSACTIONAL`, `MOU_ALERT` |

All enum values are **UPPERCASE** in the DB. API responses return them uppercase. Frontend should handle and display accordingly.

---

## Tables Overview

| Table | Purpose |
|---|---|
| `users` | All persons — students, staff, leadership. UUID PK = `auth.users.id` |
| `student_records` | Academic record (1-to-1 with users) |
| `universities` | Partner university master list |
| `mous` | MOUs with partner universities |
| `programs` | Exchange programmes — always linked to an MOU |
| `events` | Public/draft events, optionally MOU-linked |
| `applications` | User × programme intersection. One per user per programme |
| `documents` | Files owned by user, optionally linked to an application |
| `stage_history` | Audit trail for application stage changes |
| `notifications` | System/email notification log |
| `change_requests` | Audit and approval workflow for EDITOR changes |

---

## Table Details

### `users`
```
id           UUID PK DEFAULT gen_random_uuid()  -- = auth.users.id
email        TEXT UNIQUE NOT NULL
display_name TEXT
role         user_role NOT NULL DEFAULT 'STUDENT'
photo_url    TEXT
mobile       TEXT
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```
**Auth**: `id` matches `auth.users.id` (Supabase Auth). Provisioned automatically on first Microsoft login via trigger. No `password_hash` — identity managed by Supabase Auth entirely.
**Role default**: `STUDENT`. Promoted manually via `PATCH /users/:id` by `SUPER_ADMIN` only.

---

### `student_records`
```
id            UUID PK
user_id       UUID UNIQUE FK → users ON DELETE CASCADE  -- 1-to-1
enrollment_id TEXT UNIQUE NOT NULL
department    TEXT NOT NULL
batch_year    INT NOT NULL
program_type  TEXT NOT NULL
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ
```

---

### `universities`
```
id          UUID PK
name        TEXT NOT NULL
country     TEXT NOT NULL
logo_r2_key TEXT  -- R2 object key — generate signed URL, never return raw key
map_lat     NUMERIC
map_lng     NUMERIC
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

---

### `mous`
```
id                    UUID PK
partner_university_id UUID FK → universities ON DELETE RESTRICT
signed_date           DATE NOT NULL
expiry_date           DATE NOT NULL  -- must be > signed_date (CHECK constraint)
status                mou_status NOT NULL DEFAULT 'ACTIVE'
clauses               JSONB
document_r2_key       TEXT  -- R2 key for the signed MOU PDF
alert_sent_180        BOOLEAN DEFAULT FALSE
alert_sent_90         BOOLEAN DEFAULT FALSE
alert_sent_30         BOOLEAN DEFAULT FALSE
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```
**Alert flags**: background job checks `expiry_date` daily. Sets `alert_sent_*` after sending notification — prevents duplicate alerts.
**Status update**: `EXPIRING` when within 90 days, `EXPIRED` when past expiry — set by background job or on-read computation.

---

### `programs`
```
id               UUID PK
mou_id           UUID FK → mous ON DELETE RESTRICT  -- programs always tied to an MOU
title            TEXT NOT NULL
country          TEXT NOT NULL
duration         TEXT NOT NULL
fee              NUMERIC NOT NULL (>= 0)
seats_total      INT NOT NULL
seats_remaining  INT NOT NULL (0 ≤ seats_remaining ≤ seats_total)
status           program_status NOT NULL DEFAULT 'OPEN'
apply_open_date  TIMESTAMPTZ NOT NULL
apply_close_date TIMESTAMPTZ NOT NULL  -- must be > apply_open_date
type             TEXT NOT NULL
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```
**seats_remaining**: decremented when an application reaches `ENROLLED`, incremented if application is withdrawn. Never goes negative (CHECK constraint).

---

### `events`
```
id          UUID PK
mou_id      UUID FK → mous ON DELETE SET NULL  -- optional MOU link
title       TEXT NOT NULL
event_date  TIMESTAMPTZ NOT NULL
type        TEXT NOT NULL
description TEXT
visibility  event_visibility NOT NULL DEFAULT 'DRAFT'
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```
**Visibility**: `DRAFT` = internal only; `PUBLIC` = visible on public site.

---

### `applications`
```
id             UUID PK
user_id        UUID FK → users ON DELETE RESTRICT
program_id     UUID FK → programs ON DELETE RESTRICT
stage          app_stage NOT NULL DEFAULT 'RECEIVED'
fee_paid       BOOLEAN NOT NULL DEFAULT FALSE
departure_date DATE
applied_at     TIMESTAMPTZ DEFAULT NOW()
created_at     TIMESTAMPTZ
updated_at     TIMESTAMPTZ
UNIQUE(user_id, program_id)  -- one application per user per programme
```
**Stage flow**: `RECEIVED` → `VERIFIED` → `OFFER` → `VISA` → `ENROLLED`
**Every stage change**: must write a `stage_history` row in the same transaction. Never update stage silently.

---

### `documents`
```
id             UUID PK
user_id        UUID NOT NULL FK → users ON DELETE RESTRICT  -- always user-owned
application_id UUID FK → applications ON DELETE SET NULL    -- optional application link
type           doc_type NOT NULL
r2_key         TEXT NOT NULL  -- R2 object key — NEVER returned in API responses
status         doc_status NOT NULL DEFAULT 'PENDING'
verified_by_id UUID FK → users ON DELETE SET NULL
verified_at    TIMESTAMPTZ
created_at     TIMESTAMPTZ
updated_at     TIMESTAMPTZ
```
**Storage**: Cloudflare R2 private bucket. Always generate signed URL (15 min) via `getSignedUrl` — never expose `r2_key`.

---

### `stage_history`
```
id             UUID PK
application_id UUID FK → applications ON DELETE CASCADE
from_stage     app_stage  -- NULLABLE — null on first entry (initial RECEIVED)
to_stage       app_stage NOT NULL
changed_by_id  UUID FK → users ON DELETE RESTRICT
note           TEXT  -- optional reviewer comment
changed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
```
**Note on from_stage**: the original SQL had `NOT NULL` — changed to nullable to support the initial entry when an application is first created (no prior stage). This is intentional.
**Written by**: controller, not DB trigger — so `note` from request body can be captured and both writes are in the same Prisma transaction.

---

### `notifications`
```
id               UUID PK
type             notif_type NOT NULL
recipient_filter TEXT  -- 'all', 'role:STUDENT', 'user:{uuid}'
subject          TEXT NOT NULL
body_html        TEXT NOT NULL  -- sanitize before any frontend rendering
sent_by_id       UUID FK → users ON DELETE SET NULL
recipient_count  INT DEFAULT 0
sent_at          TIMESTAMPTZ DEFAULT NOW()
```

---

### `change_requests`
```
id             UUID PK
target_table   TEXT      -- e.g., 'mous', 'programs', 'events'
target_id      UUID      -- NULL if creating a new record
action_type    TEXT      -- 'CREATE', 'UPDATE', 'DELETE'
payload        JSONB     -- The JSON body of the proposed change
status         TEXT NOT NULL DEFAULT 'PENDING' -- 'PENDING', 'APPROVED', 'REJECTED'
requested_by   UUID FK → users
reviewed_by    UUID FK → users ON DELETE SET NULL
reviewed_at    TIMESTAMPTZ
created_at     TIMESTAMPTZ
```
**Approval Workflow**: `EDITOR` submits changes here. `SUPER_ADMIN` or `ADMIN` reviews and approves, applying the payload to the target table.

---

## Key Constraints Summary

| Table | Constraint | Rule |
|---|---|---|
| `mous` | `chk_mou_dates` | `expiry_date > signed_date` |
| `programs` | `chk_program_seats` | `0 ≤ seats_remaining ≤ seats_total` |
| `programs` | `chk_program_dates` | `apply_close_date > apply_open_date` |
| `programs` | `chk_program_fee` | `fee ≥ 0` |
| `applications` | UNIQUE | One application per `(user_id, program_id)` |
| `student_records` | UNIQUE | One record per `user_id` |

---

## Indexes

| Index | Table | Columns | Purpose |
|---|---|---|---|
| `idx_mous_status_expiry` | `mous` | `status, expiry_date` | Expiry alert background job |
| `idx_mous_university` | `mous` | `partner_university_id` | University → MOU lookups |
| `idx_programs_status_country` | `programs` | `status, country` | Programme listing filters |
| `idx_programs_mou` | `programs` | `mou_id` | MOU → programme lookups |
| `idx_events_visibility_date` | `events` | `visibility, event_date` | Public event feed |
| `idx_applications_user` | `applications` | `user_id` | Student's own applications |
| `idx_applications_program_stage` | `applications` | `program_id, stage` | Admin filter by programme + stage |
| `idx_documents_user` | `documents` | `user_id` | User's documents |
| `idx_documents_application` | `documents` | `application_id` | Application's documents |
| `idx_documents_status_created` | `documents` | `status, created_at` | Pending verification queue |
| `idx_stage_history_application` | `stage_history` | `application_id` | Application audit trail |
| `idx_notifications_type_sent` | `notifications` | `type, sent_at` | Notification log filtering |
