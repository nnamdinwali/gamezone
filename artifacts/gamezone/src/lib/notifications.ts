import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetchJson } from "./api-fetch";

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
  return apiFetchJson<NotificationResponse>("/api/notifications", { cache: "no-store" });
}

async function markNotificationRead(id: number): Promise<GameZoneNotification> {
  return apiFetchJson<GameZoneNotification>(`/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
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

