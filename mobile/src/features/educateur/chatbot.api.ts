import { api } from "../../services/api";

export type ChatbotMessage = {
  id: number;
  enfant_id: number;
  educateur_id: number;
  annee_id: number;
  role: "user" | "assistant";
  message: string;
  created_at: string;
  updated_at?: string;
};

export type ChatbotHistoryResponse = {
  ok?: boolean;
  data?: ChatbotMessage[];
};

export type ChatbotSendResponse = {
  ok?: boolean;
  data?: {
    userMessage: ChatbotMessage;
    assistantMessage: ChatbotMessage;
  };
};

export async function getChatbotMessages(
  enfantId: number,
  anneeId: number
): Promise<ChatbotMessage[]> {
  const { data } = await api.get<ChatbotHistoryResponse>(
    `/educateurs/enfants/${enfantId}/chatbot/messages`,
    { params: { anneeId } }
  );
  return data?.data ?? [];
}

export async function sendChatbotMessage(
  enfantId: number,
  anneeId: number,
  message: string
): Promise<{ userMessage: ChatbotMessage; assistantMessage: ChatbotMessage }> {
  const { data } = await api.post<ChatbotSendResponse>(
    `/educateurs/enfants/${enfantId}/chatbot/messages`,
    { anneeId, message }
  );
  if (data?.data) {
    return data.data;
  }
  throw new Error("Réponse invalide du chatbot");
}
