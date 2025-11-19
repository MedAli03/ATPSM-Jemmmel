// src/features/parent/hooks.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getChildById,
  getChildTimeline,
  getMyChildren,
  getParentNotifications,
  getParentThreads,
  getThreadById,
  getThreadMessages,
  markThreadRead,
  sendThreadMessage,
} from "./api";
import {
  Child,
  MessageThread,
  ParentNotification,
  ThreadMessage,
  TimelineItem,
} from "./types";

interface MessageCursor {
  id: string;
  createdAt: string;
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useAsyncData = <T,>(fetcher: () => Promise<T>): AsyncState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};

export const useMyChildren = () => {
  const fetcher = useCallback(() => getMyChildren(), []);
  const state = useAsyncData<Child[]>(fetcher);
  const normalizedChildren = useMemo(() => {
    const data = state.data ?? [];
    return data.map((child) => ({
      ...child,
      thread_id:
        typeof child.thread_id === "number" && Number.isFinite(child.thread_id)
          ? child.thread_id
          : child.thread_id ?? null,
      has_unread_note: Boolean(child.has_unread_note ?? child.has_unread_daily_note),
      has_unread_daily_note: Boolean(
        child.has_unread_daily_note ?? child.has_unread_note ?? false,
      ),
      unread_messages_count: child.unread_messages_count ?? 0,
    }));
  }, [state.data]);
  return {
    children: normalizedChildren,
    isLoading: state.loading,
    isError: Boolean(state.error),
    error: state.error,
    refetch: state.refetch,
  };
};

export const useChildDetail = (childId: number) => {
  const fetcher = useCallback(() => getChildById(childId), [childId]);
  const state = useAsyncData<Child>(fetcher);
  return {
    child: state.data ?? null,
    isLoading: state.loading,
    isError: Boolean(state.error),
    error: state.error,
    refetch: state.refetch,
  };
};

export const useChildTimeline = (childId: number) => {
  const fetcher = useCallback(() => getChildTimeline(childId), [childId]);
  const state = useAsyncData<TimelineItem[]>(fetcher);
  const sortedData = useMemo(() => {
    if (!state.data) {
      return [] as TimelineItem[];
    }
    return [...state.data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [state.data]);

  return {
    events: sortedData,
    isLoading: state.loading,
    isError: Boolean(state.error),
    error: state.error,
    refetch: state.refetch,
  };
};

export const useParentThreads = () => {
  const fetcher = useCallback(() => getParentThreads(), []);
  const state = useAsyncData<MessageThread[]>(fetcher);
  return {
    threads: state.data ?? [],
    isLoading: state.loading,
    isError: Boolean(state.error),
    error: state.error,
    refetch: state.refetch,
  };
};

export const useChatThread = (threadId?: number | null) => {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [cursor, setCursor] = useState<MessageCursor | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!threadId) {
      setError("لا يمكن فتح المحادثة بدون معرّف صالح.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [threadDetails, messagePage] = await Promise.all([
        getThreadById(threadId),
        getThreadMessages(threadId),
      ]);
      setThread(threadDetails);
      setMessages(messagePage.data);
      setCursor(messagePage.nextCursor ?? null);
      if (messagePage.data.length) {
        const lastMessage = messagePage.data[messagePage.data.length - 1];
        await markThreadRead(threadId, lastMessage.id);
      }
    } catch (err) {
      console.error("Failed to load chat thread", err);
      setError("تعذّر تحميل المحادثة. حاول مرة أخرى لاحقًا.");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    load();
  }, [load]);

  const send = useCallback(
    async (text: string) => {
      if (!threadId || !text.trim()) {
        return;
      }
      setSending(true);
      try {
        const message = await sendThreadMessage(threadId, text.trim());
        setMessages((prev) => [...prev, message]);
        await markThreadRead(threadId, message.id);
      } catch (err) {
        console.error("Failed to send message", err);
        setError("تعذّر إرسال الرسالة. حاول مجددًا.");
      } finally {
        setSending(false);
      }
    },
    [threadId],
  );

  const loadMore = useCallback(async () => {
    if (!threadId || !cursor) {
      return;
    }
    try {
      const page = await getThreadMessages(threadId, cursor);
      setMessages((prev) => [...page.data, ...prev]);
      setCursor(page.nextCursor ?? null);
    } catch (err) {
      console.error("Failed to load more messages", err);
    }
  }, [cursor, threadId]);

  return {
    thread,
    messages,
    isLoading: loading,
    isError: Boolean(error),
    error,
    send,
    sending,
    refetch: load,
    loadMore,
  };
};

export const useParentNotifications = () => {
  const fetcher = useCallback(() => getParentNotifications(), []);
  const state = useAsyncData<ParentNotification[]>(fetcher);
  const sorted = useMemo(() => {
    if (!state.data) {
      return [] as ParentNotification[];
    }
    return [...state.data].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [state.data]);

  return {
    notifications: sorted,
    isLoading: state.loading,
    isError: Boolean(state.error),
    error: state.error,
    refetch: state.refetch,
  };
};
