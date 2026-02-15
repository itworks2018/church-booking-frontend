/**
 * HTML Escape Utility
 * Safely escapes HTML special characters to prevent XSS attacks
 * Use this whenever inserting user-controlled data into innerHTML
 */

export function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") return String(unsafe || "");
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
