import { apiClient } from "../lib/apiClient";

export type ChatbotMessage = {
  id: number;
  childId: number;
  educatorId: number;
  question: string;
  answer: string;
  createdAt: string;
};

export async function getChatbotHistory(
  childId: number
): Promise<ChatbotMessage[]> {
  const res = await apiClient.get("/chatbot/history", { params: { childId } });
  return res.data;
}

export async function sendChatbotMessage(
  childId: number,
  message: string
): Promise<ChatbotMessage> {
  const res = await apiClient.post("/chatbot/query", { childId, message });
  return res.data;
}
