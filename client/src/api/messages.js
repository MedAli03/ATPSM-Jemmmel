import http from "../services/https";

export const listThreads = async ({ page = 1, search = "" } = {}) => {
  const { data } = await http.get("/messages/threads", {
    params: { page, search },
  });
  return data;
};

export const getThreadDetails = async (threadId) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const { data } = await http.get(`/messages/threads/${threadId}`);
  return data;
};

export const getThreadMessages = async ({ threadId, cursor = null }) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const { data } = await http.get(`/messages/threads/${threadId}/messages`, {
    params: { cursor },
  });
  return data;
};

export const sendThreadMessage = async ({ threadId, payload }) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const config =
    payload instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined;
  const { data } = await http.post(
    `/messages/threads/${threadId}/messages`,
    payload,
    config,
  );
  return data;
};

export const markThreadAsRead = async (threadId) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const { data } = await http.post(`/messages/threads/${threadId}/read`);
  return data;
};

export const getTypingStatus = async (threadId) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const { data } = await http.get(`/messages/threads/${threadId}/typing`);
  return data;
};

export const setTypingStatus = async ({ threadId, isTyping }) => {
  if (!threadId) throw new Error("معرّف المحادثة مطلوب");
  const { data } = await http.post(`/messages/threads/${threadId}/typing`, {
    isTyping,
  });
  return data;
};
