export type FlashType = "success" | "error";

export interface FlashMessage {
  category: FlashType;
  message: string;
}

export interface SessionResponse {
  authenticated: boolean;
  username: string | null;
}

export interface FileRecord {
  id: number;
  filename: string;
  file_size: number;
  uploaded_at: string;
  owner?: string;
  shared_at?: string;
}

export interface AuditLog {
  username: string;
  action: string;
  target_type: string;
  target_id: number | null;
  details: string;
  created_at: string;
}

export interface DashboardData {
  username: string;
  userFiles: FileRecord[];
  sharedFiles: FileRecord[];
  recentActivity: AuditLog[];
  totalUploads: number;
  totalShared: number;
  activityCount: number;
}
