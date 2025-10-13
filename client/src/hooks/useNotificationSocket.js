import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/ToastProvider";
import { normalizeNotification } from "../api/notifications";

function resolveBaseUrl() {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  return base.replace(/\/?api\/?$/, "");
}

function parseData(event) {
  try {
    return event?.data ? JSON.parse(event.data) : {};
  } catch {
    return {};
  }
}

export function useNotificationSocket(enabled = true) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    if (!enabled || !token) return undefined;

    const url = `${resolveBaseUrl()}/api/notifications/stream?token=${encodeURIComponent(
      token
    )}`;
    const source = new EventSource(url);

    source.addEventListener("notification:new", (event) => {
      const normalized = normalizeNotification(parseData(event));
      if (!normalized) return;

      queryClient.setQueryData(["notifications", "unread-count"], (prev) => {
        if (typeof prev !== "number") return 1;
        return prev + 1;
      });

      queryClient.setQueriesData(
        { queryKey: ["notifications", "recent"] },
        (old) => {
          if (!Array.isArray(old)) return old;
          const filtered = old.filter((item) => item.id !== normalized.id);
          filtered.unshift(normalized);
          return filtered.slice(0, old.length || filtered.length);
        }
      );

      queryClient.invalidateQueries({ queryKey: ["notifications", "page"] });

      const message = normalized.title || normalized.text || "إشعار جديد";
      toast(`🔔 ${message}`, "info");
    });

    source.addEventListener("notification:count", (event) => {
      const payload = parseData(event);
      if (typeof payload === "number") {
        queryClient.setQueryData(["notifications", "unread-count"], payload);
      } else if (typeof payload?.count === "number") {
        queryClient.setQueryData(["notifications", "unread-count"], payload.count);
      }
    });

    source.addEventListener("notification:read", (event) => {
      const { id } = parseData(event);
      if (!id) return;
      const stamp = new Date().toISOString();
      const markRead = (item) =>
        item?.id === id ? { ...item, read: true, readAt: item.readAt ?? stamp } : item;

      queryClient.setQueriesData(
        { queryKey: ["notifications", "recent"] },
        (old) => (Array.isArray(old) ? old.map(markRead) : old)
      );
      queryClient.setQueriesData(
        { queryKey: ["notifications", "page"] },
        (old) => {
          if (!old?.items) return old;
          return { ...old, items: old.items.map(markRead) };
        }
      );
    });

    source.addEventListener("notification:read-all", () => {
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
    });

    source.addEventListener("notification:deleted", (event) => {
      const { id } = parseData(event);
      if (!id) return;
      queryClient.setQueriesData(
        { queryKey: ["notifications", "recent"] },
        (old) => (Array.isArray(old) ? old.filter((item) => item.id !== id) : old)
      );
      queryClient.setQueriesData(
        { queryKey: ["notifications", "page"] },
        (old) => {
          if (!old?.items) return old;
          return { ...old, items: old.items.filter((item) => item.id !== id) };
        }
      );
    });

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [enabled, queryClient, toast, token]);
}
