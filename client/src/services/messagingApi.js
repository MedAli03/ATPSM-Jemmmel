import http from "./https";

export const messagingApi = {
  async listThreads(params = {}) {
    const { data } = await http.get("/messages/threads", { params });
    return data.data;
  },
  async getThread(threadId) {
    const { data } = await http.get(`/messages/threads/${threadId}`);
    return data.data;
  },
  async listMessages(threadId, cursor, limit = 25) {
    const params = {};
    if (cursor) params.cursor = JSON.stringify(cursor);
    if (limit) params.limit = limit;
    const { data } = await http.get(`/messages/threads/${threadId}/messages`, { params });
    return data.data;
  },
  async sendMessage(threadId, payload) {
    const { data } = await http.post(`/messages/threads/${threadId}/messages`, payload);
    return data.data;
  },
  async createThread(payload) {
    const participantIds = Array.isArray(payload?.participantIds)
      ? payload.participantIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];
    const requestBody = {
      ...payload,
      participantIds,
    };
    const { data } = await http.post(`/messages/threads`, requestBody);
    return data.data;
  },
  async markRead(threadId, upToMessageId) {
    const { data } = await http.post(`/messages/threads/${threadId}/read`, {
      upToMessageId,
    });
    return data.data;
  },
};
