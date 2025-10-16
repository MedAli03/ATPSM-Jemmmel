import { nanoid } from "nanoid";

const LATENCY_RANGE = [180, 520];

const participants = [
  { id: "u-parent", name: "أميمة بن صالح", role: "PARENT", avatarUrl: "https://i.pravatar.cc/150?img=47" },
  { id: "u-educateur", name: "سامي عياد", role: "EDUCATEUR", avatarUrl: "https://i.pravatar.cc/150?img=12" },
  { id: "u-directeur", name: "ليلى الطرابلسي", role: "DIRECTEUR", avatarUrl: "https://i.pravatar.cc/150?img=34" },
  { id: "u-president", name: "هشام منصور", role: "PRESIDENT", avatarUrl: "https://i.pravatar.cc/150?img=18" },
];

const loremMessages = [
  "أهلاً! كيف كان يوم مروان في المركز اليوم؟",
  "مرحباً، كان نشيطاً جداً في ورشة المهارات الحسية.",
  "سعيد بمعرفة ذلك! هل هناك نشاط منزلي أنصح به؟",
  "يمكنك تجربة لعبة الفرز بالألوان لدعم التركيز.",
  "شكرًا لك، سأفعل ذلك مساءً.",
  "لدينا اجتماع أولياء الأسبوع القادم يوم الثلاثاء.",
  "تمت قراءة الرسالة من جميع المشاركين.",
  "هذا تحديث تلقائي من النظام.",
];

function randomLatency() {
  const [min, max] = LATENCY_RANGE;
  return new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));
}

function buildInitialThreads() {
  const now = Date.now();
  return Array.from({ length: 16 }).map((_, index) => {
    const threadId = `thread-${index + 1}`;
    const createdAt = new Date(now - index * 3600_000).toISOString();
    const lastMessageId = `${threadId}-msg-${index + 1}`;
    return {
      id: threadId,
      title: index % 3 === 0 ? "مجموعة الدمج الصباحي" : undefined,
      participantIds: index % 2 === 0 ? ["u-parent", "u-educateur"] : ["u-directeur", "u-president"],
      unreadCount: index % 4 === 0 ? 2 : 0,
      archived: index % 5 === 0,
      lastMessageId,
      updatedAt: createdAt,
    };
  });
}

function buildInitialMessages(threads) {
  const messages = {};
  threads.forEach((thread) => {
    const baseTime = new Date(thread.updatedAt).getTime();
    const count = 12;
    const items = [];
    for (let i = 0; i < count; i += 1) {
      const kind = i === 3 && thread.id === "thread-2" ? "system" : "text";
      const metadata = kind === "system" ? { source: i === 3 ? "ai" : "system" } : undefined;
      items.push({
        id: `${thread.id}-msg-${i + 1}`,
        threadId: thread.id,
        senderId: i % 2 === 0 ? "u-educateur" : "u-parent",
        kind,
        text: loremMessages[(i + thread.id.length) % loremMessages.length],
        metadata,
        createdAt: new Date(baseTime - (count - i) * 6 * 60 * 1000).toISOString(),
        status: "read",
        readBy: ["u-educateur", "u-parent", "u-directeur"].slice(0, (i % 3) + 1),
      });
    }
    messages[thread.id] = items;
  });
  return messages;
}

const threadsStore = buildInitialThreads();
const messagesStore = buildInitialMessages(threadsStore);

function toRelativeDate(iso) {
  const delta = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.round(hours / 24);
  return `منذ ${days} يوم`;
}

function decorateThread(thread) {
  const lastMessage = messagesStore[thread.id]?.slice(-1)[0];
  const participantsSummary = thread.participantIds
    .map((id) => participants.find((user) => user.id === id))
    .filter(Boolean);
  const sender = participantsSummary.find((user) => user?.id === lastMessage?.senderId);
  return {
    ...thread,
    participants: participantsSummary,
    preview: lastMessage ? {
      text: lastMessage.text,
      createdAt: lastMessage.createdAt,
      relativeTime: toRelativeDate(lastMessage.createdAt),
      senderId: lastMessage.senderId,
      senderName: sender?.name || null,
    } : null,
    previewMessages: lastMessage ? [lastMessage] : [],
  };
}

export class MockMessagingService {
  constructor() {
    this.subscribers = new Set();
    this.typingTimers = new Map();
  }

  async listThreads({ page = 1, pageSize = 10, search = "", filter = "all", archived } = {}) {
    await randomLatency();
    const normalizedFilter = archived ?? (filter === "archived");
    const lower = search.trim().toLowerCase();
    const filtered = threadsStore
      .filter((thread) => {
        if (normalizedFilter !== undefined && thread.archived !== normalizedFilter) {
          return false;
        }
        if (filter === "unread" && !thread.unreadCount) return false;
        if (filter === "read" && thread.unreadCount) return false;
        if (!lower) return true;
        const participantsLabel = thread.participantIds
          .map((id) => participants.find((user) => user.id === id)?.name || "")
          .join(" ");
        return (
          thread.id.toLowerCase().includes(lower) ||
          (thread.title || "").toLowerCase().includes(lower) ||
          participantsLabel.toLowerCase().includes(lower)
        );
      })
      .map(decorateThread)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return {
      items,
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize) || 1,
    };
  }

  async getThread(threadId) {
    await randomLatency();
    const thread = threadsStore.find((item) => item.id === threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    return decorateThread(thread);
  }

  async listMessages(threadId, cursor) {
    await randomLatency();
    const all = messagesStore[threadId] || [];
    const pageSize = 20;
    const startIndex = cursor ? Math.max(all.findIndex((msg) => msg.id === cursor) - pageSize, 0) : Math.max(all.length - pageSize, 0);
    const endIndex = cursor ? Math.max(all.findIndex((msg) => msg.id === cursor), 0) : all.length;
    const slice = all.slice(startIndex, endIndex);
    const nextCursor = startIndex > 0 ? all[startIndex].id : null;
    return {
      items: slice,
      nextCursor,
    };
  }

  async buildOptimisticMessage(threadId, draft) {
    await randomLatency();
    const tempId = `temp-${nanoid(8)}`;
    return {
      id: tempId,
      threadId,
      senderId: draft.senderId,
      kind: draft.attachments?.length ? "attachment" : "text",
      text: draft.text,
      attachments: draft.attachments || [],
      createdAt: new Date().toISOString(),
      status: "sending",
      clientId: tempId,
    };
  }

  async sendMessage(threadId, draft) {
    await randomLatency();
    const id = `msg-${nanoid(10)}`;
    const message = {
      id,
      threadId,
      senderId: draft.senderId,
      kind: draft.attachments?.length ? "attachment" : "text",
      text: draft.text,
      attachments: draft.attachments || [],
      createdAt: new Date().toISOString(),
      status: "sent",
      readBy: [draft.senderId],
    };
    messagesStore[threadId] = [...(messagesStore[threadId] || []), message];
    const thread = threadsStore.find((item) => item.id === threadId);
    if (thread) {
      thread.lastMessageId = message.id;
      thread.updatedAt = message.createdAt;
      thread.unreadCount = 0;
      this.emit({ type: "thread.updated", thread: decorateThread(thread) });
    }
    this.emit({ type: "message.created", message, thread: decorateThread(thread) });
    return message;
  }

  async createThread(payload) {
    await randomLatency();
    const id = `thread-${nanoid(6)}`;
    const thread = {
      id,
      title: payload.title || payload.subject || undefined,
      participantIds: payload.participantIds || [],
      unreadCount: 0,
      archived: false,
      lastMessageId: null,
      updatedAt: new Date().toISOString(),
    };
    threadsStore.unshift(thread);
    if (payload.initialMessage) {
      await this.sendMessage(id, {
        senderId: payload.initialMessage.senderId,
        text: payload.initialMessage.text,
        attachments: payload.initialMessage.attachments || [],
      });
    }
    this.emit({ type: "thread.updated", thread: decorateThread(thread) });
    return decorateThread(thread);
  }

  async markRead(threadId) {
    await randomLatency();
    const thread = threadsStore.find((item) => item.id === threadId);
    if (thread) {
      thread.unreadCount = 0;
      this.emit({ type: "thread.updated", thread: decorateThread(thread) });
    }
  }

  async archiveThread(threadId, archived) {
    await randomLatency();
    const thread = threadsStore.find((item) => item.id === threadId);
    if (thread) {
      thread.archived = archived;
      this.emit({ type: "thread.updated", thread: decorateThread(thread) });
    }
  }

  onEvent(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  emit(event) {
    this.subscribers.forEach((callback) => callback(event));
  }

  simulateTyping(threadId, userId) {
    const key = `${threadId}-${userId}`;
    clearTimeout(this.typingTimers.get(key));
    this.emit({ type: "typing", threadId, users: [userId] });
    const timeout = setTimeout(() => {
      this.emit({ type: "typing", threadId, users: [] });
    }, 2500);
    this.typingTimers.set(key, timeout);
  }
}

export function getParticipantById(id) {
  return participants.find((user) => user.id === id);
}

export function listParticipants(ids) {
  return ids.map((id) => getParticipantById(id)).filter(Boolean);
}

export function listAllParticipants() {
  return participants.slice();
}
