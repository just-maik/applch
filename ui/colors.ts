// ============================================================================
// THEME COLORS
// ============================================================================

export const colors = {
  primary: "#7c3aed",
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  muted: "#6b7280",
  accent: "#06b6d4",
} as const;

export type ColorKey = keyof typeof colors;