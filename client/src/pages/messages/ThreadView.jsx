import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMessagingContext } from "../../modules/messaging/context/MessagingProvider";
import MessageBubble from "../../modules/messaging/components/MessageBubble";
import TypingIndicator from "../../modules/messaging/components/TypingIndicator";
import Composer from "../../modules/messaging/components/Composer";
import DateSeparator from "../../modules/messaging/components/DateSeparator";
import ParticipantsPill from "../../modules/messaging/components/ParticipantsPill";
import ErrorState from "../../modules/messaging/components/ErrorState";
import { useAuth } from "../../context/AuthContext";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("ar", { weekday: "long", day: "numeric", month: "long" });

const ThreadView = () => {
  const { threadId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions, selectors, service, dispatch } = useMessagingContext();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const timelineRef = useRef(null);
  const currentUserId = currentUser?.id || "u-directeur";

  const thread = useMemo(() => selectors.threadById(state, threadId), [selectors, state, threadId]);
  const messages = useMemo(() => selectors.messagesForThread(state, threadId), [selectors, state, threadId]);
  const draft = useMemo(() => selectors.draftForThread(state, threadId), [selectors, state, threadId]);
  const typingUsers = useMemo(() => selectors.typingForThread(state, threadId), [selectors, state, threadId]);
  const nextCursor = state.messageCursors[threadId];

  useEffect(() => {
    if (!threadId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    Promise.all([actions.getThread(threadId), actions.listMessages(threadId)])
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actions, threadId]);

  useEffect(() => {
    if (!threadId || !messages.length) return;
    const latest = messages[messages.length - 1];
    if (String(latest?.senderId) !== String(currentUserId)) {
      actions.markRead(threadId, latest?.id);
    }
  }, [messages, actions, threadId, currentUserId]);

  const participantMap = useMemo(() => {
    const entries = (thread?.participants || []).map((participant) => [participant.id, participant]);
    return new Map(entries);
  }, [thread?.participants]);

  const basePath = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const index = segments.indexOf("messages");
    if (index === -1) return "/dashboard/messages";
    return `/${segments.slice(0, index + 1).join("/")}`;
  }, [location.pathname]);

  const decoratedMessages = useMemo(() => {
    const result = [];
    let previousDate = null;
    messages.forEach((message, index) => {
      const messageDate = formatDate(message.createdAt);
      const showDate = messageDate !== previousDate;
      if (showDate) {
        result.push({ type: "date", id: `date-${messageDate}-${index}`, date: messageDate });
        previousDate = messageDate;
      }
      result.push({ type: "message", id: message.id, message });
    });
    return result;
  }, [messages]);

  const rowVirtualizer = useVirtualizer({
    count: decoratedMessages.length,
    getScrollElement: () => timelineRef.current,
    estimateSize: () => 132,
    overscan: 6,
  });

  useEffect(() => {
    if (!decoratedMessages.length) return;
    const lastMessageIndex = decoratedMessages.reduce(
      (acc, item, index) => (item.type === "message" ? index : acc),
      decoratedMessages.length - 1
    );
    rowVirtualizer.scrollToIndex(lastMessageIndex, { align: "end" });
  }, [decoratedMessages, rowVirtualizer]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const first = virtualItems[0];
    if (
      first &&
      first.index === 0 &&
      nextCursor &&
      !loadingMore &&
      !isLoading &&
      threadId
    ) {
      setLoadingMore(true);
      actions
        .listMessages(threadId, nextCursor)
        .finally(() => setLoadingMore(false));
    }
  }, [virtualItems, nextCursor, loadingMore, isLoading, actions, threadId]);

  const typingNames = useMemo(() => {
    return (typingUsers || [])
      .map((userId) => participantMap.get(userId)?.name)
      .filter(Boolean);
  }, [typingUsers, participantMap]);

  const handleRetry = async (failedMessage) => {
    try {
      dispatch({
        type: "message/status",
        payload: { messageId: failedMessage.id, patch: { status: "sending" } },
      });
      await actions.sendMessage(threadId, {
        text: failedMessage.text,
        attachments: failedMessage.attachments,
        senderId: currentUserId,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <ErrorState onRetry={() => actions.listMessages(threadId)} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col" dir="rtl">
      <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-primary-50 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="العودة للقائمة"
            >
              ←
            </button>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {thread?.title || (thread?.participants || []).map((p) => p.name).join("، ") || "محادثة"}
              </h2>
              <ParticipantsPill participants={thread?.participants || []} />
            </div>
          </div>
          <Menu as="div" className="relative text-left">
            <Menu.Button className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200">
              ⋮
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 mt-2 w-40 origin-top-left rounded-2xl border border-slate-200 bg-white p-2 shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-800">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => actions.archiveThread(threadId, !(thread?.archived ?? false))}
                      className={`w-full rounded-xl px-3 py-2 text-right text-sm ${
                        active ? "bg-primary-50 text-primary-600" : "text-slate-600 dark:text-slate-200"
                      }`}
                    >
                      {thread?.archived ? "إلغاء الأرشفة" : "أرشفة"}
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={`w-full rounded-xl px-3 py-2 text-right text-sm ${
                        active ? "bg-primary-50 text-primary-600" : "text-slate-600 dark:text-slate-200"
                      }`}
                    >
                      كتم الإشعارات
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={`w-full rounded-xl px-3 py-2 text-right text-sm ${
                        active ? "bg-rose-50 text-rose-600" : "text-rose-500"
                      }`}
                    >
                      حذف المحادثة
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={`w-full rounded-xl px-3 py-2 text-right text-sm ${
                        active ? "bg-primary-50 text-primary-600" : "text-slate-600 dark:text-slate-200"
                      }`}
                    >
                      إضافة مشارك
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>

      <div
        ref={timelineRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-white to-slate-50 px-4 py-6 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900"
        aria-live="polite"
      >
        {isLoading && !decoratedMessages.length ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            جاري تحميل الرسائل…
          </div>
        ) : (
          <>
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
              {virtualItems.map((virtualItem) => {
                const item = decoratedMessages[virtualItem.index];
                if (!item) return null;
                const top = virtualItem.start;
                return (
                  <div
                    key={item.id}
                    style={{ position: "absolute", top, width: "100%" }}
                    className="flex justify-end py-2"
                  >
                    {item.type === "date" ? (
                      <DateSeparator date={item.date} />
                    ) : (
                      <MessageBubble
                        message={item.message}
                        isOwn={String(item.message.senderId) === String(currentUserId)}
                        sender={participantMap.get(item.message.senderId) || null}
                        onRetry={handleRetry}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {loadingMore ? (
              <div className="mt-4 text-center text-xs text-slate-400">جاري تحميل رسائل أقدم…</div>
            ) : null}
          </>
        )}
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
        {typingNames.filter(Boolean).length ? <TypingIndicator users={typingNames.filter(Boolean)} /> : null}
        <Composer
          onSend={async (payload) => {
            await actions.sendMessage(threadId, { ...payload, senderId: currentUserId });
            const lastIndex = decoratedMessages.length - 1;
            rowVirtualizer.scrollToIndex(lastIndex, { align: "end" });
          }}
          onDraftChange={(value) => actions.saveDraft(threadId, value)}
          onTyping={() => service?.simulateTyping?.(threadId, currentUserId)}
          initialDraft={draft}
          focusSearch={() => document.querySelector("input[type=search]")?.focus()}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ThreadView;
