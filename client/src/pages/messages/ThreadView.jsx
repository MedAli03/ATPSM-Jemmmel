import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { messagingApi } from "../../services/messagingApi";
import MessageBubble from "../../components/messages/MessageBubble";
import Composer from "../../components/messages/Composer";
import DateSeparator from "../../components/messages/DateSeparator";
import TypingIndicator from "../../components/messages/TypingIndicator";
import { useAuth } from "../../context/AuthContext";

function useThreadDraft(threadId) {
  const storageKey = threadId ? `messages:draft:${threadId}` : null;
  const [draft, setDraftState] = useState(() => {
    if (!storageKey) return "";
    try {
      return localStorage.getItem(storageKey) || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    if (!storageKey) {
      setDraftState("");
      return;
    }
    try {
      setDraftState(localStorage.getItem(storageKey) || "");
    } catch {
      setDraftState("");
    }
  }, [storageKey]);

  const setDraft = useCallback(
    (value) => {
      setDraftState(value);
      if (!storageKey) return;
      try {
        if (value) {
          localStorage.setItem(storageKey, value);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch {
        /* ignore */
      }
    },
    [storageKey]
  );

  return [draft, setDraft];
}

export default function ThreadView() {
  const { threadId: threadIdParam } = useParams();
  const numericThreadId = threadIdParam ? Number(threadIdParam) : null;
  const threadId = Number.isFinite(numericThreadId) ? numericThreadId : null;
  const navigate = useNavigate();
  const realtime = useOutletContext();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [draft, setDraft] = useThreadDraft(threadId);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const scrollRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    setOptimisticMessages([]);
  }, [threadId]);

  const threadQuery = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => messagingApi.getThread(threadId),
    enabled: Boolean(threadId),
  });

  const messagesQuery = useInfiniteQuery({
    queryKey: ["messages", threadId],
    queryFn: ({ pageParam }) => messagingApi.listMessages(threadId, pageParam),
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: Boolean(threadId),
    refetchInterval: realtime?.connected ? false : 15000,
  });

  const fetchNextPage = messagesQuery.fetchNextPage;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;
    const handleScroll = () => {
      const nearTop = container.scrollTop < 120;
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      setIsAtBottom(nearBottom);
      if (
        nearTop &&
        messagesQuery.hasNextPage &&
        !messagesQuery.isFetchingNextPage &&
        !messagesQuery.isLoading
      ) {
        fetchNextPage();
      }
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [messagesQuery.hasNextPage, messagesQuery.isFetchingNextPage, messagesQuery.isLoading, fetchNextPage]);

  const participants = threadQuery.data?.participants || [];
  const participantCount = participants.length;

  const timeline = useMemo(() => {
    const seen = new Map();
    const serverMessages = messagesQuery.data?.pages.flatMap((page) => page.data || []) || [];
    [...serverMessages, ...optimisticMessages].forEach((message) => {
      seen.set(message.id, message);
    });
    const sorted = Array.from(seen.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const items = [];
    let lastDay = null;
    sorted.forEach((message) => {
      const dayKey = new Date(message.createdAt).toDateString();
      if (dayKey !== lastDay) {
        items.push({ type: "date", id: `date-${dayKey}`, date: message.createdAt });
        lastDay = dayKey;
      }
      const isMine = message.sender?.id === currentUser?.id;
      let status = message.status || "sent";
      if (isMine && status === "sent") {
        const readers = (message.readBy || []).filter((id) => id !== currentUser?.id);
        if (readers.length >= Math.max(0, participantCount - 1)) {
          status = "read";
        }
      }
      items.push({ type: "message", id: message.id, message: { ...message, status } });
    });
    return items;
  }, [messagesQuery.data, optimisticMessages, currentUser, participantCount]);

  const rowVirtualizer = useVirtualizer({
    count: timeline.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => (timeline[index]?.type === "date" ? 40 : 120),
    overscan: 8,
  });

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const lastItem = timeline[timeline.length - 1];
    if (isAtBottom || lastItem?.message?.sender?.id === currentUser?.id) {
      container.scrollTop = container.scrollHeight;
    }
  }, [timeline, isAtBottom, currentUser]);

  useEffect(() => {
    const last = [...timeline].reverse().find((item) => item.type === "message");
    if (!last || last.message.sender?.id === currentUser?.id) return;
    realtime?.markRead?.(last.message.id);
  }, [timeline, realtime, currentUser]);

  const sendMutation = useMutation({
    mutationFn: ({ text }) => messagingApi.sendMessage(threadId, { text }),
    onSuccess: (message, variables) => {
      setOptimisticMessages((prev) => prev.filter((item) => item.clientId !== variables.clientId));
      queryClient.setQueryData(["messages", threadId], (old) => {
        if (!old) {
          return {
            pages: [{ data: [message], nextCursor: null }],
            pageParams: [undefined],
          };
        }
        const pages = old.pages.slice();
        const lastIndex = pages.length - 1;
        if (lastIndex >= 0) {
          pages[lastIndex] = {
            ...pages[lastIndex],
            data: [...(pages[lastIndex].data || []), message],
          };
        } else {
          pages.push({ data: [message], nextCursor: null });
        }
        return { ...old, pages };
      });
      queryClient.setQueryData(["thread", threadId], (old) =>
        old ? { ...old, lastMessage: message, updatedAt: message.createdAt } : old
      );
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
    onError: (_, variables) => {
      setOptimisticMessages((prev) =>
        prev.map((item) =>
          item.clientId === variables.clientId ? { ...item, status: "failed" } : item
        )
      );
    },
  });

  const handleSend = useCallback(
    async (content) => {
      if (!threadId || !currentUser) return;
      const clientId = `temp-${Date.now()}`;
      const optimistic = {
        id: clientId,
        clientId,
        threadId,
        text: content,
        createdAt: new Date().toISOString(),
        sender: currentUser,
        kind: "text",
        status: "sending",
        attachments: [],
        readBy: [currentUser.id],
      };
      setOptimisticMessages((prev) => [...prev, optimistic]);
      setDraft("");
      realtime?.sendTyping?.(false);
      try {
        await sendMutation.mutateAsync({ text: content, clientId });
      } catch {
        // handled via mutation onError
      }
    },
    [threadId, currentUser, sendMutation, setDraft, realtime]
  );

  const handleRetry = (message) => {
    setOptimisticMessages((prev) => prev.filter((item) => item.id !== message.id));
    handleSend(message.text);
  };

  if (!threadId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        اختر محادثة من القائمة.
      </div>
    );
  }

  if (threadQuery.isLoading) {
    return <div className="p-6 text-sm text-slate-500">جاري تحميل تفاصيل المحادثة…</div>;
  }

  if (threadQuery.isError) {
    return (
      <div className="p-6 text-sm text-red-500">
        تعذّر تحميل المحادثة. حاول مرة أخرى لاحقًا.
      </div>
    );
  }

  const thread = threadQuery.data;

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-primary-300 hover:text-primary-500 dark:border-slate-700 dark:text-slate-200"
          >
            رجوع
          </button>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{thread.title || "محادثة"}</h2>
            <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-slate-500">
              {participants.map((participant) => (
                <span key={participant.id} className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800 dark:text-slate-200">
                  {participant.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-primary-300 hover:text-primary-500 dark:border-slate-700 dark:text-slate-200"
          onClick={() => alert("TODO: قائمة الإجراءات")}
        >
          ⋮
        </button>
      </header>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6 dark:bg-slate-950"
        aria-live="polite"
      >
        {messagesQuery.isError && (
          <div className="mb-4 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
            تعذّر تحميل الرسائل. سيتم إعادة المحاولة عند التحديث التالي.
          </div>
        )}
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = timeline[virtualRow.index];
            return (
              <div
                key={item.id}
                ref={virtualRow.measureRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {item.type === "date" ? (
                  <DateSeparator date={item.date} />
                ) : (
                  <MessageBubble
                    message={item.message}
                    isMine={item.message.sender?.id === currentUser?.id}
                    onRetry={handleRetry}
                  />
                )}
              </div>
            );
          })}
        </div>
        {timeline.length === 0 && messagesQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        )}
        {messagesQuery.isFetchingNextPage && (
          <div className="my-3 text-center text-xs text-slate-400">جاري تحميل رسائل أقدم…</div>
        )}
        <TypingIndicator active={realtime?.typingActive} />
      </div>
      <div className="border-t border-slate-100 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          onTypingChange={(isTyping) => realtime?.sendTyping?.(isTyping)}
          isSending={sendMutation.isPending}
        />
      </div>
    </div>
  );
}
