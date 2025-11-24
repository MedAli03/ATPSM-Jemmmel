import { api } from "./api";

export async function chatbotQuery(
  childId: number,
  message: string,
  preferredLanguage = "ar-fr-mix"
) {
  const { data } = await api.post("/chatbot/query", {
    childId,
    message,
    preferredLanguage,
  });
  return data;
}

export async function getChatbotHistory(childId: number) {
  const { data } = await api.get("/chatbot/history", { params: { childId } });
  return data;
}
