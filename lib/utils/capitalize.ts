// lib/utils/capitalize.ts
export function capitalizeFirst(s?: string | null) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
