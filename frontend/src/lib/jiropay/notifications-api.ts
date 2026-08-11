import { apiFetch } from "./http";

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationsResponse = {
  data: NotificationItem[];
  non_lues: number;
};

export async function listeNotifications(): Promise<NotificationsResponse> {
  const res = await apiFetch<{ success: boolean } & NotificationsResponse>("/api/notifications");
  return { data: res.data, non_lues: res.non_lues };
}

export async function marquerNotificationLue(id: number): Promise<void> {
  await apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
}

export async function marquerToutesLues(): Promise<void> {
  await apiFetch("/api/notifications/read-all", { method: "POST" });
}
