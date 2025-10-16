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

const mergePages = (pages) =>
  pages
    .flatMap((page) => page?.messages || page?.data || [])
    .filter(Boolean)
    .sort((a, b) => {
      const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aDate - bDate;
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
      lastPage?.nextCursor ?? lastPage?.meta?.nextCursor ?? null,
    enabled: Boolean(threadId),
    initialPageParam: null,
    staleTime: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: ({ body, attachments }) => {
      const formData = new FormData();
      formData.append("body", body);
      attachments.forEach((file) => formData.append("attachments", file));
      return sendThreadMessage({ threadId, payload: formData });
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
              newMessage?.message || newMessage,
            ],
          };
          return { ...previousData, pages: updatedPages };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  const typingMutation = useMutation({
    mutationFn: (isTyping) => setTypingStatus({ threadId, isTyping }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: () => markThreadAsRead(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  const hasLoadedMessages = Boolean(messagesQuery.data?.pages?.length);

  const messages = useMemo(() => mergePages(messagesQuery.data?.pages || []), [
    messagesQuery.data?.pages,
  ]);

  useEffect(() => {
    if (!threadId || !hasLoadedMessages) return;
    markAsReadMutation.mutate();
  }, [threadId, hasLoadedMessages, markAsReadMutation]);

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
          <h1 className="text-2xl font-bold text-slate-900">{threadQuery.data?.title || "المحادثة"}</h1>
          {threadQuery.data?.participants && (
            <p className="text-sm text-slate-600">
              {threadQuery.data.participants.map((person) => person.name || person).join("، ")}
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
                  isOwn={String(message?.senderId) === String(threadQuery.data?.currentUserId)}
                />
              </Fragment>
            ))}
            {typingQuery.data?.isTyping && (
              <div className="self-center rounded-full bg-primary-100 px-4 py-2 text-xs text-primary-600">
                {typingQuery.data?.label || "الطرف الآخر يكتب الآن..."}
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
