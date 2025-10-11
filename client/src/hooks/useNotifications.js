// src/hooks/useNotifications.js
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount, getRecentFeed } from "../api/dashboard.president";
// import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "../api/notifications";
export function useUnreadCount(options = {}) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30_000, // 30s
    staleTime: 15_000,
    ...options,
  });
}

export function useRecentNotifications(limit = 8, options = {}) {
  const query = useQuery({
    queryKey: ["notifications", "recent", limit],
    queryFn: () => getRecentFeed(limit),
    refetchInterval: 30_000,
    staleTime: 10_000,
    ...options,
  });

  // Normalize various possible shapes to a consistent UI model
  const items = useMemo(() => {
    const src = query.data ?? [];
    return src.map((row, idx) => {
      // Flexible mapping:
      const id = row.id ?? idx;
      const type = row.type || row.kind || row.category || "info";
      const title = row.titre || row.title || row.name || "عنصر حديث";
      const content = row.contenu || row.body || row.description || "";
      const text = row.text || `${title}${content ? ` — ${content}` : ""}`;
      const time =
        row.publie_le || row.created_at || row.createdAt || row.date || "الآن";
      // some feeds include read state
      const read = Boolean(row.read ?? row.is_read ?? false);

      return { id, type, text, time, read };
    });
  }, [query.data]);

  return { ...query, items };
}
export function useNotificationsPage(params) {
  return useQuery({
    queryKey: ["notifications", "page", params],
    queryFn: () => fetchNotifications(params),
    keepPreviousData: true,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}