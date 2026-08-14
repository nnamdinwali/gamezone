import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE = (import.meta.env.VITE_API_URL || "https://gamezoneapi-cp623ub2.manus.space").replace(/\/$/, "");

export type GameZoneNotification = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};

type NotificationResponse = {
  notifications: GameZoneNotification[];
  unreadCount: number;
};

const notificationsKey = ["gamezone", "notifications"];

async function getNotifications(): Promise<NotificationResponse> {
  const response = await fetch(`${API_BASE}/api/notifications`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Notifications request failed (${response.status})`);
  return (await response.json()) as NotificationResponse;
}

async function markNotificationRead(id: number): Promise<GameZoneNotification> {
  const response = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Notification update failed (${response.status})`);
  return (await response.json()) as GameZoneNotification;
}

export function useNotifications(enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: notificationsKey,
    queryFn: getNotifications,
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey }),
  });
  return { ...query, markRead };
}
