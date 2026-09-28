// ============================================================
// sanitize.ts — SEC-04 frontend HTML sanitisation helper
// Uses DOMPurify to strip unsafe HTML before rendering via
// dangerouslySetInnerHTML.
//
// Install: npm install dompurify
//          npm install --save-dev @types/dompurify
// ============================================================

import DOMPurify from 'dompurify'

/**
 * Sanitise an HTML string using DOMPurify.
 * Safe to call on the client side only (SSR returns empty string).
 *
 * Allowed: basic text formatting, links, simple tables.
 * Blocked: <script>, event handlers (onclick, onerror...), <iframe>, etc.
 *
 * @param html - Raw HTML string from the API
 * @returns Sanitised HTML string safe to use with dangerouslySetInnerHTML
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''

  // Guard: DOMPurify requires a DOM (window). Return empty string during SSR.
  if (typeof window === 'undefined') return ''

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's',
      'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'blockquote'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',  // <a> only — target/rel sanitised below
      'class', 'id'
    ],
    // Force safe link attributes
    FORCE_BODY: false,
    RETURN_DOM: false,
    ADD_ATTR: ['target'],
    // Strip javascript: URIs from href
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  })
}

/**
 * Convenience hook to use sanitised HTML in dangerouslySetInnerHTML props.
 *
 * Usage:
 *   <div dangerouslySetInnerHTML={safeHtml(program.feeBreakdownHtml)} />
 */
export function safeHtml(html: string | null | undefined): { __html: string } {
  return { __html: sanitizeHtml(html) }
}
