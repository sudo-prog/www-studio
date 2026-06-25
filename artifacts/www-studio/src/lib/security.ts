// ── Security utilities for WWW Studio ──────────────────────────────────────
// HTML sanitization and XSS prevention for exports and user content.

import { FreeformElement } from "@/lib/freeform-types";

/**
 * Sanitize a string for safe HTML output.
 * Escapes HTML entities to prevent XSS.
 */
export function sanitizeHTML(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize a URL for safe use in href/src attributes.
 * Blocks javascript: and data: URLs.
 */
export function sanitizeURL(url: string): string {
  if (!url) return "";
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return "#";
  }
  return url;
}

/**
 * Validate and sanitize CSS value to prevent injection.
 */
export function sanitizeCSSValue(value: string): string {
  if (!value) return "";
  // Remove potentially dangerous CSS expressions
  return value
    .replace(/expression\(/gi, "")
    .replace(/url\(['"]?javascript:/gi, "")
    .replace(/@import/gi, "");
}

/**
 * Sanitize all user-facing string content in an element.
 */
export function sanitizeFreeformElement(el: FreeformElement): FreeformElement {
  const sanitized = { ...el };
  if (sanitized.text) sanitized.text = sanitizeHTML(sanitized.text);
  if (sanitized.label) sanitized.label = sanitizeHTML(sanitized.label);
  if (sanitized.href) sanitized.href = sanitizeURL(sanitized.href);
  if (sanitized.src) sanitized.src = sanitizeURL(sanitized.src);
  if (sanitized.name) sanitized.name = sanitizeHTML(sanitized.name);
  if (sanitized.fill) sanitized.fill = sanitizeCSSValue(sanitized.fill);
  if (sanitized.color) sanitized.color = sanitizeCSSValue(sanitized.color);
  if (sanitized.background) sanitized.background = sanitizeCSSValue(sanitized.background);
  return sanitized;
}

/**
 * Sanitize a batch of elements for export.
 */
export function sanitizeForExport(elements: FreeformElement[]): FreeformElement[] {
  return elements.map(sanitizeFreeformElement);
}
