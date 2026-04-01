import type { DashboardData, SessionResponse } from "./types";

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    ...init
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const data = await response.json();
      throw new Error(data.error || "Request failed.");
    }
    throw new Error("Request failed.");
  }

  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  session: () => request<SessionResponse>("/api/auth/session"),
  login: (username: string, password: string) =>
    request<SessionResponse>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    }),
  register: (username: string, password: string) =>
    request<{ message: string }>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    }),
  logout: () =>
    request<{ success: boolean }>("/api/auth/logout", {
      method: "POST"
    }),
  dashboard: () => request<DashboardData>("/api/dashboard"),
  vault: () => request<{ username: string; userFiles: DashboardData["userFiles"]; totalUploads: number }>("/api/vault"),
  downloads: () => request<{ username: string; userFiles: DashboardData["userFiles"]; sharedFiles: DashboardData["sharedFiles"]; totalDownloads: number }>("/api/downloads"),
  logs: () => request<{ username: string; auditLogs: DashboardData["recentActivity"]; activityCount: number }>("/api/logs"),
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ message: string; fileId: number }>("/api/uploads", {
      method: "POST",
      body: formData
    });
  },
  share: (fileId: number, sharedWith: string) =>
    request<{ message: string }>(`/api/share/${fileId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharedWith })
    })
};
