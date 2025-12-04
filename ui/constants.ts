// ============================================================================
// TYPES
// ============================================================================

export type TaskStatus = "pending" | "running" | "success" | "error" | "warning";

export interface TaskItem {
  id: string;
  label: string;
  status: TaskStatus;
  message?: string;
}

export interface CheckProgress {
  name: string;
  folderName: string;
  status: TaskStatus;
  filesCount?: number;
  message?: string;
}
