/**
 * apiFetch.ts — SEC-03 drop-in replacement for fetch()
 *
 * All API calls in this project MUST use this function instead of
 * raw fetch() with localStorage tokens. This ensures:
 *   1. Auth is via HttpOnly cookie only (XSS-safe).
 *   2. Content-Type is always set for JSON bodies.
 *   3. The API base URL is sourced from one place.
 *
 * Usage:
 *   // Before (insecure):
 *   const token = localStorage.getItem("access_token")
 *   await fetch(`${API_URL}/api/v1/events`, { headers: { Authorization: `Bearer ${token}` } })
 *
 *   // After (secure):
 *   import { apiFetch } from "@/lib/apiFetch"
 *   await apiFetch("/api/v1/events")
 *
 *   // With body:
 *   await apiFetch("/api/v1/events/123", { method: "PATCH", body: JSON.stringify({ isArchived: true }) })
 *
 *   // File upload (don't set Content-Type — browser sets multipart boundary):
 *   await apiFetch("/api/v1/documents", { method: "POST", body: formData, isFileUpload: true })
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface ApiFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>
  /** Set true for FormData / multipart uploads — skips Content-Type so browser sets it */
  isFileUpload?: boolean
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { isFileUpload, headers = {}, ...rest } = options

  // Auto-detect FormData to never force application/json on multipart bodies
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData
  const isUpload = isFileUpload || isFormData

  const defaultHeaders: Record<string, string> = isUpload
    ? {}  // Let browser set multipart/form-data boundary
    : { "Content-Type": "application/json" }

  return fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",   // HttpOnly cookie sent automatically — no localStorage needed
    headers: {
      ...defaultHeaders,
      ...headers,
      // Explicitly exclude any Authorization header — backend reads HttpOnly cookie only
    },
  })
}
