// src/hooks/useNotifications.js
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUnreadCount,
  getRecentNotifications,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../api/notifications";

export function useUnreadCount(options = {}) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
    staleTime: 15_000,
    ...options,
  });
}

export function useRecentNotifications(limit = 8, options = {}) {
  const query = useQuery({
    queryKey: ["notifications", "recent", limit],
    queryFn: () => getRecentNotifications(limit),
    refetchInterval: 30_000,
    staleTime: 10_000,
    ...options,
  });

  const items = useMemo(() => query.data ?? [], [query.data]);
  return { ...query, items };
}

export function useNotificationsPage(params) {
  return useQuery({
    queryKey: ["notifications", "page", params],
    queryFn: () => listNotifications(params),
    keepPreviousData: true,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const markOne = useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: ({ notification, meta }) => {
      if (meta?.unread != null) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          meta.unread
        );
      }
      if (notification) {
        const updater = (item) =>
          item?.id === notification.id ? { ...item, ...notification } : item;

        queryClient.setQueriesData(
          { queryKey: ["notifications", "recent"] },
          (old) => (Array.isArray(old) ? old.map(updater) : old)
        );

        queryClient.setQueriesData(
          { queryKey: ["notifications", "page"] },
          (old) => {
            if (!old?.items) return old;
            return {
              ...old,
              items: old.items.map(updater),
              meta:
                meta?.unread != null
                  ? { ...old.meta, unread: meta.unread }
                  : old.meta,
            };
          }
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "page"] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      const stamp = new Date().toISOString();
      const markRead = (item) =>
        item ? { ...item, read: true, readAt: item.readAt ?? stamp } : item;

      queryClient.setQueryData(["notifications", "unread-count"], 0);

      queryClient.setQueriesData(
        { queryKey: ["notifications", "recent"] },
        (old) => (Array.isArray(old) ? old.map(markRead) : old)
      );

      queryClient.setQueriesData(
        { queryKey: ["notifications", "page"] },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map(markRead),
            meta: { ...(old.meta || {}), unread: 0 },
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "page"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => deleteNotification(id).then(() => id),
    onSuccess: (id) => {
      queryClient.setQueriesData(
        { queryKey: ["notifications", "recent"] },
        (old) => (Array.isArray(old) ? old.filter((item) => item.id !== id) : old)
      );
      queryClient.setQueriesData(
        { queryKey: ["notifications", "page"] },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== id),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return { markOne, markAll, remove };
}
