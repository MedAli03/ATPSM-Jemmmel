import { Fragment, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getThreadDetails,
  getThreadMessages,
  markThreadAsRead,
  sendThreadMessage,
  getTypingStatus,
  setTypingStatus,
} from "../../api/messages";
import MessageBubble from "../../components/messages/MessageBubble";
import Composer from "../../components/messages/Composer";
import EmptyState from "../../components/messages/EmptyState";

const mergePages = (pages) => {
  const map = new Map();
  pages.forEach((page) => {
    const collection = Array.isArray(page?.messages)
      ? page.messages
      : Array.isArray(page?.data)
        ? page.data
        : [];
    collection
      .filter(Boolean)
      .forEach((message) => {
        const key = message.id || message.createdAt;
        if (!key) {
          map.set(Symbol("message"), message);
          return;
        }
        const existing = map.get(key);
        map.set(key, existing ? { ...existing, ...message } : message);
      });
  });
  return Array.from(map.values()).sort((a, b) => {
    const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aDate - bDate;
  });
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const ThreadView = () => {
  const { threadId } = useParams();
  const queryClient = useQueryClient();
  const endOfMessagesRef = useRef(null);
  const topSentinelRef = useRef(null);
  const lastTypingValueRef = useRef(false);

  const threadQuery = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => getThreadDetails(threadId),
    enabled: Boolean(threadId),
  });

  const typingQuery = useQuery({
    queryKey: ["thread", threadId, "typing"],
    queryFn: () => getTypingStatus(threadId),
    enabled: Boolean(threadId),
    refetchInterval: 4000,
  });

  const messagesQuery = useInfiniteQuery({
    queryKey: ["thread", threadId, "messages"],
    queryFn: ({ pageParam }) =>
      getThreadMessages({ threadId, cursor: pageParam ?? undefined }),
    getNextPageParam: (lastPage) =>
      lastPage?.pageInfo?.nextCursor ?? lastPage?.nextCursor ?? null,
    enabled: Boolean(threadId),
    initialPageParam: null,
    staleTime: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async ({ body, attachments }) => {
      const files = Array.isArray(attachments) ? attachments : [];
      const serializedAttachments = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          mimeType: file.type,
          size: file.size,
          data: await fileToDataUrl(file),
        })),
      );
      return sendThreadMessage({
        threadId,
        payload: { body, attachments: serializedAttachments },
      });
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(
        ["thread", threadId, "messages"],
        (previousData) => {
          if (!previousData) return previousData;
          const updatedPages = previousData.pages.slice();
          updatedPages[0] = {
            ...(updatedPages[0] || {}),
            messages: [
              ...(updatedPages[0]?.messages || []),
              newMessage,
            ],
            pageInfo: {
              ...(updatedPages[0]?.pageInfo || {}),
            },
          };
          return { ...previousData, pages: updatedPages };
        },
      );
      queryClient.setQueryData(["thread", threadId], (previousThread) => {
        if (!previousThread) return previousThread;
        return {
          ...previousThread,
          lastMessage: newMessage,
          unreadCount: 0,
          updatedAt: newMessage.createdAt || previousThread.updatedAt,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  const typingMutation = useMutation({
    mutationFn: (isTyping) => setTypingStatus({ threadId, isTyping }),
    onMutate: (isTyping) => {
      queryClient.setQueryData([
        "thread",
        threadId,
        "typing",
      ], (previous) => ({
        ...(previous || {}),
        isTyping,
        users: isTyping ? previous?.users || [] : [],
      }));
    },
    onSuccess: (status) => {
      queryClient.setQueryData(["thread", threadId, "typing"], status);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: () => markThreadAsRead(threadId),
    onSuccess: (result) => {
      queryClient.setQueryData(["thread", threadId], (previousThread) => {
        if (!previousThread) return previousThread;
        return {
          ...previousThread,
          unreadCount: result?.unread ?? 0,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  const hasLoadedMessages = Boolean(messagesQuery.data?.pages?.length);

  const messages = useMemo(() => mergePages(messagesQuery.data?.pages || []), [
    messagesQuery.data?.pages,
  ]);

  const typingUsers = typingQuery.data?.users ?? [];
  const typingLabel = typingUsers.length
    ? `${typingUsers
        .map((user) => user.name || user.label || "مستخدم")
        .join("، ")} يكتب الآن...`
    : typingQuery.data?.label || "الطرف الآخر يكتب الآن...";
  const currentUserId = threadQuery.data?.currentUserId;

  useEffect(() => {
    if (!threadId || !hasLoadedMessages || markAsReadMutation.isPending) return;
    markAsReadMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, hasLoadedMessages, markAsReadMutation.isPending]);

  useEffect(() => {
    if (!threadId || messages.length === 0 || markAsReadMutation.isPending || !currentUserId) {
      return;
    }
    const latest = messages[messages.length - 1];
    if (latest && String(latest.senderId) !== String(currentUserId)) {
      markAsReadMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, threadId, markAsReadMutation.isPending, currentUserId]);

  useEffect(() => {
    if (!topSentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
          messagesQuery.fetchNextPage();
        }
      },
      { threshold: 1 },
    );

    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [messagesQuery]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sendMutation.isSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/40" dir="rtl">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <header className="flex flex-col gap-1 text-right">
          <h1 className="text-2xl font-bold text-slate-900">
            {threadQuery.data?.subject || threadQuery.data?.title ||
              threadQuery.data?.participants?.map((person) => person.name).join("، ") ||
              "المحادثة"}
          </h1>
          {threadQuery.data?.participants && (
            <p className="text-sm text-slate-600">
              {threadQuery.data.participants.map((person) => person.name || person).join("، ")}
            </p>
          )}
          {threadQuery.data?.enfant?.name && (
            <p className="text-xs text-slate-500">
              مرتبط بالطفل: {threadQuery.data.enfant.name}
            </p>
          )}
        </header>

        <section className="flex flex-1 flex-col gap-4">
          <div className="relative flex h-[60vh] flex-col gap-4 overflow-y-auto rounded-3xl bg-white/70 p-6 shadow-sm backdrop-blur">
            <span ref={topSentinelRef} />
            {messagesQuery.isLoading && (
              <EmptyState title="جاري تحميل الرسائل" icon="⏳" />
            )}
            {messagesQuery.isError && (
              <EmptyState
                icon="⚠️"
                title="تعذّر تحميل الرسائل"
                description="حاول تحديث الصفحة أو تحقق من الاتصال."
              />
            )}
            {!messagesQuery.isLoading && messages.length === 0 && (
              <EmptyState
                title="ابدأ المحادثة"
                description="لم يتم إرسال أي رسائل بعد في هذه المحادثة."
              />
            )}
            {messages.map((message) => (
              <Fragment key={message.id || message.createdAt}>
                <MessageBubble
                  message={message}
                  isOwn={String(message?.senderId) === String(currentUserId)}
                />
              </Fragment>
            ))}
            {typingQuery.data?.isTyping && (
              <div className="self-center rounded-full bg-primary-100 px-4 py-2 text-xs text-primary-600">
                {typingLabel}
              </div>
            )}
            <span ref={endOfMessagesRef} />
          </div>

          <Composer
            onSend={(values) => sendMutation.mutate(values)}
            isSending={sendMutation.isPending}
            onTypingChange={(isTyping) => {
              if (lastTypingValueRef.current === isTyping) return;
              lastTypingValueRef.current = isTyping;
              typingMutation.mutate(isTyping);
            }}
          />
        </section>
      </div>
    </div>
  );
};

export default ThreadView;
