import { describe, expect, it } from "vitest";
import { initialState, messagingReducer, selectors } from "../messagingReducer";

const baseMessage = {
  id: "msg-1",
  threadId: "thread-1",
  senderId: "u-educateur",
  text: "مرحبا",
  createdAt: new Date().toISOString(),
  status: "sent",
};

const baseThread = {
  id: "thread-1",
  participantIds: ["u-educateur", "u-parent"],
  unreadCount: 2,
  updatedAt: new Date().toISOString(),
};

describe("messagingReducer", () => {
  it("handles optimistic send and success", () => {
    let state = messagingReducer(initialState, {
      type: "thread/updated",
      payload: { thread: baseThread },
    });
    const optimisticMessage = { ...baseMessage, id: "temp-1", status: "sending", clientId: "temp-1" };

    state = messagingReducer(state, {
      type: "message/optimistic",
      payload: { message: optimisticMessage },
    });

    expect(selectors.messagesForThread(state, "thread-1")).toHaveLength(1);
    expect(selectors.messagesForThread(state, "thread-1")[0].status).toBe("sending");

    const confirmed = { ...baseMessage, id: "msg-final", status: "sent" };
    state = messagingReducer(state, {
      type: "message/succeeded",
      payload: { tempId: "temp-1", message: confirmed },
    });

    const messages = selectors.messagesForThread(state, "thread-1");
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe("msg-final");
    expect(messages[0].status).toBe("sent");
  });

  it("prepends older messages and keeps cursor", () => {
    const threadState = messagingReducer(initialState, {
      type: "thread/updated",
      payload: { thread: baseThread },
    });
    const newest = { ...baseMessage, id: "msg-new" };
    let state = messagingReducer(threadState, {
      type: "messages/received",
      payload: { threadId: "thread-1", messages: [newest], cursor: "cursor-2" },
    });

    const older = { ...baseMessage, id: "msg-old", createdAt: new Date(Date.now() - 3600_000).toISOString() };
    state = messagingReducer(state, {
      type: "messages/prepend",
      payload: { threadId: "thread-1", messages: [older], cursor: "cursor-1" },
    });

    const ordered = selectors.messagesForThread(state, "thread-1");
    expect(ordered[0].id).toBe("msg-old");
    expect(state.messageCursors["thread-1"]).toBe("cursor-1");
  });
});
