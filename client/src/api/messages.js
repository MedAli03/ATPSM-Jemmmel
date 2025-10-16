import http from "../services/https";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const listThreads = async ({ page = 1, search = "" } = {}) => {
  const response = await http.get("/messages/threads", {
    params: { page, search },
  });
  const payload = unwrap(response);
  return {
    threads: Array.isArray(payload.threads) ? payload.threads : [],
    pagination: payload.pagination ?? payload.meta ?? {},
  };
};

export const getThreadDetails = async (threadId) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const response = await http.get(`/messages/threads/${threadId}`);
  const payload = unwrap(response);
  return payload.thread ?? payload;
};

export const getThreadMessages = async ({ threadId, cursor = null }) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const params = cursor ? { cursor } : {};
  const response = await http.get(`/messages/threads/${threadId}/messages`, {
    params,
  });
  const payload = unwrap(response);
  return {
    messages: Array.isArray(payload.messages) ? payload.messages : [],
    pageInfo: payload.pageInfo ?? payload.meta ?? {},
  };
};

export const sendThreadMessage = async ({ threadId, payload }) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const response = await http.post(
    `/messages/threads/${threadId}/messages`,
    payload,
  );
  const data = unwrap(response);
  return data.message ?? data;
};

export const markThreadAsRead = async (threadId) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const response = await http.post(`/messages/threads/${threadId}/read`);
  return unwrap(response);
};

export const getTypingStatus = async (threadId) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const response = await http.get(`/messages/threads/${threadId}/typing`);
  return unwrap(response);
};

export const setTypingStatus = async ({ threadId, isTyping }) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const response = await http.post(`/messages/threads/${threadId}/typing`, {
    isTyping,
  });
  return unwrap(response);
};
