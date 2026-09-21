-- ============================================================
-- Migration 001: Add missing models + schema extensions
-- Covers: DB-01 (universities, documents, change_requests)
--         APP-01 (extend students with academic fields)
--         NOTIF-01 (notification_reads)
--         DATA-02 (soft-delete deleted_at on programs, mous)
--         AUDIT-01 (extend audit_logs)
--         MOU-02  (add r2_key to mou_documents)
-- ============================================================

-- 1. universities table
CREATE TABLE IF NOT EXISTS universities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  logo_r2_key TEXT,
  map_lat     NUMERIC(10, 7),
  map_lng     NUMERIC(10, 7),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. DocType / DocStatus enums + documents table
DO $$ BEGIN
  CREATE TYPE "DocType" AS ENUM (
    'PASSPORT', 'TRANSCRIPT', 'SOP', 'BANK_STATEMENT', 'PHOTO', 'VACCINATION'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DocStatus" AS ENUM ('PENDING', 'VERIFIED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id  UUID REFERENCES applications(id) ON DELETE SET NULL,
  type            "DocType" NOT NULL,
  r2_key          TEXT NOT NULL,
  status          "DocStatus" NOT NULL DEFAULT 'PENDING',
  verified_by_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at     TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id        ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_status         ON documents(status);

-- 3. change_requests table
DO $$ BEGIN
  CREATE TYPE "ChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS change_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_table    TEXT NOT NULL,
  target_id       UUID,
  action_type     TEXT NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE')),
  payload         JSONB NOT NULL,
  requested_by    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  status          "ChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
  review_comments TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_change_requests_status       ON change_requests(status);
CREATE INDEX IF NOT EXISTS idx_change_requests_requested_by ON change_requests(requested_by);

-- 4. Extend students with academic fields (APP-01)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS semester        TEXT,
  ADD COLUMN IF NOT EXISTS cgpa            NUMERIC(4, 2),
  ADD COLUMN IF NOT EXISTS has_passport    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS passport_number TEXT,
  ADD COLUMN IF NOT EXISTS gender          TEXT,
  ADD COLUMN IF NOT EXISTS erp_synced_at   TIMESTAMPTZ;

-- 5. Soft-delete columns (DATA-02)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE mous     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 6. notification_reads table (NOTIF-01)
CREATE TABLE IF NOT EXISTS notification_reads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (notification_id, user_id)
);

-- 7. Extend audit_logs for richer trail (AUDIT-01)
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS performed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS previous_value  TEXT,
  ADD COLUMN IF NOT EXISTS new_value       TEXT;

-- 8. mou_documents: add r2_key (MOU-02) — old url column kept for migration period
ALTER TABLE mou_documents
  ADD COLUMN IF NOT EXISTS r2_key      TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ NOT NULL DEFAULT now();

-- Purge schedule note (run via cron or manual):
-- DELETE FROM programs  WHERE deleted_at < now() - INTERVAL '6 months';
-- DELETE FROM mous      WHERE deleted_at < now() - INTERVAL '6 months';
-- DELETE FROM documents WHERE deleted_at < now() - INTERVAL '6 months';
